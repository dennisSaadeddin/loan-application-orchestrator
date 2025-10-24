from datetime import datetime
from decimal import Decimal
from app.steps.base import StepResult
from app.services.step_registry import StepRegistry


class PipelineExecutor:
    def __init__(self, steps_config: list[dict], terminal_rules: list[dict]):
        self.steps_config = sorted(steps_config, key=lambda x: x["order"])
        self.terminal_rules = sorted(terminal_rules, key=lambda x: x["order"])

    async def execute(
        self,
        applicant_name: str,
        amount: Decimal,
        monthly_income: Decimal,
        declared_debts: Decimal,
        country: str,
        loan_purpose: str
    ) -> tuple[str, list[dict]]:
        """
        Execute the pipeline and return (final_status, step_logs)
        """
        step_logs = []
        step_results = {}

        # Execute each step in order
        for step_config in self.steps_config:
            step_type = step_config["step_type"]
            step_params = step_config.get("params", {})

            # Get step class and instantiate
            step_class = StepRegistry.get_step_class(step_type)
            step_instance = step_class(params=step_params)

            # Execute step
            result = await step_instance.execute(
                applicant_name=applicant_name,
                amount=amount,
                monthly_income=monthly_income,
                declared_debts=declared_debts,
                country=country,
                loan_purpose=loan_purpose,
                previous_results=step_results
            )

            # Store result
            step_results[step_type] = result

            # Log execution
            step_log = {
                "step_type": step_type,
                "order": step_config["order"],
                "passed": result.passed,
                "details": result.details,
                "executed_at": datetime.utcnow().isoformat()
            }
            step_logs.append(step_log)

        # Evaluate terminal rules
        final_status = self._evaluate_terminal_rules(step_results)

        return final_status, step_logs

    def _evaluate_terminal_rules(self, step_results: dict[str, StepResult]) -> str:
        """Evaluate terminal rules in order and return final status"""
        for rule in self.terminal_rules:
            condition = rule["condition"]
            condition_type = condition.get("type")

            if condition_type == "step_failed":
                # Check if any of the specified steps failed
                step_types = condition.get("step_types", [])
                if any(
                    step_results.get(st) and not step_results[st].passed
                    for st in step_types
                ):
                    return rule["outcome"]

            elif condition_type == "risk_threshold":
                # Check risk score from risk_scoring step
                risk_result = step_results.get("risk_scoring")
                if risk_result:
                    risk_score = risk_result.details.get("risk_score", 999)
                    threshold = condition.get("value", 45)
                    operator = condition.get("operator", "<=")

                    if operator == "<=" and risk_score <= threshold:
                        return rule["outcome"]
                    elif operator == "<" and risk_score < threshold:
                        return rule["outcome"]
                    elif operator == ">=" and risk_score >= threshold:
                        return rule["outcome"]
                    elif operator == ">" and risk_score > threshold:
                        return rule["outcome"]

            elif condition_type == "default":
                # Default rule always matches
                return rule["outcome"]

        # Fallback if no rules matched
        return "NEEDS_REVIEW"
