from pydantic import BaseModel, Field, ConfigDict
from typing import Any
from datetime import datetime


class StepLog(BaseModel):
    step_type: str
    order: int
    passed: bool
    details: dict[str, Any]
    executed_at: datetime


class RunCreate(BaseModel):
    application_id: int
    pipeline_id: int


class RunResponse(BaseModel):
    id: int
    application_id: int
    pipeline_id: int
    status: str
    step_logs: list[StepLog]
    started_at: datetime
    completed_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
