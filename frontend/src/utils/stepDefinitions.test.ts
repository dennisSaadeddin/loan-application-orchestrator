import { describe, it, expect } from 'vitest';
import { STEP_DEFINITIONS, getStepDefinition, getAllStepTypes } from './stepDefinitions';

describe('stepDefinitions', () => {
  describe('STEP_DEFINITIONS', () => {
    it('should contain all step types', () => {
      expect(STEP_DEFINITIONS).toHaveProperty('dti_rule');
      expect(STEP_DEFINITIONS).toHaveProperty('amount_policy');
      expect(STEP_DEFINITIONS).toHaveProperty('risk_scoring');
      expect(STEP_DEFINITIONS).toHaveProperty('sentiment_check');
    });

    it('should have correct DTI rule definition', () => {
      const dtiRule = STEP_DEFINITIONS.dti_rule;
      expect(dtiRule.type).toBe('dti_rule');
      expect(dtiRule.name).toBe('DTI Rule');
      expect(dtiRule.description).toBe('Debt-to-Income ratio validation');
      expect(dtiRule.defaultParams).toEqual({ max_dti: 0.4 });
      expect(dtiRule.paramSchema).toHaveLength(1);
      expect(dtiRule.paramSchema[0].name).toBe('max_dti');
    });

    it('should have correct amount policy definition', () => {
      const amountPolicy = STEP_DEFINITIONS.amount_policy;
      expect(amountPolicy.type).toBe('amount_policy');
      expect(amountPolicy.name).toBe('Amount Policy');
      expect(amountPolicy.defaultParams).toHaveProperty('DE');
      expect(amountPolicy.defaultParams).toHaveProperty('ES');
      expect(amountPolicy.defaultParams).toHaveProperty('FR');
      expect(amountPolicy.defaultParams).toHaveProperty('OTHER');
    });

    it('should have correct risk scoring definition', () => {
      const riskScoring = STEP_DEFINITIONS.risk_scoring;
      expect(riskScoring.type).toBe('risk_scoring');
      expect(riskScoring.name).toBe('Risk Scoring');
      expect(riskScoring.defaultParams).toEqual({ approve_threshold: 45 });
    });

    it('should have correct sentiment check definition', () => {
      const sentimentCheck = STEP_DEFINITIONS.sentiment_check;
      expect(sentimentCheck.type).toBe('sentiment_check');
      expect(sentimentCheck.name).toBe('Sentiment Check');
      expect(sentimentCheck.defaultParams).toHaveProperty('risky_keywords');
      expect(Array.isArray(sentimentCheck.defaultParams.risky_keywords)).toBe(true);
    });
  });

  describe('getStepDefinition', () => {
    it('should return correct definition for dti_rule', () => {
      const definition = getStepDefinition('dti_rule');
      expect(definition).toBe(STEP_DEFINITIONS.dti_rule);
    });

    it('should return correct definition for amount_policy', () => {
      const definition = getStepDefinition('amount_policy');
      expect(definition).toBe(STEP_DEFINITIONS.amount_policy);
    });

    it('should return correct definition for risk_scoring', () => {
      const definition = getStepDefinition('risk_scoring');
      expect(definition).toBe(STEP_DEFINITIONS.risk_scoring);
    });

    it('should return correct definition for sentiment_check', () => {
      const definition = getStepDefinition('sentiment_check');
      expect(definition).toBe(STEP_DEFINITIONS.sentiment_check);
    });
  });

  describe('getAllStepTypes', () => {
    it('should return all step types', () => {
      const stepTypes = getAllStepTypes();
      expect(stepTypes).toHaveLength(4);
      expect(stepTypes).toContain('dti_rule');
      expect(stepTypes).toContain('amount_policy');
      expect(stepTypes).toContain('risk_scoring');
      expect(stepTypes).toContain('sentiment_check');
    });

    it('should return step types as StepType array', () => {
      const stepTypes = getAllStepTypes();
      stepTypes.forEach((type) => {
        expect(['dti_rule', 'amount_policy', 'risk_scoring', 'sentiment_check']).toContain(type);
      });
    });
  });
});
