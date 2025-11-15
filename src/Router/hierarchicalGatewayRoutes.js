const express = require("express");
const router = express.Router();
const HierarchicalGatewayController = require("../Controllers/hierarchicalGatewayController");
const {auth} = require("../MiddleWare/auth");
// const { authorize } = require("../middlewares/roleCheck");

// 🔹 এডমিন রাউটস
router.get("/admin/gateways", 
    auth, 
    // authorize('admin'), 
    HierarchicalGatewayController.getAdminGateways
);

router.post("/admin/gateways/create", 
    auth, 
    // authorize('admin'), 
    HierarchicalGatewayController.createAdminGateway
);

router.put("/admin/gateways/:gatewayId", 
    auth, 
    // authorize('admin'), 
    HierarchicalGatewayController.updateAdminGateway
);

router.delete("/admin/gateways/:gatewayId", 
    auth, 
    // authorize('admin'), 
    HierarchicalGatewayController.deleteAdminGateway
);

// 🔹 সাব-এডমিন রাউটস
router.get("/subadmin/full-hierarchy", 
    auth, 
    // authorize('subAdmin'), 
    HierarchicalGatewayController.getSubAdminAllGateways
);

// 🔹 এফিলিয়েট রাউটস
router.get("/affiliate/full-hierarchy", 
    auth, 
    // authorize('affiliate'), 
    HierarchicalGatewayController.getAffiliateAllGateways
);

// 🔹 ইউজার রাউটস
router.get("/user/full-hierarchy", 
    // auth, 
    // authorize('user'), 
    HierarchicalGatewayController.getUserAllGateways
);

// 🔹 কমন রাউটস (সব রোলের জন্য)
router.get("/available-for-deposit", 
    auth, 
    HierarchicalGatewayController.getAvailableGatewaysForDeposit
);

module.exports = router;