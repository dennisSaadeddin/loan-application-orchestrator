import { StepDefinition, StepType } from '@/types';

export const STEP_DEFINITIONS: Record<StepType, StepDefinition> = {
  dti_rule: {
    type: 'dti_rule',
    name: 'DTI Rule',
    description: 'Debt-to-Income ratio validation',
    defaultParams: { max_dti: 0.4 },
    paramSchema: [
      {
        name: 'max_dti',
        label: 'Maximum DTI',
        type: 'number',
        required: true,
        description: 'Maximum allowed debt-to-income ratio (0.0 - 1.0)',
        defaultValue: 0.4,
      },
    ],
  },
  amount_policy: {
    type: 'amount_policy',
    name: 'Amount Policy',
    description: 'Country-specific loan amount caps',
    defaultParams: {
      DE: 35000,
      ES: 30000,
      FR: 25000,
      OTHER: 20000,
    },
    paramSchema: [
      {
        name: 'country_caps',
        label: 'Country Caps',
        type: 'country_caps',
        required: true,
        description: 'Maximum loan amounts per country',
        defaultValue: {
          DE: 35000,
          ES: 30000,
          FR: 25000,
          OTHER: 20000,
        },
      },
    ],
  },
  risk_scoring: {
    type: 'risk_scoring',
    name: 'Risk Scoring',
    description: 'Calculate risk score based on DTI and amount',
    defaultParams: { approve_threshold: 45 },
    paramSchema: [
      {
        name: 'approve_threshold',
        label: 'Approve Threshold',
        type: 'number',
        required: true,
        description: 'Maximum risk score for auto-approval',
        defaultValue: 45,
      },
    ],
  },
  sentiment_check: {
    type: 'sentiment_check',
    name: 'Sentiment Check',
    description: 'AI-powered loan purpose validation',
    defaultParams: {
      risky_keywords: ['gambling', 'crypto', 'cryptocurrency', 'betting', 'casino'],
    },
    paramSchema: [
      {
        name: 'risky_keywords',
        label: 'Risky Keywords',
        type: 'keywords',
        required: true,
        description: 'Keywords that indicate risky loan purposes (used as fallback)',
        defaultValue: ['gambling', 'crypto', 'cryptocurrency', 'betting', 'casino'],
      },
    ],
  },
};

export const getStepDefinition = (stepType: StepType): StepDefinition => {
  return STEP_DEFINITIONS[stepType];
};

export const getAllStepTypes = (): StepType[] => {
  return Object.keys(STEP_DEFINITIONS) as StepType[];
};
