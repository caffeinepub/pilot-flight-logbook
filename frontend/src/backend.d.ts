import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type StudentResult = {
    __kind__: "ok";
    ok: Student;
} | {
    __kind__: "err";
    err: string;
};
export interface Exercise {
    id: string;
    name: string;
    description: string;
}
export interface Instructor {
    id: string;
    name: string;
}
export type AircraftResult = {
    __kind__: "ok";
    ok: Aircraft;
} | {
    __kind__: "err";
    err: string;
};
export interface User {
    principal: Principal;
    name: string;
    role: Role;
}
export type InstructorResult = {
    __kind__: "ok";
    ok: Instructor;
} | {
    __kind__: "err";
    err: string;
};
export type ExerciseResult = {
    __kind__: "ok";
    ok: Exercise;
} | {
    __kind__: "err";
    err: string;
};
export interface FlightLog {
    id: bigint;
    studentId: string;
    exerciseId: string;
    totalHours: number;
    date: string;
    sunriseTime: string;
    flightType: string;
    sunsetTime: string;
    instructorId: string;
    aircraftHours: number;
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
export type UserRoleResult = {
    __kind__: "ok";
    ok: Role;
} | {
    __kind__: "error";
    error: string;
};
export type UpdateRoleResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "error";
    error: string;
};
export type FlightLogResult = {
    __kind__: "ok";
    ok: FlightLog;
} | {
    __kind__: "err";
    err: string;
};
export interface UserProfile {
    name: string;
}
export interface Student {
    id: string;
    name: string;
}
export enum SuccessResult {
    ok = "ok"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Register or update a user. Admin-only.
     */
    addOrUpdateUser(id: Principal, name: string, role: Role): Promise<SuccessResult>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAircraft(_id: string, registration: string): Promise<Aircraft>;
    createExercise(_id: string, name: string, description: string): Promise<Exercise>;
    createFlightLog(date: string, studentId: string, instructorId: string, aircraftId: string, exerciseId: string, flightType: string, landingType: string, landingCount: bigint, takeoffTime: string, landingTime: string, aircraftHours: number, sunriseTime: string, sunsetTime: string): Promise<FlightLog>;
    createInstructor(_id: string, name: string): Promise<Instructor>;
    createStudent(_id: string, name: string): Promise<Student>;
    deleteAircraft(id: string): Promise<SuccessResult>;
    deleteExercise(id: string): Promise<SuccessResult>;
    deleteFlightLog(id: bigint): Promise<SuccessResult>;
    deleteInstructor(id: string): Promise<SuccessResult>;
    deleteStudent(id: string): Promise<SuccessResult>;
    exportFlightLogsAsCSV(): Promise<string>;
    getAircraft(id: string): Promise<AircraftResult>;
    getAllAircraft(): Promise<Array<Aircraft>>;
    getAllExercises(): Promise<Array<Exercise>>;
    getAllFlightLogs(): Promise<Array<FlightLog>>;
    getAllInstructors(): Promise<Array<Instructor>>;
    /**
     * / Return all registered users. Admin-only (contains sensitive role/principal data).
     */
    getAllRegisteredUsers(): Promise<Array<User>>;
    getAllStudents(): Promise<Array<Student>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get the role for a given principal. Open to all (no sensitive data beyond role).
     */
    getCurrentUserRole(id: Principal): Promise<UserRoleResult>;
    getExercise(id: string): Promise<ExerciseResult>;
    getFlightLog(id: bigint): Promise<FlightLogResult>;
    getInstructor(id: string): Promise<InstructorResult>;
    getInstructorReport(instructorId: string): Promise<[number, bigint]>;
    getStudent(id: string): Promise<StudentResult>;
    getStudentTotalHours(studentId: string): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    partialUpdateAircraft(id: string, registration: string | null): Promise<AircraftResult>;
    partialUpdateExercise(id: string, name: string | null, description: string | null): Promise<ExerciseResult>;
    partialUpdateFlightLog(id: bigint, date: string | null, studentId: string | null, instructorId: string | null, aircraftId: string | null, exerciseId: string | null, flightType: string | null, landingType: string | null, landingCount: bigint | null, takeoffTime: string | null, landingTime: string | null, aircraftHours: number | null, sunriseTime: string | null, sunsetTime: string | null): Promise<FlightLogResult>;
    partialUpdateInstructor(id: string, name: string | null): Promise<InstructorResult>;
    partialUpdateStudent(id: string, name: string | null): Promise<StudentResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAircraft(id: string, registration: string): Promise<AircraftResult>;
    /**
     * / Update the role of an existing user. Admin-only.
     */
    updateCurrentUserRole(id: Principal, newRole: Role): Promise<UpdateRoleResult>;
    updateExercise(id: string, name: string, description: string): Promise<ExerciseResult>;
    updateFlightLog(id: bigint, date: string, studentId: string, instructorId: string, aircraftId: string, exerciseId: string, flightType: string, landingType: string, landingCount: bigint, takeoffTime: string, landingTime: string, aircraftHours: number, sunriseTime: string, sunsetTime: string): Promise<FlightLogResult>;
    updateInstructor(id: string, name: string): Promise<InstructorResult>;
    updateStudent(id: string, name: string): Promise<StudentResult>;
}
