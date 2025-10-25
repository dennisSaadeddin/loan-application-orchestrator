import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import Base, get_db
from app.models.application import Application
from app.models.pipeline import Pipeline

# Test database URL - use 'db' as host when running in Docker, 'localhost' otherwise
import os
DB_HOST = os.getenv("DB_HOST", "db")
TEST_DATABASE_URL = f"postgresql+asyncpg://loan_user:loan_pass@{DB_HOST}:5432/loan_orchestrator_test"


@pytest.fixture(scope="session")
async def test_engine():
    """Create test database engine"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def db_session(test_engine):
    """Create a fresh database session for each test"""
    async_session_maker = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    async with async_session_maker() as session:
        # Clean up any existing data before test
        from sqlalchemy import text
        await session.execute(text("TRUNCATE TABLE runs RESTART IDENTITY CASCADE"))
        await session.execute(text("TRUNCATE TABLE applications RESTART IDENTITY CASCADE"))
        await session.execute(text("TRUNCATE TABLE pipelines RESTART IDENTITY CASCADE"))
        await session.commit()

        yield session

        # Rollback any uncommitted changes
        await session.rollback()


@pytest.fixture
async def client(db_session):
    """Create test client with database override"""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def sample_application(db_session):
    """Create a sample application for testing"""
    application = Application(
        applicant_name="John Doe",
        amount=Decimal("15000.00"),
        monthly_income=Decimal("3000.00"),
        declared_debts=Decimal("600.00"),
        country="ES",
        loan_purpose="home renovation"
    )
    db_session.add(application)
    await db_session.commit()
    await db_session.refresh(application)
    return application


@pytest.fixture
async def sample_pipeline(db_session):
    """Create a sample pipeline for testing"""
    pipeline = Pipeline(
        name="Test Pipeline",
        description="Pipeline for testing",
        steps=[
            {
                "step_type": "dti_rule",
                "order": 1,
                "params": {"max_dti": 0.4}
            },
            {
                "step_type": "amount_policy",
                "order": 2,
                "params": {
                    "DE": 35000,
                    "ES": 30000,
                    "FR": 25000,
                    "OTHER": 20000
                }
            },
            {
                "step_type": "risk_scoring",
                "order": 3,
                "params": {"approve_threshold": 45}
            },
            {
                "step_type": "sentiment_check",
                "order": 4,
                "params": {
                    "risky_keywords": ["gambling", "crypto", "cryptocurrency", "betting", "casino"]
                }
            }
        ],
        terminal_rules=[
            {
                "order": 1,
                "condition": {
                    "type": "step_failed",
                    "step_types": ["dti_rule", "amount_policy", "sentiment_check"]
                },
                "outcome": "REJECTED"
            },
            {
                "order": 2,
                "condition": {
                    "type": "risk_threshold",
                    "value": 45,
                    "operator": "<="
                },
                "outcome": "APPROVED"
            },
            {
                "order": 3,
                "condition": {"type": "default"},
                "outcome": "NEEDS_REVIEW"
            }
        ]
    )
    db_session.add(pipeline)
    await db_session.commit()
    await db_session.refresh(pipeline)
    return pipeline
