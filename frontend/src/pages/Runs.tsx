import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Stack,
  Grid,
  Alert,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Loading, StatusChip } from '@/components/common';
import { useRuns } from '@/hooks/useRuns';
import { useApplications } from '@/hooks/useApplications';
import { usePipelines } from '@/hooks/usePipelines';
import { Run, RunStatus } from '@/types';

const RunRow: React.FC<{
  run: Run;
  applicationName: string;
  pipelineName: string;
}> = ({ run, applicationName, pipelineName }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{run.id}</TableCell>
        <TableCell>{applicationName}</TableCell>
        <TableCell>{pipelineName}</TableCell>
        <TableCell>
          <StatusChip status={run.status} />
        </TableCell>
        <TableCell>{format(new Date(run.started_at), 'MMM dd, yyyy HH:mm')}</TableCell>
        <TableCell>
          {run.completed_at
            ? format(new Date(run.completed_at), 'MMM dd, yyyy HH:mm')
            : '-'}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Step Execution Logs
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Step Type</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Executed At</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {run.step_logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.step_type}</TableCell>
                      <TableCell>{log.order}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.passed ? 'Passed' : 'Failed'}
                          color={log.passed ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(log.executed_at), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {JSON.stringify(log.details, null, 2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Runs: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: runs, isLoading: runsLoading, error: runsError } = useRuns();
  const { data: applications } = useApplications();
  const { data: pipelines } = usePipelines();

  // Create lookup maps for applications and pipelines
  const applicationMap = useMemo(() => {
    if (!applications) return new Map();
    return new Map(applications.map((app) => [app.id, app.applicant_name]));
  }, [applications]);

  const pipelineMap = useMemo(() => {
    if (!pipelines) return new Map();
    return new Map(pipelines.map((pipeline) => [pipeline.id, pipeline.name]));
  }, [pipelines]);

  // Filter and search runs
  const filteredRuns = useMemo(() => {
    if (!runs) return [];

    return runs.filter((run) => {
      // Status filter
      if (statusFilter !== 'ALL' && run.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const applicationName = applicationMap.get(run.application_id) || '';
        const pipelineName = pipelineMap.get(run.pipeline_id) || '';

        return (
          run.id.toString().includes(searchLower) ||
          applicationName.toLowerCase().includes(searchLower) ||
          pipelineName.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [runs, statusFilter, searchTerm, applicationMap, pipelineMap]);

  // Sort runs by started_at descending (most recent first)
  const sortedRuns = useMemo(() => {
    return [...filteredRuns].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  }, [filteredRuns]);

  if (runsLoading) {
    return <Loading message="Loading run history..." />;
  }

  if (runsError) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Run History
        </Typography>
        <Alert severity="error">
          Failed to load run history: {(runsError as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Run History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View past pipeline execution runs and their outcomes
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Search by Run ID, Application, or Pipeline"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RunStatus | 'ALL')}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="NEEDS_REVIEW">Needs Review</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics */}
      {runs && runs.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Runs
              </Typography>
              <Typography variant="h6">{runs.length}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
              <Typography variant="h6" color="success.main">
                {runs.filter((r) => r.status === 'APPROVED').length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
              <Typography variant="h6" color="error.main">
                {runs.filter((r) => r.status === 'REJECTED').length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Needs Review
              </Typography>
              <Typography variant="h6" color="warning.main">
                {runs.filter((r) => r.status === 'NEEDS_REVIEW').length}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Runs Table */}
      <TableContainer component={Paper}>
        {sortedRuns.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {runs && runs.length > 0
                ? 'No runs match your filters'
                : 'No runs have been executed yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {runs && runs.length === 0 &&
                'Go to the Run Panel to execute a pipeline on an application'}
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Run ID</TableCell>
                <TableCell>Application</TableCell>
                <TableCell>Pipeline</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Started At</TableCell>
                <TableCell>Completed At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRuns.map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  applicationName={applicationMap.get(run.application_id) || `App #${run.application_id}`}
                  pipelineName={pipelineMap.get(run.pipeline_id) || `Pipeline #${run.pipeline_id}`}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default Runs;
