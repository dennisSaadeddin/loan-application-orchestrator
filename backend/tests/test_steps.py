import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, patch, MagicMock
from app.steps.dti_rule import DTIRuleStep
from app.steps.amount_policy import AmountPolicyStep
from app.steps.risk_scoring import RiskScoringStep
from app.steps.sentiment_check import SentimentCheckStep
from app.steps.base import StepResult


@pytest.mark.unit
class TestDTIRuleStep:
    """Test DTI Rule Step"""

    async def test_dti_within_threshold(self):
        """Test DTI calculation when within acceptable threshold"""
        step = DTIRuleStep(params={"max_dti": 0.4})

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("15000"),
            monthly_income=Decimal("4000"),
            declared_debts=Decimal("1000"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={}
        )

        assert result.passed is True
        assert result.details["dti"] == 0.25
        assert result.details["max_dti"] == 0.4

    async def test_dti_exceeds_threshold(self):
        """Test DTI calculation when exceeding threshold"""
        step = DTIRuleStep(params={"max_dti": 0.4})

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("15000"),
            monthly_income=Decimal("2000"),
            declared_debts=Decimal("1200"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={}
        )

        assert result.passed is False
        assert result.details["dti"] == 0.6
        assert result.details["max_dti"] == 0.4

    async def test_dti_zero_debts(self):
        """Test DTI with zero declared debts"""
        step = DTIRuleStep(params={"max_dti": 0.4})

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("15000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("0"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={}
        )

        assert result.passed is True
        assert result.details["dti"] == 0.0

    async def test_dti_at_exact_threshold(self):
        """Test DTI at exact threshold value"""
        step = DTIRuleStep(params={"max_dti": 0.4})

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("15000"),
            monthly_income=Decimal("1000"),
            declared_debts=Decimal("400"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={}
        )

        assert result.passed is True
        assert result.details["dti"] == 0.4


@pytest.mark.unit
class TestAmountPolicyStep:
    """Test Amount Policy Step"""

    async def test_amount_within_country_cap_es(self):
        """Test amount within Spain cap"""
        step = AmountPolicyStep(params={
            "DE": 35000,
            "ES": 30000,
            "FR": 25000,
            "OTHER": 20000
        })

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("25000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("600"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={}
        )

        assert result.passed is True
        assert result.details["cap"] == 30000
        assert result.details["country"] == "ES"

    async def test_amount_exceeds_country_cap(self):
        """Test amount exceeding country cap"""
        step = AmountPolicyStep(params={
            "DE": 35000,
            "ES": 30000,
            "FR": 25000,
            "OTHER": 20000
        })

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("35000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("600"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={}
        )

        assert result.passed is False
        assert result.details["cap"] == 30000
        assert result.details["amount"] == 35000.0

    async def test_amount_other_country(self):
        """Test amount for unlisted country (OTHER)"""
        step = AmountPolicyStep(params={
            "DE": 35000,
            "ES": 30000,
            "FR": 25000,
            "OTHER": 20000
        })

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("18000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("600"),
            country="US",
            loan_purpose="home renovation",
            previous_results={}
        )

        assert result.passed is True
        assert result.details["cap"] == 20000
        assert result.details["country"] == "US"

    async def test_amount_at_exact_cap(self):
        """Test amount at exact country cap"""
        step = AmountPolicyStep(params={
            "DE": 35000,
            "ES": 30000,
            "FR": 25000,
            "OTHER": 20000
        })

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("30000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("600"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={}
        )

        assert result.passed is True
        assert result.details["amount"] == 30000.0


@pytest.mark.unit
class TestRiskScoringStep:
    """Test Risk Scoring Step"""

    async def test_low_risk_score(self):
        """Test low risk calculation"""
        step = RiskScoringStep(params={"approve_threshold": 45})

        # First execute DTI and amount policy to populate previous results
        dti_step = DTIRuleStep(params={"max_dti": 0.4})
        dti_result = await dti_step.execute(
            applicant_name="John Doe",
            amount=Decimal("12000"),
            monthly_income=Decimal("4000"),
            declared_debts=Decimal("500"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={}
        )

        amount_step = AmountPolicyStep(params={"ES": 30000})
        amount_result = await amount_step.execute(
            applicant_name="John Doe",
            amount=Decimal("12000"),
            monthly_income=Decimal("4000"),
            declared_debts=Decimal("500"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={"dti_rule": dti_result}
        )

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("12000"),
            monthly_income=Decimal("4000"),
            declared_debts=Decimal("500"),
            country="ES",
            loan_purpose="home renovation",
            previous_results={
                "dti_rule": dti_result,
                "amount_policy": amount_result
            }
        )

        assert result.passed is True
        # DTI = 0.125, max_allowed = 30000
        # Risk = (0.125 * 100) + (12000/30000 * 20) = 12.5 + 8 = 20.5
        assert result.details["risk_score"] == 20.5
        assert result.details["approve_threshold"] == 45

    async def test_high_risk_score(self):
        """Test high risk calculation"""
        step = RiskScoringStep(params={"approve_threshold": 45})

        dti_step = DTIRuleStep(params={"max_dti": 0.4})
        dti_result = await dti_step.execute(
            applicant_name="John Doe",
            amount=Decimal("20000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("900"),
            country="FR",
            loan_purpose="car purchase",
            previous_results={}
        )

        amount_step = AmountPolicyStep(params={"FR": 25000})
        amount_result = await amount_step.execute(
            applicant_name="John Doe",
            amount=Decimal("20000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("900"),
            country="FR",
            loan_purpose="car purchase",
            previous_results={"dti_rule": dti_result}
        )

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("20000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("900"),
            country="FR",
            loan_purpose="car purchase",
            previous_results={
                "dti_rule": dti_result,
                "amount_policy": amount_result
            }
        )

        assert result.passed is False
        # DTI = 0.3, max_allowed = 25000
        # Risk = (0.3 * 100) + (20000/25000 * 20) = 30 + 16 = 46.0
        assert result.details["risk_score"] == 46.0
        assert result.details["approve_threshold"] == 45

    async def test_risk_score_at_threshold(self):
        """Test risk score at exact threshold"""
        step = RiskScoringStep(params={"approve_threshold": 45})

        dti_step = DTIRuleStep(params={"max_dti": 0.4})
        dti_result = await dti_step.execute(
            applicant_name="John Doe",
            amount=Decimal("15000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("900"),
            country="ES",
            loan_purpose="renovation",
            previous_results={}
        )

        amount_step = AmountPolicyStep(params={"ES": 30000})
        amount_result = await amount_step.execute(
            applicant_name="John Doe",
            amount=Decimal("15000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("900"),
            country="ES",
            loan_purpose="renovation",
            previous_results={"dti_rule": dti_result}
        )

        result = await step.execute(
            applicant_name="John Doe",
            amount=Decimal("15000"),
            monthly_income=Decimal("3000"),
            declared_debts=Decimal("900"),
            country="ES",
            loan_purpose="renovation",
            previous_results={
                "dti_rule": dti_result,
                "amount_policy": amount_result
            }
        )

        # DTI = 0.3, max_allowed = 30000
        # Risk = (0.3 * 100 * 0.7) + (15000/30000 * 100 * 0.3) = 21 + 15 = 36
        assert result.passed is True


@pytest.mark.unit
class TestSentimentCheckStep:
    """Test Sentiment Check Step"""

    async def test_keyword_match_risky(self):
        """Test sentiment check with risky keyword match"""
        step = SentimentCheckStep(params={
            "risky_keywords": ["gambling", "crypto", "betting"]
        })

        with patch('app.steps.sentiment_check.get_settings') as mock_settings:
            mock_settings.return_value.OPENAI_API_KEY = None

            result = await step.execute(
                applicant_name="John Doe",
                amount=Decimal("15000"),
                monthly_income=Decimal("5000"),
                declared_debts=Decimal("200"),
                country="ES",
                loan_purpose="gambling",
                previous_results={}
            )

            assert result.passed is False
            assert result.details["method"] == "keyword_match"
            assert "gambling" in result.details["found_keywords"]

    async def test_keyword_no_match_safe(self):
        """Test sentiment check with no keyword match"""
        step = SentimentCheckStep(params={
            "risky_keywords": ["gambling", "crypto", "betting"]
        })

        with patch('app.steps.sentiment_check.get_settings') as mock_settings:
            mock_settings.return_value.OPENAI_API_KEY = None

            result = await step.execute(
                applicant_name="John Doe",
                amount=Decimal("15000"),
                monthly_income=Decimal("5000"),
                declared_debts=Decimal("200"),
                country="ES",
                loan_purpose="home renovation",
                previous_results={}
            )

            assert result.passed is True
            assert result.details["method"] == "keyword_check"

    async def test_ai_analysis_risky(self):
        """Test AI sentiment analysis detecting risky purpose"""
        step = SentimentCheckStep(params={
            "risky_keywords": ["gambling", "crypto", "betting"]
        })

        # Mock OpenAI response
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "RISKY - This is for gambling purposes"

        with patch('app.steps.sentiment_check.get_settings') as mock_settings, \
             patch('app.steps.sentiment_check.AsyncOpenAI') as mock_openai:

            mock_settings.return_value.OPENAI_API_KEY = "test-key"
            mock_client = AsyncMock()
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            mock_openai.return_value = mock_client

            result = await step.execute(
                applicant_name="John Doe",
                amount=Decimal("15000"),
                monthly_income=Decimal("5000"),
                declared_debts=Decimal("200"),
                country="ES",
                loan_purpose="casino investment",
                previous_results={}
            )

            assert result.passed is False
            assert result.details["method"] == "ai_analysis"
            assert "RISKY" in result.details["ai_assessment"]

    async def test_ai_analysis_safe(self):
        """Test AI sentiment analysis approving safe purpose"""
        step = SentimentCheckStep(params={
            "risky_keywords": ["gambling", "crypto", "betting"]
        })

        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "SAFE - Home renovation is a legitimate purpose"

        with patch('app.steps.sentiment_check.get_settings') as mock_settings, \
             patch('app.steps.sentiment_check.AsyncOpenAI') as mock_openai:

            mock_settings.return_value.OPENAI_API_KEY = "test-key"
            mock_client = AsyncMock()
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            mock_openai.return_value = mock_client

            result = await step.execute(
                applicant_name="John Doe",
                amount=Decimal("15000"),
                monthly_income=Decimal("5000"),
                declared_debts=Decimal("200"),
                country="ES",
                loan_purpose="home renovation",
                previous_results={}
            )

            assert result.passed is True
            assert result.details["method"] == "ai_analysis"
            assert "SAFE" in result.details["ai_assessment"]

    async def test_ai_fallback_to_keyword(self):
        """Test AI failure falling back to keyword matching"""
        step = SentimentCheckStep(params={
            "risky_keywords": ["gambling", "crypto", "betting"]
        })

        with patch('app.steps.sentiment_check.get_settings') as mock_settings, \
             patch('app.steps.sentiment_check.AsyncOpenAI') as mock_openai:

            mock_settings.return_value.OPENAI_API_KEY = "test-key"
            mock_client = AsyncMock()
            mock_client.chat.completions.create = AsyncMock(
                side_effect=Exception("API Error")
            )
            mock_openai.return_value = mock_client

            result = await step.execute(
                applicant_name="John Doe",
                amount=Decimal("15000"),
                monthly_income=Decimal("5000"),
                declared_debts=Decimal("200"),
                country="ES",
                loan_purpose="gambling",
                previous_results={}
            )

            assert result.passed is False
            assert result.details["method"] == "keyword_match_fallback"
            assert "gambling" in result.details["found_keywords"]
            assert "ai_error" in result.details

    async def test_case_insensitive_keyword_match(self):
        """Test that keyword matching is case insensitive"""
        step = SentimentCheckStep(params={
            "risky_keywords": ["gambling", "crypto", "betting"]
        })

        with patch('app.steps.sentiment_check.get_settings') as mock_settings:
            mock_settings.return_value.OPENAI_API_KEY = None

            result = await step.execute(
                applicant_name="John Doe",
                amount=Decimal("15000"),
                monthly_income=Decimal("5000"),
                declared_debts=Decimal("200"),
                country="ES",
                loan_purpose="GAMBLING establishment",
                previous_results={}
            )

            assert result.passed is False
            assert "gambling" in result.details["found_keywords"]
