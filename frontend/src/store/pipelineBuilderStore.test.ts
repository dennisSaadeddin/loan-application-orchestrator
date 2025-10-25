import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import usePipelineBuilderStore from './pipelineBuilderStore';
import { Pipeline } from '@/types';

describe('pipelineBuilderStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => usePipelineBuilderStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      expect(result.current.steps).toEqual([]);
      expect(result.current.terminalRules).toEqual([]);
      expect(result.current.pipelineName).toBe('');
      expect(result.current.pipelineDescription).toBe('');
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('setPipelineName', () => {
    it('should update pipeline name and set isDirty', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.setPipelineName('Test Pipeline');
      });

      expect(result.current.pipelineName).toBe('Test Pipeline');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('setPipelineDescription', () => {
    it('should update pipeline description and set isDirty', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.setPipelineDescription('Test Description');
      });

      expect(result.current.pipelineDescription).toBe('Test Description');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('addStep', () => {
    it('should add a step with correct order', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.addStep('dti_rule');
      });

      expect(result.current.steps).toHaveLength(1);
      expect(result.current.steps[0].step_type).toBe('dti_rule');
      expect(result.current.steps[0].order).toBe(1);
      expect(result.current.steps[0].params).toEqual({ max_dti: 0.4 });
      expect(result.current.isDirty).toBe(true);
    });

    it('should add multiple steps with correct orders', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.addStep('dti_rule');
        result.current.addStep('amount_policy');
      });

      expect(result.current.steps).toHaveLength(2);
      expect(result.current.steps[0].order).toBe(1);
      expect(result.current.steps[1].order).toBe(2);
    });
  });

  describe('removeStep', () => {
    it('should remove a step and reorder remaining steps', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.addStep('dti_rule');
        result.current.addStep('amount_policy');
        result.current.addStep('risk_scoring');
      });

      act(() => {
        result.current.removeStep(2);
      });

      expect(result.current.steps).toHaveLength(2);
      expect(result.current.steps[0].order).toBe(1);
      expect(result.current.steps[1].order).toBe(2);
      expect(result.current.steps[1].step_type).toBe('risk_scoring');
    });
  });

  describe('updateStepParams', () => {
    it('should update step parameters', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.addStep('dti_rule');
      });

      act(() => {
        result.current.updateStepParams(1, { max_dti: 0.5 });
      });

      expect(result.current.steps[0].params).toEqual({ max_dti: 0.5 });
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('reorderSteps', () => {
    it('should reorder steps correctly', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.addStep('dti_rule');
        result.current.addStep('amount_policy');
        result.current.addStep('risk_scoring');
      });

      act(() => {
        result.current.reorderSteps(1, 3);
      });

      expect(result.current.steps[0].step_type).toBe('amount_policy');
      expect(result.current.steps[1].step_type).toBe('risk_scoring');
      expect(result.current.steps[2].step_type).toBe('dti_rule');
      expect(result.current.steps[0].order).toBe(1);
      expect(result.current.steps[1].order).toBe(2);
      expect(result.current.steps[2].order).toBe(3);
    });
  });

  describe('addTerminalRule', () => {
    it('should add a terminal rule with default values', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.addTerminalRule();
      });

      expect(result.current.terminalRules).toHaveLength(1);
      expect(result.current.terminalRules[0].order).toBe(1);
      expect(result.current.terminalRules[0].condition.type).toBe('default');
      expect(result.current.terminalRules[0].outcome).toBe('NEEDS_REVIEW');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('removeTerminalRule', () => {
    it('should remove a terminal rule and reorder remaining rules', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.addTerminalRule();
        result.current.addTerminalRule();
        result.current.addTerminalRule();
      });

      act(() => {
        result.current.removeTerminalRule(2);
      });

      expect(result.current.terminalRules).toHaveLength(2);
      expect(result.current.terminalRules[0].order).toBe(1);
      expect(result.current.terminalRules[1].order).toBe(2);
    });
  });

  describe('updateTerminalRule', () => {
    it('should update terminal rule', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.addTerminalRule();
      });

      act(() => {
        result.current.updateTerminalRule(1, { outcome: 'APPROVED' });
      });

      expect(result.current.terminalRules[0].outcome).toBe('APPROVED');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.setPipelineName('Test');
        result.current.addStep('dti_rule');
        result.current.addTerminalRule();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.steps).toEqual([]);
      expect(result.current.terminalRules).toEqual([]);
      expect(result.current.pipelineName).toBe('');
      expect(result.current.pipelineDescription).toBe('');
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('loadPipeline', () => {
    it('should load pipeline data into store', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      const pipeline: Pipeline = {
        id: 1,
        name: 'Test Pipeline',
        description: 'Test Description',
        steps: [
          {
            step_type: 'dti_rule',
            order: 1,
            params: { max_dti: 0.4 },
          },
        ],
        terminal_rules: [
          {
            order: 1,
            condition: { type: 'default' },
            outcome: 'APPROVED',
          },
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        result.current.loadPipeline(pipeline);
      });

      expect(result.current.pipelineName).toBe('Test Pipeline');
      expect(result.current.pipelineDescription).toBe('Test Description');
      expect(result.current.steps).toEqual(pipeline.steps);
      expect(result.current.terminalRules).toEqual(pipeline.terminal_rules);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('setIsDirty', () => {
    it('should set isDirty flag', () => {
      const { result } = renderHook(() => usePipelineBuilderStore());

      act(() => {
        result.current.setIsDirty(true);
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.setIsDirty(false);
      });

      expect(result.current.isDirty).toBe(false);
    });
  });
});
