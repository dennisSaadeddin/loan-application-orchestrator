import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '@/hooks/useApplications';
import { usePipelines } from '@/hooks/usePipelines';
import { Loading, ErrorDisplay } from '@/components/common';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: applications, isLoading: appsLoading, error: appsError } = useApplications();
  const { data: pipelines, isLoading: pipelinesLoading, error: pipelinesError } = usePipelines();

  if (appsLoading || pipelinesLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (appsError) {
    return <ErrorDisplay error={appsError as Error} title="Failed to load applications" />;
  }

  if (pipelinesError) {
    return <ErrorDisplay error={pipelinesError as Error} title="Failed to load pipelines" />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Loan Application Orchestrator
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccountBalanceIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {applications?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applications
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'secondary.main',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BuildIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {pipelines?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pipelines
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'success.main',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayArrowIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    Run
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Execute Pipeline
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'info.main',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HistoryIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View Runs
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AccountBalanceIcon />}
                onClick={() => navigate('/applications')}
              >
                Create New Application
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<BuildIcon />}
                onClick={() => navigate('/pipeline-builder')}
              >
                Build New Pipeline
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate('/run-panel')}
              >
                Execute Pipeline Run
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/runs')}
              >
                View Run History
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Getting Started
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Step 1: Create Applications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add loan applications with applicant details, loan amounts, monthly income, and
                  declared debts.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Step 2: Build Decision Pipelines
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Design custom pipelines with business rules: DTI checks, amount policies, risk
                  scoring, and AI sentiment analysis.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Step 3: Execute & Review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Run applications through pipelines to get instant decisions (Approved, Rejected,
                  or Needs Review) with detailed step logs.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* System Info */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Overview
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Total Applications
            </Typography>
            <Typography variant="h6">{applications?.length || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Active Pipelines
            </Typography>
            <Typography variant="h6">{pipelines?.length || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Available Steps
            </Typography>
            <Typography variant="h6">4</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Decision Outcomes
            </Typography>
            <Typography variant="h6">3</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
