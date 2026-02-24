# Specification

## Summary
**Goal:** Fix the Excel export filename to properly reflect the project name "Pilot Flight Logbook" with correct formatting.

**Planned changes:**
- Update ExportButton component to generate CSV filename as 'Pilot_Flight_Logbook_YYYY-MM-DD.csv'
- Replace spaces with underscores in the filename
- Include current date in YYYY-MM-DD format

**User-visible outcome:** When users export their flight logbook to CSV, the downloaded file will be named 'Pilot_Flight_Logbook_2024-01-15.csv' (with the current date) instead of the previous incorrect filename.
