from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import datetime


class ApplicationBase(BaseModel):
    applicant_name: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    monthly_income: Decimal = Field(..., gt=0, decimal_places=2)
    declared_debts: Decimal = Field(..., ge=0, decimal_places=2)
    country: str = Field(..., min_length=2, max_length=10)
    loan_purpose: str = Field(..., min_length=1)


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationResponse(ApplicationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
