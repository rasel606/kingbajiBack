# API Endpoint Testing Guide

## Fixed Issues
- ✅ Fixed mainAdminRoutes method naming (GetSubAdminList, GetSubAdminUserList, GetSubAdminPendingDepositList, GetSubAdminWithdrawalList)
- ✅ Added backward compatibility aliases in AdminController
- ✅ Re-enabled mainAdminRoutes in app.js
- ✅ Fixed syntax error in require statement

## Endpoints Now Available
All endpoints are routed through `/api/admin` prefix:

### Sub-Admin Management
- `GET /api/admin/get_sub_adminList` - Get all sub-admins
- `GET /api/admin/get_sub_admin_user_list` - Get users under sub-admins
- `GET /api/admin/get_sub_admin_pending_deposit_user_list` - Get pending deposits
- `GET /api/admin/get_sub_admin_withdraw_deposit_user_list` - Get pending withdrawals ⭐ **(Fixed endpoint)**

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Query Parameters
- `page` (default: 1) - Page number for pagination
- `limit` (default: 10/20) - Items per page
- `subAdminId` (optional) - Filter by specific sub-admin

## Example Request
```bash
curl -X GET "http://localhost:5000/api/admin/get_sub_admin_withdraw_deposit_user_list?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Expected Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```
