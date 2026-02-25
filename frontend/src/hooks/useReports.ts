import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useEntities } from './useEntities';

interface StudentReportItem {
  studentId: string;
  studentName: string;
  totalHours: number;
  totalAircraftHours: number;
}

interface InstructorReportItem {
  instructorId: string;
  instructorName: string;
  totalHours: number;
  flightCount: bigint;
  totalAircraftHours: number;
}

export function useStudentReport() {
  const { actor, isFetching } = useActor();
  const { students } = useEntities();

  return useQuery<StudentReportItem[]>({
    queryKey: ['studentReport'],
    queryFn: async () => {
      if (!actor || !students.data) return [];

      // Fetch all flight logs to compute aircraft hours per student
      const allLogs = await actor.getAllFlightLogs();

      const report = await Promise.all(
        students.data.map(async (student) => {
          const totalHours = await actor.getStudentTotalHours(student.id);

          const studentLogs = allLogs.filter((log) => log.studentId === student.id);
          const totalAircraftHours = studentLogs.reduce(
            (sum, log) => sum + (log.aircraftHours || 0),
            0
          );

          return {
            studentId: student.id,
            studentName: student.name,
            totalHours,
            totalAircraftHours,
          };
        })
      );

      return report.filter((item) => item.totalHours > 0 || item.totalAircraftHours > 0);
    },
    enabled: !!actor && !isFetching && !!students.data,
  });
}

export function useInstructorReport() {
  const { actor, isFetching } = useActor();
  const { instructors } = useEntities();

  return useQuery<InstructorReportItem[]>({
    queryKey: ['instructorReport'],
    queryFn: async () => {
      if (!actor || !instructors.data) return [];

      // Fetch all flight logs to compute aircraft hours per instructor
      const allLogs = await actor.getAllFlightLogs();

      const report = await Promise.all(
        instructors.data.map(async (instructor) => {
          const [totalHours, flightCount] = await actor.getInstructorReport(instructor.id);

          const instructorLogs = allLogs.filter((log) => log.instructorId === instructor.id);
          const totalAircraftHours = instructorLogs.reduce(
            (sum, log) => sum + (log.aircraftHours || 0),
            0
          );

          return {
            instructorId: instructor.id,
            instructorName: instructor.name,
            totalHours,
            flightCount,
            totalAircraftHours,
          };
        })
      );

      return report.filter((item) => item.totalHours > 0 || item.totalAircraftHours > 0);
    },
    enabled: !!actor && !isFetching && !!instructors.data,
  });
}
