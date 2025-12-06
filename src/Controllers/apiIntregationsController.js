const AdminModel = require('../models/AdminModel'); // adjust path
const axios = require('axios');
const crypto = require('crypto');

// Config
const API_URL = 'https://gsmd.336699bet.com/checkAgentCredit.aspx';
const OPERATOR_CODE = 'rbdb';
const SECRET_KEY = '9332fd9144a3a1a8bd3ab7afac3100b0';

// Generate signature
function generateSignature(operatorCode, secretKey) {
    const hash = crypto.createHash('md5').update(operatorCode + secretKey).digest('hex');
    return hash.toUpperCase();
}

// Fetch KIOSK balance from API
async function fetchAgentBalance() {
    try {
        const signature = generateSignature(OPERATOR_CODE, SECRET_KEY);
        const response = await axios.get(API_URL, {
            params: {
                operatorcode: OPERATOR_CODE,
                signature
            },
            headers: {
                Accept: 'application/json'
            }
        });
console.log("response", response.data);
        const { errCode, data, errMsg } = response.data;

        if (errCode !== '0') {
            throw new Error(errMsg || 'API returned an error');
        }

        return parseFloat(data);
    } catch (err) {
        console.error('Error fetching agent balance:', err.message);
        throw err;
    }
}

// Controller to update admin balance
exports.updateAdminBalance = async (req, res) => {
    try {
        const user = req.user; // assume middleware sets adminId
        // if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        console.log("user", user.email);
        const adminId = await AdminModel.findOne({ email: user.email }).select('-password');
        console.log("adminId", adminId.email);
        const kioskBalance = await fetchAgentBalance();
        console.log("kioskBalance", kioskBalance);
        const email = adminId.email;
        console.log("email", email);
        const updatedAdmin = await AdminModel.findByIdAndUpdate(
            adminId._id,
            {
                apiBalance: kioskBalance,
                $push: { apiBalanceHistory: { amount: kioskBalance, date: new Date() } }
            },
            { new: true }
        );
console.log("updatedAdmin", updatedAdmin.apiBalance, updatedAdmin.apiBalanceHistory);
        res.json({
            success: true,
            message: 'Admin balance updated',
            apiBalance: updatedAdmin.apiBalance,
            apiBalanceHistory: updatedAdmin.apiBalanceHistory
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



// // Cron job to update admin balances every 24 hours
// cron.schedule('0 0 * * *', async () => {
//     console.log('Cron job started: Updating admin balances');

//     try {
//         const balance = await fetchAgentBalance();
//         const result = await AdminModel.updateMany({}, { apiBalance: balance });
//         console.log(`Updated admin balances. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
//     } catch (err) {
//         console.error('Failed to update admin balances:', err.message);
//     }
// }, {
//     timezone: 'Asia/Dhaka' // adjust timezone if needed
// });