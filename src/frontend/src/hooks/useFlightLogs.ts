import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useEntities } from './useEntities';
import type { FlightLog } from '../backend';

interface ResolvedFlightLog extends FlightLog {
  studentName: string;
  instructorName: string;
  aircraftRegistration: string;
  exerciseName: string;
}

export function useFlightLogs() {
  const { actor, isFetching } = useActor();
  const { students, instructors, aircraft, exercises } = useEntities();

  return useQuery<ResolvedFlightLog[]>({
    queryKey: ['flightLogs'],
    queryFn: async () => {
      if (!actor) return [];
      
      const logs = await actor.getAllFlightLogs();
      
      // Resolve foreign keys to names
      return logs.map((log) => {
        const student = students.data?.find((s) => s.id === log.studentId);
        const instructor = instructors.data?.find((i) => i.id === log.instructorId);
        const ac = aircraft.data?.find((a) => a.id === log.aircraftId);
        const exercise = exercises.data?.find((e) => e.id === log.exerciseId);

        return {
          ...log,
          studentName: student?.name || log.studentId,
          instructorName: instructor?.name || log.instructorId,
          aircraftRegistration: ac?.registration || log.aircraftId,
          exerciseName: exercise?.name || log.exerciseId,
        };
      });
    },
    enabled: !!actor && !isFetching && !!students.data && !!instructors.data && !!aircraft.data && !!exercises.data,
  });
}

export function useCreateFlightLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: string;
      studentId: string;
      instructorId: string;
      aircraftId: string;
      exerciseId: string;
      flightType: string;
      landingType: string;
      landingCount: bigint;
      takeoffTime: string;
      landingTime: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      return actor.createFlightLog(
        data.date,
        data.studentId,
        data.instructorId,
        data.aircraftId,
        data.exerciseId,
        data.flightType,
        data.landingType,
        data.landingCount,
        data.takeoffTime,
        data.landingTime
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flightLogs'] });
    },
  });
}

export function useUpdateFlightLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      date: string;
      studentId: string;
      instructorId: string;
      aircraftId: string;
      exerciseId: string;
      flightType: string;
      landingType: string;
      landingCount: bigint;
      takeoffTime: string;
      landingTime: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      return actor.updateFlightLog(
        data.id,
        data.date,
        data.studentId,
        data.instructorId,
        data.aircraftId,
        data.exerciseId,
        data.flightType,
        data.landingType,
        data.landingCount,
        data.takeoffTime,
        data.landingTime
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flightLogs'] });
    },
  });
}

export function useDeleteFlightLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteFlightLog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flightLogs'] });
    },
  });
}
