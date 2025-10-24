from pydantic import BaseModel, Field, ConfigDict
from typing import Any
from datetime import datetime


class StepConfig(BaseModel):
    step_type: str
    order: int
    params: dict[str, Any] = Field(default_factory=dict)


class TerminalRule(BaseModel):
    order: int
    condition: dict[str, Any]
    outcome: str  # APPROVED, REJECTED, NEEDS_REVIEW


class PipelineBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    steps: list[StepConfig]
    terminal_rules: list[TerminalRule]


class PipelineCreate(PipelineBase):
    pass


class PipelineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    steps: list[StepConfig] | None = None
    terminal_rules: list[TerminalRule] | None = None


class PipelineResponse(PipelineBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
