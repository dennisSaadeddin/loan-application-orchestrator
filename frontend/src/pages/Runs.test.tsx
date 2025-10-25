import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { fireEvent } from '@testing-library/react';
import Runs from './Runs';
import * as useRunsModule from '@/hooks/useRuns';
import * as useApplicationsModule from '@/hooks/useApplications';
import * as usePipelinesModule from '@/hooks/usePipelines';

// Mock the hooks
vi.mock('@/hooks/useRuns');
vi.mock('@/hooks/useApplications');
vi.mock('@/hooks/usePipelines');

describe('Runs Page', () => {
  const mockApplications = [
    {
      id: 1,
      applicant_name: 'John Doe',
      amount: '10000',
      monthly_income: '5000',
      declared_debts: '1000',
      country: 'US',
      loan_purpose: 'home renovation',
      created_at: '2025-10-25T10:00:00Z',
    },
    {
      id: 2,
      applicant_name: 'Jane Smith',
      amount: '20000',
      monthly_income: '6000',
      declared_debts: '2000',
      country: 'DE',
      loan_purpose: 'car purchase',
      created_at: '2025-10-25T11:00:00Z',
    },
  ];

  const mockPipelines = [
    {
      id: 1,
      name: 'Standard Pipeline',
      description: 'Standard approval pipeline',
      steps: [],
      terminal_rules: [],
      created_at: '2025-10-25T09:00:00Z',
      updated_at: '2025-10-25T09:00:00Z',
    },
  ];

  const mockRuns = [
    {
      id: 1,
      application_id: 1,
      pipeline_id: 1,
      status: 'APPROVED' as const,
      step_logs: [
        {
          step_type: 'dti_rule' as const,
          order: 1,
          passed: true,
          details: { dti: 0.2, max_dti: 0.4 },
          executed_at: '2025-10-25T10:00:01Z',
        },
        {
          step_type: 'amount_policy' as const,
          order: 2,
          passed: true,
          details: { cap: 35000, amount: 10000, country: 'US' },
          executed_at: '2025-10-25T10:00:02Z',
        },
      ],
      started_at: '2025-10-25T10:00:00Z',
      completed_at: '2025-10-25T10:00:05Z',
    },
    {
      id: 2,
      application_id: 2,
      pipeline_id: 1,
      status: 'REJECTED' as const,
      step_logs: [
        {
          step_type: 'dti_rule' as const,
          order: 1,
          passed: false,
          details: { dti: 0.5, max_dti: 0.4 },
          executed_at: '2025-10-25T11:00:01Z',
        },
      ],
      started_at: '2025-10-25T11:00:00Z',
      completed_at: '2025-10-25T11:00:03Z',
    },
    {
      id: 3,
      application_id: 1,
      pipeline_id: 1,
      status: 'NEEDS_REVIEW' as const,
      step_logs: [],
      started_at: '2025-10-25T12:00:00Z',
      completed_at: '2025-10-25T12:00:05Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default mocks
    vi.mocked(useApplicationsModule.useApplications).mockReturnValue({
      data: mockApplications,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(usePipelinesModule.usePipelines).mockReturnValue({
      data: mockPipelines,
      isLoading: false,
      error: null,
    } as any);
  });

  describe('Loading State', () => {
    it('should show loading spinner when fetching runs', () => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<Runs />);

      expect(screen.getByText(/loading run history/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      } as any);

      render(<Runs />);

      expect(screen.getByText(/failed to load run history/i)).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no runs exist', () => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      render(<Runs />);

      expect(screen.getByText(/no runs have been executed yet/i)).toBeInTheDocument();
      expect(screen.getByText(/go to the run panel/i)).toBeInTheDocument();
    });
  });

  describe('Runs Display', () => {
    beforeEach(() => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: mockRuns,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should display runs in table', () => {
      render(<Runs />);

      // Check that application names are displayed (may appear multiple times)
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);

      // Check that pipeline name is displayed
      expect(screen.getAllByText('Standard Pipeline').length).toBeGreaterThan(0);
    });

    it('should display statistics', () => {
      render(<Runs />);

      // Total runs
      expect(screen.getByText('Total Runs')).toBeInTheDocument();

      // Check for statistics section existence (may appear in filters too)
      expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Needs Review').length).toBeGreaterThan(0);
    });

    it('should sort runs by most recent first', () => {
      render(<Runs />);

      const rows = screen.getAllByRole('row');
      // Each run creates 2 rows (main + collapsible). Skip header (index 0).
      // First data row should be run ID 3 (most recent)
      expect(rows[1]).toHaveTextContent('3');
      // Run ID 2 starts at index 3 (skip collapsible row at index 2)
      expect(rows[3]).toHaveTextContent('2');
      // Run ID 1 starts at index 5 (skip collapsible row at index 4)
      expect(rows[5]).toHaveTextContent('1');
    });
  });

  describe('Expandable Rows', () => {
    beforeEach(() => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: mockRuns,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should expand row to show step logs when clicked', async () => {
      render(<Runs />);

      // Step logs should not be visible initially
      expect(screen.queryByText('Step Execution Logs')).not.toBeInTheDocument();

      // Click expand button for first run (run ID 3)
      const expandButtons = screen.getAllByRole('button');
      fireEvent.click(expandButtons[0]);

      // Step logs section should now be visible
      await waitFor(() => {
        expect(screen.getByText('Step Execution Logs')).toBeInTheDocument();
      });
    });

    it('should show step details when row is expanded', async () => {
      render(<Runs />);

      // Find the expand button for run ID 1 (which has step logs)
      // Run ID 1 is sorted last (oldest), so it's the third run
      const expandButtons = screen.getAllByRole('button');
      fireEvent.click(expandButtons[2]); // Third expand button

      await waitFor(() => {
        expect(screen.getByText('dti_rule')).toBeInTheDocument();
        // Check that at least one "Passed" chip exists
        expect(screen.getAllByText('Passed').length).toBeGreaterThan(0);
      });
    });

    it('should collapse row when clicked again', async () => {
      render(<Runs />);

      const expandButtons = screen.getAllByRole('button');

      // Expand
      fireEvent.click(expandButtons[0]);
      await waitFor(() => {
        expect(screen.getByText('Step Execution Logs')).toBeInTheDocument();
      });

      // Collapse
      fireEvent.click(expandButtons[0]);
      await waitFor(() => {
        expect(screen.queryByText('Step Execution Logs')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: mockRuns,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should filter runs by application name', () => {
      render(<Runs />);

      const searchInput = screen.getByPlaceholderText(/search by run id, application, or pipeline/i);
      fireEvent.change(searchInput, { target: { value: 'jane' } });

      // Should show only Jane Smith's run
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should filter runs by run ID', () => {
      render(<Runs />);

      const searchInput = screen.getByPlaceholderText(/search by run id, application, or pipeline/i);
      fireEvent.change(searchInput, { target: { value: '2' } });

      // Should show only run ID 2
      // Each run creates 2 rows, so: 1 header + 2 data rows = 3 total
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3);
    });

    it('should show empty message when search has no results', () => {
      render(<Runs />);

      const searchInput = screen.getByPlaceholderText(/search by run id, application, or pipeline/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText(/no runs match your filters/i)).toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    beforeEach(() => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: mockRuns,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should filter runs by APPROVED status', () => {
      render(<Runs />);

      const statusFilter = screen.getByLabelText(/filter by status/i);
      fireEvent.mouseDown(statusFilter);

      const approvedOption = screen.getByRole('option', { name: /approved/i });
      fireEvent.click(approvedOption);

      // Should only show approved runs (run ID 1)
      // 1 header + 2 data rows (1 run * 2) = 3 total rows
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3);
    });

    it('should filter runs by REJECTED status', () => {
      render(<Runs />);

      const statusFilter = screen.getByLabelText(/filter by status/i);
      fireEvent.mouseDown(statusFilter);

      const rejectedOption = screen.getByRole('option', { name: /rejected/i });
      fireEvent.click(rejectedOption);

      // Should only show rejected runs (run ID 2)
      // 1 header + 2 data rows (1 run * 2) = 3 total rows
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3);
    });

    it('should filter runs by NEEDS_REVIEW status', () => {
      render(<Runs />);

      const statusFilter = screen.getByLabelText(/filter by status/i);
      fireEvent.mouseDown(statusFilter);

      const needsReviewOption = screen.getByRole('option', { name: /needs review/i });
      fireEvent.click(needsReviewOption);

      // Should only show needs review runs (run ID 3)
      // 1 header + 2 data rows (1 run * 2) = 3 total rows
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3);
    });
  });

  describe('Combined Filters', () => {
    beforeEach(() => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: mockRuns,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should apply both search and status filters', () => {
      render(<Runs />);

      // Search for "John" (appears in 2 runs: ID 1 and 3)
      const searchInput = screen.getByPlaceholderText(/search by run id, application, or pipeline/i);
      fireEvent.change(searchInput, { target: { value: 'john' } });

      // Filter by APPROVED status (only run ID 1)
      const statusFilter = screen.getByLabelText(/filter by status/i);
      fireEvent.mouseDown(statusFilter);
      const approvedOption = screen.getByRole('option', { name: /approved/i });
      fireEvent.click(approvedOption);

      // Should show only run ID 1
      // 1 header + 2 data rows (1 run * 2) = 3 total rows
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3);
    });
  });

  describe('Fallback Display', () => {
    it('should show fallback text when application is not found', () => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: [
          {
            id: 99,
            application_id: 999, // Non-existent application
            pipeline_id: 1,
            status: 'APPROVED' as const,
            step_logs: [],
            started_at: '2025-10-25T10:00:00Z',
            completed_at: '2025-10-25T10:00:05Z',
          },
        ],
        isLoading: false,
        error: null,
      } as any);

      render(<Runs />);

      expect(screen.getByText('App #999')).toBeInTheDocument();
    });

    it('should show fallback text when pipeline is not found', () => {
      vi.mocked(useRunsModule.useRuns).mockReturnValue({
        data: [
          {
            id: 99,
            application_id: 1,
            pipeline_id: 999, // Non-existent pipeline
            status: 'APPROVED' as const,
            step_logs: [],
            started_at: '2025-10-25T10:00:00Z',
            completed_at: '2025-10-25T10:00:05Z',
          },
        ],
        isLoading: false,
        error: null,
      } as any);

      render(<Runs />);

      expect(screen.getByText('Pipeline #999')).toBeInTheDocument();
    });
  });
});
