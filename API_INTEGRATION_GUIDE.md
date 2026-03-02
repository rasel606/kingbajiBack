# Backend API Integration - Complete Documentation

## Overview
This document describes all the new API endpoints created for the frontend components, including Social Links Management, Affiliate Management, and Profile/Auth functionality.

---

## 1. SOCIAL LINKS API

### Base URL: `/api/social-links`

#### 1.1 Get All Social Links (Admin Only)
```
GET /api/social-links
Authentication: Required (Admin)
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "telegram": "https://t.me/username",
      "facebook": "https://facebook.com/username",
      "email": "contact@example.com",
      "whatsapp": "https://wa.me/1234567890",
      "twitter": "https://twitter.com/username",
      "instagram": "https://instagram.com/username",
      "linkedin": "https://linkedin.com/in/username",
      "youtube": "https://youtube.com/@username"
    }
  ],
  "count": 1
}
```

#### 1.2 Get Single Social Link Details (Admin Only)
```
GET /api/social-links/:id
Authentication: Required (Admin)
```

#### 1.3 Get Current User's Social Links
```
GET /api/social-links/my/links
Authentication: Required (User/Affiliate)
```

#### 1.4 Create Social Link
```
POST /api/social-links
Authentication: Required (User/Affiliate)
Content-Type: application/json
```

**Request Body:**
```json
{
  "platform": "facebook",
  "url": "https://facebook.com/username"
}
```

Or using individual fields:
```json
{
  "telegram": "https://t.me/username",
  "facebook": "https://facebook.com/username",
  "email": "contact@example.com",
  "whatsapp": "https://wa.me/1234567890",
  "twitter": "https://twitter.com/username",
  "instagram": "https://instagram.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "youtube": "https://youtube.com/@username"
}
```

#### 1.5 Update Social Link
```
PUT /api/social-links/:id
Authentication: Required (User/Affiliate)
Content-Type: application/json
```

**Request Body:**
```json
{
  "platform": "facebook",
  "url": "https://facebook.com/newusername"
}
```

#### 1.6 Update Platform Link
```
PUT /api/social-links/platform/update
Authentication: Required (User/Affiliate)
Content-Type: application/json
```

**Request Body:**
```json
{
  "platform": "telegram",
  "url": "https://t.me/newusername"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Telegram link updated successfully",
  "data": { ... }
}
```

#### 1.7 Delete Social Link
```
DELETE /api/social-links/:id
Authentication: Required (Admin)
```

---

## 2. AFFILIATE MANAGEMENT API

### Base URL: `/api/admin/affiliate/management`
**Authentication: Required (Admin Only)**

### 2.1 AFFILIATE USERS MANAGEMENT

#### 2.1.1 Get All Affiliate Users
```
GET /api/admin/affiliate/management/users?status=active&search=john&page=1&limit=10
```

**Query Parameters:**
- `status`: Filter by status (active, inactive, suspended, blocked)
- `search`: Search by username, email, or phone number
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "1234567890",
      "username": "johndoe",
      "status": "active",
      "totalEarnings": 5000,
      "totalCommission": 3000,
      "activeLinks": 5,
      "totalReferrals": 25,
      "approvedAt": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-03-01T08:45:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "pages": 5,
    "currentPage": 1,
    "limit": 10
  }
}
```

#### 2.1.2 Get Affiliate User Details
```
GET /api/admin/affiliate/management/users/:id
```

#### 2.1.3 Update Affiliate User Status
```
PUT /api/admin/affiliate/management/users/:id/status
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Valid Status Values:**
- `active`
- `inactive`
- `suspended`
- `blocked`

#### 2.1.4 Delete Affiliate User
```
DELETE /api/admin/affiliate/management/users/:id
```

---

### 2.2 AFFILIATE DEPOSITS MANAGEMENT

#### 2.2.1 Get All Affiliate Deposits
```
GET /api/admin/affiliate/management/deposits?status=pending&page=1&limit=10
```

**Query Parameters:**
- `status`: pending, approved, rejected
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "affiliateId": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "amount": 1000,
      "currency": "BDT",
      "status": "pending",
      "paymentMethod": "bkash",
      "transactionId": "TXN12345",
      "description": "Bonus deposit",
      "createdAt": "2024-03-01T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### 2.2.2 Get Deposit Details
```
GET /api/admin/affiliate/management/deposits/:id
```

#### 2.2.3 Approve Affiliate Deposit
```
PUT /api/admin/affiliate/management/deposits/:id/approve
Content-Type: application/json
```

**Request Body:**
```json
{
  "remarks": "Deposit verified and approved"
}
```

#### 2.2.4 Reject Affiliate Deposit
```
PUT /api/admin/affiliate/management/deposits/:id/reject
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Transaction not verified"
}
```

---

### 2.3 AFFILIATE WITHDRAWALS MANAGEMENT

#### 2.3.1 Get All Affiliate Withdrawals
```
GET /api/admin/affiliate/management/withdrawals?status=pending&page=1&limit=10
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "affiliateId": { ... },
      "amount": 500,
      "currency": "BDT",
      "status": "pending",
      "bankAccount": {
        "_id": "507f1f77bcf86cd799439020",
        "bankName": "Bank Name",
        "accountNumber": "1234567890",
        "name": "Account Holder Name"
      },
      "createdAt": "2024-03-01T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### 2.3.2 Get Withdrawal Details
```
GET /api/admin/affiliate/management/withdrawals/:id
```

#### 2.3.3 Approve Affiliate Withdrawal
```
PUT /api/admin/affiliate/management/withdrawals/:id/approve
Content-Type: application/json
```

**Request Body:**
```json
{
  "transactionId": "TXN987654321"
}
```

#### 2.3.4 Reject Affiliate Withdrawal
```
PUT /api/admin/affiliate/management/withdrawals/:id/reject
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Insufficient funds"
}
```

---

### 2.4 AFFILIATE USER WITHDRAWALS MANAGEMENT

#### 2.4.1 Get All Affiliate User Withdrawals
```
GET /api/admin/affiliate/management/user-withdrawals?status=pending&page=1&limit=10
```

#### 2.4.2 Get User Withdrawal Details
```
GET /api/admin/affiliate/management/user-withdrawals/:id
```

#### 2.4.3 Approve User Withdrawal
```
PUT /api/admin/affiliate/management/user-withdrawals/:id/approve
Content-Type: application/json
```

**Request Body:**
```json
{
  "transactionId": "TXN123456789"
}
```

#### 2.4.4 Reject User Withdrawal
```
PUT /api/admin/affiliate/management/user-withdrawals/:id/reject
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "KYC verification failed"
}
```

---

## 3. PROFILE & AUTH API

### Base URL: `/api/auth`
**Authentication: Required (User/Affiliate)**

### 3.1 GET ENDPOINTS

#### 3.1.1 Get User Profile
```
GET /api/auth/profile
Authentication: Required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "avatar": "https://example.com/avatar.jpg",
    "address": "123 Main Street",
    "city": "Dhaka",
    "country": "Bangladesh",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "username": "johndoe",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-03-01T08:45:00Z",
    "lastPasswordChange": "2024-02-15T10:30:00Z",
    "kycStatus": "verified",
    "emailVerified": true,
    "phoneVerified": true
  }
}
```

#### 3.1.2 Get Profile Statistics
```
GET /api/auth/stats
Authentication: Required
```

**Response (for Affiliate):**
```json
{
  "status": "success",
  "data": {
    "totalEarnings": 15000,
    "totalCommission": 10000,
    "activeLinks": 5,
    "totalReferrals": 50,
    "withdrawalBalance": 5000,
    "status": "active",
    "approvedDate": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-03-01T08:45:00Z"
  }
}
```

#### 3.1.3 Get Security Information
```
GET /api/auth/security
Authentication: Required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "phoneVerified": true,
    "emailVerified": true,
    "lastPasswordChange": "2024-02-15T10:30:00Z",
    "twoFactorEnabled": false
  }
}
```

---

### 3.2 UPDATE ENDPOINTS

#### 3.2.1 Update Profile Information
```
PUT /api/auth/profile/update
Authentication: Required
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "9876543210",
  "address": "456 Oak Avenue",
  "city": "Chittagong",
  "country": "Bangladesh",
  "avatar": "https://example.com/new-avatar.jpg",
  "dateOfBirth": "1990-01-15",
  "gender": "male"
}
```

#### 3.2.2 Update Profile Picture
```
PUT /api/auth/profile/picture
Authentication: Required
Content-Type: application/json
```

**Request Body:**
```json
{
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### 3.2.3 Change Password
```
PUT /api/auth/password/change
Authentication: Required
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

---

### 3.3 DELETE ENDPOINTS

#### 3.3.1 Delete Account
```
DELETE /api/auth/profile/delete
Authentication: Required
Content-Type: application/json
```

**Request Body:**
```json
{
  "password": "currentPassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Account deleted successfully"
}
```

---

### 3.4 LOGOUT

#### 3.4.1 Logout
```
POST /api/auth/logout
Authentication: Required
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "timestamp": "2024-03-01T10:30:00Z"
}
```

**Common HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Authentication

All protected endpoints require one of the following:

1. **User Authentication Header:**
   ```
   Authorization: Bearer <user_token>
   ```

2. **Admin Authentication Header:**
   ```
   Authorization: Bearer <admin_token>
   ```

3. **Affiliate Authentication Header:**
   ```
   Authorization: Bearer <affiliate_token>
   ```

---

## Integration with Frontend

### Example: Fetch Affiliate Users
```javascript
// GET all affiliate users
const response = await fetch('/api/admin/affiliate/management/users?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Example: Update User Status
```javascript
// UPDATE user status
const response = await fetch('/api/admin/affiliate/management/users/507f1f77bcf86cd799439011/status', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'suspended'
  })
});

const data = await response.json();
```

### Example: Get User Profile
```javascript
// GET user profile
const response = await fetch('/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

---

## Files Created

### Controllers
1. `src/controllers/SocialLinksController.js` - Social links management
2. `src/controllers/AffiliateManagementController.js` - Affiliate management
3. `src/controllers/ProfileAuthController.js` - Profile and auth management

### Routes
1. `src/router/socialLinksRoutes.js` - Social links routes
2. `src/router/affiliateManagementRoutes.js` - Affiliate management routes
3. `src/router/profileAuthRoutes.js` - Profile and auth routes

### Updated Files
1. `app.js` - Added new route imports and middleware

---

## Testing with cURL

### Get All Affiliate Users
```bash
curl -X GET 'http://localhost:5000/api/admin/affiliate/management/users?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json'
```

### Create Social Link
```bash
curl -X POST 'http://localhost:5000/api/social-links' \
  -H 'Authorization: Bearer YOUR_USER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "platform": "facebook",
    "url": "https://facebook.com/username"
  }'
```

### Get User Profile
```bash
curl -X GET 'http://localhost:5000/api/auth/profile' \
  -H 'Authorization: Bearer YOUR_USER_TOKEN' \
  -H 'Content-Type: application/json'
```

### Update Profile
```bash
curl -X PUT 'http://localhost:5000/api/auth/profile/update' \
  -H 'Authorization: Bearer YOUR_USER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Smith"
  }'
```

---

## Next Steps

1. Test all endpoints with Postman or similar tool
2. Integrate API calls in frontend components
3. Add error handling and loading states
4. Implement pagination in frontend
5. Add real-time notifications for approvals/rejections
6. Set up audit logging for sensitive operations

