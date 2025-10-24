from typing import Any
from decimal import Decimal
from app.steps.base import BaseStep, StepResult


class AmountPolicyStep(BaseStep):
    @classmethod
    def get_step_type(cls) -> str:
        return "amount_policy"

    @classmethod
    def get_default_params(cls) -> dict[str, Any]:
        return {
            "ES": 30000,
            "FR": 25000,
            "DE": 35000,
            "OTHER": 20000
        }

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
        # Get country cap or default to OTHER
        cap = self.params.get(country, self.params.get("OTHER", 20000))

        passed = float(amount) <= cap

        details = {
            "amount": float(amount),
            "country": country,
            "cap": cap
        }

        return StepResult(passed=passed, details=details)
