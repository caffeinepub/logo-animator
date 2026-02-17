import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { LogoSpecification, GeneratedLogoProjectSerialized } from '../backend';

export function useLogoProjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GeneratedLogoProjectSerialized[]>({
    queryKey: ['logoProjects'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSortedLogoProjects();
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveLogoProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ description, logoSpec }: { description: string; logoSpec: LogoSpecification }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveGeneratedLogoProject(description, logoSpec);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logoProjects'] });
    },
  });
}
