---
name: grill-me
description: Comprehensive phase-by-phase final implementation plan for the Veloce Systems Employee Management System (EMS).
---

# VELOCE SYSTEMS — EMPLOYEE MANAGEMENT SYSTEM (EMS)
## Phase-by-Phase Final Implementation Plan

**Reference Document:** `Employee_Management_System_Implementation_Plan.md`  
**Prepared by:** Gonzalez, Polo C.  
**Version:** 1.0 (Final Engineering Plan)  
**Scope:** Complete delivery of Employee and Department Manager modules (All 37 Screens).

---

## High-Level Delivery Phases Sequence

```
┌────────────────────────────────────────────────────────┐
│ Phase 0: Project and Screen Baseline                   │
│ - Visual Design System, Tokens, Layout & Components   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 1: Authentication and Account Setup (Screens 1–7)│
│ - Login, Activation, Password Rules & Validation States│
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌──────────────────────────┐┌─────────────────────────────┐
│ Phase 2: Employee        ││ Phase 3: Department Manager │
│ Workspace (Screens 8–19) ││ Workspace (Screens 20–37)   │
│ - Dashboard & Profile    ││ - Department Dashboard      │
│ - Tasks & Details        ││ - Employees & Attendance    │
│ - Attendance & Calendar  ││ - Task Hub: Create & Assign │
│ - Announcements & Feeds  ││ - Leave Review Engine       │
│ - Leave Filing & History ││ - Announcements Hub         │
└────────────┬─────────────┘└────────────┬────────────────┘
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 4: Cross-Module Consistency & Data Parity        │
│ - Real-time Reactive Sync & Mutual Role Workflows      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 5: UI Validation and Completion Checklist        │
│ - 37-Screen Parity Verification & Acceptance Sign-off  │
└────────────────────────────────────────────────────────┘
```

---

## Phase 0: Project and Screen Baseline

### 0.1 Scope & Visual Identity
- **Visual Design:** Veloce Systems dark interface with light form controls, sharp high-contrast typography, and subtle card glow borders.
- **Palette Tokens:**
  - Canvas Background: `#090D16` / `#1E222B`
  - Card Surfaces: `#111827` / `#22262E` (rounded `16px` to `24px` with glassmorphic backdrop filter)
  - Dividers & Outlines: `#374151` / `#4B5563`
  - Brand Primary: Electric Indigo (`#6366F1`) & Warm Taupe (`#8C8275` button accents)
  - Brand Accent: Cyan (`#06B6D4`)
  - Semantic Statuses: Emerald (`#10B981` Present/Approved), Amber (`#F59E0B` Late/Pending), Rose (`#EF4444` Absent/Rejected/Error)
- **Shared Components:**
  - `Navbar`: System branding, real-time clock, shift ticker pill, notifications dropdown, and **Role Switcher** (**Polo Gonzalez - Employee** $\leftrightarrow$ **IT Department Manager**).
  - `Sidebar`: Role-aware active tab navigation with badge counts.
  - `StatCard`: Standardized KPI card with icon, title, metric value, and trend indicators.
  - `Badge`: Standardized tag component with status and priority color styles.
  - `Modal` / `Drawer`: Consistent overlay component with backdrop blur and escape key handling.

---

## Phase 1: Authentication and Account Setup (Screens 1–7)

### Objectives
Build complete authentication, employee activation with email verification, and mandatory first-login credential replacement with real-time password security validation.

### Screen-by-Screen Specifications
- **Screen 1 — Employee Login**
  - **Visible Flow:** Registered username input, password input, "Login" button, "Forgot Password" control, "Activate account?" link.
  - **Behaviors:** Authenticates credentials against registered records before allowing workspace access.
- **Screen 2 — Employee Login (Validation State)**
  - **Visible Flow:** Red input border highlights, red circle-X alert indicators, and inline validation message (*"The username does not exist"* / *"Please enter your password"*).
  - **Behaviors:** Keeps user on screen until corrected; empty or invalid inputs never proceed.
- **Screen 3 — Employee Account Activation**
  - **Visible Flow:** Employee ID/Number input (e.g. `EMP-1042`), Registered Company Email (`@veloce.com`), "Activate" CTA.
  - **Behaviors:** Verifies employee existence; sends temporary default password to company email.
- **Screen 4 — Employee Activation (Error State)**
  - **Visible Flow:** Field-level error messages for invalid employee IDs, unregistered emails, and mismatched credentials.
- **Screen 5 — Update User Credentials (First Login)**
  - **Visible Flow:** New Username, Default Password (from email), New Password, and Confirm Password fields.
- **Screen 6 — Update Credentials (Invalid Default Password)**
  - **Visible Flow:** Highlights default password field; blocks save action if default credential does not match the issued token.
- **Screen 7 — Update Credentials (Live Security & Mismatch Feedback)**
  - **Visible Flow:** Real-time 4-point password security checklist (8+ characters, uppercase letter, number, special symbol) and password matching verification badge.

---

## Phase 2: Employee Workspace (Screens 8–19)

### Objectives
Implement the complete day-to-day employee self-service workspace covering shifts, tasks, notices, leave applications, and personal profile management.

### Screen-by-Screen Specifications
- **Screen 8 — Employee Dashboard**
  - **Visible Flow:** Shift Check-In / Check-Out widget with live timestamp clock, 4 KPI summary cards (Assigned Tasks, Attendance Rate, Leave Balance, Announcements), My Tasks active preview, Leave Status tracker, and Announcements preview carousel.
- **Screen 9 — User Profile & Security**
  - **Visible Flow:** Employee information card (Employee ID, Name, Department, Position, Email, Phone, Address, Join Date), avatar switcher, and password change modal.
- **Screen 10 — Employee Tasks List**
  - **Visible Flow:** Search bar, status filter chips (`All Tasks`, `Not Started`, `In Progress`, `Completed`), priority badges, due date markers, and pagination controls.
- **Screen 11 — Task Details View**
  - **Visible Flow:** Detailed task requirements, downloadable supporting documents, submission notes / work log textarea, and status update selector.
- **Screen 12 — Attendance Module View**
  - **Visible Flow:** Monthly shift summary KPI cards (Total Days of Shift, Number Present, Number of Absence, Late Shifts), and Month/Year selector.
- **Screen 13 — Detailed Attendance Calendar & Records**
  - **Visible Flow:** Interactive 31-day visual calendar with status day markers (Green = Present, Amber = Late, Red = Absent, Blue = On Leave), and detailed shift logs table with pagination.
- **Screen 14 — Announcements List**
  - **Visible Flow:** Tab filters (`All Announcements`, `Bookmarked`, `Unread`), category tags (`System`, `Meeting`, `Advisory`, `Update`, `Reminder`), date snippets, and "Read More" trigger.
- **Screen 15 — Bookmarked Announcements**
  - **Visible Flow:** Filtered tab showing user-saved announcements with one-click bookmark toggles.
- **Screen 16 — Announcement Details View**
  - **Visible Flow:** Full announcement view with author details, department tag, full markdown content, attachment downloads, and auto-mark-as-read tracking.
- **Screen 17 — Leave Requests Main Hub**
  - **Visible Flow:** Leave balance cards (Vacation, Sick, Emergency), "+ Create Leave Request" CTA, and leave history table with status badges and manager notes.
- **Screen 18 — Leave Form & Type Selection**
  - **Visible Flow:** Leave type category dropdown (`Vacation`, `Sick`, `Emergency`, `Maternity/Paternity`, `Bereavement`).
- **Screen 19 — Leave Date Picker & Total Days Calculation**
  - **Visible Flow:** Start date and end date selectors with automated working day calculation (excluding weekends), reason textarea, and submit action.

---

## Phase 3: Department Manager Workspace (Screens 20–37)

### Objectives
Provide the IT Department Manager with centralized administration tools for staff directory inspection, attendance monitoring, task assignment, leave review, and announcement management.

### Screen-by-Screen Specifications
- **Screen 20 — Department Manager Dashboard**
  - **Visible Flow:** IT Department headcount KPIs (Total Employees, Present Today, Ongoing Tasks, Pending Leave Requests), Leave Pipeline distribution breakdown, recent task assignments, and recent announcements.
- **Screen 21 — Viewing IT Employees Directory**
  - **Visible Flow:** Staff directory table: Employee ID, Name, Avatar, Position, Contact, Status (Active), Search, Position filter, and "View Attendance" action.
- **Screen 22 — Attendance Record (Department View)**
  - **Visible Flow:** Selected employee's attendance breakdown cards (Present, Late, Absent, On Leave), daily shift logs table, and "Return to Employees" button.
- **Screen 23 — Manager Tasks Hub**
  - **Visible Flow:** Status counters (`Pending`, `In Progress`, `Completed`), task registry table with assignees and actions, and "+ Create Task" button.
- **Screen 24 — Create Task Form (Step 1)**
  - **Visible Flow:** Form fields for Task Title, Detailed Description, Priority (`Low`, `Medium`, `High`, `Urgent`), Target Due Date, and optional attachments.
- **Screen 25 — Assign to Employees (Step 2)**
  - **Visible Flow:** Searchable multi-select employee directory with avatars, positions, and workload indicators.
- **Screen 26 — Edit Task Form**
  - **Visible Flow:** Pre-populated edit modal for updating specifications, priority, deadline, or status.
- **Screen 27 — Task Updated / Created Successfully State**
  - **Visible Flow:** Confirmation modal with animated checkmark and navigation options (*"View Task"* or *"Back to Tasks"*).
- **Screen 28 — Manager Leave Requests Hub**
  - **Visible Flow:** KPI counters (`Total Requests`, `Pending Review`, `Approved`, `Rejected`), filters by Leave Type and Status, and inbox table with "Review" action.
- **Screen 29 — Leave Request Details Review**
  - **Visible Flow:** Comprehensive review modal (applicant info, dates, duration, stated reason) with `Approve Request` and `Reject Request` actions.
- **Screen 30 — Approve Leave Confirmation Modal**
  - **Visible Flow:** Confirmation dialog displaying duration and balance deduction.
- **Screen 31 — Reject Leave Dialog (Mandatory Reason Input)**
  - **Visible Flow:** Rejection dialog enforcing a **mandatory justification reason** textarea.
- **Screen 32 — Leave Request Approved Success State**
  - **Visible Flow:** Success notification confirming approval and balance updates.
- **Screen 33 — Leave Request Rejected Success State**
  - **Visible Flow:** Rejection confirmation recording the manager's justification into audit logs.
- **Screen 34 — Manager Announcements Hub**
  - **Visible Flow:** Summary tiles (`Total Announcements`, `Active Now`, `Scheduled`), announcements table with Edit and Delete controls, and "+ Post Announcement" button.
- **Screen 35 — Post Announcement Form**
  - **Visible Flow:** Title, category, content body, attachments, and publishing mode (`Post Now` vs. `Schedule for Later` with date selector).
- **Screen 36 — Edit Announcement Form**
  - **Visible Flow:** Form for updating published announcement title, category, and content.
- **Screen 37 — Announcement Posted Success State**
  - **Visible Flow:** Confirmation modal showing distribution across the IT department.

---

## Phase 4: Cross-Module Consistency & Data Parity

### Synchronization Workflows
1. **Leave Requests Flow:**
   - Employee submits leave $\rightarrow$ Immediately appears in Manager Leave Requests inbox with `Pending` status.
   - Manager approves request $\rightarrow$ Deducts employee balance and updates Employee history to `Approved`.
   - Manager rejects request $\rightarrow$ Updates Employee status to `Rejected` with visible rejection reason.
2. **Task Assignment Flow:**
   - Manager creates & assigns task $\rightarrow$ Instantly appears in assigned employee's task queue and dashboard.
   - Employee updates progress / notes $\rightarrow$ Manager sees updated status in real-time.
3. **Announcement Broadcast Flow:**
   - Manager publishes notice $\rightarrow$ Instantly broadcasted to employee announcement feed and dashboard carousel.
   - Employee bookmarks announcement $\rightarrow$ Preserved in personal Bookmarks tab.
4. **Interactive Role Switcher:**
   - Top-bar toggle (**Polo Gonzalez - Employee** $\leftrightarrow$ **Marcus Rivera - IT Manager**) for live bidirectional testing.

---

## Phase 5: UI Validation and Completion Checklist

- [ ] **Phase 0:** Veloce Systems Dark Design tokens, typography, and reusable components.
- [ ] **Phase 1:** Screens 1–7 (Login, Activation, First-login Password Meter & Mismatch validation).
- [ ] **Phase 2:** Screens 8–19 (Employee Dashboard, Profile, Tasks & Notes, Attendance & Calendar, Announcements & Bookmarks, Leave Filing & Working-day calculation).
- [ ] **Phase 3:** Screens 20–37 (Manager Dashboard, IT Employees & Attendance Logs, Task Creation & Assignment flow, Leave Review with Mandatory Rejection Justification, Announcement Publishing & Scheduling).
- [ ] **Phase 4:** Reactive centralized state store connecting all employee and manager interactions.
- [ ] **Phase 5:** Screen-by-screen parity check against all 37 screenshots in the EMS reference material.
