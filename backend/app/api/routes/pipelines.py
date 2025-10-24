from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.pipeline import Pipeline
from app.schemas.pipeline import PipelineCreate, PipelineUpdate, PipelineResponse
from app.services.step_registry import StepRegistry

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.get("/available-steps")
async def get_available_steps():
    """Get list of available step types with their default parameters"""
    return StepRegistry.list_available_steps()


@router.post("", response_model=PipelineResponse, status_code=201)
async def create_pipeline(
    pipeline: PipelineCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new pipeline configuration"""
    # Validate step types
    for step in pipeline.steps:
        try:
            StepRegistry.get_step_class(step.step_type)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    # Convert Pydantic models to dicts for JSONB
    steps_data = [step.model_dump() for step in pipeline.steps]
    terminal_rules_data = [rule.model_dump() for rule in pipeline.terminal_rules]

    db_pipeline = Pipeline(
        name=pipeline.name,
        description=pipeline.description,
        steps=steps_data,
        terminal_rules=terminal_rules_data
    )

    db.add(db_pipeline)

    try:
        await db.flush()
        await db.refresh(db_pipeline)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Pipeline creation failed: {str(e)}")

    return db_pipeline


@router.get("/{pipeline_id}", response_model=PipelineResponse)
async def get_pipeline(
    pipeline_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a pipeline by ID"""
    result = await db.execute(
        select(Pipeline).where(Pipeline.id == pipeline_id)
    )
    pipeline = result.scalar_one_or_none()

    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    return pipeline


@router.get("", response_model=list[PipelineResponse])
async def list_pipelines(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all pipelines"""
    result = await db.execute(
        select(Pipeline).offset(skip).limit(limit)
    )
    pipelines = result.scalars().all()
    return pipelines


@router.put("/{pipeline_id}", response_model=PipelineResponse)
async def update_pipeline(
    pipeline_id: int,
    pipeline_update: PipelineUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a pipeline configuration"""
    result = await db.execute(
        select(Pipeline).where(Pipeline.id == pipeline_id)
    )
    db_pipeline = result.scalar_one_or_none()

    if not db_pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    # Update fields if provided
    update_data = pipeline_update.model_dump(exclude_unset=True)

    if "steps" in update_data:
        # Validate step types
        for step in pipeline_update.steps:
            try:
                StepRegistry.get_step_class(step.step_type)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))
        update_data["steps"] = [step.model_dump() for step in pipeline_update.steps]

    if "terminal_rules" in update_data:
        update_data["terminal_rules"] = [rule.model_dump() for rule in pipeline_update.terminal_rules]

    for field, value in update_data.items():
        setattr(db_pipeline, field, value)

    await db.flush()
    await db.refresh(db_pipeline)

    return db_pipeline


@router.delete("/{pipeline_id}", status_code=204)
async def delete_pipeline(
    pipeline_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a pipeline"""
    result = await db.execute(
        select(Pipeline).where(Pipeline.id == pipeline_id)
    )
    pipeline = result.scalar_one_or_none()

    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    await db.delete(pipeline)
    return None
