from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.core.database import get_db
from app.models.application import Application
from app.models.pipeline import Pipeline
from app.models.run import Run
from app.schemas.run import RunCreate, RunResponse
from app.services.pipeline_executor import PipelineExecutor

router = APIRouter(prefix="/runs", tags=["runs"])


@router.post("", response_model=RunResponse, status_code=201)
async def create_run(
    run: RunCreate,
    db: AsyncSession = Depends(get_db)
):
    """Execute a pipeline on an application"""
    # Fetch application
    app_result = await db.execute(
        select(Application).where(Application.id == run.application_id)
    )
    application = app_result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Fetch pipeline
    pipe_result = await db.execute(
        select(Pipeline).where(Pipeline.id == run.pipeline_id)
    )
    pipeline = pipe_result.scalar_one_or_none()

    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    # Execute pipeline
    executor = PipelineExecutor(
        steps_config=pipeline.steps,
        terminal_rules=pipeline.terminal_rules
    )

    try:
        final_status, step_logs = await executor.execute(
            applicant_name=application.applicant_name,
            amount=application.amount,
            monthly_income=application.monthly_income,
            declared_debts=application.declared_debts,
            country=application.country,
            loan_purpose=application.loan_purpose
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")

    # Create run record
    db_run = Run(
        application_id=run.application_id,
        pipeline_id=run.pipeline_id,
        status=final_status,
        step_logs=step_logs,
        completed_at=datetime.utcnow()
    )

    db.add(db_run)
    await db.flush()
    await db.refresh(db_run)

    return db_run


@router.get("/{run_id}", response_model=RunResponse)
async def get_run(
    run_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a run by ID"""
    result = await db.execute(
        select(Run).where(Run.id == run_id)
    )
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return run


@router.get("", response_model=list[RunResponse])
async def list_runs(
    application_id: int | None = None,
    pipeline_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all runs with optional filters"""
    query = select(Run)

    if application_id:
        query = query.where(Run.application_id == application_id)

    if pipeline_id:
        query = query.where(Run.pipeline_id == pipeline_id)

    query = query.offset(skip).limit(limit).order_by(Run.created_at.desc())

    result = await db.execute(query)
    runs = result.scalars().all()
    return runs
