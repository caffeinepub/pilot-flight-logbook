# Specification

## Summary
**Goal:** Add an Admin Panel with a dashboard, user management, and role-based access control to the Pilot Flight Logbook application.

**Planned changes:**
- Add backend support for a user registry in stable storage with roles (Admin, User, Guest), including methods to register/update users, retrieve all users, update roles, and get the current user's role; enforce that the last admin cannot be demoted or removed
- Add a `useAdminPanel` React Query hook that fetches all users, exposes entity counts, provides an `updateUserRole` mutation, and includes an `isAdmin` helper for the current principal
- Create an `AdminPanel` component with a System Overview section (stat cards for Students, Instructors, Aircraft, Exercises), a Quick Actions section (navigation buttons to each entity management tab), and a User Management table (Name, truncated Principal, Role dropdown with success/error toasts and last-admin protection)
- Add an Admin tab to the main navigation that is only visible to users with the Admin role, using a shield or lock icon, and renders the `AdminPanel` component

**User-visible outcome:** Admin users see a new Admin tab (with a shield icon) in the navigation. Clicking it opens the Admin Panel showing live entity counts, quick-access links to management pages, and a user management table where roles can be changed via a dropdown — with the system preventing demotion of the last admin.
