const axios = require('axios');
const crypto = require('crypto');

exports.tnx = async (req, res) => {
    try {
        const { providercode, username, referenceid, amount } = req.body;
        console.log(providercode, username, referenceid, amount);

        const operatorcode = "rbdb";
        const password = "asdf1234";
        const key = "9332fd9144a3a1a8bd3ab7afac3100b0";

        const signature = crypto.createHash('md5').update(
            `${amount}${operatorcode}${password}${providercode}${referenceid}1${username}${key}`
        ).digest('hex').toUpperCase();

        const params = {
            operatorcode: operatorcode,
            providercode: providercode,
            username: username,
            password: password,
            referenceid: referenceid,
            type: 1,
            amount: amount,
            signature
        };

        console.log(signature);

        const refund = await axios.get('http://fetch.336699bet.com/makeTransfer.aspx', { params });

        console.log(refund.data);
        res.status(200).json(refund.data);
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// exports.blnc = async (req, res) => {
//     const { providercode, username } = req.body
//     console.log(providercode, username)
//     const operatorcode = "rbdb"
//     const password = "asdf1234"
//     const key = "9332fd9144a3a1a8bd3ab7afac3100b0"
//     const Signature = crypto.createHash('md5').update(
//         `${operatorcode.toLowerCase()}${password}${providercode.toUpperCase()}${username}${key}`
//     ).digest('hex').toUpperCase();
//     console.log(Signature)
//     const params = {
//         operatorcode: operatorcode,
//         providercode: providercode,
//         username: username,
//         password: password,
//         signature: Signature

//     }
//     const apiUrl = `http://fetch.336699bet.com/getBalance.aspx?`;
//     const response = await axios.get(apiUrl, { params }, {
//         
//     });
//     res.status(500).json({ refund: response });
// }