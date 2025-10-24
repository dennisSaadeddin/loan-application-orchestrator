from typing import Any
from decimal import Decimal
from app.steps.base import BaseStep, StepResult


class RiskScoringStep(BaseStep):
    @classmethod
    def get_step_type(cls) -> str:
        return "risk_scoring"

    @classmethod
    def get_default_params(cls) -> dict[str, Any]:
        return {"approve_threshold": 45}

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
        approve_threshold = self.params.get("approve_threshold", 45)

        # Calculate DTI
        dti = float(declared_debts) / float(monthly_income) if monthly_income > 0 else 1.0

        # Get max_allowed from amount_policy step or use default
        amount_policy_result = previous_results.get("amount_policy")
        if amount_policy_result:
            max_allowed = amount_policy_result.details.get("cap", 20000)
        else:
            # Fallback defaults
            country_caps = {"ES": 30000, "FR": 25000, "DE": 35000}
            max_allowed = country_caps.get(country, 20000)

        # Calculate risk score: risk = (dti * 100) + (amount/max_allowed * 20)
        risk = (dti * 100) + (float(amount) / max_allowed * 20)

        passed = risk <= approve_threshold

        details = {
            "risk_score": round(risk, 2),
            "approve_threshold": approve_threshold,
            "dti": round(dti, 4),
            "amount": float(amount),
            "max_allowed": max_allowed
        }

        return StepResult(passed=passed, details=details)
