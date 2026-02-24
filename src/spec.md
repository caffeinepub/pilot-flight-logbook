# Specification

## Summary
**Goal:** Build a pilot flight logbook application with comprehensive tracking of students, instructors, aircraft, exercises, and flight logs, including reporting and CSV export capabilities.

**Planned changes:**
- Create backend data models for Student, Instructor, Aircraft, Exercise, and FlightLog with all required fields
- Implement CRUD operations for all entities with automatic total hours calculation for flight logs
- Add backend reporting methods for student total hours and instructor reports
- Implement CSV export functionality for all flight log data
- Build frontend forms to add and manage Students, Instructors, Aircraft, and Exercises
- Create flight log entry form with date picker, dropdowns, toggles, time inputs, and auto-calculated total hours
- Display flight logs in a table with edit and delete functionality
- Add student-wise and instructor-wise reporting views
- Implement Export to Excel button with CSV download

**User-visible outcome:** Users can manage a complete flight logbook by adding students, instructors, aircraft, and exercises, logging flights with comprehensive details (date, times, landing counts, flight/landing types), viewing all entries in a table, editing and deleting records, viewing aggregated reports by student and instructor, and exporting all data to CSV format for use in spreadsheet applications.
