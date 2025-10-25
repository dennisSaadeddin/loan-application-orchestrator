# Loan Application Orchestrator - Backend

A FastAPI-based backend for configurable loan processing with dynamic pipelines, business rule steps, and intelligent decision-making capabilities.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Business Rule Steps](#business-rule-steps)
- [Terminal Rules](#terminal-rules)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Extending the System](#extending-the-system)

## Overview

The backend API enables financial institutions to configure and execute customizable loan approval workflows. Each pipeline contains multiple business rule steps (DTI checks, amount policies, risk scoring, sentiment analysis) and terminal rules to determine final approval outcomes.

## Tech Stack

- **Python 3.11.9**: Modern Python with type hints
- **FastAPI 0.115.0**: High-performance async web framework
- **PostgreSQL 16.3**: Relational database with JSONB support
- **SQLAlchemy 2.0.35**: Async ORM with type safety
- **Alembic 1.13.3**: Database migration tool
- **Pydantic 2.9.2**: Data validation and settings
- **OpenAI API**: GPT-4o-mini for sentiment analysis
- **pytest 8.3.3**: Testing framework with async support

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   └── versions/         # Migration files
├── app/
│   ├── api/
│   │   └── routes/       # API endpoint handlers
│   │       ├── applications.py
│   │       ├── pipelines.py
│   │       └── runs.py
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings management
│   │   └── database.py   # Database engine
│   ├── models/           # SQLAlchemy models
│   │   ├── application.py
│   │   ├── pipeline.py
│   │   └── run.py
│   ├── schemas/          # Pydantic schemas
│   │   ├── application.py
│   │   ├── pipeline.py
│   │   └── run.py
│   ├── services/         # Business logic
│   │   ├── pipeline_executor.py
│   │   └── step_registry.py
│   ├── steps/            # Business rule implementations
│   │   ├── base.py
│   │   ├── dti_rule.py
│   │   ├── amount_policy.py
│   │   ├── risk_scoring.py
│   │   └── sentiment_check.py
│   └── main.py           # FastAPI application
├── tests/                # Test suite
│   ├── conftest.py       # Pytest fixtures
│   ├── test_steps.py     # Business rule tests
│   ├── test_services.py  # Service layer tests
│   └── test_api.py       # API endpoint tests
├── .env.example          # Environment template
├── Dockerfile            # Container image
├── pytest.ini            # Pytest configuration
└── requirements.txt      # Python dependencies
```

## Setup

### Prerequisites

- Python 3.11.9+
- PostgreSQL 16.3+
- (Optional) OpenAI API key for sentiment analysis

### Local Development Setup

1. **Create virtual environment:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   Required environment variables:
   ```bash
   DATABASE_URL=postgresql://loan_user:loan_pass@localhost:5432/loan_orchestrator
   API_V1_STR=/api/v1
   PROJECT_NAME=Loan Orchestrator
   BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   OPENAI_API_KEY=your_api_key_here  # Optional
   ```

4. **Start PostgreSQL:**
   ```bash
   # Using Docker Compose (from project root)
   docker-compose up -d db

   # Or install PostgreSQL locally and create database
   createdb loan_orchestrator
   ```

5. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. **Access API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Docker Setup

Using Docker Compose is the recommended way to run the full stack:

```bash
# From project root
docker-compose up -d

# Check health
curl http://localhost:8000/health
```

## Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker

```bash
docker-compose up -d backend
docker-compose logs -f backend
```

## Testing

### Setup Test Database

When running tests inside Docker container, the test database is automatically created. For local testing:

```bash
createdb loan_orchestrator_test
```

### Run All Tests

```bash
# Inside Docker container
docker exec loan-application-orchestrator-backend-1 pytest -v

# Local environment
pytest -v
```

### Run Specific Test File

```bash
# Inside Docker
docker exec loan-application-orchestrator-backend-1 pytest tests/test_steps.py -v

# Local
pytest tests/test_steps.py -v
```

### Run Specific Test

```bash
# Inside Docker
docker exec loan-application-orchestrator-backend-1 pytest tests/test_steps.py::TestDTIRuleStep::test_dti_within_threshold -v

# Local
pytest tests/test_steps.py::TestDTIRuleStep::test_dti_within_threshold -v
```

### Run Tests by Marker

```bash
# Unit tests only
pytest -m unit -v

# Integration tests only
pytest -m integration -v

# API tests only
pytest -m api -v
```

### Run with Coverage

```bash
# Inside Docker
docker exec loan-application-orchestrator-backend-1 pytest --cov=app --cov-report=html --cov-report=term

# Local
pytest --cov=app --cov-report=html --cov-report=term
```

Coverage report will be generated in `htmlcov/index.html`

### Test Structure

- **test_steps.py**: Unit tests for business rule steps (DTI, Amount Policy, Risk Scoring, Sentiment Check)
- **test_services.py**: Integration tests for Step Registry and Pipeline Executor
- **test_api.py**: API endpoint tests for Applications, Pipelines, and Runs

## Code Quality

### Linting

Install linting tools:
```bash
pip install flake8 black isort mypy
```

**Run linter:**
```bash
flake8 app/ tests/
```

**Auto-format code:**
```bash
black app/ tests/
```

**Sort imports:**
```bash
isort app/ tests/
```

**Type checking:**
```bash
mypy app/
```

### Pre-commit Setup (Optional)

```bash
pip install pre-commit
pre-commit install
```

## Business Rule Steps

### 1. DTI Rule (Debt-to-Income)

Validates that the applicant's debt-to-income ratio doesn't exceed the threshold.

**Location:** `app/steps/dti_rule.py`

**Parameters:**
- `max_dti`: Maximum allowed DTI ratio (default: 0.4 = 40%)

**Formula:** `DTI = declared_debts / monthly_income`

**Example:**
```python
{
  "step_type": "dti_rule",
  "order": 1,
  "params": {"max_dti": 0.4}
}
```

### 2. Amount Policy

Enforces country-specific loan amount caps.

**Location:** `app/steps/amount_policy.py`

**Parameters:**
- `DE`: Germany cap (default: €35,000)
- `ES`: Spain cap (default: €30,000)
- `FR`: France cap (default: €25,000)
- `OTHER`: All other countries (default: €20,000)

**Example:**
```python
{
  "step_type": "amount_policy",
  "order": 2,
  "params": {
    "DE": 35000,
    "ES": 30000,
    "FR": 25000,
    "OTHER": 20000
  }
}
```

### 3. Risk Scoring

Calculates combined risk score from DTI ratio and loan amount.

**Location:** `app/steps/risk_scoring.py`

**Parameters:**
- `approve_threshold`: Maximum score for auto-approval (default: 45)

**Formula:** `Risk = (DTI × 100 × 0.7) + (amount / max_allowed × 100 × 0.3)`

**Example:**
```python
{
  "step_type": "risk_scoring",
  "order": 3,
  "params": {"approve_threshold": 45}
}
```

### 4. Sentiment Check

Analyzes loan purpose using AI or keyword matching to detect risky activities.

**Location:** `app/steps/sentiment_check.py`

**Parameters:**
- `risky_keywords`: List of risk indicators (default: gambling, crypto, cryptocurrency, betting, casino)

**Logic:**
1. Primary: OpenAI GPT-4o-mini analysis if API key available
2. Fallback: Keyword matching if AI fails or unavailable
3. Default: Approve if no keywords matched

**Example:**
```python
{
  "step_type": "sentiment_check",
  "order": 4,
  "params": {
    "risky_keywords": ["gambling", "crypto", "betting"]
  }
}
```

## Terminal Rules

Terminal rules determine the final decision based on step results.

### Condition Types

**1. step_failed** - Checks if specific steps failed
```json
{
  "order": 1,
  "condition": {
    "type": "step_failed",
    "step_types": ["dti_rule", "amount_policy", "sentiment_check"]
  },
  "outcome": "REJECTED"
}
```

**2. risk_threshold** - Evaluates risk score against threshold
```json
{
  "order": 2,
  "condition": {
    "type": "risk_threshold",
    "value": 45,
    "operator": "<="
  },
  "outcome": "APPROVED"
}
```

**3. default** - Catch-all condition (always matches)
```json
{
  "order": 3,
  "condition": {"type": "default"},
  "outcome": "NEEDS_REVIEW"
}
```

### Outcomes

- `APPROVED`: Application accepted
- `REJECTED`: Application denied
- `NEEDS_REVIEW`: Manual review required

## API Endpoints

### API Endpoints

### Applications

- `POST /api/v1/applications` - Create loan application
- `GET /api/v1/applications` - List all applications
- `GET /api/v1/applications/{id}` - Get application details

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Ana",
    "amount": 12000.00,
    "monthly_income": 4000.00,
    "declared_debts": 500.00,
    "country": "ES",
    "loan_purpose": "home renovation"
  }'
```

### Pipelines

- `POST /api/v1/pipelines` - Create pipeline
- `GET /api/v1/pipelines` - List all pipelines
- `GET /api/v1/pipelines/{id}` - Get pipeline details
- `PUT /api/v1/pipelines/{id}` - Update pipeline configuration

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/v1/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Standard Pipeline",
    "description": "Default loan approval workflow",
    "steps": [
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
          "risky_keywords": ["gambling", "crypto", "betting"]
        }
      }
    ],
    "terminal_rules": [
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
  }'
```

### Runs

- `POST /api/v1/runs` - Execute application through pipeline
- `GET /api/v1/runs/{id}` - Get run results with step logs

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/v1/runs \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "pipeline_id": 1
  }'
```

**Example Response:**
```json
{
  "id": 1,
  "application_id": 1,
  "pipeline_id": 1,
  "status": "APPROVED",
  "step_logs": [
    {
      "step_type": "dti_rule",
      "order": 1,
      "passed": true,
      "details": {
        "dti": 0.125,
        "max_dti": 0.4
      },
      "executed_at": "2025-10-24T18:05:32.861817"
    }
  ],
  "started_at": "2025-10-24T18:05:32.859872Z",
  "completed_at": "2025-10-24T18:05:38.685563Z"
}
```

## Test Scenarios

### Scenario 1: Ana (APPROVED)
- Amount: €12,000
- Country: ES
- Monthly Income: €4,000
- Debts: €500
- Purpose: home renovation
- **Result**: DTI 12.5%, Risk 20.5 → APPROVED

### Scenario 2: Luis (REJECTED)
- Amount: €28,000
- Country: OTHER
- Monthly Income: €2,000
- Debts: €1,200
- Purpose: business expansion
- **Result**: DTI 60%, amount exceeds €20K cap → REJECTED

### Scenario 3: Mia (NEEDS_REVIEW)
- Amount: €20,000
- Country: FR
- Monthly Income: €3,000
- Debts: €900
- Purpose: car purchase
- **Result**: DTI 30%, Risk 46 > threshold → NEEDS_REVIEW

### Scenario 4: Eva (REJECTED)
- Amount: €15,000
- Country: ES
- Monthly Income: €5,000
- Debts: €200
- Purpose: gambling
- **Result**: DTI 4%, Risk 14, but risky purpose → REJECTED

## Database

### Migrations

**Create migration:**
```bash
alembic revision --autogenerate -m "Description of changes"
```

**Apply migrations:**
```bash
alembic upgrade head
```

**Rollback migration:**
```bash
alembic downgrade -1
```

**Check current version:**
```bash
alembic current
```

**View migration history:**
```bash
alembic history
```

### Database Shell

**Access PostgreSQL:**
```bash
# Inside Docker
docker exec -it loan-application-orchestrator-db-1 psql -U loan_user -d loan_orchestrator

# Local
psql -U loan_user -d loan_orchestrator
```

### Schema

**applications**
- `id` (PK)
- `applicant_name`
- `amount` (Decimal)
- `monthly_income` (Decimal)
- `declared_debts` (Decimal)
- `country`
- `loan_purpose`
- `created_at`, `updated_at`

**pipelines**
- `id` (PK)
- `name` (unique)
- `description`
- `steps` (JSONB)
- `terminal_rules` (JSONB)
- `created_at`, `updated_at`

**runs**
- `id` (PK)
- `application_id` (FK)
- `pipeline_id` (FK)
- `status` (APPROVED/REJECTED/NEEDS_REVIEW)
- `step_logs` (JSONB)
- `started_at`, `completed_at`, `created_at`

## Extending the System

### Adding a New Business Rule Step

1. **Create step class** in `app/steps/`:

```python
from app.steps.base import BaseStep, StepResult
from typing import Any
from decimal import Decimal

class MyCustomStep(BaseStep):
    @classmethod
    def get_step_type(cls) -> str:
        return "my_custom_step"

    @classmethod
    def get_default_params(cls) -> dict[str, Any]:
        return {"threshold": 100}

    async def execute(
        self,
        applicant_name: str,
        amount: Decimal,
        monthly_income: Decimal,
        declared_debts: Decimal,
        country: str,
        loan_purpose: str,
        previous_results: dict[str, StepResult]
    ) -> StepResult:
        # Your validation logic here
        passed = True  # or False based on your logic

        return StepResult(
            passed=passed,
            details={"reason": "explanation here"}
        )
```

2. **Register step** in `app/steps/__init__.py`:

```python
from app.steps.my_custom_step import MyCustomStep

__all__ = [
    # ... existing exports
    "MyCustomStep",
]
```

3. **Register in service** in `app/services/step_registry.py`:

```python
from app.steps import MyCustomStep

# Add to registry initialization
StepRegistry.register(MyCustomStep)
```

4. **Write tests** in `tests/test_steps.py`:

```python
class TestMyCustomStep:
    async def test_my_custom_logic(self):
        step = MyCustomStep(params={"threshold": 100})
        result = await step.execute(...)
        assert result.passed is True
```

5. **Run migration** if needed:

```bash
alembic revision --autogenerate -m "Add support for my_custom_step"
alembic upgrade head
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Migration Issues

```bash
# Check current migration version
alembic current

# View migration history
alembic history

# Downgrade one version
alembic downgrade -1

# Upgrade to latest
alembic upgrade head
```

### OpenAI API Issues

If sentiment check shows `"method": "keyword_match_fallback"`, the system attempted AI but failed:

1. Check API key is set in `.env`
2. Verify API quota at https://platform.openai.com/usage
3. Check error details in `step_logs[].details.ai_error`

Without OpenAI key, sentiment check uses keyword matching only.

## Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write tests first (TDD approach recommended)
3. Implement feature
4. Run tests: `pytest -v`
5. Run linters: `flake8 app/ && black app/ && isort app/`
6. Create migration if needed: `alembic revision --autogenerate`
7. Commit changes with descriptive message
8. Create pull request

## License

MIT
