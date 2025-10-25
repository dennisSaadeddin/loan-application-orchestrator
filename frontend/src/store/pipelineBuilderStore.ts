import { create } from 'zustand';
import { PipelineBuilderState, StepConfig, TerminalRule, Pipeline, StepType } from '@/types';
import { getStepDefinition } from '@/utils/stepDefinitions';

const usePipelineBuilderStore = create<PipelineBuilderState>((set) => ({
  steps: [],
  terminalRules: [],
  pipelineName: '',
  pipelineDescription: '',
  isDirty: false,

  setSteps: (steps) => set({ steps, isDirty: true }),

  setTerminalRules: (terminalRules) => set({ terminalRules, isDirty: true }),

  setPipelineName: (pipelineName) => set({ pipelineName, isDirty: true }),

  setPipelineDescription: (pipelineDescription) => set({ pipelineDescription, isDirty: true }),

  addStep: (stepType: StepType) =>
    set((state) => {
      const stepDef = getStepDefinition(stepType);
      const newOrder = state.steps.length + 1;
      const newStep: StepConfig = {
        step_type: stepType,
        order: newOrder,
        params: { ...stepDef.defaultParams },
      };
      return {
        steps: [...state.steps, newStep],
        isDirty: true,
      };
    }),

  removeStep: (order: number) =>
    set((state) => {
      const filteredSteps = state.steps
        .filter((step) => step.order !== order)
        .map((step, index) => ({ ...step, order: index + 1 }));
      return {
        steps: filteredSteps,
        isDirty: true,
      };
    }),

  updateStepParams: (order: number, params: Record<string, any>) =>
    set((state) => {
      const updatedSteps = state.steps.map((step) =>
        step.order === order ? { ...step, params } : step
      );
      return {
        steps: updatedSteps,
        isDirty: true,
      };
    }),

  reorderSteps: (fromOrder: number, toOrder: number) =>
    set((state) => {
      const steps = [...state.steps];
      const fromIndex = steps.findIndex((s) => s.order === fromOrder);
      const toIndex = steps.findIndex((s) => s.order === toOrder);

      if (fromIndex === -1 || toIndex === -1) return state;

      const [movedStep] = steps.splice(fromIndex, 1);
      steps.splice(toIndex, 0, movedStep);

      // Reassign order values
      const reorderedSteps = steps.map((step, index) => ({
        ...step,
        order: index + 1,
      }));

      return {
        steps: reorderedSteps,
        isDirty: true,
      };
    }),

  addTerminalRule: () =>
    set((state) => {
      const newOrder = state.terminalRules.length + 1;
      const newRule: TerminalRule = {
        order: newOrder,
        condition: { type: 'default' },
        outcome: 'NEEDS_REVIEW',
      };
      return {
        terminalRules: [...state.terminalRules, newRule],
        isDirty: true,
      };
    }),

  removeTerminalRule: (order: number) =>
    set((state) => {
      const filteredRules = state.terminalRules
        .filter((rule) => rule.order !== order)
        .map((rule, index) => ({ ...rule, order: index + 1 }));
      return {
        terminalRules: filteredRules,
        isDirty: true,
      };
    }),

  updateTerminalRule: (order: number, ruleUpdate: Partial<TerminalRule>) =>
    set((state) => {
      const updatedRules = state.terminalRules.map((rule) =>
        rule.order === order ? { ...rule, ...ruleUpdate } : rule
      );
      return {
        terminalRules: updatedRules,
        isDirty: true,
      };
    }),

  reset: () =>
    set({
      steps: [],
      terminalRules: [],
      pipelineName: '',
      pipelineDescription: '',
      isDirty: false,
    }),

  loadPipeline: (pipeline: Pipeline) =>
    set({
      steps: pipeline.steps,
      terminalRules: pipeline.terminal_rules,
      pipelineName: pipeline.name,
      pipelineDescription: pipeline.description,
      isDirty: false,
    }),

  setIsDirty: (isDirty: boolean) => set({ isDirty }),
}));

export default usePipelineBuilderStore;
