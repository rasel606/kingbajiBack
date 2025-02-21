const User = require('../Models/User');

const crypto = require("crypto");

const GameTable = require('../Models/GamesTable');
const BetProviderTable = require('../Models/BetProviderTable');
const { default: axios } = require('axios');

const fetchBalance = async (agent, username) => {
    try {
        const signature = crypto.createHash('md5').update(
            `${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${username}${agent.key}`
        ).digest('hex').toUpperCase();

        console.log("Generated Signature:", signature);

        const params = {
            operatorcode: agent.operatorcode,
            providercode: agent.providercode,
            username: username,
            password: agent.auth_pass,
            signature
        };

        const apiUrl = `http://fetch.336699bet.com/getBalance.aspx`;

        // Make the API request
        const response = await axios.get(apiUrl, { params, headers: { 'Content-Type': 'application/json' }, responseType: 'json' });

        // Log response for debugging
        if (!response.data || typeof response.data !== 'object' || !("balance" in response.data)) {
            throw new Error("Invalid API response format");
        }

        const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

        if (!parsedData.balance || isNaN(parsedData.balance)) {
            throw new Error("Invalid balance received from API");
        }

        return parseFloat(parsedData.balance);
    } catch (error) {
        console.log("Error fetching balance:", error.message);
        return null; // or handle the error accordingly
    }
};

function randomStr() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

exports.refreshBalance = async (req, res) => {
    console.log(req.userId);
    try {
        const { userId, agentID } = req.body;
        console.log(userId, req.user);
        if (!userId) return res.status(400).json({ errCode: 2, errMsg: 'Please Login' });

        const user = await User.findOne({ userId: userId });

        if (!user) return res.status(404).json({ errCode: 2, errMsg: 'User not found' });

        let balance = user.balance;
        const game = await GameTable.findOne({ userId: user.userId });


        if (game === null) return res.json({ errCode: 0, errMsg: 'Success', balance });

        const transId = `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 20);
        const agent = await BetProviderTable.findOne({ providercode: game.agentId });

        if (!agent) return res.status(500).json({ errCode: 2, errMsg: 'Server error, try again.', balance });
        const username = user.userId
        let amount = await fetchBalance(agent, username);

        if (amount === null) {
            console.log("Failed to fetch valid balance, keeping previous balance:", balance);
        } else {
            balance += parseFloat(amount);
            await User.updateOne({ userId: userId },{$set: { balance: balance, last_game_id: game.gameId }});
        }
        

        console.log("pi blance", amount)
        if (amount !== null && amount > 0) {
            const signature = crypto.createHash('md5').update(
                `${amount}${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${transId}1${user.userId}${agent.key}`
            ).digest('hex').toUpperCase();
            console.log(transId)
            const params = {
                operatorcode: agent.operatorcode,
                providercode: agent.providercode,
                username: user.userId,
                password: agent.auth_pass,
                referenceid: transId,
                type: 1,
                amount: amount,
                signature
            };

            console.log(signature);

            const refund = await axios.get('http://fetch.336699bet.com/makeTransfer.aspx', { params });


            const refundData = await refund.data
            // amount = refundData
            console.log("refundData", refundData)
            if (refundData.innerCode === null) {
                return res.status(500).json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
            }
        }




        console.log("amount+2", amount === null)
        // const win = amount - game.betAmount;
        // console.log("amount+4", win)
        // if (amount !== null && !isNaN(amount)) {
        //     balance += parseFloat(amount);
        // }
        
        const win =  amount - game.betAmount ;

console.log(win)
        if (win === 0) {
            // await GameTable.deleteOne({ gameId: game.gameId });
        } else {
            await GameTable.updateOne(
                { gameId: game.gameId },
                { $set: { winAmount: win, returnId: transId, status: win < 0 ? 2 : 1 } }
            );
        }

        

    const newUser = await User.findOne({ userId: userId });

        res.json({ errCode: 0, errMsg: 'Success', balance:newUser.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errCode: 2, errMsg: 'Internal Server Error' });
    }
}






