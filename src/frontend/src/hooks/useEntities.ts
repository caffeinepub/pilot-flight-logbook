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
      // Invalidate the correct query key
      const queryKey = entityType === 'aircraft' ? 'aircraft' : `${entityType}s`;
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });
}
