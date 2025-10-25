import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useApplications } from '@/hooks/useApplications';
import { usePipelines } from '@/hooks/usePipelines';
import { useCreateRun } from '@/hooks/useRuns';
import { RunResults } from '@/components/RunPanel';
import { Loading, ErrorDisplay } from '@/components/common';
import { Run } from '@/types';

const RunPanel: React.FC = () => {
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [runResult, setRunResult] = useState<Run | null>(null);

  const { data: applications, isLoading: appsLoading, error: appsError } = useApplications();
  const { data: pipelines, isLoading: pipelinesLoading, error: pipelinesError } = usePipelines();
  const createRunMutation = useCreateRun();

  const handleExecute = async () => {
    if (!selectedApplicationId || !selectedPipelineId) {
      alert('Please select both an application and a pipeline');
      return;
    }

    try {
      const result = await createRunMutation.mutateAsync({
        application_id: selectedApplicationId,
        pipeline_id: selectedPipelineId,
      });
      setRunResult(result);
    } catch (err) {
      console.error('Failed to execute run:', err);
    }
  };

  const handleReset = () => {
    setSelectedApplicationId(null);
    setSelectedPipelineId(null);
    setRunResult(null);
  };

  if (appsLoading || pipelinesLoading) {
    return <Loading message="Loading data..." />;
  }

  if (appsError) {
    return <ErrorDisplay error={appsError as Error} title="Failed to load applications" />;
  }

  if (pipelinesError) {
    return <ErrorDisplay error={pipelinesError as Error} title="Failed to load pipelines" />;
  }

  const selectedApplication = applications?.find((app) => app.id === selectedApplicationId);
  const selectedPipeline = pipelines?.find((p) => p.id === selectedPipelineId);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Run Panel
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Execute pipeline runs on loan applications
        </Typography>
      </Box>

      {/* Error Alert */}
      {createRunMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(createRunMutation.error as Error).message || 'Failed to execute run'}
        </Alert>
      )}

      {/* Selection Panel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Application and Pipeline
        </Typography>

        <Stack spacing={3}>
          {/* Application Selection */}
          <Box>
            <TextField
              fullWidth
              select
              label="Application"
              value={selectedApplicationId || ''}
              onChange={(e) => setSelectedApplicationId(Number(e.target.value) || null)}
              helperText="Select the loan application to process"
            >
              <MenuItem value="">
                <em>Select an application</em>
              </MenuItem>
              {applications?.map((app) => (
                <MenuItem key={app.id} value={app.id}>
                  #{app.id} - {app.applicant_name} (€{parseFloat(app.amount).toLocaleString()})
                </MenuItem>
              ))}
            </TextField>

            {selectedApplication && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Application Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Applicant:</strong> {selectedApplication.applicant_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> €{parseFloat(selectedApplication.amount).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Monthly Income:</strong> €
                  {parseFloat(selectedApplication.monthly_income).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Declared Debts:</strong> €
                  {parseFloat(selectedApplication.declared_debts).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Country:</strong> {selectedApplication.country}
                </Typography>
                <Typography variant="body2">
                  <strong>Loan Purpose:</strong> {selectedApplication.loan_purpose}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Pipeline Selection */}
          <Box>
            <TextField
              fullWidth
              select
              label="Pipeline"
              value={selectedPipelineId || ''}
              onChange={(e) => setSelectedPipelineId(Number(e.target.value) || null)}
              helperText="Select the decision pipeline to execute"
            >
              <MenuItem value="">
                <em>Select a pipeline</em>
              </MenuItem>
              {pipelines?.map((pipeline) => (
                <MenuItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name} ({pipeline.steps.length} steps)
                </MenuItem>
              ))}
            </TextField>

            {selectedPipeline && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pipeline Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedPipeline.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Description:</strong> {selectedPipeline.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Steps:</strong> {selectedPipeline.steps.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Terminal Rules:</strong> {selectedPipeline.terminal_rules.length}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Execute Button */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleExecute}
              disabled={
                !selectedApplicationId ||
                !selectedPipelineId ||
                createRunMutation.isPending
              }
              fullWidth
            >
              {createRunMutation.isPending ? 'Executing...' : 'Execute Run'}
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Run Results */}
      {runResult && <RunResults run={runResult} />}
    </Box>
  );
};

export default RunPanel;
