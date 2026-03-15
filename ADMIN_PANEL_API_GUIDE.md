# 🎯 Admin Panel - Backend API & Connection Guide

## Backend Configuration Status: ✅ RESTRUCTURED & READY

The backend has been analyzed and restructured to provide a clearer, more organized set of API endpoints for the Admin Panel. This guide outlines the new structure and how to connect to it.

---

## 🚀 Key Improvements

1.  **Centralized Admin Router**: A new main router `src/router/mainAdminRoutes.js` has been created. All admin-related API traffic should be directed to `/api/main-admin`.
2.  **Clear Authentication Flow**: Authentication routes (`/login`, `/register`) are now cleanly separated under `/api/main-admin/auth`.
3.  **Protected Routes**: All data and management endpoints are protected and require a Bearer token.
4.  **Modular Structure**: The new structure is designed to be modular, making it easier to find and manage endpoints.

---

## 🔌 Connecting the Frontend

Your frontend Admin Panel should configure its API service to use the following base URL:

```
API_BASE_URL=http://localhost:5000/api/main-admin
```

### How to Mount the New Router

In your main `app.js` or server entry file, mount the new main admin router:

```javascript
// app.js
const mainAdminRoutes = require('./src/router/mainAdminRoutes');

// ... other app setup

app.use('/api/main-admin', mainAdminRoutes);

// ... other routes
```

---

## 🔒 Authentication

### 1. Login

**Endpoint**: `POST /api/main-admin/auth/login_admin`

**Body**:
```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

**Response**:
A successful login will return a `token`. This token must be stored and sent with all subsequent requests in the `Authorization` header.

```
Authorization: Bearer <your_jwt_token>
```

### 2. Get Admin Profile

**Endpoint**: `GET /api/main-admin/profile`

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Response**:
Returns the profile information for the currently logged-in admin.

---

## 🗂️ Main API Endpoints

All the following endpoints are prefixed with `/api/main-admin` and require authentication.

### Dashboard
*   **`GET /dashboard/summary`**: Get a full overview for the dashboard.
*   **`GET /dashboard/metrics`**: Get various dashboard metrics.
*   **`GET /dashboard/revenue-breakdown`**: Revenue breakdown by source.
*   ... and more inside `advancedDashboardRoutes.js`.

### User & Role Management
*   **`GET /management/get_sub_adminList`**: Get a list of all Sub-Admins.
*   **`GET /management/get_admin_AgentList`**: Get a list of all Agents.
*   **`GET /management/get_users_by_Id/:userId`**: Get details for a specific user.
*   **`PUT /management/get_users_by_Id_update/:userId`**: Update a user's profile.
*   ... and many more inside `adminRoutes.js` under the `/management` path.

### Affiliate Management
*   **`GET /affiliates/users`**: Get all affiliate users.
*   **`PUT /affiliates/users/:id/status`**: Update an affiliate's status.
*   **`GET /affiliates/deposits`**: Get all affiliate deposits.
*   ... and more inside `affiliateManagementRoutes.js`.

### Content Management
*   **`GET /banners`**: Get all banners.
*   **`POST /banners`**: Create a new banner.
*   **`GET /advertisements/ads`**: Get all advertisements.
*   **`POST /advertisements/ads`**: Create a new advertisement.

---

## 🔬 Code Structure Overview

The new structure is organized as follows:

```
src/
└── router/
    ├── mainAdminRoutes.js      # ✅ NEW: Main entry point for admin API
    ├── adminAuth.js            # MODIFIED: Handles admin login/registration
    ├── adminRoutes.js          # MODIFIED: Contains various management endpoints
    ├── advancedDashboardRoutes.js
    ├── affiliateManagementRoutes.js
    ├── adminBannerRoutes.js
    └── adminAdRoutes.js
```

## ⚠️ Recommendations for Further Improvement

*   **Refactor `adminRoutes.js`**: The file `src/router/adminRoutes.js` is still very large and contains routes for many different features. It is strongly recommended to break it down further into smaller, feature-specific route files (e.g., `adminUserManagementRoutes.js`, `adminTransactionRoutes.js`, `adminGameManagementRoutes.js`).
*   **Refactor `AdminController.js`**: This controller is a "god object" and handles too many responsibilities. Business logic should be moved into service layers to make the controller thinner and easier to maintain.
*   **Standardize Routes**: Routes should follow a more RESTful convention (e.g., `GET /users`, `GET /users/:id`, `PUT /users/:id`) for better clarity. The current naming (`get_users_by_Id_update`) is not standard.
*   **Consolidate Auth**: The `adminAuth.js` file still contains registration endpoints for other roles. These should be moved to a more general `authRoutes.js` or into their respective modules.

---

This restructured backend provides a solid and scalable foundation for the Admin Panel frontend.