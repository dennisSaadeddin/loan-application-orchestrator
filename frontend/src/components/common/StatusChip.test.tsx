import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import StatusChip from './StatusChip';

describe('StatusChip', () => {
  it('should render approved status', () => {
    render(<StatusChip status="APPROVED" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('should render rejected status', () => {
    render(<StatusChip status="REJECTED" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('should render needs review status', () => {
    render(<StatusChip status="NEEDS_REVIEW" />);
    expect(screen.getByText('Needs Review')).toBeInTheDocument();
  });

  it('should have success color for approved', () => {
    const { container } = render(<StatusChip status="APPROVED" />);
    const chip = container.querySelector('.MuiChip-colorSuccess');
    expect(chip).toBeInTheDocument();
  });

  it('should have error color for rejected', () => {
    const { container } = render(<StatusChip status="REJECTED" />);
    const chip = container.querySelector('.MuiChip-colorError');
    expect(chip).toBeInTheDocument();
  });

  it('should have warning color for needs review', () => {
    const { container } = render(<StatusChip status="NEEDS_REVIEW" />);
    const chip = container.querySelector('.MuiChip-colorWarning');
    expect(chip).toBeInTheDocument();
  });
});
