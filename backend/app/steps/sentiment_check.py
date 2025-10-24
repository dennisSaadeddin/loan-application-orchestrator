from typing import Any
from decimal import Decimal
from app.steps.base import BaseStep, StepResult
from openai import AsyncOpenAI
from app.core.config import get_settings


class SentimentCheckStep(BaseStep):
    @classmethod
    def get_step_type(cls) -> str:
        return "sentiment_check"

    @classmethod
    def get_default_params(cls) -> dict[str, Any]:
        return {
            "risky_keywords": ["gambling", "crypto", "cryptocurrency", "betting", "casino"]
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
        settings = get_settings()
        risky_keywords = self.params.get("risky_keywords", [])

        # Primary: Try OpenAI AI analysis if API key is available
        if settings.OPENAI_API_KEY:
            try:
                client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a loan risk analyzer. Analyze if the loan purpose indicates risky or speculative activities. Respond with only 'RISKY' or 'SAFE' followed by a brief reason."
                        },
                        {
                            "role": "user",
                            "content": f"Loan purpose: {loan_purpose}"
                        }
                    ],
                    temperature=0,
                    max_tokens=100
                )

                ai_response = response.choices[0].message.content.strip()
                is_risky = ai_response.upper().startswith("RISKY")

                return StepResult(
                    passed=not is_risky,
                    details={
                        "method": "ai_analysis",
                        "loan_purpose": loan_purpose,
                        "ai_assessment": ai_response,
                        "reason": "AI detected risky purpose" if is_risky else "Purpose approved by AI"
                    }
                )
            except Exception as e:
                # If AI fails, fall back to keyword check
                loan_purpose_lower = loan_purpose.lower()
                found_keywords = [kw for kw in risky_keywords if kw in loan_purpose_lower]

                if found_keywords:
                    return StepResult(
                        passed=False,
                        details={
                            "method": "keyword_match_fallback",
                            "loan_purpose": loan_purpose,
                            "found_keywords": found_keywords,
                            "ai_error": str(e),
                            "reason": "AI failed, keyword check detected risky purpose"
                        }
                    )
                else:
                    # Both AI and keywords failed, approve by default
                    return StepResult(
                        passed=True,
                        details={
                            "method": "fallback_approval",
                            "loan_purpose": loan_purpose,
                            "ai_error": str(e),
                            "reason": "AI unavailable and no keywords matched, approved by default"
                        }
                    )

        # Fallback: If no OpenAI key available, use keyword check
        loan_purpose_lower = loan_purpose.lower()
        found_keywords = [kw for kw in risky_keywords if kw in loan_purpose_lower]

        if found_keywords:
            return StepResult(
                passed=False,
                details={
                    "method": "keyword_match",
                    "loan_purpose": loan_purpose,
                    "found_keywords": found_keywords,
                    "reason": "No AI available, keyword check detected risky purpose"
                }
            )

        # No AI and no keywords matched, approve
        return StepResult(
            passed=True,
            details={
                "method": "keyword_check",
                "loan_purpose": loan_purpose,
                "reason": "No AI available and no risky keywords detected"
            }
        )
