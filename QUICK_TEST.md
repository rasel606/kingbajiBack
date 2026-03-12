# 🧪 Quick Test Guide - Admin Endpoints

## Tests Status
All 4 main admin endpoints are now configured and ready to test.

## Endpoints Summary
```
✅ GET /api/admin/get_sub_adminList
✅ GET /api/admin/get_sub_admin_user_list?page=1&limit=10
✅ GET /api/admin/get_sub_admin_pending_deposit_user_list?page=1&limit=10
✅ GET /api/admin/get_sub_admin_withdraw_deposit_user_list?page=1&limit=10
```

## Start Backend
```bash
cd backend
npm start
```

## Valid Token (from console logs)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haW5hZG1pbkBnbWFpbC5jb20iLCJkZXZpY2VJZCI6ImE1ZDlmNTM3ZWUwMWIwMTZjM2ZhY2VjMmZkYjExOGZhIiwiaWF0IjoxNzcyNTQ1OTMwLCJleHAiOjE3NzI2MzIzMzB9.yeuk60lp_AXfBMyTMzyDF9cWazaVK99RbgEF-IFQLnY
```

## Test Each Endpoint
```bash
# Test 1: Get Sub-Admins
curl -X GET "http://localhost:5000/api/admin/get_sub_adminList" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haW5hZG1pbkBnbWFpbC5jb20iLCJkZXZpY2VJZCI6ImE1ZDlmNTM3ZWUwMWIwMTZjM2ZhY2VjMmZkYjExOGZhIiwiaWF0IjoxNzcyNTQ1OTMwLCJleHAiOjE3NzI2MzIzMzB9.yeuk60lp_AXfBMyTMzyDF9cWazaVK99RbgEF-IFQLnY"

# Test 2: Get Sub-Admin Users  
curl -X GET "http://localhost:5000/api/admin/get_sub_admin_user_list?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haW5hZG1pbkBnbWFpbC5jb20iLCJkZXZpY2VJZCI6ImE1ZDlmNTM3ZWUwMWIwMTZjM2ZhY2VjMmZkYjExOGZhIiwiaWF0IjoxNzcyNTQ1OTMwLCJleHAiOjE3NzI2MzIzMzB9.yeuk60lp_AXfBMyTMzyDF9cWazaVK99RbgEF-IFQLnY"

# Test 3: Get Pending Deposits
curl -X GET "http://localhost:5000/api/admin/get_sub_admin_pending_deposit_user_list?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haW5hZG1pbkBnbWFpbC5jb20iLCJkZXZpY2VJZCI6ImE1ZDlmNTM3ZWUwMWIwMTZjM2ZhY2VjMmZkYjExOGZhIiwiaWF0IjoxNzcyNTQ1OTMwLCJleHAiOjE3NzI2MzIzMzB9.yeuk60lp_AXfBMyTMzyDF9cWazaVK99RbgEF-IFQLnY"

# Test 4: Get Pending Withdrawals
curl -X GET "http://localhost:5000/api/admin/get_sub_admin_withdraw_deposit_user_list?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haW5hZG1pbkBnbWFpbC5jb20iLCJkZXZpY2VJZCI6ImE1ZDlmNTM3ZWUwMWIwMTZjM2ZhY2VjMmZkYjExOGZhIiwiaWF0IjoxNzcyNTQ1OTMwLCJleHAiOjE3NzI2MzIzMzB9.yeuk60lp_AXfBMyTMzyDF9cWazaVK99RbgEF-IFQLnY"
```

## Expected Success Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

## If Still Getting 404
1. Restart backend: `npm start`
2. Check token in Authorization header
3. Verify backend is running on port 5000
4. Check backend console for errors

## Files Modified
- `backend/app.js` - Enabled mainAdminRoutes
- `backend/src/router/mainAdminRoutes.js` - Fixed method names
- `backend/src/Controllers/AdminController.js` - Added aliases

All changes are complete and ready!
