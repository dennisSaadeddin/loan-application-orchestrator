/** @jsxImportSource react */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRuns, useRun, useCreateRun } from './useRuns';
import { runsApi } from '@/api';
import type { ReactNode } from 'react';

// Mock the API
vi.mock('@/api', () => ({
  runsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useRuns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all runs', async () => {
    const mockRuns = [
      {
        id: 1,
        application_id: 1,
        pipeline_id: 1,
        status: 'APPROVED' as const,
        step_logs: [],
        started_at: '2025-10-25T10:00:00Z',
        completed_at: '2025-10-25T10:00:05Z',
      },
    ];

    vi.mocked(runsApi.getAll).mockResolvedValue(mockRuns);

    const { result } = renderHook(() => useRuns(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(runsApi.getAll).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockRuns);
  });

  it('should handle errors when fetching runs', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(runsApi.getAll).mockRejectedValue(error);

    const { result } = renderHook(() => useRuns(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useRun', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a run by ID', async () => {
    const mockRun = {
      id: 1,
      application_id: 1,
      pipeline_id: 1,
      status: 'APPROVED' as const,
      step_logs: [],
      started_at: '2025-10-25T10:00:00Z',
      completed_at: '2025-10-25T10:00:05Z',
    };

    vi.mocked(runsApi.getById).mockResolvedValue(mockRun);

    const { result } = renderHook(() => useRun(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(runsApi.getById).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual(mockRun);
  });

  it('should not fetch when ID is null', async () => {
    const { result } = renderHook(() => useRun(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(runsApi.getById).not.toHaveBeenCalled();
  });
});

describe('useCreateRun', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a run', async () => {
    const createRequest = {
      application_id: 1,
      pipeline_id: 1,
    };

    const mockRun = {
      id: 1,
      application_id: 1,
      pipeline_id: 1,
      status: 'APPROVED' as const,
      step_logs: [],
      started_at: '2025-10-25T10:00:00Z',
      completed_at: '2025-10-25T10:00:05Z',
    };

    vi.mocked(runsApi.create).mockResolvedValue(mockRun);

    const { result } = renderHook(() => useCreateRun(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(createRequest);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(runsApi.create).toHaveBeenCalledWith(createRequest);
    expect(result.current.data).toEqual(mockRun);
  });

  it('should handle errors when creating a run', async () => {
    const createRequest = {
      application_id: 1,
      pipeline_id: 1,
    };

    const error = new Error('Failed to create run');
    vi.mocked(runsApi.create).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateRun(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(createRequest);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
