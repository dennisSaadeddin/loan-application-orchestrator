// Application Types
export interface Application {
  id: number;
  applicant_name: string;
  amount: string;
  monthly_income: string;
  declared_debts: string;
  country: string;
  loan_purpose: string;
  created_at: string;
}

export interface CreateApplicationRequest {
  applicant_name: string;
  amount: number;
  monthly_income: number;
  declared_debts: number;
  country: string;
  loan_purpose: string;
}

// Pipeline Types
export type StepType = 'dti_rule' | 'amount_policy' | 'risk_scoring' | 'sentiment_check';

export interface StepConfig {
  step_type: StepType;
  order: number;
  params: Record<string, any>;
}

export interface TerminalRuleCondition {
  type: 'step_failed' | 'risk_threshold' | 'default';
  step_types?: StepType[];
  value?: number;
  operator?: '<=' | '>=' | '<' | '>' | '==';
}

export interface TerminalRule {
  order: number;
  condition: TerminalRuleCondition;
  outcome: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
}

export interface Pipeline {
  id: number;
  name: string;
  description: string;
  steps: StepConfig[];
  terminal_rules: TerminalRule[];
  created_at: string;
  updated_at: string;
}

export interface CreatePipelineRequest {
  name: string;
  description: string;
  steps: StepConfig[];
  terminal_rules: TerminalRule[];
}

export type UpdatePipelineRequest = CreatePipelineRequest;

// Run Types
export type RunStatus = 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';

export interface StepLog {
  step_type: StepType;
  order: number;
  passed: boolean;
  details: Record<string, any>;
  executed_at: string;
}

export interface Run {
  id: number;
  application_id: number;
  pipeline_id: number;
  status: RunStatus;
  step_logs: StepLog[];
  started_at: string;
  completed_at: string;
}

export interface CreateRunRequest {
  application_id: number;
  pipeline_id: number;
}

// Step Definition Types (for UI)
export interface StepDefinition {
  type: StepType;
  name: string;
  description: string;
  defaultParams: Record<string, any>;
  paramSchema: ParamField[];
}

export interface ParamField {
  name: string;
  label: string;
  type: 'number' | 'text' | 'country_caps' | 'keywords';
  required: boolean;
  description?: string;
  defaultValue?: any;
}

// UI State Types
export interface PipelineBuilderState {
  steps: StepConfig[];
  terminalRules: TerminalRule[];
  pipelineName: string;
  pipelineDescription: string;
  isDirty: boolean;
  setSteps: (steps: StepConfig[]) => void;
  setTerminalRules: (rules: TerminalRule[]) => void;
  setPipelineName: (name: string) => void;
  setPipelineDescription: (description: string) => void;
  addStep: (stepType: StepType) => void;
  removeStep: (order: number) => void;
  updateStepParams: (order: number, params: Record<string, any>) => void;
  reorderSteps: (fromOrder: number, toOrder: number) => void;
  addTerminalRule: () => void;
  removeTerminalRule: (order: number) => void;
  updateTerminalRule: (order: number, rule: Partial<TerminalRule>) => void;
  reset: () => void;
  loadPipeline: (pipeline: Pipeline) => void;
  setIsDirty: (dirty: boolean) => void;
}

// API Response Types
export interface APIError {
  detail: string | { msg: string; type: string }[];
}

export interface HealthCheckResponse {
  status: string;
  database: string;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}
