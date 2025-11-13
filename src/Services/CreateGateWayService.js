// Services/CreateGateWayService.js
const PaymentGateWayTable = require("../Models/PaymentGateWayTable");
const WidthralPaymentGateWayTable = require("../Models/WidthralPaymentGateWayTable");

const CreateGateWayService = async (user) => {
    try {
        const defaultGateways = [
            {
                gateway_name: "Bkash",
                image_url: "https://i.ibb.co/0RtD1j9C/bkash.png",
                payment_type: "Cashout",
                gateway_Number: "01700000000",
            },
            {
                gateway_name: "Nagad",
                image_url: "https://i.ibb.co/2YqVLj1C/nagad-1.png",
                payment_type: "Cashout",
                gateway_Number: "01700000000",
            },
            {
                gateway_name: "Rocket",
                image_url: "https://i.ibb.co/Rp5QFcm9/rocket.png",
                payment_type: "Cashout",
                gateway_Number: "01700000000",
            },
            {
                gateway_name: "Upay",
                image_url: "https://i.ibb.co/5WX9H0Tw/upay.png",
                payment_type: "Cashout",
                gateway_Number: "01700000000",
            },
        ];

        const timestamp = new Date();
console.log(user);
        const gatewayPayload = defaultGateways.map((gateway) => ({
            user_role: user.role,
            email: user.email,
            gateway_name: gateway.gateway_name,
            gateway_Number: gateway.gateway_Number,
            payment_type: gateway.payment_type,
            image_url: gateway.image_url,
            referredBy: user.referralCode || 'system',
            start_time: { hours: 0, minutes: 0 },
            end_time: { hours: 23, minutes: 59 },
            minimun_amount: 0,
            maximun_amount: 0,
            is_active: true,
            timestamp,
            updatetime: timestamp,
        }));

        await PaymentGateWayTable.insertMany(gatewayPayload);
        await WidthralPaymentGateWayTable.insertMany(gatewayPayload);
        
        return { success: true, message: "Gateways created successfully" };
    } catch (error) {
        console.error("❌ Error in CreateGateWayService:", error);
        return { success: false, message: error.message };
    }
};

module.exports = CreateGateWayService;