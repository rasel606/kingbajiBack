const mongoose = require("mongoose");

const WidthralPaymentGateWayTableSchema = new mongoose.Schema({
    user_role: { type: String, ref: "User", required: true }, // Changed `string` to `String`
    email: { type: String, required: true },
     gateway_name: {
        type: String,
        enum: ["Bkash", "Nagad", "Rocket", "Upay", "transfer"],
        required: true,
    },
    gateway_Number: { type: Number, required: true },
    minimun_amount: { type: Number  },
    maximun_amount: { type: Number },
    payment_type: { type: String, enum: ["Send Money", "Cashout", "Payment"], required: true },
    referredBy: { type: String , required: true }, // Ensure this matches the controller field name
    image_url: { type: String , required: true },
    start_time: { 
        hours: { type: Number, min: 0, max: 23, required: true }, 
        minutes: { type: Number, min: 0, max: 59, required: true } 
    },
    end_time: { 
        hours: { type: Number, min: 0, max: 23, required: true }, 
        minutes: { type: Number, min: 0, max: 59, required: true } 
    },
    is_active: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
    updatetime: { type: Date, default: Date.now }
});



module.exports = mongoose.model("WidthralPaymentGateWayTable", WidthralPaymentGateWayTableSchema);
