import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Run } from '@/types';
import { StatusChip } from '@/components/common';

interface RunResultsProps {
  run: Run;
}

const RunResults: React.FC<RunResultsProps> = ({ run }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };

  const formatDuration = () => {
    const start = new Date(run.started_at);
    const end = new Date(run.completed_at);
    const duration = end.getTime() - start.getTime();
    return `${duration}ms`;
  };

  return (
    <Box>
      {/* Run Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Run Results</Typography>
            <StatusChip status={run.status} />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Run ID
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                #{run.id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Started At
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(run.started_at)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDuration()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Step Logs */}
      <Typography variant="h6" gutterBottom>
        Step Execution Logs
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {run.step_logs.map((log, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Chip
                  label={`Step ${log.order}`}
                  size="small"
                  color="primary"
                />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {log.step_type}
                </Typography>
                {log.passed ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Passed"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    icon={<CancelIcon />}
                    label="Failed"
                    color="error"
                    size="small"
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Executed at: {formatDate(log.executed_at)}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Details:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.875rem',
                  }}
                >
                  {JSON.stringify(log.details, null, 2)}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default RunResults;
