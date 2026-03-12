# TODO: Fix Express Server Startup Error

## Plan Steps:
- [x] Step 1: Edit `backend/src/router/subAdminRoutes.js` - Fix middleware import path and hoist BannerController import
- [x] Step 2: Edit `backend/app.js` - Remove broken subAdminAurth require/use
- [ ] Step 3: Test server startup: `cd backend && npm start`
- [ ] Step 4: Verify no new errors and server runs
- [ ] Step 5: Complete task

**Current Status:** Steps 1-2 done. Step 3: New error - BalanceTransferController method names mismatch. Fixing routes to match controller exports (transferBalanceTo*). Step 4 test after.
