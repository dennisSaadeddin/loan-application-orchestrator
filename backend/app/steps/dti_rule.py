from typing import Any
from decimal import Decimal
from app.steps.base import BaseStep, StepResult


class DTIRuleStep(BaseStep):
    @classmethod
    def get_step_type(cls) -> str:
        return "dti_rule"

    @classmethod
    def get_default_params(cls) -> dict[str, Any]:
        return {"max_dti": 0.40}

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
        max_dti = self.params.get("max_dti", 0.40)

        # Calculate DTI
        dti = float(declared_debts) / float(monthly_income) if monthly_income > 0 else 1.0

        passed = dti < max_dti

        details = {
            "dti": round(dti, 4),
            "max_dti": max_dti,
            "declared_debts": float(declared_debts),
            "monthly_income": float(monthly_income)
        }

        return StepResult(passed=passed, details=details)
