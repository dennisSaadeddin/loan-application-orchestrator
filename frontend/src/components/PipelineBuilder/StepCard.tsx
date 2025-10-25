import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  TextField,
  Grid,
} from '@mui/material';
import {
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { StepConfig } from '@/types';
import { getStepDefinition } from '@/utils/stepDefinitions';

interface StepCardProps {
  step: StepConfig;
  onRemove: () => void;
  onUpdateParams: (params: Record<string, any>) => void;
  dragHandleProps?: any;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  onRemove,
  onUpdateParams,
  dragHandleProps,
}) => {
  const stepDef = getStepDefinition(step.step_type);

  const handleParamChange = (paramName: string, value: any) => {
    onUpdateParams({
      ...step.params,
      [paramName]: value,
    });
  };

  const renderParamField = (field: any) => {
    const value = step.params[field.name];

    switch (field.type) {
      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            label={field.label}
            type="number"
            value={value || ''}
            onChange={(e) => handleParamChange(field.name, parseFloat(e.target.value) || 0)}
            helperText={field.description}
            inputProps={{ step: 0.01 }}
          />
        );

      case 'country_caps':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {field.label}
            </Typography>
            <Grid container spacing={1}>
              {['DE', 'ES', 'FR', 'OTHER'].map((country) => (
                <Grid item xs={6} sm={3} key={country}>
                  <TextField
                    fullWidth
                    size="small"
                    label={country}
                    type="number"
                    value={value?.[country] || ''}
                    onChange={(e) =>
                      handleParamChange(field.name, {
                        ...value,
                        [country]: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'keywords':
        return (
          <TextField
            fullWidth
            size="small"
            label={field.label}
            value={Array.isArray(value) ? value.join(', ') : ''}
            onChange={(e) =>
              handleParamChange(
                field.name,
                e.target.value.split(',').map((k) => k.trim()).filter(Boolean)
              )
            }
            helperText={field.description || 'Comma-separated list'}
            multiline
            rows={2}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={field.label}
            value={value || ''}
            onChange={(e) => handleParamChange(field.name, e.target.value)}
            helperText={field.description}
          />
        );
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box
            {...dragHandleProps}
            sx={{
              cursor: 'grab',
              mr: 1,
              mt: 0.5,
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <DragIndicatorIcon color="action" />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip label={`Step ${step.order}`} size="small" color="primary" />
              <Typography variant="h6">{stepDef.name}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {stepDef.description}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onRemove} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Parameters
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {stepDef.paramSchema.map((field) => (
              <Box key={field.name}>{renderParamField(field)}</Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StepCard;
