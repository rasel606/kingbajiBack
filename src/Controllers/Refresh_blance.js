const User = require('../Models/User');

const crypto = require("crypto");

const GameTable = require('../Models/GamesTable');
const BetProviderTable = require('../Models/BetProviderTable');
const { default: axios } = require('axios');

const fetchBalance = async (agent, username) => {

    const signature = crypto.createHash('md5').update(
        `${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${username}${agent.key}`
    ).digest('hex').toUpperCase();
    const params = {
        operatorcode: agent.operatorcode,
        providercode: agent.providercode,
        username: username,
        password: agent.auth_pass,
        signature

    }
    const apiUrl = `http://fetch.336699bet.com/getBalance.aspx?`;
    const response = await axios.get(apiUrl, { params }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response;
    

    return parseFloat(data.data.balance);
};

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

        const transId = crypto.randomUUID();
        const agent = await BetProviderTable.findOne({ providercode: game.agentId });
        
        if (!agent) return res.status(500).json({ errCode: 2, errMsg: 'Server error, try again.', balance });

        const amount = await fetchBalance(agent, user.userId);

        
        if (amount > 0) {
            const signature = crypto.createHash('md5').update(
                `${amount}${agent.operatorcode.toLowerCase()}${agent.auth_pass}${agent.providercode.toUpperCase()}${transId}1${user.userId}${agent.key}`
            ).digest('hex').toUpperCase();

            const refund = await fetch('http://fetch.336699bet.com/makeTransfer.aspx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operatorcode: agent.opcode,
                    providercode: agent.provider,
                    username: user.userId,
                    password: agent.pass,
                    referenceid: transId,
                    type: 1,
                    amount,
                    signature
                })
            });

            const refundData = await refund

            console.log("refundData", refundData)
            if (!refundData || refundData.status !== 200) {
                return res.status(500).json({ errCode: 2, errMsg: 'Server transaction error, try again.', balance });
            }
        }

        

        console.log("amount+2", amount)
        const win = amount - game.betAmount;

        if (win === 0) {

            // console.log(win === 0)
            // await GameTable.findOneAndDelete(game.gameId);

            // console.log(m)
        } else {

            console.log("amount+2", amount)
            await GameTable.findOneAndUpdate({ gameId: game.gameId }, {
                winAmount: win,
                returnId: transId,
                status: win < 0 ? 2 : 1
            });


            // console.log(my)


        }

        const my = await User.findOne({ userId: user.userId });
        console.log("my", my)

        let gblance = amount;
        
        const m = await User.findOneAndUpdate({ userId: user.userId }, { balance:gblance, last_game_id: game.gameId });
console.log("myblance",m)

        res.json({ errCode: 0, errMsg: 'Success', balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errCode: 2, errMsg: 'Internal Server Error' });
    }
}







// const result = await GameTable.aggregate([
//     { $match: { userId } },  // Find all games for the user
//     {
//         $group: {
//             _id: "$userId",
//             totalWin: { $sum: "$winAmount" },
//             totalBet: { $sum: "$betAmount" }
//         }
//     }
// ]);
// console.log(result)
// let newBalance = 0;
// if (result.length > 0) {
//     newBalance = result[0].totalWin - result[0].totalBet;
//     console.log(newBalance)
// }

// // Update user's balance and last played game ID
// await User.updateOne(
//     { userId },
//     { $set: { balance: newBalance, lest_game_id: user.lest_game_id } }
// );
