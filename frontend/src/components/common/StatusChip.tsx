import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import { RunStatus } from '@/types';

interface StatusChipProps {
  status: RunStatus;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const getStatusConfig = (status: RunStatus) => {
    switch (status) {
      case 'APPROVED':
        return {
          color: 'success' as const,
          icon: <CheckCircleIcon />,
          label: 'Approved',
        };
      case 'REJECTED':
        return {
          color: 'error' as const,
          icon: <CancelIcon />,
          label: 'Rejected',
        };
      case 'NEEDS_REVIEW':
        return {
          color: 'warning' as const,
          icon: <HelpOutlineIcon />,
          label: 'Needs Review',
        };
      default:
        return {
          color: 'default' as const,
          icon: <HelpOutlineIcon />,
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return <Chip color={config.color} icon={config.icon} label={config.label} />;
};

export default StatusChip;
