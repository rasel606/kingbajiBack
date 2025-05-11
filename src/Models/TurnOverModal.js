const mongoose = require("mongoose");

const TurnOverModalSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    level: {type: Number, enum: [1, 2, 3], default: [1, 2, 3], required: true, },
    isClaimed: { type: Boolean, default: false },
    earnedAt: {type: Date, default: Date.now,},
    turnoverAmount: { type: Number, required: true },
    type: { type: String, required: true, },
    status: { type: Number, enum: [0, 1, 2], required: true }, // 0 = Hold, 1 = Accept, 2 = Reject
    CreatedDate: { type: Date, default: Date.now },
    is_commission: { type: Boolean, default: false },
    referredbyAgent: { type: String, ref: 'Agent',default: null },
    referredbyAffiliate: { type: String, ref: 'AffiliateUser',default: null  },
    referredbysubAdmin: { type: String, ref: 'SubAdmin',default: null  },
});


const TurnOverModal = mongoose.model("TurnOverModal", TurnOverModalSchema);
module.exports = TurnOverModal