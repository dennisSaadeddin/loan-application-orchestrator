import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Alert,
  Snackbar,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { StepList, TerminalRulesEditor } from '@/components/PipelineBuilder';
import { Loading } from '@/components/common';
import usePipelineBuilderStore from '@/store/pipelineBuilderStore';
import { useCreatePipeline, useUpdatePipeline, usePipelines } from '@/hooks/usePipelines';
import { getAllStepTypes } from '@/utils/stepDefinitions';
import { StepType } from '@/types';

const PipelineBuilder: React.FC = () => {
  const [selectedStepType, setSelectedStepType] = useState<StepType>('dti_rule');
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    steps,
    terminalRules,
    pipelineName,
    pipelineDescription,
    isDirty,
    setPipelineName,
    setPipelineDescription,
    addStep,
    removeStep,
    updateStepParams,
    reorderSteps,
    addTerminalRule,
    removeTerminalRule,
    updateTerminalRule,
    reset,
    loadPipeline,
    setIsDirty,
  } = usePipelineBuilderStore();

  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines();
  const createMutation = useCreatePipeline();
  const updateMutation = useUpdatePipeline();

  const availableStepTypes = getAllStepTypes();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (!isDirty) {
        reset();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadPipeline = (pipelineId: number) => {
    const pipeline = pipelines?.find((p) => p.id === pipelineId);
    if (pipeline) {
      loadPipeline(pipeline);
      setSelectedPipelineId(pipelineId);
      setSuccessMessage(`Loaded pipeline: ${pipeline.name}`);
    }
  };

  const handleAddStep = () => {
    addStep(selectedStepType);
  };

  const handleSave = async () => {
    if (!pipelineName.trim()) {
      alert('Please enter a pipeline name');
      return;
    }

    if (steps.length === 0) {
      alert('Please add at least one step');
      return;
    }

    if (terminalRules.length === 0) {
      alert('Please add at least one terminal rule');
      return;
    }

    const pipelineData = {
      name: pipelineName,
      description: pipelineDescription,
      steps,
      terminal_rules: terminalRules,
    };

    try {
      if (selectedPipelineId) {
        // Update existing pipeline
        await updateMutation.mutateAsync({
          id: selectedPipelineId,
          data: pipelineData,
        });
        setSuccessMessage('Pipeline updated successfully!');
      } else {
        // Create new pipeline
        await createMutation.mutateAsync(pipelineData);
        setSuccessMessage('Pipeline created successfully!');
      }
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to save pipeline:', err);
    }
  };

  const handleReset = () => {
    if (isDirty && !confirm('Are you sure? Unsaved changes will be lost.')) {
      return;
    }
    reset();
    setSelectedPipelineId(null);
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  if (pipelinesLoading) {
    return <Loading message="Loading pipelines..." />;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error || updateMutation.error;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Pipeline Builder
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Design decision pipelines with business rules and terminal conditions
        </Typography>
      </Box>

      {/* Error Alert */}
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(saveError as Error).message || 'Failed to save pipeline'}
        </Alert>
      )}

      {/* Pipeline Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pipeline Information
        </Typography>
        <Stack spacing={2}>
          <TextField
            select
            label="Load Existing Pipeline"
            value={selectedPipelineId || ''}
            onChange={(e) => handleLoadPipeline(Number(e.target.value))}
            size="small"
            helperText="Optional: Load an existing pipeline to edit"
          >
            <MenuItem value="">
              <em>None (New Pipeline)</em>
            </MenuItem>
            {pipelines?.map((pipeline) => (
              <MenuItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Pipeline Name"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            size="small"
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={pipelineDescription}
            onChange={(e) => setPipelineDescription(e.target.value)}
            size="small"
            multiline
            rows={2}
          />
        </Stack>
      </Paper>

      {/* Steps Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pipeline Steps
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            select
            label="Step Type"
            value={selectedStepType}
            onChange={(e) => setSelectedStepType(e.target.value as StepType)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            {availableStepTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStep}
          >
            Add Step
          </Button>
        </Box>

        <StepList
          steps={steps}
          onRemoveStep={removeStep}
          onUpdateStepParams={updateStepParams}
          onReorderSteps={reorderSteps}
        />
      </Paper>

      {/* Terminal Rules Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TerminalRulesEditor
          rules={terminalRules}
          onAddRule={addTerminalRule}
          onRemoveRule={removeTerminalRule}
          onUpdateRule={updateTerminalRule}
          availableStepTypes={steps.map((s) => s.step_type)}
        />
      </Paper>

      {/* Action Buttons */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            {isSaving
              ? 'Saving...'
              : selectedPipelineId
              ? 'Update Pipeline'
              : 'Create Pipeline'}
          </Button>
        </Stack>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PipelineBuilder;
