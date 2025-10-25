import pytest
from decimal import Decimal
from app.services.step_registry import StepRegistry
from app.services.pipeline_executor import PipelineExecutor
from app.steps.dti_rule import DTIRuleStep
from app.steps.amount_policy import AmountPolicyStep
from app.steps.risk_scoring import RiskScoringStep
from app.steps.sentiment_check import SentimentCheckStep


@pytest.mark.unit
class TestStepRegistry:
    """Test Step Registry functionality"""

    def test_registry_contains_all_steps(self):
        """Test that all step types are registered"""
        expected_steps = ["dti_rule", "amount_policy", "risk_scoring", "sentiment_check"]

        for step_type in expected_steps:
            assert StepRegistry.get_step_class(step_type) is not None

    def test_get_dti_rule_step(self):
        """Test getting DTI rule step class"""
        step_class = StepRegistry.get_step_class("dti_rule")
        assert step_class == DTIRuleStep

    def test_get_amount_policy_step(self):
        """Test getting amount policy step class"""
        step_class = StepRegistry.get_step_class("amount_policy")
        assert step_class == AmountPolicyStep

    def test_get_risk_scoring_step(self):
        """Test getting risk scoring step class"""
        step_class = StepRegistry.get_step_class("risk_scoring")
        assert step_class == RiskScoringStep

    def test_get_sentiment_check_step(self):
        """Test getting sentiment check step class"""
        step_class = StepRegistry.get_step_class("sentiment_check")
        assert step_class == SentimentCheckStep

    def test_get_nonexistent_step(self):
        """Test getting non-existent step type"""
        with pytest.raises(ValueError, match="Unknown step type"):
            StepRegistry.get_step_class("nonexistent_step")

    def test_step_instantiation_with_params(self):
        """Test creating step instance with custom params"""
        step_class = StepRegistry.get_step_class("dti_rule")
        custom_params = {"max_dti": 0.5}
        step_instance = step_class(params=custom_params)

        assert step_instance.params["max_dti"] == 0.5

    def test_step_instantiation_with_default_params(self):
        """Test creating step instance with default params"""
        step_class = StepRegistry.get_step_class("dti_rule")
        step_instance = step_class()

        # When instantiated without params, params is empty dict
        assert step_instance.params == {}
        # But class has default params defined
        assert step_class.get_default_params() == {"max_dti": 0.4}


@pytest.mark.integration
class TestPipelineExecutor:
    """Test Pipeline Executor functionality"""

    async def test_execute_approved_scenario(self):
        """Test execution with Ana's scenario (APPROVED)"""
        pipeline_config = {
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                },
                {
                    "step_type": "amount_policy",
                    "order": 2,
                    "params": {"ES": 30000}
                },
                {
                    "step_type": "risk_scoring",
                    "order": 3,
                    "params": {"approve_threshold": 45}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {
                        "type": "step_failed",
                        "step_types": ["dti_rule", "amount_policy"]
                    },
                    "outcome": "REJECTED"
                },
                {
                    "order": 2,
                    "condition": {
                        "type": "risk_threshold",
                        "value": 45,
                        "operator": "<="
                    },
                    "outcome": "APPROVED"
                },
                {
                    "order": 3,
                    "condition": {"type": "default"},
                    "outcome": "NEEDS_REVIEW"
                }
            ]
        }

        application_data = {
            "applicant_name": "Ana",
            "amount": Decimal("12000"),
            "monthly_income": Decimal("4000"),
            "declared_debts": Decimal("500"),
            "country": "ES",
            "loan_purpose": "home renovation"
        }

        executor = PipelineExecutor(
            steps_config=pipeline_config["steps"],
            terminal_rules=pipeline_config["terminal_rules"]
        )

        status, step_logs = await executor.execute(**application_data)

        assert status == "APPROVED"
        assert len(step_logs) == 3
        assert all(log["passed"] for log in step_logs)

    async def test_execute_rejected_scenario_dti(self):
        """Test execution with Luis's scenario (REJECTED - DTI)"""
        pipeline_config = {
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                },
                {
                    "step_type": "amount_policy",
                    "order": 2,
                    "params": {"OTHER": 20000}
                },
                {
                    "step_type": "risk_scoring",
                    "order": 3,
                    "params": {"approve_threshold": 45}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {
                        "type": "step_failed",
                        "step_types": ["dti_rule", "amount_policy"]
                    },
                    "outcome": "REJECTED"
                },
                {
                    "order": 2,
                    "condition": {
                        "type": "risk_threshold",
                        "value": 45,
                        "operator": "<="
                    },
                    "outcome": "APPROVED"
                },
                {
                    "order": 3,
                    "condition": {"type": "default"},
                    "outcome": "NEEDS_REVIEW"
                }
            ]
        }

        application_data = {
            "applicant_name": "Luis",
            "amount": Decimal("28000"),
            "monthly_income": Decimal("2000"),
            "declared_debts": Decimal("1200"),
            "country": "OTHER",
            "loan_purpose": "business expansion"
        }

        executor = PipelineExecutor(
            steps_config=pipeline_config["steps"],
            terminal_rules=pipeline_config["terminal_rules"]
        )

        status, step_logs = await executor.execute(**application_data)

        assert status == "REJECTED"
        assert len(step_logs) == 3
        # DTI should fail (60%)
        assert step_logs[0]["passed"] is False
        # Amount should fail (28000 > 20000)
        assert step_logs[1]["passed"] is False

    async def test_execute_needs_review_scenario(self):
        """Test execution with Mia's scenario (NEEDS_REVIEW)"""
        pipeline_config = {
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                },
                {
                    "step_type": "amount_policy",
                    "order": 2,
                    "params": {"FR": 25000}
                },
                {
                    "step_type": "risk_scoring",
                    "order": 3,
                    "params": {"approve_threshold": 45}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {
                        "type": "step_failed",
                        "step_types": ["dti_rule", "amount_policy"]
                    },
                    "outcome": "REJECTED"
                },
                {
                    "order": 2,
                    "condition": {
                        "type": "risk_threshold",
                        "value": 45,
                        "operator": "<="
                    },
                    "outcome": "APPROVED"
                },
                {
                    "order": 3,
                    "condition": {"type": "default"},
                    "outcome": "NEEDS_REVIEW"
                }
            ]
        }

        application_data = {
            "applicant_name": "Mia",
            "amount": Decimal("20000"),
            "monthly_income": Decimal("3000"),
            "declared_debts": Decimal("900"),
            "country": "FR",
            "loan_purpose": "car purchase"
        }

        executor = PipelineExecutor(
            steps_config=pipeline_config["steps"],
            terminal_rules=pipeline_config["terminal_rules"]
        )

        status, step_logs = await executor.execute(**application_data)

        assert status == "NEEDS_REVIEW"
        assert len(step_logs) == 3
        # DTI should pass (30%)
        assert step_logs[0]["passed"] is True
        # Amount should pass (20000 <= 25000)
        assert step_logs[1]["passed"] is True
        # Risk scoring should fail (risk > 45)
        assert step_logs[2]["passed"] is False

    async def test_terminal_rule_step_failed(self):
        """Test terminal rule evaluation for step_failed condition"""
        pipeline_config = {
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {
                        "type": "step_failed",
                        "step_types": ["dti_rule"]
                    },
                    "outcome": "REJECTED"
                },
                {
                    "order": 2,
                    "condition": {"type": "default"},
                    "outcome": "APPROVED"
                }
            ]
        }

        # Application with high DTI
        application_data = {
            "applicant_name": "Test",
            "amount": Decimal("10000"),
            "monthly_income": Decimal("1000"),
            "declared_debts": Decimal("600"),
            "country": "ES",
            "loan_purpose": "test"
        }

        executor = PipelineExecutor(
            steps_config=pipeline_config["steps"],
            terminal_rules=pipeline_config["terminal_rules"]
        )

        status, step_logs = await executor.execute(**application_data)

        assert status == "REJECTED"
        assert step_logs[0]["passed"] is False

    async def test_terminal_rule_risk_threshold(self):
        """Test terminal rule evaluation for risk_threshold condition"""
        pipeline_config = {
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                },
                {
                    "step_type": "amount_policy",
                    "order": 2,
                    "params": {"ES": 30000}
                },
                {
                    "step_type": "risk_scoring",
                    "order": 3,
                    "params": {"approve_threshold": 45}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {
                        "type": "risk_threshold",
                        "value": 30,
                        "operator": "<="
                    },
                    "outcome": "APPROVED"
                },
                {
                    "order": 2,
                    "condition": {"type": "default"},
                    "outcome": "NEEDS_REVIEW"
                }
            ]
        }

        # Low risk application
        application_data = {
            "applicant_name": "Test",
            "amount": Decimal("10000"),
            "monthly_income": Decimal("5000"),
            "declared_debts": Decimal("200"),
            "country": "ES",
            "loan_purpose": "test"
        }

        executor = PipelineExecutor(
            steps_config=pipeline_config["steps"],
            terminal_rules=pipeline_config["terminal_rules"]
        )

        status, step_logs = await executor.execute(**application_data)

        assert status == "APPROVED"
        # Risk score should be low
        risk_log = next(log for log in step_logs if log["step_type"] == "risk_scoring")
        assert risk_log["details"]["risk_score"] <= 30

    async def test_terminal_rule_default(self):
        """Test terminal rule evaluation for default condition"""
        pipeline_config = {
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {"type": "default"},
                    "outcome": "NEEDS_REVIEW"
                }
            ]
        }

        application_data = {
            "applicant_name": "Test",
            "amount": Decimal("10000"),
            "monthly_income": Decimal("5000"),
            "declared_debts": Decimal("200"),
            "country": "ES",
            "loan_purpose": "test"
        }

        executor = PipelineExecutor(
            steps_config=pipeline_config["steps"],
            terminal_rules=pipeline_config["terminal_rules"]
        )

        status, step_logs = await executor.execute(**application_data)

        # Should always match default condition
        assert status == "NEEDS_REVIEW"

    async def test_steps_execute_in_order(self):
        """Test that steps execute in correct order"""
        pipeline_config = {
            "steps": [
                {
                    "step_type": "sentiment_check",
                    "order": 4,
                    "params": {"risky_keywords": ["gambling"]}
                },
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                },
                {
                    "step_type": "risk_scoring",
                    "order": 3,
                    "params": {"approve_threshold": 45}
                },
                {
                    "step_type": "amount_policy",
                    "order": 2,
                    "params": {"ES": 30000}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {"type": "default"},
                    "outcome": "APPROVED"
                }
            ]
        }

        application_data = {
            "applicant_name": "Test",
            "amount": Decimal("10000"),
            "monthly_income": Decimal("5000"),
            "declared_debts": Decimal("200"),
            "country": "ES",
            "loan_purpose": "test"
        }

        executor = PipelineExecutor(
            steps_config=pipeline_config["steps"],
            terminal_rules=pipeline_config["terminal_rules"]
        )

        status, step_logs = await executor.execute(**application_data)

        # Verify steps executed in order 1, 2, 3, 4
        assert step_logs[0]["order"] == 1
        assert step_logs[0]["step_type"] == "dti_rule"
        assert step_logs[1]["order"] == 2
        assert step_logs[1]["step_type"] == "amount_policy"
        assert step_logs[2]["order"] == 3
        assert step_logs[2]["step_type"] == "risk_scoring"
        assert step_logs[3]["order"] == 4
        assert step_logs[3]["step_type"] == "sentiment_check"
