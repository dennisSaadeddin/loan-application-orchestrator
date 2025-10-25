import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runsApi } from '@/api';
import { CreateRunRequest } from '@/types';

const QUERY_KEY = 'runs';

export const useRuns = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: runsApi.getAll,
  });
};

export const useRun = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => runsApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRunRequest) => runsApi.create(data),
    onSuccess: () => {
      // Invalidate runs cache
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
