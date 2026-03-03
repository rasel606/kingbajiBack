
// // Agent Deposit
// router.post('/agent-deposit', async (req, res) => {
//     try {
//         const { user_id, amount } = req.body;

//         // Fetch user and related data
//         const user = await User.findById(user_id);
//         const currency = await Currency.findById(user.currency_id);
//         const agent = await Contact.findById(user.contact_id);
// // 
//         // Validation checks
//         const minAmount = getOption('min_withrow_balance');
//         const maxAmount = getOption('max_withrow_balance');

//         if (amount < minAmount) {
//             return res.json({ status: false, msg: `Minimum Amount is ${minAmount}` });
//         }

//         if (amount > maxAmount) {
//             return res.json({ status: false, msg: `Maximum Amount is ${maxAmount}` });
//         }

//         if (agent.balance >= amount) {
//             // Deposit Logic
//             const depositData = new DepositHistory({
//                 deposit_user_id: user_id,
//                 transactionID: '--',
//                 base_amount: amount / currency.price_value,
//                 currency_rate: currency.price_value,
//                 amount,
//                 currency: user.currency_id,
//                 contact_id: user.contact_id,
//                 agent_id: user.agent_id,
//                 gateway: 0,
//                 gateway_name: 'Agent',
//                 status: 1,
//                 remark: `<p><b style='color: red;'>Deposit by Agent directly.</b></p>`
//             });

//             // Update agent and user balances
//             agent.balance -= amount;
//             user.balance += amount;

//             await agent.save();
//             await user.save();
//             await depositData.save();

//             res.json({ status: true, msg: 'Deposit completed.' });
//         } else {
//             res.json({ status: false, msg: 'Insufficient balance.' });
//         }
//     } catch (err) {
//         res.json({ status: false, msg: 'Something went wrong.' });
//     }
// });




// // / Agent Withdraw
// router.post('/agent-withraw', async (req, res) => {
//     try {
//         const { user_id, amount } = req.body;

//         // Fetch user and related data
//         const user = await User.findById(user_id);
//         const currency = await Currency.findById(user.currency_id);

//         // Validation checks
//         const minAmount = getOption('min_withrow_balance');
//         const maxAmount = getOption('max_withrow_balance');

//         if (amount < minAmount) {
//             return res.json({ status: false, msg: `Minimum Amount is ${minAmount}` });
//         }

//         if (amount > maxAmount) {
//             return res.json({ status: false, msg: `Maximum Amount is ${maxAmount}` });
//         }

//         if (user.balance >= amount) {
//             // Withdrawal Logic
//             const withdrawData = new WithdrawHistory({
//                 user_id,
//                 base_amount: amount / currency.price_value,
//                 currency_rate: currency.price_value,
//                 amount,
//                 currency_id: user.currency_id,
//                 contact_id: user.contact_id,
//                 agent_id: user.agent_id,
//                 gateway: 0,
//                 gateway_name: 'Agent',
//                 status: 1,
//                 details: `<p><b style='color: red;'>Withdraw by Agent directly.</b></p>`
//             });

//             // Update user and agent balances
//             user.balance -= amount;
//             const agent = await Contact.findById(user.contact_id);
//             agent.balance += amount;

//             await user.save();
//             await agent.save();
//             await withdrawData.save();

//             res.json({ status: true, msg: 'Withdraw completed.' });
//         } else {
//             res.json({ status: false, msg: 'Insufficient balance.' });
//         }
//     } catch (err) {
//         res.json({ status: false, msg: 'Something went wrong.' });
//     }
// });



// / Agent Add/Update
// router.post('/agent-add', async (req, res) => {
//     try {
//         const { hidden_id, details, type } = req.body;
//         const contact_id = req.user.contact_id; // Assuming `req.user.contact_id` stores the logged-in user's contact ID

//         const agentDetails = { details, type, contact_id };

//         if (!hidden_id) {
//             // Add new agent details
//             const newAgentDetails = new AgentDetails(agentDetails);
//             await newAgentDetails.save();
//             res.json({ status: 'success', msg: 'Agent details added.' });
//         } else {
//             // Update existing agent details
//             const updatedAgent = await AgentDetails.findByIdAndUpdate(hidden_id, agentDetails, { new: true });
//             res.json({ status: 'success', msg: 'Agent details updated.' });
//         }
//     } catch (err) {
//         res.json({ status: 'error', msg: 'Something went wrong.' });
//     }
// });





// const DepositHistory = require('./models/DepositHistory');  // Assuming a Mongoose model for Deposit History
// const AgentDetails = require('./models/AgentDetails');
// const Contact = require('./models/Contact');
// const User = require('./models/User');
// const Currency = require('./models/Currency');

// async function agentDeposit(data, user) {
//   try {
//     const agent = await AgentDetails.findOne({ _id: data.id });
//     const contact = await Contact.findOne({ _id: agent.contact_id });
//     const userDetails = await User.findOne({ _id: user.id });
//     const currency = await Currency.findOne({ _id: userDetails.currency_id });

//     const rate = currency.price_value;
//     const baseAmount = parseFloat(data.amount) / rate;

//     // Create a deposit history record
//     const depositHistory = new DepositHistory({
//       deposit_user_id: user.id,
//       transactionID: 0,
//       amount: parseFloat(data.amount),
//       currency_rate: parseFloat(rate),
//       base_amount: baseAmount,
//       gateway: 'Agent',
//       contact_id: contact.id,
//       agent_id: data.id,
//       remark: data.remark,
//       currency: userDetails.currency_id,
//     });

//     await depositHistory.save();

//     return { return: true, message: 'Approval completed' };
//   } catch (error) {
//     console.error(error);
//     return { return: false, message: 'Error occurred during deposit' };
//   }
// }







// const Betting = require('./models/Betting');  // Assuming a Mongoose model for Betting

// async function addManualBetting(data) {
//   try {
//     const betting = await Betting.findOne({ _id: data.id });

//     if (betting) {
//       let manualData = betting.manual ? JSON.parse(betting.manual) : [];

//       const index = manualData.findIndex(item => item.id === data.sports_id);
//       if (index !== -1) {
//         let bookmakerIndex = manualData[index].bookmakers.findIndex(b => b.title === data.title);

//         if (bookmakerIndex === -1) {
//           manualData[index].bookmakers.push({
//             title: data.title,
//             markets: [{ name: data.name, price: data.price }]
//           });
//         } else {
//           manualData[index].bookmakers[bookmakerIndex].markets.push({
//             name: data.name,
//             price: data.price
//           });
//         }
//       } else {
//         manualData.push({
//           id: data.sports_id,
//           sport_key: data.sports_key,
//           bookmakers: [{
//             title: data.title,
//             markets: [{ name: data.name, price: data.price }]
//           }]
//         });
//       }

//       // Update the betting document with the new manual data
//       await Betting.findOneAndUpdate({ _id: data.id }, { manual: JSON.stringify(manualData) });

//       return { return: true, message: 'Sync completed' };
//     } else {
//       return { return: false, message: 'Server problem' };
//     }
//   } catch (error) {
//     console.error(error);
//     return { return: false, message: 'Error occurred during sync' };
//   }
// }
