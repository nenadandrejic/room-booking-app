```markdown
# Room and Desk Booking App - Frontend Implementation Guide

**Project:** Room and Desk Booking App for BIG direkt gesund
**Version:** 1.0
**Date:** June 9, 2025

---

This document provides a practical guide for the frontend implementation of the BIG direkt gesund Room and Desk Booking Application. It outlines the core architecture, state management strategy, UI considerations, API integration approach, testing methodology, and includes practical code examples.

---

## 1. Component Architecture

The application will follow a component-based architecture, likely utilizing a modern JavaScript framework like React, Vue.js, or Angular. Given the interactive map and data-driven nature, a component-centric approach is ideal for managing complexity and reusability.

A high-level breakdown of core components could look like this:

*   **`App`**: The root component, handles global setup (routing, context providers).
*   **`Layout`**: Provides the overall page structure (header, navigation, main content area).
*   **`MapView`**: The central component responsible for rendering the floor plan.
    *   **`FloorSelector`**: Component to switch between locations and floors.
    *   **`MapRenderer`**: Handles rendering the SVG or canvas map based on floor data. Manages pan/zoom interactions.
    *   **`BookableItem`**: Abstract component representing a clickable desk or room on the map.
        *   **`Desk`**: Renders a single desk, displaying its state (available, booked, etc.).
        *   **`Room`**: Renders a single room, displaying its state (availability, capacity).
*   **`BookingPanel`**: A sidebar or modal that appears when a `BookableItem` is selected.
    *   **`ItemDetails`**: Displays details of the selected desk/room (name, capacity, features).
    *   **`AvailabilityCalendar`**: Component to select a date and view availability slots.
    *   **`TimeSlotSelector`**: Component to select specific booking times/durations.
    *   **`BookingConfirmation`**: Displays booking summary before confirmation.
    *   **`BookingButton`**: Triggers the booking API call.
*   **`MyBookingsView`**: Component to display a list/calendar of the user's current and past bookings.
    *   **`BookingListItem`**: Renders details of a single booking with options like cancellation.
*   **`FilterPanel`**: (Optional) Component for filtering bookable items (e.g., room type, capacity, features).

**Relationships:**

*   `App` contains `Layout`.
*   `Layout` contains `MapView` and potentially `MyBookingsView`.
*   `MapView` orchestrates `FloorSelector` and `MapRenderer`.
*   `MapRenderer` receives data and renders multiple `Desk` and `Room` (via `BookableItem`) components.
*   Clicking a `Desk` or `Room` triggers the display of the `BookingPanel`, passing the selected item's data.
*   `BookingPanel` interacts with state management to get selected item details and availability, and triggers API calls for booking.
*   `MyBookingsView` fetches user bookings via API and renders `BookingListItem` components.

## 2. State Management

Effective state management is crucial for handling shared data like the current location/floor, selected bookable item, booking dates/times, and the overall map data.

**Recommended Approach:**

Given the complexity involving spatial data, user interactions, and booking flows, a robust state management solution is recommended.

1.  **Core Application State:** Manage application-wide state such as:
    *   `currentUser`: User authentication and profile data.
    *   `currentLocation/currentFloor`: The location and floor currently displayed on the map.
    *   `isLoading`: Global loading indicator state for API calls.
    *   `error`: Global error state for API failures.

2.  **Map & Booking State:** Manage state specific to the map view and booking process:
    *   `mapData`: The layout and details of desks/rooms for the current floor.
    *   `selectedBookableItem`: The desk or room currently selected on the map.
    *   `availabilityData`: Availability information for the `selectedBookableItem` for a given date range.
    *   `bookingDetails`: Date, time, duration selected by the user in the `BookingPanel`.
    *   `userBookings`: List of bookings for the current user.

**Options for State Management Library:**

*   **Context API + `useReducer` (React):** Suitable for managing moderately complex state within specific domains (e.g., `MapContext`, `BookingContext`). Can become verbose for deeply nested state updates.
*   **Zustand / Jotai (React):** Lightweight, hook-based libraries offering a simpler mental model than Redux, good for managing global or complex state without boilerplate.
*   **Redux / Vuex / NgRx (Framework Specific):** More opinionated and powerful libraries for large-scale applications with complex state interactions and middlewares (e.g., handling side effects like API calls). Potentially overkill for the initial phase but provides scalability.

**Recommendation:** Start with Context API + `useReducer` or Zustand/Jotai for key areas (Map/Booking). This provides structure without excessive boilerplate and allows for easier scaling if needed.

## 3. UI Design

The UI should be intuitive, visually clear, and efficient for booking.

**Key Layout & Elements:**

*   **Main Map Area:** Dominant part of the screen. Should be interactive (pan, zoom).
*   **Floor/Location Selector:** Prominently placed, easy to access dropdown or list.
*   **Booking Panel:** A secondary area (sidebar, modal, or expandable panel) that appears contextually. Should contain all necessary booking information and controls without obscuring the map entirely.
*   **Visual Cues:**
    *   Clearly differentiate between available, booked by user, booked by others, and unavailable items on the map using distinct colors, icons, or borders.
    *   Hover states to highlight items.
    *   Loading spinners for API calls.
    *   Success/error messages for booking actions.
*   **Date/Time Selection:** Use standard calendar and time picker components. Ensure clarity on available slots based on real-time data and booking rules.
*   **Information Display:** When an item is selected, clearly show its properties (type, capacity, equipment for rooms) and availability.
*   **Responsive Design:** The application must be usable on different screen sizes (desktop is likely primary, but tablet/mobile might be used for quick checks). Map rendering and panel layout need careful consideration for smaller screens.
*   **Accessibility (A11y):** Implement standard ARIA attributes, ensure keyboard navigation is possible, provide sufficient color contrast. This is crucial for usability.
*   **Branding:** Incorporate BIG direkt gesund's corporate design elements (colors, fonts) as specified.

**User Interactions:**

*   Clicking on a desk or room on the map opens the `BookingPanel`.
*   Clicking outside the `BookingPanel` (or a close button) hides it.
*   Selecting a date/time updates availability display.
*   Clicking a "Book" button initiates the booking process with confirmation.
*   "My Bookings" view allows viewing details and cancelling existing bookings.

## 4. API Integration

The frontend will communicate with the SaaS backend via APIs.

**API Endpoints (Expected):**

Based on the requirements, anticipate endpoints for:

*   `/api/locations`: Get list of available locations (Dortmund, Düsseldorf).
*   `/api/locations/{locationId}/floors`: Get list of floors for a location.
*   `/api/floors/{floorId}/mapdata`: Get layout and list of bookable items (desks, rooms) for a floor. Includes basic properties.
*   `/api/bookable-items/{itemId}/details`: Get detailed information about a specific desk or room.
*   `/api/bookable-items/{itemId}/availability?date={date}&duration={duration}`: Get availability slots for an item on a specific date/duration.
*   `/api/bookings`:
    *   `GET /api/bookings?userId={userId}`: Get a user's bookings.
    *   `POST /api/bookings`: Create a new booking (payload includes itemId, date, time, duration, userId).
*   `/api/bookings/{bookingId}`:
    *   `DELETE /api/bookings/{bookingId}`: Cancel a booking.

**Implementation Details:**

*   Use the browser's native `fetch` API or a library like `axios` for making HTTP requests.
*   Abstract API calls into service functions (e.g., `apiService.js`) to keep components clean and make testing easier.
*   Handle request lifecycle:
    *   **Loading State:** Show loading indicators while waiting for responses.
    *   **Success State:** Process data and update state.
    *   **Error State:** Catch errors (network issues, API errors), log them, and display user-friendly error messages (e.g., "Failed to book, please try again.").
*   **Authentication:** Understand how the SaaS API handles authentication (e.g., JWT in headers, API keys). Implement logic to include necessary credentials in requests.
*   **Data Transformation:** The raw data from the API might need to be transformed or normalized before being used in components or state management.

## 5. Testing Approach

A comprehensive testing strategy is essential to ensure the application's quality and reliability.

**Types of Tests:**

1.  **Unit Tests:**
    *   Focus: Individual components, functions, and small logic units in isolation.
    *   What to test: Component rendering with different props/state, pure functions, state updates within reducers.
    *   Tools: Jest, React Testing Library, Vue Test Utils, Karma/Jasmine (Angular).
    *   Goal: Verify that each unit works correctly.

2.  **Integration Tests:**
    *   Focus: How different components or modules interact. How components interact with the state management layer or mocked API calls.
    *   What to test: A component triggering a state change that affects another component, data fetching flow using mocked API, component composition.
    *   Tools: React Testing Library (provides utilities to query and interact with component trees like a user), Cypress Component Testing.
    *   Goal: Verify that units work together correctly.

3.  **End-to-End (E2E) Tests:**
    *   Focus: Simulating a full user journey through the application in a real browser environment.
    *   What to test: Logging in (if applicable), navigating to a floor map, selecting and booking an item, viewing/cancelling a booking.
    *   Tools: Cypress, Playwright, Selenium.
    *   Goal: Verify that critical user flows work from start to finish.

4.  **Manual Testing:**
    *   Essential for verifying UI/UX, responsiveness, accessibility, and cross-browser compatibility.
    *   Involve actual users or Q&A team for testing core flows and edge cases.

**Strategy:**

*   Implement unit tests for critical components (e.g., `BookableItem`, state reducers) and core logic.
*   Write integration tests for key user interactions (e.g., clicking item opens panel, selecting date updates availability). Mock API responses for these tests.
*   Develop E2E tests for the most critical user flows (e.g., successful desk booking, successful room booking, cancelling a booking).
*   Integrate tests into the CI/CD pipeline to run automatically on code changes.

## 6. Code Examples

Here are simplified examples illustrating key concepts using React and functional components.

**Example 1: `BookableItem` Component (Desk or Room)**

```jsx
// src/components/BookableItem.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './BookableItem.css'; // Basic CSS for positioning/styling

const BookableItem = ({ item, onSelect, isSelected }) => {
  // Determine state based on item data (assuming properties like 'status', 'bookedBy')
  const getItemStatusClass = (status, bookedBy) => {
    if (status === 'available') return 'item-available';
    if (status === 'booked' && bookedBy === 'me') return 'item-booked-me';
    if (status === 'booked') return 'item-booked-other';
    return 'item-unavailable'; // e.g., out of service
  };

  const statusClass = getItemStatusClass(item.status, item.bookedBy);
  const selectedClass = isSelected ? 'item-selected' : '';

  const handleClick = () => {
    onSelect(item.id); // Notify parent component with item ID
  };

  // Position the item absolutely on the map (requires map data to include coordinates)
  const style = {
    left: `${item.x_coord}px`, // Assuming x_coord, y_coord from API
    top: `${item.y_coord}px`,
    // Add dimensions based on item type (desk/room)
    width: item.type === 'desk' ? '20px' : '40px',
    height: item.type === 'desk' ? '20px' : '40px',
    // Add zIndex to ensure clickable area is above map image
    zIndex: 10,
  };

  return (
    <div
      className={`bookable-item ${item.type} ${statusClass} ${selectedClass}`}
      style={style}
      onClick={handleClick}
      title={`${item.name} (${item.status === 'available' ? 'Available' : 'Booked'})`}
      role="button" // Indicate it's interactive
      aria-label={`Book ${item.name}`} // Accessibility label
    >
      {/* Optional: Display a small icon or text */ }
      { item.type === 'room' && <span>{item.capacity}</span> }
      {/* Visual representation handled by CSS classes */}
    </div>
  );
};

BookableItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['desk', 'room']).isRequired,
    status: PropTypes.oneOf(['available', 'booked', 'unavailable']).isRequired,
    bookedBy: PropTypes.string, // e.g., 'me' or null
    x_coord: PropTypes.number.isRequired, // Coordinates on the map image/SVG
    y_coord: PropTypes.number.isRequired,
    capacity: PropTypes.number, // For rooms
    // Add other relevant properties
  }).isRequired,
  onSelect: PropTypes.func.isRequired, // Callback when clicked
  isSelected: PropTypes.bool.isRequired, // To indicate if this item is currently selected
};

export default BookableItem;
```

**Example 2: Fetching Map Data using a Service Function**

```javascript
// src/services/mapService.js
import api from './api'; // Assume a basic API helper

const mapService = {
  // Function to fetch map data for a specific floor
  getFloorMapData: async (floorId) => {
    try {
      // Use the api helper which might handle base URL, headers (like auth)
      const response = await api.get(`/floors/${floorId}/mapdata`);

      if (!response.ok) {
        // Handle non-2xx responses
        const errorData = await response.json();
        throw new Error(errorData.message || `API error fetching map data for floor ${floorId}`);
      }

      const data = await response.json();
      return data; // Expected format: { floorDetails: {...}, bookableItems: [...] }

    } catch (error) {
      console.error(`Error in getFloorMapData for floor ${floorId}:`, error);
      // Rethrow or return a specific error object for the calling component/state manager to handle
      throw error;
    }
  },

  // Potentially other map-related functions
  // e.g., getLocations, getFloorsForLocation, etc.
};

export default mapService;

// src/services/api.js (Simple helper example using fetch)
// In a real app, use axios or a more robust wrapper
const API_BASE_URL = 'YOUR_SAAS_API_BASE_URL'; // Replace with actual API base URL

const api = {
  async get(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here if required by SaaS API
        // 'Authorization': `Bearer ${getToken()}`
      },
      ...options, // Allow overriding options
    });
    return response; // Return response to check .ok status in service functions
  },

  async post(endpoint, data, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here
      },
      body: JSON.stringify(data),
      ...options,
    });
     return response;
  },

  // Add put, delete methods as needed
};

export default api;
```

**Example 3: Component Fetching Data and Handling Loading/Error**

```jsx
// src/views/MapView.jsx
import React, { useEffect, useState } from 'react';
import mapService from '../services/mapService';
import BookableItem from '../components/BookableItem';
import LoadingSpinner from '../components/LoadingSpinner'; // Assume a spinner component
import ErrorMessage from '../components/ErrorMessage'; // Assume an error message component
import FloorSelector from '../components/FloorSelector'; // Assume a selector component
import BookingPanel from '../components/BookingPanel'; // Assume the booking panel component

// Assume state management provides currentFloorId and a way to update selectedItemId
// Example using React Context API (simplified)
// import { useMapContext } from '../context/MapContext';

const MapView = () => {
  // In a real app, get these from state management context/hooks
  // const { currentFloorId, setSelectedItemId, selectedItemId } = useMapContext();
  const [currentFloorId, setCurrentFloorId] = useState('floor-1'); // Example default
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMapData = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors
      setMapData(null); // Clear previous data
      try {
        const data = await mapService.getFloorMapData(currentFloorId);
        setMapData(data);
      } catch (err) {
        setError('Could not load map data. Please try again.'); // User-friendly message
        console.error(err); // Log technical error
      } finally {
        setIsLoading(false);
      }
    };

    if (currentFloorId) {
      loadMapData();
    }

  }, [currentFloorId]); // Re-run effect when currentFloorId changes

  const handleBookableItemSelected = (itemId) => {
    setSelectedItemId(itemId);
    // Logic here to potentially fetch item details or availability if needed immediately
    // Or, the BookingPanel component fetches details based on selectedItemId
  };

  const handleCloseBookingPanel = () => {
      setSelectedItemId(null); // Deselect the item
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading floor map..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!mapData) {
      // Handle case where data loaded but was empty or unexpected
      return <ErrorMessage message="No map data available for this floor." />;
  }

  // Assume mapData.floorDetails contains image URL or SVG data
  // Assume mapData.bookableItems is an array of desk/room objects

  return (
    <div className="map-view-container">
        <FloorSelector
            currentFloorId={currentFloorId}
            onFloorChange={setCurrentFloorId}
            // Pass available locations/floors fetched elsewhere or hardcoded initially
            locations={[{id: 'loc-do', name: 'Dortmund'}, {id: 'loc-dus', name: 'Düsseldorf'}]}
            floors={[{id: 'floor-1', name: 'Floor 1', locationId: 'loc-do'}, /*...*/]}
        />

        {/* Map rendering area - position bookable items absolutely within this */}
        <div className="map-renderer-area" style={{ position: 'relative' /* needed for absolute children */}}>
            {/* Background map image or SVG will go here */}
            {/* <img src={mapData.floorDetails.imageUrl} alt={`Floor ${currentFloorId} Map`} style={{ width: '100%', height: 'auto' }} /> */}
            {/* Or render SVG data */}

            {mapData.bookableItems.map(item => (
                <BookableItem
                    key={item.id}
                    item={item}
                    onSelect={handleBookableItemSelected}
                    isSelected={selectedItemId === item.id}
                />
            ))}
        </div>

        {/* Render BookingPanel if an item is selected */}
        {selectedItemId && (
            <BookingPanel
                itemId={selectedItemId}
                onBookingSuccess={handleCloseBookingPanel} // Close panel on success
                onClose={handleCloseBookingPanel} // Allow closing panel
            />
        )}

    </div>
  );
};

export default MapView;
```

---

This guide provides a foundation for the frontend implementation. Further detailed specifications regarding specific booking rules, UI/UX flows, and the exact API contract will be essential as development progresses. Remember to prioritize scalability, performance (especially for map rendering with many items), and user experience for the ~720 employees.
```
