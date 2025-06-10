```markdown
# Backend Implementation Guide: Room and Desk Booking App

**Project:** Room and Desk Booking App for BIG direkt gesund

**Version:** 1.0
**Date:** June 9, 2025

---

## 1. Document Header

(See above)

---

## 2. API Design

The backend will expose a RESTful API to handle requests from the frontend application and potentially other internal services (e.g., for user synchronization, if required by the full Leistungsverzeichnis). JSON will be the primary data format for requests and responses.

**Base URL:** `/api` (or similar, e.g., `/api/v1`)

**Key Endpoints:**

1.  **Locations & Structure:**
    *   `GET /api/locations`
        *   **Description:** Get a list of available locations.
        *   **Response:** `[{ id: string, name: string }]`
    *   `GET /api/locations/:locationId/buildings/:buildingId/floors`
        *   **Description:** Get a list of floors within a specific building.
        *   **Response:** `[{ id: string, name: string, layoutUrl?: string }]`
    *   `GET /api/floors/:floorId/spaces`
        *   **Description:** Get a list of bookable spaces (desks, rooms) on a specific floor. Supports filtering for availability.
        *   **Query Params:**
            *   `date`: (Required) YYYY-MM-DD
            *   `startTime`: (Required) HH:mm
            *   `endTime`: (Required) HH:mm
            *   `type`: (Optional) Filter by space type (e.g., 'Desk', 'Room').
        *   **Response:** `[{ id: string, name: string, type: 'Desk' | 'Room', capacity?: number, isBookable: boolean, isAvailable: boolean, coordinates?: { x: number, y: number, width: number, height: number } }]` - `isAvailable` is calculated based on query params.
    *   `GET /api/spaces/:spaceId`
        *   **Description:** Get details for a specific space.
        *   **Response:** `{ id: string, name: string, type: 'Desk' | 'Room', capacity?: number, floorId: string, floorName: string, buildingId: string, buildingName: string, locationId: string, locationName: string, coordinates?: { x: number, y: number, width: number, height: number } }`

2.  **Bookings:**
    *   `GET /api/users/:userId/bookings`
        *   **Description:** Get a list of bookings for a specific user. Supports filtering.
        *   **Query Params:**
            *   `status`: (Optional) Filter by status (e.g., 'active', 'cancelled', 'past'). Default: 'active'.
            *   `startDate`: (Optional) YYYY-MM-DD
            *   `endDate`: (Optional) YYYY-MM-DD
        *   **Response:** `[{ id: string, userId: string, spaceId: string, spaceName: string, spaceType: 'Desk' | 'Room', locationName: string, buildingName: string, floorName: string, startTime: string (ISO 8601), endTime: string (ISO 8601), status: 'confirmed' | 'cancelled', createdAt: string (ISO 8601) }]`
    *   `POST /api/bookings`
        *   **Description:** Create a new booking.
        *   **Request Body:** `{ userId: string, spaceId: string, startTime: string (ISO 8601), endTime: string (ISO 8601) }`
        *   **Validation:** Backend must validate time slot availability and booking rules (defined in Leistungsverzeichnis).
        *   **Response:** `{ id: string, userId: string, spaceId: string, startTime: string, endTime: string, status: 'confirmed', createdAt: string }` (On success, HTTP 201 Created) or Error object (HTTP 400/409/500).
    *   `DELETE /api/bookings/:bookingId`
        *   **Description:** Cancel a specific booking.
        *   **Validation:** Backend must verify the booking belongs to the authenticated user and adheres to cancellation rules (if any).
        *   **Response:** HTTP 204 No Content (On success) or Error object (HTTP 403/404/500).

---

## 3. Data Models

Using a relational database approach (e.g., PostgreSQL, MySQL) for structured data and strong relationships.

*   **`locations`**
    *   `id` (UUID/INT, PK)
    *   `name` (VARCHAR, e.g., 'Dortmund', 'Düsseldorf')

*   **`buildings`**
    *   `id` (UUID/INT, PK)
    *   `location_id` (UUID/INT, FK to `locations`)
    *   `name` (VARCHAR)

*   **`floors`**
    *   `id` (UUID/INT, PK)
    *   `building_id` (UUID/INT, FK to `buildings`)
    *   `name` (VARCHAR, e.g., 'Ground Floor', 'Etage 1')
    *   `layout_data` (JSONB or TEXT/VARCHAR for path/URL - stores coordinates, potentially layout image reference for frontend visualization)

*   **`space_types`** (Static data)
    *   `id` (INT, PK)
    *   `name` (VARCHAR, e.g., 'Desk', 'Project Room')

*   **`spaces`**
    *   `id` (UUID/INT, PK)
    *   `floor_id` (UUID/INT, FK to `floors`)
    *   `space_type_id` (INT, FK to `space_types`)
    *   `name` (VARCHAR, e.g., 'Desk A101', 'Raum 3.05')
    *   `capacity` (INT, NULLable - relevant for rooms)
    *   `is_bookable` (BOOLEAN, default TRUE)
    *   `coordinates` (JSONB, NULLable - relative position on floor layout)
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)

*   **`users`**
    *   `id` (UUID/INT, PK - internal backend ID)
    *   `employee_id` (VARCHAR, NULLable - BIG's internal employee identifier, potentially from integration)
    *   `email` (VARCHAR, UNIQUE, used for login/identification)
    *   `name` (VARCHAR)
    *   `location_id` (UUID/INT, FK to `locations`, NULLable - default location?)
    *   `is_admin` (BOOLEAN, default FALSE - for potential admin roles)
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)

*   **`bookings`**
    *   `id` (UUID/INT, PK)
    *   `user_id` (UUID/INT, FK to `users`)
    *   `space_id` (UUID/INT, FK to `spaces`)
    *   `start_time` (TIMESTAMP)
    *   `end_time` (TIMESTAMP)
    *   `status` (ENUM/VARCHAR, e.g., 'confirmed', 'cancelled')
    *   `created_at` (TIMESTAMP)
    *   `cancelled_at` (TIMESTAMP, NULLable)

**Database Indexing Strategy:**

Critical indexes for performance, especially on the `bookings` table:

*   `bookings`: Index on `(space_id, start_time, end_time)` for availability checks.
*   `bookings`: Index on `(user_id, created_at)` for fetching user bookings.
*   `spaces`: Index on `(floor_id, space_type_id)` for listing spaces on a floor.
*   `users`: Index on `email`.

---

## 4. Business Logic

The core business logic resides in the backend and orchestrates the booking process, availability checks, and rule enforcement.

*   **Availability Check:**
    *   When a user views a floor or attempts to book a space, the backend queries the `bookings` table.
    *   A space is available for a requested time slot (`requested_start`, `requested_end`) if there are *no* existing 'confirmed' bookings (`existing_start`, `existing_end`) for that `space_id` where the time ranges overlap.
    *   Overlap condition: `(existing_start < requested_end) AND (existing_end > requested_start)`.

*   **Booking Creation (`POST /api/bookings`):**
    1.  **Input Validation:** Validate `userId`, `spaceId`, `startTime`, `endTime` formats and ensure they are within reasonable bounds (e.g., future dates, valid space ID).
    2.  **Basic Availability Check:** Perform the query described above to see if the space is available for the requested time. Reject if not available.
    3.  **Rule Enforcement:** Apply rules from the Leistungsverzeichnis. Examples:
        *   Maximum booking duration (e.g., desk max 8 hours, room max 4 hours).
        *   Maximum number of active bookings per user.
        *   Minimum lead time for booking (e.g., must book at least 15 minutes in advance).
        *   Specific space restrictions (e.g., certain rooms require approval - *Note: Approval flow is not in the concise summary, may need future design*).
    4.  **Race Condition Handling:** Between the availability check (step 2) and the database insertion (step 5), another request might book the space. Implement this logic within a database transaction or use pessimistic/optimistic locking mechanisms. A robust approach is to perform the availability check *again* or as part of the INSERT statement (e.g., using conditional inserts or database constraints if possible).
    5.  **Database Write:** If all checks pass, insert a new record into the `bookings` table with `status = 'confirmed'`.
    6.  **Response:** Return the created booking details (HTTP 201) or an appropriate error response (HTTP 400 for invalid input, HTTP 409 for conflict/not available, HTTP 403 for rule violation).

*   **Booking Cancellation (`DELETE /api/bookings/:bookingId`):**
    1.  **Authentication/Authorization:** Verify the authenticated user is the owner of the booking.
    2.  **Retrieve Booking:** Fetch the booking details from the database.
    3.  **State Check:** Ensure the booking status is 'confirmed' and not already 'cancelled'.
    4.  **Rule Enforcement:** Apply cancellation rules (e.g., bookings cannot be cancelled less than 30 minutes before `start_time`).
    5.  **Database Update:** Update the `status` of the booking to 'cancelled' and set `cancelled_at`. Do *not* delete the record to maintain history.
    6.  **Response:** Return HTTP 204 on success or an error (HTTP 403 unauthorized, HTTP 404 not found, HTTP 400 rule violation).

*   **Listing Available Spaces (`GET /api/floors/:floorId/spaces` with date/time filters):**
    1.  Retrieve all bookable spaces for the given `floorId`.
    2.  For the specified `date`, `startTime`, and `endTime`, query the `bookings` table to find all 'confirmed' bookings that overlap with this time range for the spaces retrieved in step 1.
    3.  Join or map the results: For each space from step 1, determine `isAvailable` by checking if its ID exists in the list of booked spaces from step 2.
    4.  Return the list of spaces with their availability status. Optimized queries (using SQL joins and date range functions) are crucial here.

---

## 5. Security

Security must be integrated into the design from the ground up.

*   **Authentication:**
    *   Users must authenticate before accessing booking functionality.
    *   Assuming a modern web application, a token-based approach like JWT (JSON Web Tokens) is suitable.
    *   When a user logs in (details of login mechanism TBD, potentially integrating with BIG's identity provider), the backend issues a JWT.
    *   This token is sent with subsequent requests in the `Authorization: Bearer <token>` header.
    *   The backend verifies the token's signature and expiration on *each* protected endpoint.

*   **Authorization:**
    *   After authenticating the user (knowing their `userId`), verify if they are authorized to perform the requested action.
    *   **Booking Creation:** Any authenticated user can create a booking for *any* available space, subject to rules.
    *   **Booking Cancellation:** An authenticated user can *only* cancel bookings where their `userId` matches the `user_id` on the `bookings` record.
    *   **Viewing Bookings:** A user can *only* view bookings where their `userId` matches the `user_id` on the `bookings` record (`GET /api/users/:userId/bookings` should internally use the authenticated user's ID, not the one from the path, or enforce that path ID matches authenticated user ID unless they are an admin).
    *   **Space/Location Data:** Publicly accessible (`GET /api/locations`, `/api/floors/:floorId/spaces` *for viewing*). Booking actions require authentication.
    *   Implement authorization checks using middleware or decorators/interceptors depending on the chosen framework.

*   **Other Security Considerations:**
    *   **HTTPS:** All communication must use HTTPS/SSL/TLS to encrypt data in transit.
    *   **Input Validation:** Strictly validate all incoming data to prevent injection attacks (SQL injection, XSS if any user-provided data is reflected). Use parameterized queries for database interactions.
    *   **Rate Limiting:** Implement rate limiting on booking endpoints to prevent abuse.
    *   **Logging & Monitoring:** Log security-relevant events (failed logins, authorization failures, booking manipulations) and monitor for suspicious activity.
    *   **Secret Management:** Securely store API keys, database credentials, and JWT secrets (e.g., using environment variables or a secrets manager).
    *   **Dependency Management:** Regularly update libraries and frameworks to patch known vulnerabilities.

---

## 6. Performance

Given the user scale (~720) and booking frequency in an ABW environment, performance is critical, especially for availability checks and listing spaces on busy floors.

*   **Database Optimization:**
    *   **Indexing:** As detailed in Section 3, proper indexing is paramount.
    *   **Efficient Queries:** Write SQL queries that are optimized for the database engine. Avoid N+1 query problems (e.g., when listing spaces on a floor, fetch all bookings for those spaces in one query rather than one query per space).
    *   **Connection Pooling:** Use a database connection pool to manage database connections efficiently.
    *   **Read Replicas:** Consider using read replicas for the database if read traffic (availability checks, listing spaces) becomes significantly higher than write traffic (creating/cancelling bookings).

*   **Backend Application Optimization:**
    *   **Asynchronous Operations:** Use asynchronous I/O (non-blocking operations) for database calls and external API calls to maximize throughput.
    *   **Caching:**
        *   Cache static data that changes infrequently (Locations, Buildings, Floors, Spaces details).
        *   Consider caching availability data for upcoming popular dates/times, invalidating the cache when bookings are made or cancelled.
    *   **Scalability:** Design the application to be horizontally scalable. It should be stateless (session state stored externally, not in application memory) so multiple instances can run behind a load balancer.
    *   **Code Profiling:** Use profiling tools to identify performance bottlenecks in the backend code.

*   **API Design for Performance:**
    *   Return only necessary data in API responses.
    *   Implement pagination if listings become very large (e.g., admin views of all bookings).

*   **Monitoring:** Implement comprehensive monitoring (application metrics, database metrics, server resource usage) to identify performance issues proactively.

---

## 7. Code Examples

Illustrative examples using a simplified Node.js/Express structure with pseudocode for database interactions.

**Example 1: Checking Space Availability (Conceptual)**

```javascript
// Assume a database helper or ORM is available
// e.g., db.query(sql, params)

/**
 * Checks if a space is available during a specific time range.
 * @param {string} spaceId - The ID of the space.
 * @param {Date} startTime - The start time of the requested slot.
 * @param {Date} endTime - The end time of the requested slot.
 * @returns {Promise<boolean>} - Resolves to true if available, false otherwise.
 */
async function isSpaceAvailable(spaceId, startTime, endTime) {
    // SQL query to find any conflicting confirmed bookings for the space
    const sql = `
        SELECT COUNT(*)
        FROM bookings
        WHERE space_id = $1
        AND status = 'confirmed'
        AND end_time > $2 -- Existing booking ends AFTER requested start
        AND start_time < $3; -- Existing booking starts BEFORE requested end
    `; // This correctly checks for overlap: (A.start < B.end AND A.end > B.start)

    try {
        const result = await db.query(sql, [spaceId, startTime, endTime]);
        const conflictingBookingsCount = parseInt(result.rows[0].count, 10);

        return conflictingBookingsCount === 0; // Available if no conflicting bookings found

    } catch (error) {
        console.error("Error checking space availability:", error);
        // Depending on error handling strategy, might throw or return false/error indicator
        throw new Error("Failed to check space availability.");
    }
}
```

**Example 2: Creating a Booking Endpoint (`POST /api/bookings`)**

This example includes simplified rule checks and a basic transaction concept.

```javascript
const express = require('express');
const router = express.Router();
// Assume authMiddleware authenticates the user and attaches user object to req.user
// Assume db is your database client/pool
// Assume ruleEngine contains functions like checkBookingRules(bookingDetails)

router.post('/bookings', authMiddleware, async (req, res) => {
    const { spaceId, startTime, endTime } = req.body;
    const userId = req.user.id; // Get user ID from authenticated user

    // 1. Basic Input Validation
    if (!spaceId || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    // Convert time strings to Date objects
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Validate dates/times are valid and in the future (basic check)
    if (isNaN(startDateTime) || isNaN(endDateTime) || startDateTime >= endDateTime || startDateTime < new Date()) {
         return res.status(400).json({ message: "Invalid start or end time." });
    }

    // Construct potential booking object for rule checks
    const bookingDetails = { userId, spaceId, startTime: startDateTime, endTime: endDateTime };

    try {
        // 2. & 3. Rule Enforcement (example checks)
        // Check custom rules defined in Leistungsverzeichnis
        const rulesViolated = await ruleEngine.checkBookingRules(bookingDetails);
        if (rulesViolated.length > 0) {
             // Assuming ruleEngine returns an array of violated rule messages
             return res.status(403).json({ message: "Booking violates rules.", violations: rulesViolated });
        }

        // 4. & 5. Availability Check and Database Write (within a transaction)
        const client = await db.connect(); // Get a client from the pool

        try {
            await client.query('BEGIN'); // Start transaction

            // Re-check availability INSIDE the transaction to prevent race conditions
            const isAvailableNow = await isSpaceAvailableInTransaction(client, spaceId, startDateTime, endDateTime); // Use a transaction-aware version of isSpaceAvailable

            if (!isAvailableNow) {
                await client.query('ROLLBACK');
                return res.status(409).json({ message: "Space is no longer available for the requested time." });
            }

            // Insert the new booking
            const insertSql = `
                INSERT INTO bookings (user_id, space_id, start_time, end_time, status, created_at)
                VALUES ($1, $2, $3, $4, 'confirmed', NOW())
                RETURNING id, created_at, status; -- Return inserted fields
            `;
            const insertResult = await client.query(insertSql, [userId, spaceId, startDateTime, endDateTime]);
            const newBooking = insertResult.rows[0];

            await client.query('COMMIT'); // Commit the transaction

            // 6. Response
            // Fetch space details to include in response, or join in INSERT query if possible/desired
            // For simplicity, let's just return the booking details we have + fetched space info
            const spaceInfo = await getSpaceDetails(spaceId); // Assuming a helper function
            const fullBookingResponse = {
                 id: newBooking.id,
                 userId: userId,
                 spaceId: spaceId,
                 spaceName: spaceInfo.name, // Example of enriching response
                 spaceType: spaceInfo.type,
                 locationName: spaceInfo.locationName,
                 buildingName: spaceInfo.buildingName,
                 floorName: spaceInfo.floorName,
                 startTime: startDateTime.toISOString(),
                 endTime: endDateTime.toISOString(),
                 status: newBooking.status,
                 createdAt: newBooking.created_at.toISOString()
            };


            res.status(201).json(fullBookingResponse);

        } catch (transactionError) {
            await client.query('ROLLBACK'); // Rollback on error
            console.error("Transaction failed:", transactionError);
            res.status(500).json({ message: "Failed to create booking due to a transaction error." });
        } finally {
            client.release(); // Release the client back to the pool
        }

    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Failed to create booking." });
    }
});

// Helper function (conceptual)
async function isSpaceAvailableInTransaction(client, spaceId, startTime, endTime) {
     // Same logic as isSpaceAvailable, but uses the provided client instance
      const sql = `
        SELECT COUNT(*)
        FROM bookings
        WHERE space_id = $1
        AND status = 'confirmed'
        AND end_time > $2
        AND start_time < $3;
    `;
    const result = await client.query(sql, [spaceId, startTime, endTime]);
    return parseInt(result.rows[0].count, 10) === 0;
}

// Helper function (conceptual)
async function getSpaceDetails(spaceId) {
    // Query spaces, floors, buildings, locations table with joins
    const sql = `... JOIN queries ... WHERE s.id = $1`;
    const result = await db.query(sql, [spaceId]);
    // Return formatted space object
     if (result.rows.length === 0) throw new Error("Space not found");
     return result.rows[0]; // Simplified
}

// Example conceptual rule engine check
const ruleEngine = {
    async checkBookingRules(bookingDetails) {
        const violations = [];
        const { userId, spaceId, startTime, endTime } = bookingDetails;
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        // Rule: Max 8 hours for desks (example)
        const spaceInfo = await getSpaceDetails(spaceId); // Need space type
        if (spaceInfo.type === 'Desk' && durationHours > 8) {
            violations.push("Desk bookings cannot exceed 8 hours.");
        }

        // Rule: No booking less than 15 mins in advance (example)
        const now = new Date();
        const leadTimeMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
        if (leadTimeMinutes < 15) {
             violations.push("Bookings must be made at least 15 minutes in advance.");
        }

        // Rule: Max 5 active bookings per user (example)
        const activeBookingsSql = `
            SELECT COUNT(*) FROM bookings
            WHERE user_id = $1 AND status = 'confirmed' AND end_time > NOW();
        `;
        const activeCountResult = await db.query(activeBookingsSql, [userId]);
        if (parseInt(activeCountResult.rows[0].count, 10) >= 5) {
             violations.push("Maximum number of active bookings per user exceeded.");
        }


        // ... Add more rules based on Leistungsverzeichnis ...

        return violations;
    }
};

// module.exports = router; // Standard Express export
```

---

This guide provides a foundational structure for the backend implementation. Detailed specifications from the "Leistungsverzeichnis" regarding specific booking rules, user management (sync with BIG's system?), reporting needs, and potential integrations must be incorporated into the detailed design and development phases.
```
