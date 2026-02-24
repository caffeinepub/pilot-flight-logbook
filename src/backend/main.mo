import Float "mo:core/Float";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  type Student = {
    id : Text;
    name : Text;
  };

  type Instructor = {
    id : Text;
    name : Text;
  };

  type Aircraft = {
    id : Text;
    registration : Text;
  };

  type Exercise = {
    id : Text;
    name : Text;
    description : Text;
  };

  type FlightLog = {
    id : Nat;
    date : Text;
    studentId : Text;
    instructorId : Text;
    aircraftId : Text;
    exerciseId : Text;
    flightType : Text; // "Solo" or "Dual"
    landingType : Text; // "Day" or "Night"
    landingCount : Nat;
    takeoffTime : Text; // HH:MM format
    landingTime : Text; // HH:MM format
    totalHours : Float;
  };

  let students = Map.empty<Text, Student>();
  let instructors = Map.empty<Text, Instructor>();
  let aircraft = Map.empty<Text, Aircraft>();
  let exercises = Map.empty<Text, Exercise>();
  let flightLogs = Map.empty<Nat, FlightLog>();

  var nextFlightLogId = 0;

  module Student {
    public func compare(a : Student, b : Student) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  module Instructor {
    public func compare(a : Instructor, b : Instructor) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  module Aircraft {
    public func compare(a : Aircraft, b : Aircraft) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  module Exercise {
    public func compare(a : Exercise, b : Exercise) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  module FlightLog {
    public func compare(a : FlightLog, b : FlightLog) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Student CRUD
  public shared ({ caller }) func createStudent(id : Text, name : Text) : async () {
    if (students.containsKey(id)) {
      Runtime.trap("Student with this ID already exists");
    };
    students.add(id, { id; name });
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    students.values().toArray().sort(Student.compare);
  };

  public shared ({ caller }) func updateStudent(id : Text, name : Text) : async () {
    if (not students.containsKey(id)) {
      Runtime.trap("Student not found");
    };
    students.add(id, { id; name });
  };

  public shared ({ caller }) func deleteStudent(id : Text) : async () {
    if (not students.containsKey(id)) {
      Runtime.trap("Student not found");
    };
    students.remove(id);
  };

  // Instructor CRUD
  public shared ({ caller }) func createInstructor(id : Text, name : Text) : async () {
    if (instructors.containsKey(id)) {
      Runtime.trap("Instructor with this ID already exists");
    };
    instructors.add(id, { id; name });
  };

  public query ({ caller }) func getAllInstructors() : async [Instructor] {
    instructors.values().toArray().sort(Instructor.compare);
  };

  public shared ({ caller }) func updateInstructor(id : Text, name : Text) : async () {
    if (not instructors.containsKey(id)) {
      Runtime.trap("Instructor not found");
    };
    instructors.add(id, { id; name });
  };

  public shared ({ caller }) func deleteInstructor(id : Text) : async () {
    if (not instructors.containsKey(id)) {
      Runtime.trap("Instructor not found");
    };
    instructors.remove(id);
  };

  // Aircraft CRUD
  public shared ({ caller }) func createAircraft(id : Text, registration : Text) : async () {
    if (aircraft.containsKey(id)) {
      Runtime.trap("Aircraft with this ID already exists");
    };
    aircraft.add(id, { id; registration });
  };

  public query ({ caller }) func getAllAircraft() : async [Aircraft] {
    aircraft.values().toArray().sort();
  };

  public shared ({ caller }) func updateAircraft(id : Text, registration : Text) : async () {
    if (not aircraft.containsKey(id)) {
      Runtime.trap("Aircraft not found");
    };
    aircraft.add(id, { id; registration });
  };

  public shared ({ caller }) func deleteAircraft(id : Text) : async () {
    if (not aircraft.containsKey(id)) {
      Runtime.trap("Aircraft not found");
    };
    aircraft.remove(id);
  };

  // Exercise CRUD
  public shared ({ caller }) func createExercise(id : Text, name : Text, description : Text) : async () {
    if (exercises.containsKey(id)) {
      Runtime.trap("Exercise with this ID already exists");
    };
    exercises.add(id, { id; name; description });
  };

  public query ({ caller }) func getAllExercises() : async [Exercise] {
    exercises.values().toArray().sort();
  };

  public shared ({ caller }) func updateExercise(id : Text, name : Text, description : Text) : async () {
    if (not exercises.containsKey(id)) {
      Runtime.trap("Exercise not found");
    };
    exercises.add(id, { id; name; description });
  };

  public shared ({ caller }) func deleteExercise(id : Text) : async () {
    if (not exercises.containsKey(id)) {
      Runtime.trap("Exercise not found");
    };
    exercises.remove(id);
  };

  // FlightLog CRUD
  public shared ({ caller }) func createFlightLog(
    date : Text,
    studentId : Text,
    instructorId : Text,
    aircraftId : Text,
    exerciseId : Text,
    flightType : Text,
    landingType : Text,
    landingCount : Nat,
    takeoffTime : Text,
    landingTime : Text
  ) : async Nat {
    let totalHours = calculateTotalHours(takeoffTime, landingTime);
    let log : FlightLog = {
      id = nextFlightLogId;
      date;
      studentId;
      instructorId;
      aircraftId;
      exerciseId;
      flightType;
      landingType;
      landingCount;
      takeoffTime;
      landingTime;
      totalHours;
    };
    flightLogs.add(nextFlightLogId, log);
    nextFlightLogId += 1;
    log.id;
  };

  public query ({ caller }) func getAllFlightLogs() : async [FlightLog] {
    flightLogs.values().toArray().sort();
  };

  public shared ({ caller }) func updateFlightLog(
    id : Nat,
    date : Text,
    studentId : Text,
    instructorId : Text,
    aircraftId : Text,
    exerciseId : Text,
    flightType : Text,
    landingType : Text,
    landingCount : Nat,
    takeoffTime : Text,
    landingTime : Text
  ) : async () {
    if (not flightLogs.containsKey(id)) {
      Runtime.trap("FlightLog not found");
    };
    let totalHours = calculateTotalHours(takeoffTime, landingTime);
    let log : FlightLog = {
      id;
      date;
      studentId;
      instructorId;
      aircraftId;
      exerciseId;
      flightType;
      landingType;
      landingCount;
      takeoffTime;
      landingTime;
      totalHours;
    };
    flightLogs.add(id, log);
  };

  public shared ({ caller }) func deleteFlightLog(id : Nat) : async () {
    if (not flightLogs.containsKey(id)) {
      Runtime.trap("FlightLog not found");
    };
    flightLogs.remove(id);
  };

  // Reporting
  public query ({ caller }) func getStudentTotalHours(studentId : Text) : async Float {
    var total : Float = 0;
    for ((_, log) in flightLogs.entries()) {
      if (log.studentId == studentId) {
        total += log.totalHours;
      };
    };
    total;
  };

  public query ({ caller }) func getInstructorReport(instructorId : Text) : async (Float, Nat) {
    var totalHours : Float = 0;
    var flightCount = 0;
    for ((_, log) in flightLogs.entries()) {
      if (log.instructorId == instructorId) {
        totalHours += log.totalHours;
        flightCount += 1;
      };
    };
    (totalHours, flightCount);
  };

  public query ({ caller }) func exportFlightLogsAsCSV() : async Text {
    var csv = "Date,Student,Instructor,Aircraft,Exercise,Flight Type,Landing Type,Landing Count,Takeoff Time,Landing Time,Total Hours\n";
    for ((_, log) in flightLogs.entries()) {
      csv #= log.date # "," #
      log.studentId # "," #
      log.instructorId # "," #
      log.aircraftId # "," #
      log.exerciseId # "," #
      log.flightType # "," #
      log.landingType # "," #
      log.landingCount.toText() # "," #
      log.takeoffTime # "," #
      log.landingTime # "," #
      log.totalHours.toText() # "\n";
    };
    csv;
  };

  func calculateTotalHours(takeoffTime : Text, landingTime : Text) : Float {
    let takeoffParts = takeoffTime.split(#char ':').toArray();
    let landingParts = landingTime.split(#char ':').toArray();

    if (takeoffParts.size() != 2 or landingParts.size() != 2) {
      return 0;
    };

    let takeoffHours = switch (takeoffParts[0].toNat()) {
      case (?h) { h };
      case (null) { return 0 };
    };
    let takeoffMinutes = switch (takeoffParts[1].toNat()) {
      case (?m) { m };
      case (null) { return 0 };
    };
    let landingHours = switch (landingParts[0].toNat()) {
      case (?h) { h };
      case (null) { return 0 };
    };
    let landingMinutes = switch (landingParts[1].toNat()) {
      case (?m) { m };
      case (null) { return 0 };
    };

    let takeoffTotalMinutes = takeoffHours * 60 + takeoffMinutes;
    let landingTotalMinutes = landingHours * 60 + landingMinutes;

    let timeDifference = landingTotalMinutes - takeoffTotalMinutes;
    timeDifference.toInt().toFloat() / 60.0;
  };
};
