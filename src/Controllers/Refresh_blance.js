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

        // Ensure response is an object and contains the expected balance field
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
            try {
                parsedData = JSON.parse(parsedData);
            } catch (error) {
                console.log("Failed to parse API response");
            }
        }

        if (!parsedData || typeof parsedData !== 'object' || !("balance" in parsedData)) {
            // throw new Error("Invalid API response format");
            console.log("Invalid API response format");
        }

        // Ensure balance is a valid number
        if (parsedData.balance === null || isNaN(parsedData.balance)) {
            // throw new Error("Invalid balance received from API");
            console.log("Invalid balance received from API");
        }

        return parseFloat(parsedData.balance);
    } catch (error) {
        console.log("Error fetching balance:", error.message);
        return null; // Returning null to prevent breaking the flow
    }
};


function randomStr() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

exports.refreshBalance = async (req, res) => {
    console.log(req.userId);
    try {
        const { userId} = req.body;
        console.log(userId, req.user);
        if (!userId) return res.status(400).json({ errCode: 2, errMsg: 'Please Login' });

        const user = await User.findOne({ userId: userId });

        if (!user) return res.status(404).json({ errCode: 2, errMsg: 'User not found' });

        let balance = user.balance;
        const game = await GameTable.findOne({ userId: user.userId,gameId: user.last_game_id });
console.log("game", game)

        if (game === null) return res.json({ errCode: 0, errMsg: 'Success', balance });

        const transId = `${randomStr(6)}${randomStr(6)}${randomStr(6)}`.substring(0, 20);
        const agent = await BetProviderTable.findOne({ providercode: game.agentId });
console.log("agent", agent)
        if (!agent) return res.status(500).json({ errCode: 2, errMsg: 'Server error, try again.', balance });
        const username = user.userId
        let amount;
        if(balance == 0 ){
        amount = await fetchBalance(agent, username);
        }
        else{
            res.status(500).json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
        }
        console.log("amounty", amount)
        console.log("pi blance", amount)
        if (amount !== null && amount > 0) {
            balance += amount
             return await User.findOneAndUpdate(
                { userId: userId },
                { 
                    $set: { balance: parseFloat(balance) },
                    
                },
                { new: true }
            );

            console.log("blt", blt)
            console.log("balance", balance)
            // res.json({ errCode: 0, Msg: 'Success', balance });
        } else {
            console.log("Failed to fetch valid balance, keeping previous balance");
            // res.json({ errCode: 0, errMsg: 'Success', balance:"balance already update" });
        }

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
            
                    console.log(refund.data);

            const refundData = await refund.data
            // amount = refundData
            console.log("refundData", refundData)
            if (refundData.innerCode === null ) {
                return res.status(500).json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
            }
         }


        console.log("amount+2", amount === null)
        // const win = amount - game.betAmount;
        // console.log("amount+4", win)
        // if (amount !== null && !isNaN(amount)) {
        //     balance += parseFloat(amount);
        // }
        
        const win =  amount - game.betAmount;

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

        res.json(newUser.balance );
    } catch (error) {
        // console.log(error.message);
        res.status(500).json({ errCode: 2, Msg: 'Internal Server Error', balance:0 });
        // if (!res.headersSent) {
        //     return res.status(500).json({ error: "Internal Server Error" });
        //   }
    }
}






