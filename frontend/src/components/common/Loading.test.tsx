import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import Loading from './Loading';

describe('Loading', () => {
  it('should render with default message', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<Loading message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render CircularProgress component', () => {
    const { container } = render(<Loading />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
  });
});
