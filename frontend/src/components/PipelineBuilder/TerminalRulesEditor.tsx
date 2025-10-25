import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { TerminalRule, StepType } from '@/types';

interface TerminalRulesEditorProps {
  rules: TerminalRule[];
  onAddRule: () => void;
  onRemoveRule: (order: number) => void;
  onUpdateRule: (order: number, rule: Partial<TerminalRule>) => void;
  availableStepTypes: StepType[];
}

const CONDITION_TYPES = [
  { value: 'step_failed', label: 'Step Failed' },
  { value: 'risk_threshold', label: 'Risk Threshold' },
  { value: 'default', label: 'Default (Always Match)' },
];

const OUTCOMES = [
  { value: 'APPROVED', label: 'Approved', color: 'success' },
  { value: 'REJECTED', label: 'Rejected', color: 'error' },
  { value: 'NEEDS_REVIEW', label: 'Needs Review', color: 'warning' },
];

const OPERATORS = [
  { value: '<=', label: '<=' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '>', label: '>' },
  { value: '==', label: '==' },
];

const TerminalRulesEditor: React.FC<TerminalRulesEditorProps> = ({
  rules,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
  availableStepTypes,
}) => {
  const handleConditionTypeChange = (order: number, type: string) => {
    const baseCondition: any = { type };

    if (type === 'step_failed') {
      baseCondition.step_types = [];
    } else if (type === 'risk_threshold') {
      baseCondition.value = 0;
      baseCondition.operator = '<=';
    }

    onUpdateRule(order, { condition: baseCondition });
  };

  const handleStepTypesChange = (order: number, event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const stepTypes = typeof value === 'string' ? value.split(',') : value;

    const rule = rules.find((r) => r.order === order);
    if (rule) {
      onUpdateRule(order, {
        condition: {
          ...rule.condition,
          step_types: stepTypes as StepType[],
        },
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Terminal Rules</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddRule}
          size="small"
        >
          Add Rule
        </Button>
      </Box>

      {rules.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" align="center">
              No terminal rules defined. Add rules to determine pipeline outcomes.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rules.map((rule) => (
            <Card key={rule.order}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip label={`Rule ${rule.order}`} size="small" color="primary" />
                  <IconButton
                    size="small"
                    onClick={() => onRemoveRule(rule.order)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Condition Type"
                      value={rule.condition.type}
                      onChange={(e) => handleConditionTypeChange(rule.order, e.target.value)}
                    >
                      {CONDITION_TYPES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Outcome"
                      value={rule.outcome}
                      onChange={(e) => onUpdateRule(rule.order, { outcome: e.target.value as any })}
                    >
                      {OUTCOMES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {rule.condition.type === 'step_failed' && (
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Failed Step Types</InputLabel>
                        <Select
                          multiple
                          value={rule.condition.step_types || []}
                          onChange={(e) => handleStepTypesChange(rule.order, e)}
                          input={<OutlinedInput label="Failed Step Types" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {availableStepTypes.map((stepType) => (
                            <MenuItem key={stepType} value={stepType}>
                              {stepType}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {rule.condition.type === 'risk_threshold' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          size="small"
                          label="Operator"
                          value={rule.condition.operator || '<='}
                          onChange={(e) =>
                            onUpdateRule(rule.order, {
                              condition: {
                                ...rule.condition,
                                operator: e.target.value as any,
                              },
                            })
                          }
                        >
                          {OPERATORS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Threshold Value"
                          type="number"
                          value={rule.condition.value || 0}
                          onChange={(e) =>
                            onUpdateRule(rule.order, {
                              condition: {
                                ...rule.condition,
                                value: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TerminalRulesEditor;
