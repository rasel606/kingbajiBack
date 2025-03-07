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

        const response = await axios.get(apiUrl, { params, headers: { 'Content-Type': 'application/json' }, responseType: 'json' });

        let parsedData = response.data;


        return parseFloat(parsedData.balance);
    } catch (error) {
        console.log("Error fetching balance:", error.message);
        return null;
    }
};

function randomStr() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

exports.refreshBalance = async (req, res) => {
    
    try {
        const { userId } = req.body;
        console.log(userId, req.user);
        if (!userId) return res.status(400).json({ errCode: 2, errMsg: 'Please Login' });

        const user = await User.findOne({ userId: userId });
        if (!user) return res.status(404).json({ errCode: 2, errMsg: 'User not found' });

        let balance = user.balance;
        const game = await GameTable.findOne({ userId: user.userId, gameId: user.last_game_id });
        // console.log("game refresh", game);

        if (!game) return res.json({ errCode: 0, errMsg: 'Success', balance });

        const agent = await BetProviderTable.findOne({ providercode: game.agentId });
        // console.log("agent refresh", agent);
        if (!agent) return res.status(500).json({ errCode: 2, errMsg: 'Server error, try again.', balance });

        const username = user.userId;
        let amount = null;

        if (balance === 0 ) {
            amount = await fetchBalance(agent, username);
            if (amount === null ) {
                return res.json({ errCode: 0, errMsg: 'Success', balance });
            }
        } else {
            return res.status(500).json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
        }

        // console.log("Fetched Balance:", amount);
        setTimeout(async () => {
            
            if (amount > 0 && balance === 0 && amount !== balance && amount !== null) {
                console.log((amount > 0 && balance === 0 && amount !== balance))
                balance += amount;

                await User.findOneAndUpdate(
                    { userId: userId },
                    { $set: { balance: parseFloat(balance) } },
                    { new: true }
                );

                console.log("Updated Balance:", balance);
            }

            const transId = `${randomStr(3)}${randomStr(3)}${randomStr(3)}`.substring(0, 8).toUpperCase();
            const signature = crypto.createHash('md5').update(
                `${amount}${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${transId}1${user.userId}${agent.key}`
            ).digest('hex').toUpperCase();

            console.log("Transaction ID:", transId);
            console.log("Signature:", signature);

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

            console.log("Transfer Params:", params);
            try {
                const refund = await axios.get('http://fetch.336699bet.com/makeTransfer.aspx', { params });
                console.log("Refund Response:", refund.data);

                if (refund.errMsg === "NOT_ALLOW_TO_MAKE_TRANSFER_WHILE_IN_GAME") {
                     res.json({ errCode: 0, errMsg: "Transaction not allowed while in game. Try again later.", balance });
                }

                if (refund.innerCode === null) {
                     res.status(500).json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
                }
            } catch (transferError) {
                console.log("Transfer API Error:", transferError.message);
                return res.status(500).json({ errCode: 2, errMsg: 'Transfer API Error', balance });
            }
        }, 5000);
        const win = parseFloat(amount) - parseFloat(game.betAmount);
        console.log("Win Amount:", win);

        if (!isNaN(win) && win !== 0 && win !== NaN) {
            await GameTable.findOneAndUpdate(
                { gameId: game.gameId },
                { $set: { winAmount: win, returnId: transId, status: win < 0 ? 2 : 1 } },
                { new: true }
            );
        } else {
           await GameTable.deleteOne({ gameId: game.gameId })
        }

        const updatedUser = await User.findOne({ userId: userId });
        res.json({ errCode: 0, errMsg: 'Success', balance: updatedUser.balance });

    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ errCode: 2, errMsg: 'Internal Server Error', balance: 0 });
    }
};