# VIP Level Configuration API Documentation

## Overview
This documentation covers the newly created admin endpoints for managing VIP level configurations in the KingBaji backend system.

## Endpoints

### 1. Initialize/Create All VIP Levels
**Endpoint:** `POST /api/admin/vip-levels/initialize`

**Authentication:** Required (Admin token)

**Description:** Creates or updates the VIP configuration for all levels (Bronze, Silver, Gold, Diamond, Elite).

**Request Body:**
```json
{
  "forceUpdate": false,  // Optional: Set to true to override existing config
  "bronze": {
    "monthlyTurnoverRequirement": 0,
    "vpConversionRate": 5000,
    "loyaltyBonus": 0.01
  },
  "silver": {
    "monthlyTurnoverRequirement": 50000,
    "vpConversionRate": 1250,
    "loyaltyBonus": 0.02
  },
  "gold": {
    "monthlyTurnoverRequirement": 100000,
    "vpConversionRate": 1000,
    "loyaltyBonus": 0.03
  },
  "diamond": {
    "monthlyTurnoverRequirement": 500000,
    "vpConversionRate": 500,
    "loyaltyBonus": 0.05
  },
  "elite": {
    "monthlyTurnoverRequirement": 1000000,
    "vpConversionRate": 400,
    "loyaltyBonus": 0.07
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "VIP levels initialized successfully",
  "data": {
    "_id": "...",
    "levels": {
      "bronze": { ... },
      "silver": { ... },
      "gold": { ... },
      "diamond": { ... },
      "elite": { ... }
    },
    "updatedAt": "2024-02-04T00:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "VIP configuration already exists. Use forceUpdate=true to override."
}
```

---

### 2. Get Current VIP Configuration
**Endpoint:** `GET /api/admin/vip-levels/config`

**Authentication:** Required (Admin token)

**Description:** Retrieves the current VIP level configuration.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "levels": {
      "bronze": {
        "monthlyTurnoverRequirement": 0,
        "vpConversionRate": 5000,
        "loyaltyBonus": 0.01
      },
      "silver": {
        "monthlyTurnoverRequirement": 50000,
        "vpConversionRate": 1250,
        "loyaltyBonus": 0.02
      },
      // ... other levels
    },
    "updatedAt": "2024-02-04T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "VIP configuration not found. Please initialize VIP levels first."
}
```

---

### 3. Update Specific VIP Level
**Endpoint:** `PUT /api/admin/vip-levels/:level`

**Authentication:** Required (Admin token)

**Description:** Updates configuration for a specific VIP level.

**URL Parameters:**
- `level`: One of `bronze`, `silver`, `gold`, `diamond`, or `elite` (case-insensitive)

**Request Body:**
```json
{
  "monthlyTurnoverRequirement": 150000,  // Optional
  "vpConversionRate": 900,               // Optional
  "loyaltyBonus": 0.035                  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "VIP level gold updated successfully",
  "data": {
    "_id": "...",
    "levels": {
      // ... all levels including the updated one
    },
    "updatedAt": "2024-02-04T00:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid level. Must be one of: bronze, silver, gold, diamond, elite"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "VIP configuration not found. Please initialize VIP levels first."
}
```

---

## VIP Level Details

### Bronze Level (Default)
- **Monthly Turnover Requirement:** 0
- **VP Conversion Rate:** 5000 (5000 VP = 1 unit)
- **Loyalty Bonus:** 1%

### Silver Level
- **Monthly Turnover Requirement:** 50,000
- **VP Conversion Rate:** 1250 (1250 VP = 1 unit)
- **Loyalty Bonus:** 2%

### Gold Level
- **Monthly Turnover Requirement:** 100,000
- **VP Conversion Rate:** 1000 (1000 VP = 1 unit)
- **Loyalty Bonus:** 3%

### Diamond Level
- **Monthly Turnover Requirement:** 500,000
- **VP Conversion Rate:** 500 (500 VP = 1 unit)
- **Loyalty Bonus:** 5%

### Elite Level (Highest)
- **Monthly Turnover Requirement:** 1,000,000
- **VP Conversion Rate:** 400 (400 VP = 1 unit)
- **Loyalty Bonus:** 7%

---

## Usage Examples

### Example 1: Initialize VIP Levels with Defaults
```bash
curl -X POST https://api.example.com/api/admin/vip-levels/initialize \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Example 2: Initialize with Custom Values
```bash
curl -X POST https://api.example.com/api/admin/vip-levels/initialize \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gold": {
      "monthlyTurnoverRequirement": 120000,
      "vpConversionRate": 950,
      "loyaltyBonus": 0.035
    }
  }'
```

### Example 3: Get Current Configuration
```bash
curl -X GET https://api.example.com/api/admin/vip-levels/config \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Example 4: Update Elite Level
```bash
curl -X PUT https://api.example.com/api/admin/vip-levels/elite \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyTurnoverRequirement": 1200000,
    "vpConversionRate": 350
  }'
```

---

## Notes

1. **Authentication**: All endpoints require admin authentication via the `auth` middleware.
2. **Validation**: All endpoints use the `validate` middleware for request validation.
3. **Error Handling**: All endpoints use `catchAsync` wrapper for consistent error handling.
4. **Logging**: All operations are logged using the application's logger utility.
5. **Default Values**: When initializing, any omitted level configuration will use default values.
6. **Force Update**: Use `forceUpdate: true` in the initialize endpoint to override existing configuration.

---

## Security Considerations

⚠️ **Important Security Notes:**

1. **Rate Limiting**: These endpoints currently do not have rate limiting. Consider implementing rate limiting for production use to prevent abuse.
2. **CSRF Protection**: The application currently lacks CSRF protection. This is a pre-existing issue that should be addressed application-wide.
3. **Input Validation**: Ensure all numeric values are positive and within reasonable ranges.
4. **Admin Access Only**: These endpoints should only be accessible to super admins or authorized personnel.

---

## Integration with Existing System

These endpoints integrate with:
- **VIPConfig Model** (`src/models/VIPConfig.js`): Stores level configurations
- **UserVip Model** (`src/models/UserVip.js`): Uses VIP_CONFIG for user level calculations
- **Admin Authentication** (`src/MiddleWare/AdminAuth.js`): Protects routes
- **Logger Utility** (`src/utils/logger.js`): Logs all operations

---

## Future Enhancements

Potential improvements for future versions:
1. Add rate limiting middleware
2. Implement CSRF protection
3. Add input validation middleware with specific rules
4. Create audit log for configuration changes
5. Add bulk update endpoint
6. Implement configuration versioning
7. Add rollback functionality
