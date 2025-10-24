from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    applicant_name = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    monthly_income = Column(Numeric(12, 2), nullable=False)
    declared_debts = Column(Numeric(12, 2), nullable=False)
    country = Column(String(10), nullable=False)
    loan_purpose = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
