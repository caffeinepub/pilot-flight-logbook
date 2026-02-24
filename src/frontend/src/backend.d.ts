import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    id: string;
    name: string;
    description: string;
}
export interface Instructor {
    id: string;
    name: string;
}
export interface FlightLog {
    id: bigint;
    studentId: string;
    exerciseId: string;
    totalHours: number;
    date: string;
    flightType: string;
    instructorId: string;
    aircraftId: string;
    takeoffTime: string;
    landingTime: string;
    landingType: string;
    landingCount: bigint;
}
export interface Aircraft {
    id: string;
    registration: string;
}
export interface Student {
    id: string;
    name: string;
}
export interface backendInterface {
    createAircraft(id: string, registration: string): Promise<void>;
    createExercise(id: string, name: string, description: string): Promise<void>;
    createFlightLog(date: string, studentId: string, instructorId: string, aircraftId: string, exerciseId: string, flightType: string, landingType: string, landingCount: bigint, takeoffTime: string, landingTime: string): Promise<bigint>;
    createInstructor(id: string, name: string): Promise<void>;
    createStudent(id: string, name: string): Promise<void>;
    deleteAircraft(id: string): Promise<void>;
    deleteExercise(id: string): Promise<void>;
    deleteFlightLog(id: bigint): Promise<void>;
    deleteInstructor(id: string): Promise<void>;
    deleteStudent(id: string): Promise<void>;
    exportFlightLogsAsCSV(): Promise<string>;
    getAllAircraft(): Promise<Array<Aircraft>>;
    getAllExercises(): Promise<Array<Exercise>>;
    getAllFlightLogs(): Promise<Array<FlightLog>>;
    getAllInstructors(): Promise<Array<Instructor>>;
    getAllStudents(): Promise<Array<Student>>;
    getInstructorReport(instructorId: string): Promise<[number, bigint]>;
    getStudentTotalHours(studentId: string): Promise<number>;
    updateAircraft(id: string, registration: string): Promise<void>;
    updateExercise(id: string, name: string, description: string): Promise<void>;
    updateFlightLog(id: bigint, date: string, studentId: string, instructorId: string, aircraftId: string, exerciseId: string, flightType: string, landingType: string, landingCount: bigint, takeoffTime: string, landingTime: string): Promise<void>;
    updateInstructor(id: string, name: string): Promise<void>;
    updateStudent(id: string, name: string): Promise<void>;
}
