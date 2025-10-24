from typing import Type
from app.steps.base import BaseStep
from app.steps.dti_rule import DTIRuleStep
from app.steps.amount_policy import AmountPolicyStep
from app.steps.risk_scoring import RiskScoringStep
from app.steps.sentiment_check import SentimentCheckStep


class StepRegistry:
    _steps: dict[str, Type[BaseStep]] = {}

    @classmethod
    def register(cls, step_class: Type[BaseStep]):
        """Register a step class"""
        step_type = step_class.get_step_type()
        cls._steps[step_type] = step_class

    @classmethod
    def get_step_class(cls, step_type: str) -> Type[BaseStep]:
        """Get a step class by type"""
        if step_type not in cls._steps:
            raise ValueError(f"Unknown step type: {step_type}")
        return cls._steps[step_type]

    @classmethod
    def list_available_steps(cls) -> dict[str, dict]:
        """List all available steps with their default params"""
        return {
            step_type: {
                "default_params": step_class.get_default_params()
            }
            for step_type, step_class in cls._steps.items()
        }


# Register all steps
StepRegistry.register(DTIRuleStep)
StepRegistry.register(AmountPolicyStep)
StepRegistry.register(RiskScoringStep)
StepRegistry.register(SentimentCheckStep)
