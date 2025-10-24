from abc import ABC, abstractmethod
from typing import Any
from decimal import Decimal


class StepResult:
    def __init__(self, passed: bool, details: dict[str, Any]):
        self.passed = passed
        self.details = details


class BaseStep(ABC):
    def __init__(self, params: dict[str, Any] | None = None):
        self.params = params or {}

    @abstractmethod
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
        """Execute the step and return result"""
        pass

    @classmethod
    @abstractmethod
    def get_step_type(cls) -> str:
        """Return the step type identifier"""
        pass

    @classmethod
    def get_default_params(cls) -> dict[str, Any]:
        """Return default parameters for this step"""
        return {}
