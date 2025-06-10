```markdown
# Product Requirements Document: BIG direkt gesund Room & Desk Booking App

*   **Version:** 1.0
*   **Date:** June 9, 2025

---

## 1. Executive Summary

This document outlines the requirements for a cloud-based (SaaS) Room and Desk Booking application for BIG direkt gesund. The application will enable approximately 720 employees across their Dortmund and Düsseldorf locations to visually browse and book available desks and project rooms within their Activity-Based Working (ABW) environment. The primary goal is to facilitate flexible working, optimize space utilization, and provide employees with an intuitive tool for managing their workspace needs. The solution will be fully managed by the vendor, including operations, maintenance, and support, adhering to specified service levels. A targeted Go-Live date of December 1, 2025, requires the core implementation phase to be completed by November 30, 2025.

---

## 2. Product Vision

The vision for the BIG direkt gesund Room and Desk Booking App is to be the central, intuitive platform that empowers all employees to easily find and reserve the workspace they need, whether it's a quiet desk for focused work or a project room for collaboration. By providing a clear, visual representation of available spaces and a simple booking process, the app will seamlessly integrate into the daily workflow of an Activity-Based Working environment. This will not only improve individual productivity and flexibility but also provide valuable data to BIG direkt gesund for optimizing their office layout and resource allocation, ultimately contributing to a more efficient and employee-centric workplace. The product should scale to accommodate future growth and adapt to evolving working models, providing reliable, vendor-managed service.

---

## 3. User Personas

Based on the target user group and required functionality, we define two primary user personas:

*   **Persona 1: Flexible Worker Frank**
    *   **Description:** A typical BIG direkt gesund employee who works in the office regularly but utilizes the Activity-Based Working concept. He needs to book desks or rooms for specific days and times based on his tasks and planned collaborations.
    *   **Goals:**
        *   Quickly find an available desk or room that meets his needs (location, equipment).
        *   Book a desk or room for a specific time slot or full day.
        *   Easily view and manage his upcoming bookings.
        *   Have confidence that a booked space will be available when he arrives.
    *   **Pain Points:**
        *   Wasting time searching for available space upon arrival.
        *   Difficulty booking spaces with specific requirements.
        *   Cumbersome or non-intuitive booking systems.
        *   Uncertainty about space availability in advance.
        *   Booked spaces being occupied by others.

*   **Persona 2: Facility Manager Fiona**
    *   **Description:** Part of the administration or facility management team responsible for managing the office space and supporting employees. She needs to oversee the booking system, manage user access, configure spaces, and analyze usage data.
    *   **Goals:**
        *   Manage users and permissions within the system.
        *   Configure and update details for desks and rooms (e.g., location, capacity, equipment) accurately reflecting the physical space.
        *   Access reliable reports on space utilization and booking trends to inform space planning decisions.
        *   Troubleshoot user issues related to booking and system access.
        *   Ensure system data integrity.
    *   **Pain Points:**
        *   Lack of visibility into actual space usage.
        *   Manual, time-consuming processes for updating space information.
        *   Difficulty supporting employees with a complex or unreliable system.
        *   Inability to generate data-driven reports for space planning.
        *   Challenges in keeping the system configuration synchronized with physical changes.

---

## 4. Feature Specifications

### 4.1. User Authentication and Authorization

*   **Description:** Enable users to securely log in to the application and ensure they have appropriate access levels (Employee or Administrator).
*   **User Stories:**
    *   As an employee, I want to log in to the booking system so I can access my profile and make bookings.
    *   As an administrator, I want to log in with elevated privileges so I can manage users and spaces.
    *   As a user, I want my session to remain active for a reasonable period so I don't have to log in repeatedly during my workday.
*   **Acceptance Criteria:**
    *   Users can log in using credentials provided or integrated. (Integration details in LV).
    *   Successful login redirects the user to the main application dashboard/map view.
    *   Invalid credentials display a clear error message.
    *   User roles (Employee, Administrator) are applied upon login, granting access to the appropriate features.
    *   User sessions are managed securely (e.g., cookies, tokens) with inactivity timeouts.
*   **Edge Cases:**
    *   User account is locked or disabled.
    *   Incorrect handling of password resets (if applicable, often handled by integrated IdP).
    *   Concurrent logins from multiple devices (system behavior needs definition - block, allow, notify?).
    *   Session expiring during an action (e.g., during booking process).

### 4.2. Browse Available Spaces (Visual Map)

*   **Description:** Provide a visual interface representing the office layout, showing the status of desks and rooms.
*   **User Stories:**
    *   As an employee, I want to see a map of my location and floor so I can understand the office layout.
    *   As an employee, I want to see which desks and rooms are available or booked on the map for a specific date and time.
    *   As an employee, I want to easily switch between different locations (Dortmund, Düsseldorf) and floors.
*   **Acceptance Criteria:**
    *   Application loads a floor plan image/representation for a default or selected location/floor.
    *   Desks and rooms are clearly identifiable graphical elements on the map.
    *   Each space element visually indicates its availability status (e.g., color-coded: green for available, red for booked, grey for closed/unavailable) for the currently selected date/time.
    *   A mechanism exists to select the desired location (Dortmund, Düsseldorf) and floor.
    *   Map view allows for zooming and panning.
    *   Clicking or hovering on a space element provides a quick summary of its status and identity (e.g., Desk 1A, Room Dortmund 3.01).
*   **Edge Cases:**
    *   No floor plan configured for a location/floor.
    *   Floor plan image fails to load.
    *   Spaces on the map are not correctly aligned with the background image.
    *   Color blindness accessibility for status indicators.
    *   Performance issues with large or detailed maps or many spaces.

### 4.3. Search and Filter Spaces

*   **Description:** Allow users to refine the list or map view of spaces based on criteria.
*   **User Stories:**
    *   As an employee, I want to search for a specific desk or room by name/number.
    *   As an employee, I want to filter spaces by type (Desk, Room) so I only see relevant options.
    *   As an employee, I want to filter rooms by capacity or available equipment (e.g., "projector", "monitor") so I can find a space meeting my needs.
*   **Acceptance Criteria:**
    *   A search bar and filter options are available on the main browsing interface.
    *   Users can filter by Location, Floor, Space Type (Desk, Room).
    *   Users can filter Rooms by capacity (e.g., min attendees) and available equipment (pre-defined list of equipment types).
    *   Searching by space name/number highlights or filters the results.
    *   Applying filters updates the displayed list or map view in real-time or upon user action.
    *   Applied filters are clearly indicated to the user.
*   **Edge Cases:**
    *   Search or filter yields no results.
    *   Equipment list is empty or not configured.
    *   Filtering by capacity on desks (should be disabled).
    *   Combining conflicting filters.

### 4.4. View Space Details

*   **Description:** Provide detailed information about a specific desk or room when selected.
*   **User Stories:**
    *   As an employee, when I click on a space, I want to see detailed information about it before booking.
    *   As an employee, I want to see the specific availability schedule for a space on a selected date.
*   **Acceptance Criteria:**
    *   Clicking or selecting a space on the map or from a list opens a detail panel or page.
    *   The detail view includes: Space Name/Identifier, Location, Floor, Type (Desk/Room), Capacity (for rooms), List of Equipment (for rooms), and potentially a small image if available.
    *   The detail view shows the availability for the selected date, typically as a time-based breakdown (e.g., calendar or time slots).
    *   User can change the date in the detail view to check availability on other days.
*   **Edge Cases:**
    *   Missing data for space attributes (capacity, equipment).
    *   Availability display is confusing for overnight bookings (if applicable).
    *   Performance issues when fetching detailed availability for complex schedules.

### 4.5. Book a Desk

*   **Description:** Allow a user to reserve an available desk for a specific duration.
*   **User Stories:**
    *   As an employee, when I find an available desk, I want to book it for the day.
    *   As an employee, I want to book a desk for a specific time range if needed.
    *   As an employee, I want confirmation that my desk booking was successful.
*   **Acceptance Criteria:**
    *   A prominent "Book" action is available for selected, available desks.
    *   User can specify the booking date and time range (e.g., Full Day, or specific start/end times). Default to Full Day if applicable based on rules.
    *   The system validates that the desk is still available for the requested time slot before confirming.
    *   Upon successful booking, the user receives an in-app confirmation message.
    *   The booked desk's status on the map and in details updates to "Booked" for the relevant time.
    *   The booking appears in the user's "My Bookings" list.
*   **Edge Cases:**
    *   Desk becomes unavailable between the user viewing it and attempting to book.
    *   User attempts to book a desk that is already booked or unavailable.
    *   Booking request fails due to system error (clear error message required).
    *   Attempting to book outside of allowed booking window (e.g., booking too far in advance, booking in the past, booking outside office hours if rules apply).
    *   Booking a desk that is marked as "out of service" by an administrator.

### 4.6. Book a Project Room

*   **Description:** Allow a user to reserve an available project room for a specific duration and potentially invite attendees.
*   **User Stories:**
    *   As an employee, when I find an available room, I want to book it for a meeting.
    *   As an employee, I want to specify the duration and potentially invite colleagues when booking a room.
    *   As an employee, I want confirmation that my room booking was successful and potentially have it appear in my calendar.
*   **Acceptance Criteria:**
    *   A prominent "Book" action is available for selected, available rooms.
    *   User can specify the booking date and time range (start/end time).
    *   User can optionally specify the number of attendees (validation against room capacity required if specified).
    *   User can optionally add attendees (requires calendar integration - see Technical Requirements).
    *   The system validates that the room is still available for the requested time slot and meets capacity constraints.
    *   Upon successful booking, the user receives an in-app confirmation message.
    *   The booked room's status on the map and in details updates to "Booked" for the relevant time.
    *   The booking appears in the user's "My Bookings" list.
    *   If calendar integration is active and configured, a calendar event is created for the user and invited attendees.
*   **Edge Cases:**
    *   Room becomes unavailable during the booking process.
    *   User attempts to book a room that is already booked or unavailable.
    *   Booking request fails due to system error.
    *   Attempting to book outside of allowed booking window.
    *   Attempting to book a room with attendees exceeding its capacity (system should warn or prevent).
    *   Calendar integration fails or credentials are invalid during booking.

### 4.7. View and Manage My Bookings

*   **Description:** Allow users to see a list of their current and upcoming bookings and cancel them.
*   **User Stories:**
    *   As an employee, I want to see a list of all my upcoming desk and room bookings.
    *   As an employee, I want to easily find the details of a specific upcoming booking.
    *   As an employee, I want to cancel a booking I no longer need.
*   **Acceptance Criteria:**
    *   A dedicated section ("My Bookings") is accessible to the user.
    *   This section lists all active and future bookings made by the user.
    *   Each booking entry clearly shows the Space Name, Location, Floor, Date, and Time.
    *   Users can click on a booking entry to view full details.
    *   A "Cancel Booking" action is available for each upcoming booking.
    *   Confirming cancellation removes the booking and updates the space's availability.
    *   Successful cancellation is confirmed to the user.
*   **Edge Cases:**
    *   Attempting to cancel a booking that has already passed.
    *   Attempting to cancel a booking that is already cancelled.
    *   Cancellation failing due to system error.
    *   Cancellation rules based on proximity to start time (e.g., cannot cancel within 1 hour) - requires clear messaging.

### 4.8. Admin: Space Configuration and Management

*   **Description:** Provide administrators with tools to define and manage locations, floors, desks, and rooms within the system.
*   **User Stories:**
    *   As an administrator, I want to add, edit, and remove locations and floors.
    *   As an administrator, I want to upload and associate floor plan images with floors.
    *   As an administrator, I want to graphically place desks and rooms on the floor plan.
    *   As an administrator, I want to define attributes for each space (name, capacity, equipment, etc.).
    *   As an administrator, I want to mark spaces as temporarily unavailable (e.g., for maintenance).
*   **Acceptance Criteria:**
    *   An accessible admin interface exists for Space Management.
    *   Admins can create, edit, and delete Location and Floor records.
    *   Admins can upload image files (e.g., PNG, JPG, SVG - specify supported formats) as floor plans for each floor.
    *   A visual editor allows admins to place, resize, and rotate graphical representations of desks and rooms on the uploaded floor plan image, linking them to the underlying space data.
    *   Admins can create, edit, and delete space records (Desks, Rooms).
    *   Admins can define attributes for spaces (e.g., Name, Capacity, Equipment List - requires managing a list of equipment types).
    *   Admins can mark spaces as "unavailable" or "out of service" for specified periods, which should be reflected in the user view.
*   **Edge Cases:**
    *   Uploading unsupported image file types or excessively large images.
    *   Misaligned or incorrectly scaled spaces on the map.
    *   Attempting to delete a location, floor, or space that has upcoming bookings (requires warning or blocking).
    *   Managing changes to physical office layout requiring map updates.
    *   Defining complex equipment lists or attributes.

### 4.9. Admin: User Management

*   **Description:** Allow administrators to view and manage users within the booking system.
*   **User Stories:**
    *   As an administrator, I want to see a list of all users in the system.
    *   As an administrator, I want to view individual user details (name, email, role).
    *   As an administrator, I want to assign or change a user's role (Employee/Administrator).
    *   As an administrator, I want to add or remove users (manual or via integration).
*   **Acceptance Criteria:**
    *   An accessible admin interface exists for User Management.
    *   Admins can view a paginated list of all users.
    *   Each user entry shows key information (Name, Email, Role).
    *   Admins can view a detail page for each user.
    *   Admins can modify a user's role.
    *   Admins can manually add new users (if not fully relying on integration).
    *   Admins can deactivate or remove users. (Behavior towards existing bookings needed - cancel? transfer?).
    *   If user sync integration is used, the admin interface reflects the integrated user base.
*   **Edge Cases:**
    *   Attempting to remove a user who has active bookings (requires clear handling).
    *   Managing large numbers of users.
    *   Conflicts between manual user edits and automated synchronization (if applicable).
    *   Ensuring role changes are applied correctly and immediately.

### 4.10. Admin: Reporting and Analytics

*   **Description:** Provide administrators with reports on space utilization and booking trends to inform decision-making.
*   **User Stories:**
    *   As an administrator, I want to see how often desks and rooms are being booked.
    *   As an administrator, I want to identify peak usage times and days.
    *   As an administrator, I want to understand the utilization rate of different types of spaces, floors, and locations.
    *   As an administrator, I want to export booking data for further analysis.
*   **Acceptance Criteria:**
    *   An accessible admin interface section for Reporting exists.
    *   Standard reports available include:
        *   Overall Utilization Rate (percentage of time spaces are booked) filterable by Location, Floor, Space Type, and Date Range.
        *   Booking Count by Day/Week/Month, filterable by Location, Floor, Space Type.
        *   Popular Spaces (List of most frequently booked desks/rooms).
    *   Reports can be filtered by date range, location, floor, and space type.
    *   Reports are presented in a clear, understandable format (tables, charts where appropriate).
    *   Ability to export report data (e.g., CSV format) for external use.
*   **Edge Cases:**
    *   Generating reports for very long date ranges causing performance issues.
    *   Reporting on spaces that have been removed or modified.
    *   Edge cases in calculating utilization (e.g., very short bookings, overlapping bookings if system allows - shouldn't, but data might show weirdness).
    *   Ensuring data accuracy in reports.

---

## 5. Technical Requirements

Based on the SaaS model and scope, the following technical requirements are essential:

*   **Architecture:**
    *   Cloud-based SaaS solution, fully hosted and managed by the vendor.
    *   Vendor is fully responsible for infrastructure provisioning, monitoring, maintenance, updates, backups, and disaster recovery.
    *   Must be scalable horizontally and vertically to handle the initial user base (~720) and support significant future growth in users and spaces.
    *   Must adhere to relevant German data protection regulations (e.g., GDPR, BDSG). Data storage location must be specified and preferably within the EU/Germany.
    *   High availability and reliability targets (specific uptime SLAs are in the Leistungsverzeichnis).

*   **Integrations (Details per Leistungsverzeichnis):**
    *   The solution must support key integrations as specified in the separate Leistungsverzeichnis document. Potential integration points include:
        *   **User Authentication/Synchronization:** Integration with BIG direkt gesund's identity provider (e.g., Active Directory, LDAP, or Azure AD) is highly probable for user authentication and potentially user provisioning/deprovisioning to avoid manual user management.
        *   **Calendar Systems:** Integration with BIG direkt gesund's corporate calendar system (likely Microsoft Exchange/Outlook) to create/update meeting entries for room bookings and potentially allow users to see their desk bookings in their calendar. Requires handling authentication and permissions for calendar access.
        *   **Reporting/Analytics:** Potential APIs for extracting raw booking/utilization data for integration into BIG direkt gesund's internal Business Intelligence tools if required beyond built-in reporting capabilities.
    *   APIs required for these integrations must be well-documented, secure (using standard authentication/authorization protocols like OAuth2), performant, and robustly handle connection errors and data inconsistencies.

*   **Data Storage:**
    *   Secure and compliant storage of:
        *   User profiles (minimal data required for system function, typically synced from IdP: Name, email, internal ID, role).
        *   Location and Floor data (Names, descriptions).
        *   Space data (Desks, Rooms) including unique identifiers, names, attributes (capacity, equipment list), associated Location/Floor, spatial data for map placement (coordinates, size, orientation), status (active, out-of-service).
        *   Booking data (Unique Booking ID, User ID, Space ID, Start Time, End Time, Date, Status - confirmed/cancelled, creation timestamp, potentially invited attendees for rooms).
        *   Map assets (image files, potentially vector data or coordinates).
    *   Database must be performant for real-time availability lookups and historical reporting queries.
    *   Data retention and deletion policies must be configurable or clearly defined to meet compliance requirements.
    *   Data encryption at rest and in transit is required.

*   **APIs:**
    *   Robust internal APIs to support the web user interface and potential future interfaces (e.g., mobile app). These should be performant and secure.
    *   External APIs for specified integrations (Authentication callback, Calendar sync, Reporting Data Export) as defined in the LV. These APIs should follow RESTful principles, use standard data formats (JSON), and implement appropriate security measures.

*   **Performance:**
    *   Application must load quickly (< 5 seconds for initial load, < 2 seconds for map/data updates).
    *   Map interaction (pan, zoom, selecting spaces) should be smooth.
    *   Availability lookups and booking confirmations must be near real-time (< 2 seconds response time under peak load).
    *   Reporting generation should be reasonably fast, even for large date ranges (e.g., < 30 seconds for complex reports).

*   **Security:**
    *   Adherence to standard web application security best practices (OWASP Top 10 mitigation).
    *   Use of HTTPS/TLS for all communication.
    *   Secure handling and storage of any credentials or tokens used for integrations.
    *   Role-based access control (RBAC) strictly enforced server-side.
    *   Regular security audits and penetration testing performed by the vendor.
    *   Compliance with German specific data privacy and security requirements is paramount.

*   **Supportability:**
    *   Vendor must provide robust logging, monitoring, and alerting for the service to ensure proactive issue detection.
    *   System must provide interfaces for BIG direkt gesund to report issues (Portal/Email) as per the required service levels.
    *   Configuration should be manageable by the vendor to perform maintenance and updates efficiently, preferably with minimal downtime.

---

## 6. Implementation Roadmap

The implementation roadmap is structured to align with the required Go-Live date of December 1, 2025. The dedicated implementation phase runs from October 1, 2025, to November 30, 2025.

*   **Phase 1: Core Foundation & Configuration Readiness (Oct 1, 2025 – Oct 31, 2025)**
    *   **Focus:** Establish the core technical infrastructure, deploy the basic application framework, enable user access, and build the administrative capabilities required for BIG direkt gesund to configure their space data.
    *   **Features:**
        *   Basic User Authentication & Authorization (Initial setup, potentially manual admin user creation).
        *   Admin: Core Space Management (Add/Edit Locations, Floors, Upload/Associate Floor Plans, Basic graphical placement of spaces).
        *   Admin: Basic User Management (View user list, basic details – potentially read-only if full sync is Phase 3).
        *   Basic Data Model for Users, Spaces, Bookings, Locations, Floors.
        *   Initial API development for core data access.
    *   **Technical:** Cloud environment provisioning, initial database setup, core application deployment pipeline, basic security configuration.
    *   **Milestone:** System accessible to BIG direkt gesund administrators, core admin configuration features functional, ready for BIG direkt gesund to begin loading office layout data.

*   **Phase 2: Core Booking Logic, User Experience & Testing (Nov 1, 2025 – Nov 22, 2025)**
    *   **Focus:** Implement the core user-facing booking features, refine the visual interface based on BIG direkt gesund's configured data, and integrate any components absolutely critical for initial operation.
    *   **Features:**
        *   Browse Available Spaces (Functional map display with configured spaces, status indication for a selected date).
        *   View Basic Space Details (Name, Type, Status).
        *   Core Desk Booking workflow (Select available desk, choose date/time range, confirm).
        *   Core Room Booking workflow (Select available room, choose date/time range, confirm).
        *   Basic "My Bookings" view (List of upcoming bookings).
        *   Initial implementation of key booking rules from Leistungsverzeichnis (e.g., max booking duration, booking window).
    *   **Technical:** Development of frontend UI/UX for core flows, refinement of APIs, integration with authentication source if critical for Go-Live (otherwise manual users are fallback), initial performance testing, basic security review.
    *   **Milestone:** Core booking workflows are functional end-to-end, system contains configured BIG direkt gesund data, internal testing and initial BIG direkt gesund review complete, system ready for User Acceptance Testing (UAT).

*   **Phase 3: Refinement, UAT, Go-Live Preparation & Launch (Nov 23, 2025 – Nov 30, 2025)**
    *   **Focus:** Address feedback from UAT, finalize remaining critical features for Go-Live, complete documentation and training materials, and prepare for the production launch.
    *   **Features:**
        *   Refined View Space Details (Adding capacity, equipment).
        *   Search and Filter Spaces.
        *   View and Manage My Bookings (Adding cancellation).
        *   Admin: Basic Reporting features operational.
        *   Refinement of booking rules based on UAT/LV.
        *   Final configuration of all spaces and users by BIG direkt gesund using admin tools.
    *   **Technical:** Bug fixing based on UAT, performance tuning, final security checks, production environment setup and validation, documentation (technical and user/admin guides), final data migration/sync readiness.
    *   **Milestone:** User Acceptance Testing (UAT) successfully passed, all critical Go-Live features implemented and tested, training materials delivered/reviewed, operational procedures (support, monitoring) finalized, system ready for production launch on Dec 1, 2025.

*   **Phase 4: Service Start & Post-Launch Optimization (Starting Dec 1, 2025)**
    *   **Focus:** Production launch, live monitoring, providing support, and implementing remaining features or optimizations based on the full requirements and user feedback.
    *   **Features:**
        *   Service Start / Go-Live (Dec 1, 2025).
        *   Provision of Support as per agreed SLAs (German language, business hours).
        *   Vendor manages and performs necessary Updates as per notification process.
        *   Training delivery for key users/administrators.
        *   Implementation of full integrations (e.g., Calendar Sync, full User Sync if not critical for Go-Live).
        *   Implementation of advanced Reporting features.
        *   Ongoing performance monitoring and optimization.
        *   Gathering user feedback and prioritizing backlog for future development cycles (contract extensions allowing).
    *   **Technical:** Production environment monitoring, incident response based on SLAs, scheduled maintenance and updates, continued development for backlog features and improvements.
    *   **Milestone:** Successful production launch, stable operation, meeting defined SLAs, positive initial user adoption, clear roadmap for future enhancements established.

---
```
