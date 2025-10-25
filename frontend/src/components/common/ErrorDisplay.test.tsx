import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import ErrorDisplay from './ErrorDisplay';

describe('ErrorDisplay', () => {
  it('should not render when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render error message', () => {
    const error = new Error('Test error message');
    render(<ErrorDisplay error={error} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render custom title', () => {
    const error = new Error('Test error');
    render(<ErrorDisplay error={error} title="Custom Error" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('should render default title', () => {
    const error = new Error('Test error');
    render(<ErrorDisplay error={error} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render fallback message when error.message is empty', () => {
    const error = new Error('');
    render(<ErrorDisplay error={error} />);
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });
});
