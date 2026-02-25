import Float "mo:core/Float";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Migration "migration";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

// Use migration function on upgrade via with-clause
(with migration = Migration.run)
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
    flightType : Text;
    landingType : Text;
    landingCount : Nat;
    takeoffTime : Text;
    landingTime : Text;
    totalHours : Float;
    aircraftHours : Float;
    sunriseTime : Text;
    sunsetTime : Text;
  };

  type User = { principal : Principal; name : Text; role : Role };
  type Role = { #admin; #user; #guest };
  type UserProfile = { name : Text };
  type SuccessResult = { #ok : () };
  type StudentResult = { #ok : Student; #err : Text };
  type InstructorResult = { #ok : Instructor; #err : Text };
  type AircraftResult = { #ok : Aircraft; #err : Text };
  type ExerciseResult = { #ok : Exercise; #err : Text };
  type FlightLogResult = { #ok : FlightLog; #err : Text };
  type UserRoleResult = { #ok : Role; #error : Text };
  type UpdateRoleResult = { #ok : (); #error : Text };

  let students = Map.empty<Text, Student>();
  let instructors = Map.empty<Text, Instructor>();
  let aircraft = Map.empty<Text, Aircraft>();
  let exercises = Map.empty<Text, Exercise>();
  let flightLogs = Map.empty<Nat, FlightLog>();
  let users = Map.empty<Principal, User>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  var nextFlightLogId = 0;

  // ── User profile functions (required by frontend) ──────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── User management ────────────────────────────────────────────────────────

  /// Register or update a user. Admin-only.
  public shared ({ caller }) func addOrUpdateUser(id : Principal, name : Text, role : Role) : async SuccessResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add or update users");
    };
    // Guard: do not demote the last admin
    switch (users.get(id)) {
      case (?existing) {
        if (existing.role == #admin and role != #admin and countAdmins() == 1) {
          Runtime.trap("Cannot demote the last admin");
        };
      };
      case (null) {};
    };
    let user : User = { principal = id; name; role };
    users.add(id, user);
    #ok(());
  };

  /// Return all registered users. Admin-only (contains sensitive role/principal data).
  public query ({ caller }) func getAllRegisteredUsers() : async [User] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    users.values().toArray();
  };

  /// Update the role of an existing user. Admin-only.
  public shared ({ caller }) func updateCurrentUserRole(id : Principal, newRole : Role) : async UpdateRoleResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update user roles");
    };
    switch (users.get(id)) {
      case (null) {
        #error("User not found");
      };
      case (?existing) {
        // Prevent removing the last admin
        if (existing.role == #admin and newRole != #admin and countAdmins() == 1) {
          return #error("Cannot remove the last admin");
        };
        let updated : User = { principal = id; name = existing.name; role = newRole };
        users.add(id, updated);
        #ok(());
      };
    };
  };

  /// Get the role for a given principal. Open to all (no sensitive data beyond role).
  public query ({ caller }) func getCurrentUserRole(id : Principal) : async UserRoleResult {
    switch (users.get(id)) {
      case (null) { #error("User not found") };
      case (?user) { #ok(user.role) };
    };
  };

  func countAdmins() : Nat {
    var count = 0;
    for ((_, user) in users.entries()) {
      switch (user.role) {
        case (#admin) { count += 1 };
        case (_) {};
      };
    };
    count;
  };

  // ── Students ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func createStudent(_id : Text, name : Text) : async Student {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create students");
    };
    let id = nextFlightLogId.toText();
    let student : Student = { id; name };
    students.add(id, student);
    nextFlightLogId += 1;
    student;
  };

  public query ({ caller }) func getStudent(id : Text) : async StudentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view students");
    };
    switch (students.get(id)) {
      case (null) { #err("Student not found") };
      case (?student) { #ok(student) };
    };
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list students");
    };
    students.values().toArray();
  };

  public shared ({ caller }) func updateStudent(id : Text, name : Text) : async StudentResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    switch (students.get(id)) {
      case (null) { #err("Student not found") };
      case (?_) {
        let updatedStudent : Student = { id; name };
        students.add(id, updatedStudent);
        #ok(updatedStudent);
      };
    };
  };

  public shared ({ caller }) func partialUpdateStudent(id : Text, name : ?Text) : async StudentResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    switch (students.get(id)) {
      case (null) { #err("Student not found") };
      case (?student) {
        let newName = switch (name) {
          case (null) { student.name };
          case (?n) { n };
        };
        let updatedStudent : Student = { id = student.id; name = newName };
        students.add(id, updatedStudent);
        #ok(updatedStudent);
      };
    };
  };

  public shared ({ caller }) func deleteStudent(id : Text) : async SuccessResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    students.remove(id);
    #ok(());
  };

  // ── Instructors ────────────────────────────────────────────────────────────

  public shared ({ caller }) func createInstructor(_id : Text, name : Text) : async Instructor {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create instructors");
    };
    let id = nextFlightLogId.toText();
    let instructor : Instructor = { id; name };
    instructors.add(id, instructor);
    nextFlightLogId += 1;
    instructor;
  };

  public query ({ caller }) func getInstructor(id : Text) : async InstructorResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view instructors");
    };
    switch (instructors.get(id)) {
      case (null) { #err("Instructor not found") };
      case (?instructor) { #ok(instructor) };
    };
  };

  public query ({ caller }) func getAllInstructors() : async [Instructor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list instructors");
    };
    instructors.values().toArray();
  };

  public shared ({ caller }) func updateInstructor(id : Text, name : Text) : async InstructorResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update instructors");
    };
    switch (instructors.get(id)) {
      case (null) { #err("Instructor not found") };
      case (?_) {
        let updatedInstructor : Instructor = { id; name };
        instructors.add(id, updatedInstructor);
        #ok(updatedInstructor);
      };
    };
  };

  public shared ({ caller }) func partialUpdateInstructor(id : Text, name : ?Text) : async InstructorResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update instructors");
    };
    switch (instructors.get(id)) {
      case (null) { #err("Instructor not found") };
      case (?instructor) {
        let newName = switch (name) {
          case (null) { instructor.name };
          case (?n) { n };
        };
        let updatedInstructor : Instructor = { id = instructor.id; name = newName };
        instructors.add(id, updatedInstructor);
        #ok(updatedInstructor);
      };
    };
  };

  public shared ({ caller }) func deleteInstructor(id : Text) : async SuccessResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete instructors");
    };
    instructors.remove(id);
    #ok(());
  };

  // ── Aircraft ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func createAircraft(_id : Text, registration : Text) : async Aircraft {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create aircraft");
    };
    let id = nextFlightLogId.toText();
    let aircraftEntry : Aircraft = { id; registration };
    aircraft.add(id, aircraftEntry);
    nextFlightLogId += 1;
    aircraftEntry;
  };

  public query ({ caller }) func getAircraft(id : Text) : async AircraftResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view aircraft");
    };
    switch (aircraft.get(id)) {
      case (null) { #err("Aircraft not found") };
      case (?aircraftEntry) { #ok(aircraftEntry) };
    };
  };

  public query ({ caller }) func getAllAircraft() : async [Aircraft] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list aircraft");
    };
    aircraft.values().toArray();
  };

  public shared ({ caller }) func updateAircraft(id : Text, registration : Text) : async AircraftResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update aircraft");
    };
    switch (aircraft.get(id)) {
      case (null) { #err("Aircraft not found") };
      case (?_) {
        let updatedAircraft : Aircraft = { id; registration };
        aircraft.add(id, updatedAircraft);
        #ok(updatedAircraft);
      };
    };
  };

  public shared ({ caller }) func partialUpdateAircraft(id : Text, registration : ?Text) : async AircraftResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update aircraft");
    };
    switch (aircraft.get(id)) {
      case (null) { #err("Aircraft not found") };
      case (?aircraftEntry) {
        let newRegistration = switch (registration) {
          case (null) { aircraftEntry.registration };
          case (?r) { r };
        };
        let updatedAircraft : Aircraft = { id = aircraftEntry.id; registration = newRegistration };
        aircraft.add(id, updatedAircraft);
        #ok(updatedAircraft);
      };
    };
  };

  public shared ({ caller }) func deleteAircraft(id : Text) : async SuccessResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete aircraft");
    };
    aircraft.remove(id);
    #ok(());
  };

  // ── Exercises ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func createExercise(_id : Text, name : Text, description : Text) : async Exercise {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create exercises");
    };
    let id = nextFlightLogId.toText();
    let exercise : Exercise = { id; name; description };
    exercises.add(id, exercise);
    nextFlightLogId += 1;
    exercise;
  };

  public query ({ caller }) func getExercise(id : Text) : async ExerciseResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view exercises");
    };
    switch (exercises.get(id)) {
      case (null) { #err("Exercise not found") };
      case (?exercise) { #ok(exercise) };
    };
  };

  public query ({ caller }) func getAllExercises() : async [Exercise] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list exercises");
    };
    exercises.values().toArray();
  };

  public shared ({ caller }) func updateExercise(id : Text, name : Text, description : Text) : async ExerciseResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update exercises");
    };
    switch (exercises.get(id)) {
      case (null) { #err("Exercise not found") };
      case (?_) {
        let updatedExercise : Exercise = { id; name; description };
        exercises.add(id, updatedExercise);
        #ok(updatedExercise);
      };
    };
  };

  public shared ({ caller }) func partialUpdateExercise(id : Text, name : ?Text, description : ?Text) : async ExerciseResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update exercises");
    };
    switch (exercises.get(id)) {
      case (null) { #err("Exercise not found") };
      case (?exercise) {
        let newName = switch (name) {
          case (null) { exercise.name };
          case (?n) { n };
        };
        let newDescription = switch (description) {
          case (null) { exercise.description };
          case (?d) { d };
        };
        let updatedExercise : Exercise = { id = exercise.id; name = newName; description = newDescription };
        exercises.add(id, updatedExercise);
        #ok(updatedExercise);
      };
    };
  };

  public shared ({ caller }) func deleteExercise(id : Text) : async SuccessResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete exercises");
    };
    exercises.remove(id);
    #ok(());
  };

  // ── Flight Logs ────────────────────────────────────────────────────────────

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
    landingTime : Text,
    aircraftHours : Float,
    sunriseTime : Text,
    sunsetTime : Text
  ) : async FlightLog {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create flight logs");
    };
    let totalHours = calculateTotalHours(takeoffTime, landingTime);
    let id = nextFlightLogId;
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
      aircraftHours;
      sunriseTime;
      sunsetTime;
    };
    flightLogs.add(id, log);
    nextFlightLogId += 1;
    log;
  };

  public query ({ caller }) func getFlightLog(id : Nat) : async FlightLogResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view flight logs");
    };
    switch (flightLogs.get(id)) {
      case (null) { #err("FlightLog not found") };
      case (?log) { #ok(log) };
    };
  };

  public query ({ caller }) func getAllFlightLogs() : async [FlightLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list flight logs");
    };
    flightLogs.values().toArray();
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
    landingTime : Text,
    aircraftHours : Float,
    sunriseTime : Text,
    sunsetTime : Text
  ) : async FlightLogResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update flight logs");
    };
    switch (flightLogs.get(id)) {
      case (null) { #err("FlightLog not found") };
      case (?_) {
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
          aircraftHours;
          sunriseTime;
          sunsetTime;
        };
        flightLogs.add(id, log);
        #ok(log);
      };
    };
  };

  public shared ({ caller }) func partialUpdateFlightLog(
    id : Nat,
    date : ?Text,
    studentId : ?Text,
    instructorId : ?Text,
    aircraftId : ?Text,
    exerciseId : ?Text,
    flightType : ?Text,
    landingType : ?Text,
    landingCount : ?Nat,
    takeoffTime : ?Text,
    landingTime : ?Text,
    aircraftHours : ?Float,
    sunriseTime : ?Text,
    sunsetTime : ?Text
  ) : async FlightLogResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update flight logs");
    };
    switch (flightLogs.get(id)) {
      case (null) { #err("FlightLog not found") };
      case (?log) {
        let newDate = switch (date) { case (null) { log.date }; case (?d) { d } };
        let newStudentId = switch (studentId) { case (null) { log.studentId }; case (?s) { s } };
        let newInstructorId = switch (instructorId) { case (null) { log.instructorId }; case (?i) { i } };
        let newAircraftId = switch (aircraftId) { case (null) { log.aircraftId }; case (?a) { a } };
        let newExerciseId = switch (exerciseId) { case (null) { log.exerciseId }; case (?e) { e } };
        let newFlightType = switch (flightType) { case (null) { log.flightType }; case (?f) { f } };
        let newLandingType = switch (landingType) { case (null) { log.landingType }; case (?l) { l } };
        let newLandingCount = switch (landingCount) { case (null) { log.landingCount }; case (?c) { c } };
        let newTakeoffTime = switch (takeoffTime) { case (null) { log.takeoffTime }; case (?t) { t } };
        let newLandingTime = switch (landingTime) { case (null) { log.landingTime }; case (?t) { t } };
        let newTotalHours = calculateTotalHours(newTakeoffTime, newLandingTime);
        let newAircraftHours = switch (aircraftHours) { case (null) { log.aircraftHours }; case (?ah) { ah } };
        let newSunriseTime = switch (sunriseTime) { case (null) { log.sunriseTime }; case (?sr) { sr } };
        let newSunsetTime = switch (sunsetTime) { case (null) { log.sunsetTime }; case (?ss) { ss } };

        let updatedLog : FlightLog = {
          id = log.id;
          date = newDate;
          studentId = newStudentId;
          instructorId = newInstructorId;
          aircraftId = newAircraftId;
          exerciseId = newExerciseId;
          flightType = newFlightType;
          landingType = newLandingType;
          landingCount = newLandingCount;
          takeoffTime = newTakeoffTime;
          landingTime = newLandingTime;
          totalHours = newTotalHours;
          aircraftHours = newAircraftHours;
          sunriseTime = newSunriseTime;
          sunsetTime = newSunsetTime;
        };
        flightLogs.add(id, updatedLog);
        #ok(updatedLog);
      };
    };
  };

  public shared ({ caller }) func deleteFlightLog(id : Nat) : async SuccessResult {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete flight logs");
    };
    flightLogs.remove(id);
    #ok(());
  };

  // ── Reports ────────────────────────────────────────────────────────────────

  public query ({ caller }) func getStudentTotalHours(studentId : Text) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view student hours");
    };
    var total : Float = 0;
    for ((_, log) in flightLogs.entries()) {
      if (log.studentId == studentId) {
        total += log.totalHours;
      };
    };
    total;
  };

  public query ({ caller }) func getInstructorReport(instructorId : Text) : async (Float, Nat) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view instructor reports");
    };
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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can export flight logs");
    };
    var csv = "Date,Student,Instructor,Aircraft,Exercise,Flight Type,Landing Type,Landing Count,Takeoff Time,Landing Time,Total Hours,Aircraft Hours,Sunrise Time,Sunset Time\n";
    for ((_, log) in flightLogs.entries()) {
      let studentName = switch (students.get(log.studentId)) {
        case (?student) { student.name };
        case (null) { "Unknown Student" };
      };
      let instructorName = switch (instructors.get(log.instructorId)) {
        case (?instructor) { instructor.name };
        case (null) { "Unknown Instructor" };
      };
      let aircraftRegistration = switch (aircraft.get(log.aircraftId)) {
        case (?aircraftEntry) { aircraftEntry.registration };
        case (null) { "Unknown Aircraft" };
      };
      let exerciseName = switch (exercises.get(log.exerciseId)) {
        case (?exercise) { exercise.name };
        case (null) { "Unknown Exercise" };
      };

      csv #= log.date # "," #
      studentName # "," #
      instructorName # "," #
      aircraftRegistration # "," #
      exerciseName # "," #
      log.flightType # "," #
      log.landingType # "," #
      log.landingCount.toText() # "," #
      log.takeoffTime # "," #
      log.landingTime # "," #
      log.totalHours.toText() # "," #
      log.aircraftHours.toText() # "," #
      log.sunriseTime # "," #
      log.sunsetTime # "\n";
    };
    csv;
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

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

    if (landingTotalMinutes < takeoffTotalMinutes) {
      return 0;
    };

    let timeDifference = (landingTotalMinutes - takeoffTotalMinutes) : Int;
    timeDifference.toFloat() / 60.0;
  };
};

