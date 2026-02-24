import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useEntities } from './useEntities';

interface StudentReportItem {
  studentId: string;
  studentName: string;
  totalHours: number;
}

interface InstructorReportItem {
  instructorId: string;
  instructorName: string;
  totalHours: number;
  flightCount: bigint;
}

export function useStudentReport() {
  const { actor, isFetching } = useActor();
  const { students } = useEntities();

  return useQuery<StudentReportItem[]>({
    queryKey: ['studentReport'],
    queryFn: async () => {
      if (!actor || !students.data) return [];

      const report = await Promise.all(
        students.data.map(async (student) => {
          const totalHours = await actor.getStudentTotalHours(student.id);
          return {
            studentId: student.id,
            studentName: student.name,
            totalHours,
          };
        })
      );

      return report.filter((item) => item.totalHours > 0);
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

      const report = await Promise.all(
        instructors.data.map(async (instructor) => {
          const [totalHours, flightCount] = await actor.getInstructorReport(instructor.id);
          return {
            instructorId: instructor.id,
            instructorName: instructor.name,
            totalHours,
            flightCount,
          };
        })
      );

      return report.filter((item) => item.totalHours > 0);
    },
    enabled: !!actor && !isFetching && !!instructors.data,
  });
}
