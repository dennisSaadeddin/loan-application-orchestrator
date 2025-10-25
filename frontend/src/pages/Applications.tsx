import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useApplications, useCreateApplication } from '@/hooks/useApplications';
import { ApplicationForm, ApplicationList } from '@/components/Applications';
import { Loading, ErrorDisplay } from '@/components/common';
import { CreateApplicationRequest } from '@/types';

const Applications: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: applications, isLoading, error } = useApplications();
  const createMutation = useCreateApplication();

  const handleOpenForm = () => {
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  const handleSubmit = async (data: CreateApplicationRequest) => {
    try {
      await createMutation.mutateAsync(data);
      setSuccessMessage('Application created successfully!');
      handleCloseForm();
    } catch (err) {
      // Error is handled by the mutation
      console.error('Failed to create application:', err);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  if (isLoading) {
    return <Loading message="Loading applications..." />;
  }

  if (error) {
    return <ErrorDisplay error={error as Error} title="Failed to load applications" />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage loan applications from applicants
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
        >
          New Application
        </Button>
      </Box>

      {/* Error Alert */}
      {createMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(createMutation.error as Error).message || 'Failed to create application'}
        </Alert>
      )}

      {/* Applications List */}
      <ApplicationList applications={applications || []} />

      {/* Application Form Dialog */}
      <ApplicationForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />

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

export default Applications;
