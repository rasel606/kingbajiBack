const User = require('../Models/User');

const crypto = require("crypto");

const GameTable = require('../Models/GamesTable');
const BetProviderTable = require('../Models/BetProviderTable');
const { default: axios } = require('axios');







async function fetchApi(endpoint, data) {
    try {
        // Simulated API call for transactions
        const response = await axios.post(`http://fetch.336699bet.com/${endpoint}`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching API:", error);
        return { errCode: 2, errMsg: "API error" };
    }
}


// exports.fetchBalance = async (agentID, userName)=> {
//     console.log(agentID, userName)

//     // Fetch the agent details from MongoDB
//     const agent = await BetProviderTable.findOne(agentID);
//     if (!agent) {
//         return 0; // Return 0 if agent is not found
//     }

//     console.log(agentID, userName)

//     // Making the API call
//     try {

//       const signatureLunchGame = generateSignatureBlance(
//         agent.operatorcode,
//         agent.auth_pass,
//         agent.providercode,
//         userName,
//         agent.key


//       )

//       console.log(signatureLunchGame);
//         const response = await axios.get('http://fetch.336699bet.com/getBalance.aspx', {
//             params: {
//                 operatorcode: agent.operatorcode,
//                 providercode: agent.providercode,
//                 username: userName,
//                 password: agent.auth_pass,
//                 signature: signatureLunchGame
//             }
//         });
//         // console.log(JSON.parse(response.data));
//         // Check if the response is valid and contains the balance
//         if (response.data && response.data.errCode === 0) {
//             return response.data.balance;
//         }
//     } catch (error) {
//         console.error('Error fetching balance:', error);
//     }

//     return 0; // Return 0 if there's an error or invalid response
//   }

//   function generateSignatureBlance(...args) {
//     console.log("args:", args);
//     return crypto.createHash("md5").update(args.join("")).digest("hex").toUpperCase();
//   }

// // Helper function to generate transaction ID
// function generateTransactionId() {
//     return (
//         Math.random().toString(36).substr(2, 6) +
//         "-" +
//         Math.random().toString(36).substr(2, 6) +
//         "-" +
//         Math.random().toString(36).substr(2, 6)
//     ).toUpperCase();
// }

// // Helper function to generate signature
// function generateSignature(amount, agent, transId, username) {
//     return (
//         amount +
//         agent.operatorcode.toLowerCase() +
//         agent.auth_pass +
//         agent.providercode.toUpperCase() +
//         transId +
//         1 +
//         username +
//         agent.key
//     ).toUpperCase();
// }














// exports.refreshBalance = async (req, res ) => {

//     try {
//         console.log("user:", req);
//         const user_id =  req.body.userId


//         // Assuming user is set in the session or JWT token

//           const userId = user_id; // Assuming user is authenticated and stored in req.user
//         if (!userId) {
//           return res.status(401).json({ errCode: 2, errMsg: "Please Login" });
//         }

//         const user = await User.findOne({ userId });
//         if (!user) {
//           return res.status(404).json({ errCode: 2, errMsg: "User not found" });
//         }

//         let balance = user.balance;
//         const game = await GameTable.findOne({ userId,status:0 });
//     console.log("game", game)
//         if (game) {
//           const transId = generateTransactionId();

//           const agent = await BetProviderTable.findOne({ providercode: game.agentId });
//           if (!agent) {
//             return res.status(500).json({ errCode: 2, errMsg: "Server error, try again.", balance });
//           }


//           console.log(game)

//           const amount = await fetchBalance(agent, user.userId);
//           console.log("amount-0", amount)
//           if (amount > 0) {
//             const refund = await fetchApi("makeTransfer.aspx", {
//               operatorcode: agent.operatorcode,
//               providercode: agent.providercode,
//               username: user.userId,
//               password: agent.auth_pass,
//               referenceid: transId,
//               type: 1,
//               amount,
//               signature: generateSignature(amount, agent, transId, user.userId),
//             });
//             console.log("amount-1", refund)

//             if (!refund || refund.errCode !== 0) {
//               return res.status(500).json({ errCode: 2, errMsg: "Transaction error, try again.", balance });
//             }
//           }

//           balance += amount;
//           const win = amount - game.betAmount;

//           if (win === 0) {
//             await GameTable.deleteOne({ gameId: game._id });
//           } else {
//             await GameTable.updateOne(
//               { gameId: game._id },
//               { $set: { winAmount: win, returnId: transId, status: win < 0 ? 2 : 1 } }
//             );
//           }

//           await User.updateOne({ userId }, { $set: { balance, last_game_id: null } });

//           return res.json({ errCode: 0, errMsg: "Success", balance });
//         }

//         // res.json({ errCode: 0, errMsg: "No active game found", balance });
//       } catch (error) {
//         console.error(error);
//         res.status(500).json({ errCode: 1, errMsg: "Internal Server Error" });
//       }
//     }

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
    try {
        const { userId, agentID } = req.body;
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
            await GameTable.findOneAndDelete(game.gameId);

            // console.log(m)
        } else {


            await GameTable.findOneAndUpdate({ gameId: game.gameId }, {
                winAmount: win,
                returnId: transId,
                status: win < 0 ? 2 : 1
            });


            // console.log(my)


        }


        
        const m = await User.findOneAndUpdate({ userId: user.userId }, { balance, last_game_id: game.gameId });
console.log(m)

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
