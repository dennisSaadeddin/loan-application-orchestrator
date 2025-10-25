import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelinesApi } from '@/api';
import { CreatePipelineRequest, UpdatePipelineRequest } from '@/types';

const QUERY_KEY = 'pipelines';

export const usePipelines = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: pipelinesApi.getAll,
  });
};

export const usePipeline = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => pipelinesApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreatePipeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePipelineRequest) => pipelinesApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch pipelines list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdatePipeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePipelineRequest }) =>
      pipelinesApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific pipeline and the list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
