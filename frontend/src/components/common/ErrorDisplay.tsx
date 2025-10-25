import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorDisplayProps {
  error: Error | null;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, title = 'Error' }) => {
  if (!error) return null;

  return (
    <Box sx={{ my: 2 }}>
      <Alert severity="error">
        <AlertTitle>{title}</AlertTitle>
        {error.message || 'An unexpected error occurred'}
      </Alert>
    </Box>
  );
};

export default ErrorDisplay;
