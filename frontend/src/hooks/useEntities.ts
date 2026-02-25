import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Student, Instructor, Aircraft, Exercise } from '../backend';

export function useEntities() {
  const { actor, isFetching } = useActor();

  const students = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const instructors = useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInstructors();
    },
    enabled: !!actor && !isFetching,
  });

  const aircraft = useQuery<Aircraft[]>({
    queryKey: ['aircraft'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAircraft();
    },
    enabled: !!actor && !isFetching,
  });

  const exercises = useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExercises();
    },
    enabled: !!actor && !isFetching,
  });

  return {
    students,
    instructors,
    aircraft,
    exercises,
  };
}

export function useCreateEntity(entityType: 'student' | 'instructor' | 'aircraft' | 'exercise') {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not initialized');

      switch (entityType) {
        case 'student':
          return actor.createStudent(data.id, data.name);
        case 'instructor':
          return actor.createInstructor(data.id, data.name);
        case 'aircraft':
          return actor.createAircraft(data.id, data.registration);
        case 'exercise':
          return actor.createExercise(data.id, data.name, data.description || '');
      }
    },
    onSuccess: () => {
      const queryKey = entityType === 'aircraft' ? 'aircraft' : `${entityType}s`;
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      const result = await actor.updateStudent(id, name);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useUpdateInstructor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      const result = await actor.updateInstructor(id, name);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
}

export function useDeleteInstructor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteInstructor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
}

export function useUpdateAircraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, registration }: { id: string; registration: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      const result = await actor.updateAircraft(id, registration);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
    },
  });
}

export function useDeleteAircraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteAircraft(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
    },
  });
}

export function useUpdateExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      const result = await actor.updateExercise(id, name, description);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useDeleteExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteExercise(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}
