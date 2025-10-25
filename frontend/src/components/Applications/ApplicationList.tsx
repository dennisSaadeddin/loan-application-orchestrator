import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import { Application } from '@/types';

interface ApplicationListProps {
  applications: Application[];
}

const ApplicationList: React.FC<ApplicationListProps> = ({ applications }) => {
  if (applications.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No applications found. Create your first application to get started.
        </Typography>
      </Paper>
    );
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const calculateDTI = (debts: string, income: string) => {
    const dti = (parseFloat(debts) / parseFloat(income)) * 100;
    return `${dti.toFixed(1)}%`;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Applicant Name</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Monthly Income</TableCell>
            <TableCell align="right">Debts</TableCell>
            <TableCell align="right">DTI</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Loan Purpose</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} hover>
              <TableCell>{app.id}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {app.applicant_name}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {formatCurrency(app.amount)}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(app.monthly_income)}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(app.declared_debts)}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Chip
                    label={calculateDTI(app.declared_debts, app.monthly_income)}
                    size="small"
                    color={
                      parseFloat(app.declared_debts) / parseFloat(app.monthly_income) > 0.4
                        ? 'error'
                        : 'success'
                    }
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={app.country} size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={app.loan_purpose}
                >
                  {app.loan_purpose}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(app.created_at)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApplicationList;
