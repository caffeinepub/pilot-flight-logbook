import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useEntities } from './useEntities';
import type { User, UserRole } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserRole | null>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserRole();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsAdmin() {
  const { data: role, isLoading, isFetched } = useGetCallerUserRole();
  return {
    isAdmin: role === 'admin',
    isLoading,
    isFetched,
  };
}

export function useGetAllRegisteredUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User[]>({
    queryKey: ['registeredUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRegisteredUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newRole }: { id: Principal; newRole: UserRole }) => {
      if (!actor) throw new Error('Actor not initialized');
      const result = await actor.updateCurrentUserRole(id, newRole as any);
      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registeredUsers'] });
    },
  });
}

export function useAdminPanel() {
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const usersQuery = useGetAllRegisteredUsers();
  const { students, instructors, aircraft, exercises } = useEntities();
  const updateUserRole = useUpdateUserRole();

  const entityCounts = {
    students: students.data?.length ?? 0,
    instructors: instructors.data?.length ?? 0,
    aircraft: aircraft.data?.length ?? 0,
    exercises: exercises.data?.length ?? 0,
  };

  const isLoading =
    roleLoading ||
    usersQuery.isLoading ||
    students.isLoading ||
    instructors.isLoading ||
    aircraft.isLoading ||
    exercises.isLoading;

  return {
    isAdmin,
    users: usersQuery.data ?? [],
    usersLoading: usersQuery.isLoading,
    usersError: usersQuery.error,
    entityCounts,
    isLoading,
    updateUserRole,
  };
}
