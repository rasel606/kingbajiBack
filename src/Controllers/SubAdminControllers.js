// const { processDepositApproval } = require("./ALLTransactionController");




// // exports.approveDepositBySubAdmin = async (req, res) => {
// //     try {
// //         const { userId, referralCode, status } = req.body;
// //         const { transactionID } = req.params;

// //         const result = await processDepositApproval({
// //             userId,
// //             referralCode,
// //             status,
// //             transactionID,
// //             role: 'subadmin'
// //         });

// //         res.status(200).json(result);
// //     } catch (err) {
// //         res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
// //     }
// // };