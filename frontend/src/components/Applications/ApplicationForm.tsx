import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { CreateApplicationRequest } from '@/types';

interface ApplicationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateApplicationRequest) => void;
  isSubmitting: boolean;
}

const COUNTRIES = [
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'ES', label: 'Spain (ES)' },
  { value: 'FR', label: 'France (FR)' },
  { value: 'OTHER', label: 'Other' },
];

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<CreateApplicationRequest>({
    applicant_name: '',
    amount: 0,
    monthly_income: 0,
    declared_debts: 0,
    country: 'ES',
    loan_purpose: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateApplicationRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: ['amount', 'monthly_income', 'declared_debts'].includes(field)
        ? parseFloat(value) || 0
        : value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicant_name.trim()) {
      newErrors.applicant_name = 'Applicant name is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.monthly_income <= 0) {
      newErrors.monthly_income = 'Monthly income must be greater than 0';
    }

    if (formData.declared_debts < 0) {
      newErrors.declared_debts = 'Declared debts cannot be negative';
    }

    if (!formData.loan_purpose.trim()) {
      newErrors.loan_purpose = 'Loan purpose is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      applicant_name: '',
      amount: 0,
      monthly_income: 0,
      declared_debts: 0,
      country: 'ES',
      loan_purpose: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Application</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Applicant Name"
                value={formData.applicant_name}
                onChange={handleChange('applicant_name')}
                error={!!errors.applicant_name}
                helperText={errors.applicant_name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loan Amount"
                type="number"
                value={formData.amount || ''}
                onChange={handleChange('amount')}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{ inputProps: { min: 0, step: 100 } }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Income"
                type="number"
                value={formData.monthly_income || ''}
                onChange={handleChange('monthly_income')}
                error={!!errors.monthly_income}
                helperText={errors.monthly_income}
                InputProps={{ inputProps: { min: 0, step: 100 } }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Declared Debts"
                type="number"
                value={formData.declared_debts || ''}
                onChange={handleChange('declared_debts')}
                error={!!errors.declared_debts}
                helperText={errors.declared_debts}
                InputProps={{ inputProps: { min: 0, step: 10 } }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Country"
                value={formData.country}
                onChange={handleChange('country')}
                required
              >
                {COUNTRIES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Loan Purpose"
                value={formData.loan_purpose}
                onChange={handleChange('loan_purpose')}
                error={!!errors.loan_purpose}
                helperText={errors.loan_purpose}
                multiline
                rows={3}
                required
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationForm;
