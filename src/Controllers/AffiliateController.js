const AffiliateUser = require('../Models/AffiliateUser')
const CreateService = require('../Services/CreateService')
const LoginService = require('../Services/LoginService')


// exports.CreateAdmin = async (req, res) => {
//     console.log(req.body)
//     let dataModel = AffiliateUser;
//     let result = await CreateService(req, dataModel);
//     console.log(result, "line1")
//     res.json({ status: result.status, data: result.data })
// };
// exports.AdminLogin = async (req, res) => {
//     let dataModel = AffiliateUser;
//     let result = await LoginService(req, res, dataModel);
//     console.log(result, "line1")
//     res.json({ status: result.status, data: result.data })
// };
// exports.AdminProfile = async (req, res) => {
//     let dataModel = AffiliateUser;
//     let result = await updateOne(req, res, dataModel);
//     res.status(result.status).json({ status: result.status, data: result.data })
// }



// app.get('/api/users/:username', async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.params.username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// // Example: Update user profile 
// app.put('/api/users/:username', async (req, res) => {
//     try {
//         const updatedUser = await User.findOneAndUpdate(
//             { username: req.params.username },
//             req.body, // The updated user data from the request body
//             { new: true, runValidators: true } // Return the updated document and validate updates
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(updatedUser);

//     } catch (error) {
//         console.error("Error updating user:", error); // Log the detailed error for debugging
//         res.status(500).json({ message: error.message });
//     }
// });


// // Example: Create a new user
// app.post('/api/users', async (req, res) => {
//     try {
//         const newUser = new User(req.body);
//         await newUser.save();
//         res.status(201).json(newUser); // 201 Created status code
//     } catch (err) {
//         res.status(400).json({ message: err.message }); // 400 Bad Request
//     }
// });


// app.get('/api/domains', async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search = '' } = req.query;  // Get query parameters

//         const query = {}; // Build the query object
//         if (search) {
//             query.domain = { $regex: search, $options: 'i' }; // Case-insensitive search
//         }

//         const domains = await Domain.find(query)
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .exec();

//         const totalCount = await Domain.countDocuments(query); // Total matching documents

//         res.json({
//             domains,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });


// // Create a new domain
// app.post('/api/domains', async (req, res) => {
//     try {
//         const newDomain = new Domain(req.body);
//         await newDomain.save();
//         res.status(201).json(newDomain);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });






// // Member Schema (models/Member.js)
// const memberSchema = new mongoose.Schema({
//     registeredTime: Date, // Use Date type
//     username: String,
//     affiliateURL: String,
//     lastLoginIP: String,
//     signUp: Date, // If you store signup time
//     lastLoginTime: Date,
//     lastDeposit: Date,
//     lastBetTime: Date,
//     currencyType: String, // e.g., 'BDT'
// });

// const Member = mongoose.model('Member', memberSchema);

// // Routes (controllers/memberController.js - In this example, routes are in server.js)

// // Get members with filtering, pagination, and search
// app.get('/api/members', async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search = '', registeredDateStart, registeredDateEnd, ...otherFilters } = req.query;

//         const query = {};

//         if (search) {
//             query.username = { $regex: search, $options: 'i' }; // Case-insensitive username search
//         }

//         // Date Filtering (important to handle date ranges correctly)
//         if (registeredDateStart && registeredDateEnd) {
//             query.registeredTime = {
//                 $gte: new Date(registeredDateStart), // Greater than or equal to start date
//                 $lte: new Date(registeredDateEnd),   // Less than or equal to end date
//             };
//         } else if (registeredDateStart) {
//             query.registeredTime = { $gte: new Date(registeredDateStart) };
//         } else if (registeredDateEnd) {
//             query.registeredTime = { $lte: new Date(registeredDateEnd) };
//         }

//         // Add other filters as needed (lastLoginIP, currencyType, etc.)
//         for (const key in otherFilters) {
//             if (otherFilters[key]) {
//                 query[key] = otherFilters[key]; // Add other filters to the query
//             }
//         }

//         const members = await Member.find(query)
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ registeredTime: -1 }) // Sort by registration time (newest first)
//             .exec();

//         const totalCount = await Member.countDocuments(query);

//         res.json({
//             members,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });










// // Registration & FTD Schema (models/RegistrationFTD.js)
// const registrationFTDSchema = new mongoose.Schema({
//     username: String,
//     keywords: String,
//     currency: String,
//     registrationTime: Date,
//     firstDepositTime: Date,
//     firstDeposit: Number,
//     firstBetTime: Date,
//     firstBet: Number,
//     lastBetTime: Date,
//     lastBet: Number,
//     page: Number, // Assuming this refers to a page or group
//     total: Number, // A calculated total if needed
// });

// const RegistrationFTD = mongoose.model('RegistrationFTD', registrationFTDSchema);

// // Routes (controllers/registrationFTDController.js - In this example, routes are in server.js)

// app.get('/api/registration-ftds', async (req, res) => {
//     try {
//         const { page = 1, limit = 10, fromDate, toDate, keywords, currency } = req.query;

//         const query = {};

//         if (fromDate && toDate) {
//             query.registrationTime = {
//                 $gte: new Date(fromDate),
//                 $lte: new Date(toDate),
//             };
//         } else if (fromDate) {
//             query.registrationTime = { $gte: new Date(fromDate) };
//         } else if (toDate) {
//             query.registrationTime = { $lte: new Date(toDate) };
//         }

//         if (keywords && keywords !== 'All') { // Filter by keywords (excluding "All")
//             query.keywords = keywords;
//         }

//         if (currency && currency !== 'All') {
//             query.currency = currency;
//         }

//         const registrationFTDs = await RegistrationFTD.find(query)
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .exec();

//         const totalCount = await RegistrationFTD.countDocuments(query);

//         res.json({
//             registrationFTDs,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });













// // Performance Schema (models/Performance.js)
// const performanceSchema = new mongoose.Schema({
//     username: String,
//     keyword: String, // Or keywords array if multiple
//     signUpCountry: String,
//     currency: String,
//     registrationTime: Date,
//     firstDepositTime: Date,
//     phoneNumber: String,
//     emailAddress: String,
//     signUpIP: String,
//     lastLoginIP: String,
//     lastLoginTime: Date,
//     totalDeposit: Number,
//     totalDepositPaymentFee: Number,
//     totalWithdrawal: Number,
//     totalWithdrawalPaymentFee: Number,
//     totalNumberOfBets: Number,
//     totalTurnover: Number,
//     profitLoss: Number,
//     totalJackpot: Number,
//     bonus: Number,
//     vipCashBonus: Number,
//     referralCommission: Number,
//     revenueAdjustment: Number,
//     page: Number,
//     total: Number, // Calculated total
// });

// const Performance = mongoose.model('Performance', performanceSchema);

// // Routes (controllers/performanceController.js - In this example, routes are in server.js)

// app.get('/api/performance', async (req, res) => {
//     try {
//         const { page = 1, limit = 10, player, downline, fromDate, toDate, currency, keywords } = req.query;

//         const query = {};

//         if (player) {
//             query.username = { $regex: player, $options: 'i' }; // Case-insensitive player search
//         }

//         if (downline) {
//             // Add downline filter logic if needed (depends on how you store downline data)
//         }

//         if (fromDate && toDate) {
//             query.registrationTime = {
//                 $gte: new Date(fromDate),
//                 $lte: new Date(toDate),
//             };
//         } else if (fromDate) {
//             query.registrationTime = { $gte: new Date(fromDate) };
//         } else if (toDate) {
//             query.registrationTime = { $lte: new Date(toDate) };
//         }

//         if (currency && currency !== 'All') {
//             query.currency = currency;
//         }

//         if (keywords && keywords !== 'All') {
//             query.keyword = keywords; // Or filter on keywords array if needed
//         }

//         const performanceData = await Performance.find(query)
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .exec();

//         const totalCount = await Performance.countDocuments(query);

//         res.json({
//             performanceData,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });










// // Commission Schema (models/Commission.js)
// const commissionSchema = new mongoose.Schema({
//     startDate: Date,
//     currency: String,
//     netProfit: Number,
//     commission: Number,
//     period: String, // e.g., "Weekly", "Monthly"
//     status: String, // e.g., "Paid", "Pending"
//     page: Number,
//     total: Number, // Calculated total if needed
// });

// const Commission = mongoose.model('Commission', commissionSchema);

// // Routes (controllers/commissionController.js - In this example, routes are in server.js)

// app.get('/api/commissions', async (req, res) => {
//     try {
//         const { page = 1, limit = 10, fromDate, toDate, currency } = req.query;

//         const query = {};

//         if (fromDate && toDate) {
//             query.startDate = {
//                 $gte: new Date(fromDate),
//                 $lte: new Date(toDate),
//             };
//         } else if (fromDate) {
//             query.startDate = { $gte: new Date(fromDate) };
//         } else if (toDate) {
//             query.startDate = { $lte: new Date(toDate) };
//         }

//         if (currency && currency !== 'All') {
//             query.currency = currency;
//         }

//         const commissions = await Commission.find(query)
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .exec();

//         const totalCount = await Commission.countDocuments(query);

//         res.json({
//             commissions,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });














// // User Schema (models/User.js -  Update with all your fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     firstName: String,
//     lastName: String,
//     dateOfBirth: Date,
//     lastWithdrawalTime: Date,
//     accountStatus: String,
//     approvedDateTime: Date,
//     lastLoginTime: Date,
//     referralCode: String,
//     contactInfo: {
//         phone: String,
//         email: String,
//         whatsapp: String,
//     },
//     potential: Number,
//     earnings: {  // ... (all your earnings fields)
//         totalRevenue: Number,
//         totalProfitLoss: Number,
//         // ...
//     },
//     commissionPercentage: Number,
//     // ... other fields
//     negativeCarryForward: Number,
//     totalNetProfit: Number,
//     pendingWithdrawal: Number,
//     availableBalance: Number,
//     processingWithdrawal: Number,

// });

// const User = mongoose.model('User', userSchema);


// // Routes (controllers/userController.js - In this example, routes are in server.js)

// // Get user profile
// app.get('/api/users/:username', async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.params.username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });


// // Update user profile (example: updating potential)
// app.put('/api/users/:username', async (req, res) => {
//     try {
//         const updatedUser = await User.findOneAndUpdate(
//             { username: req.params.username },
//             { potential: req.body.potential }, // Update only the potential field
//             { new: true, runValidators: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(updatedUser);
//     } catch (error) {
//         console.error("Error updating user:", error);
//         res.status(500).json({ message: error.message });
//     }
// });






// // Application Schema (models/Application.js)
// const applicationSchema = new mongoose.Schema({
//     player: String, // Username
//     amount: Number,
//     receiveOTPBy: String, // "Phone Number 1" or "Email"
//     // Add other relevant fields (e.g., application status, timestamp)
//     status: { type: String, default: "Pending" }, // Default status
//     timestamp: { type: Date, default: Date.now }, // Timestamp of application
// });

// const Application = mongoose.model('Application', applicationSchema);

// // User Schema (models/User.js -  Include necessary fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     // ... other user fields
//     phoneNumber1: String, // Add phone number field
//     email: String, // Add email field
//     availableBalance: Number,
//     pendingWithdrawal: Number,
//     processingWithdrawal: Number,
// });

// const User = mongoose.model('User', userSchema);


// // Routes (controllers/applicationController.js - In this example, routes are in server.js)

// // Create a new application
// app.post('/api/applications', async (req, res) => {
//     try {
//         const newApplication = new Application(req.body);
//         await newApplication.save();

//         // Optionally, update user's pendingWithdrawal:
//         const user = await User.findOne({ username: req.body.player });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Check if available balance is sufficient
//         if (user.availableBalance < req.body.amount) {
//             return res.status(400).json({ message: 'Insufficient funds' });
//         }

//         user.pendingWithdrawal += req.body.amount;
//         user.availableBalance -= req.body.amount;
//         await user.save();



//         res.status(201).json(newApplication); // 201 Created
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


















// // Bank Account Schema (models/BankAccount.js)
// const bankAccountSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
//     bankName: String,
//     branch: String,
//     holder: String,
//     bankCardNo: String,
//     swiftCode: String,
// });

// const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

// // User Schema (models/User.js -  Include necessary fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     //... other user fields
// });

// const User = mongoose.model('User', userSchema);


// // Routes (controllers/bankAccountController.js - In this example, routes are in server.js)

// // Create bank account info
// app.post('/api/bank-accounts', async (req, res) => {
//     try {
//         const { username, bankName, branch, holder, bankCardNo, swiftCode } = req.body;

//         // Find the user to associate the bank account with
//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const newBankAccount = new BankAccount({
//             user: user._id,
//             bankName,
//             branch,
//             holder,
//             bankCardNo,
//             swiftCode,
//         });

//         await newBankAccount.save();
//         res.status(201).json(newBankAccount);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });






// User Schema (models/User.js -  Include necessary fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     firstName: String,
//     lastName: String,
//     birthday: Date,  // Date type!
//     phoneNumber: String,
//     phoneVerified: { type: Boolean, default: false }, // Verification status
//     email: String,
//     emailVerified: { type: Boolean, default: false }, // Verification status
//     giftPoints: { type: Number, default: 0 }, // Gift Points
//     registrationDate: { type: Date, default: Date.now }, // Registration Date

// });







// Get user profile
// app.get('/api/users/:username', async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.params.username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// Update user profile (example: adding/updating contact info)
// app.put('/api/users/:username', async (req, res) => {
//     try {
//         const updatedUser = await User.findOneAndUpdate(
//             { username: req.params.username },
//             req.body, // Update with the request body (name, birthday, phone, email)
//             { new: true, runValidators: true } // Return updated doc and validate
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(updatedUser);
//     } catch (error) {
//         console.error("Error updating user:", error);
//         res.status(500).json({ message: error.message });
//     }
// });

// Route to verify phone number (example)
// app.put('/api/users/:username/verify-phone', async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.params.username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // In a real app, you would have OTP verification logic here.
//         // For this example, we'll just mark the phone as verified.
//         user.phoneVerified = true;
//         await user.save();

//         res.json({ message: 'Phone number verified successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });











// Betting Record Schema (models/BettingRecord.js)
// const bettingRecordSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
//     platform: String,
//     gameType: String,
//     turnover: Number,
//     profitLoss: Number,
//     date: Date, // Important: Store the bet date!
//     settled: Boolean, // Add a field to track settlement status
//     // ... other relevant betting record fields
// });

const BettingRecord = mongoose.model('BettingRecord', bettingRecordSchema);

// User Schema (models/User.js -  Include necessary fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     // ... other user fields
// });

// const User = mongoose.model('User', userSchema);


// Routes (controllers/bettingRecordController.js - In this example, routes are in server.js)

// Get betting records with filtering
// app.get('/api/betting-records', async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             settled,
//             platforms, // Array of platforms
//             gameTypes, // Array of game types
//             fromDate,
//             toDate,
//             username // Add username for filtering
//         } = req.query;

//         const query = {};

//         if (username) {
//             const user = await User.findOne({ username });
//             if (!user) {
//                 return res.status(404).json({ message: 'User not found' });
//             }
//             query.user = user._id; // Filter by user ID
//         }

//         if (settled !== undefined) {
//             query.settled = settled === 'true'; // Convert string to boolean
//         }

//         if (platforms && platforms.length > 0) {
//             query.platform = { $in: platforms }; // Filter by platforms array
//         }

//         if (gameTypes && gameTypes.length > 0) {
//             query.gameType = { $in: gameTypes }; // Filter by game types array
//         }

//         if (fromDate && toDate) {
//             query.date = {
//                 $gte: new Date(fromDate),
//                 $lte: new Date(toDate),
//             };
//         } else if (fromDate) {
//             query.date = { $gte: new Date(fromDate) };
//         } else if (toDate) {
//             query.date = { $lte: new Date(toDate) };
//         }

//         const bettingRecords = await BettingRecord.find(query)
//             .populate('user', 'username') // Populate user field (if needed)
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ date: -1 }) // Sort by date (newest first)
//             .exec();

//         const totalCount = await BettingRecord.countDocuments(query);

//         res.json({
//             bettingRecords,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });








// MongoDB Connection (REPLACE WITH YOUR CONNECTION STRING)
// mongoose.connect('mongodb://localhost:27017/your_database_name', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ... (Your BettingRecord and User schemas - same as before)

// Routes (controllers/bettingRecordController.js - In this example, routes are in server.js)

// Get betting records with filtering
// app.get('/api/betting-records', async (req, res) => {
//     try {
//       // ... (Your query building logic - same as before)

//       const bettingRecords = await BettingRecord.find(query)
//           .populate('user', 'username') // Populate user field (if needed)
//           .limit(limit * 1)
//           .skip((page - 1) * limit)
//           .sort({ date: -1 }) // Sort by date (newest first)
//           .exec();

//       const totalCount = await BettingRecord.countDocuments(query);

//       res.json({
//           bettingRecords,
//           totalPages: Math.ceil(totalCount / limit),
//           currentPage: parseInt(page),
//       });
//   } catch (err) {
//       res.status(500).json({ message: err.message });
//   }
// });










// Turnover Record Schema (models/TurnoverRecord.js)  - Adjust fields as needed
// const turnoverRecordSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
//     amount: Number, // The turnover amount
//     date: Date, // The date of the turnover
//     status: String, // "Active" or "Completed"
//     // ... any other relevant fields
// });

// const TurnoverRecord = mongoose.model('TurnoverRecord', turnoverRecordSchema);

// User Schema (models/User.js -  Include necessary fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     // ... other user fields
// });

// const User = mongoose.model('User', userSchema);


// Routes (controllers/turnoverRecordController.js - In this example, routes are in server.js)

// Get turnover records with filtering
// app.get('/api/turnover-records', async (req, res) => {
//     try {
//         const { page = 1, limit = 10, status, fromDate, toDate, username } = req.query;

//         const query = {};

//         if (username) {
//             const user = await User.findOne({ username });
//             if (!user) {
//                 return res.status(404).json({ message: 'User not found' });
//             }
//             query.user = user._id;
//         }

//         if (status) {
//             query.status = status;
//         }

//         if (fromDate && toDate) {
//             query.date = {
//                 $gte: new Date(fromDate),
//                 $lte: new Date(toDate),
//             };
//         } else if (fromDate) {
//             query.date = { $gte: new Date(fromDate) };
//         } else if (toDate) {
//             query.date = { $lte: new Date(toDate) };
//         }

//         const turnoverRecords = await TurnoverRecord.find(query)
//             .populate('user', 'username')
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ date: -1 })
//             .exec();

//         const totalCount = await TurnoverRecord.countDocuments(query);

//         res.json({
//             turnoverRecords,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });











// Routes (controllers/transactionRecordController.js - In this example, routes are in server.js)

// Get transaction records with filtering
// app.get('/api/transaction-records', async (req, res) => {
//     try {
//         const { page = 1, limit = 10, status, paymentType, fromDate, toDate, username } = req.query;

//         const query = {};

//         if (username) {
//             const user = await User.findOne({ username });
//             if (!user) {
//                 return res.status(404).json({ message: 'User not found' });
//             }
//             query.user = user._id;
//         }

//         if (status) {
//             query.status = status;
//         }

//         if (paymentType) {
//             query.type = paymentType;
//         }

//         if (fromDate && toDate) {
//             query.txnDate = {
//                 $gte: new Date(fromDate),
//                 $lte: new Date(toDate),
//             };
//         } else if (fromDate) {
//             query.txnDate = { $gte: new Date(fromDate) };
//         } else if (toDate) {
//             query.txnDate = { $lte: new Date(toDate) };
//         }

//         const transactionRecords = await TransactionRecord.find(query)
//             .populate('user', 'username')
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ txnDate: -1 }) // Sort by transaction date
//             .exec();

//         const totalCount = await TransactionRecord.countDocuments(query);

//         res.json({
//             transactionRecords,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });









// Transaction Record Schema (models/TransactionRecord.js - UPDATED)
// const transactionRecordSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     type: String, // "Deposit", "Withdrawal", "Adjustment"
//     amount: Number,
//     status: String, // "Processing", "Rejected", "Approved"
//     txnDate: Date, // Transaction date
//     // Other transaction fields (ADD THESE):
//     transactionId: String,  // Example: A unique transaction ID
//     paymentMethod: String, // e.g., "Bkash", "Nagad", "Credit Card"
//     details: String,       // Any additional details about the transaction
//     fee: Number,           // Transaction fee (if applicable)
//     // ... any other fields you need
// });

// const TransactionRecord = mongoose.model('TransactionRecord', transactionRecordSchema);

// ... (Your User schema remains the same)

// Routes (controllers/transactionRecordController.js - In this example, routes are in server.js)

// Get transaction records with filtering (remains largely the same)
// app.get('/api/transaction-records', async (req, res) => {
//     try {
//         // ... (Your query building and pagination logic - same as before)

//         const transactionRecords = await TransactionRecord.find(query)
//             .populate('user', 'username')
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ txnDate: -1 })
//             .exec();

//         const totalCount = await TransactionRecord.countDocuments(query);

//         res.json({
//             transactionRecords,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });















// User Schema (models/User.js -  Include necessary fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     // ... other user fields
//     referralCode: String, // Unique referral code for each user
//     referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who referred this user
//     totalDeposits: { type: Number, default: 0 },
//     totalTurnover: { type: Number, default: 0 },
//     phoneVerified: { type: Boolean, default: false }, // Verification status
//     friendsInvited: { type: Number, default: 0 },
//     friendsCompleted: { type: Number, default: 0 },

// });

// const User = mongoose.model('User', userSchema);

// Referral Bonus Schema (models/ReferralBonus.js)
// const referralBonusSchema = new mongoose.Schema({
//     referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     bonusAmount: Number,
//     date: { type: Date, default: Date.now },
// });

// const ReferralBonus = mongoose.model('ReferralBonus', referralBonusSchema);

// Routes (controllers/referralController.js - In this example, routes are in server.js)

// Generate referral code (when a user is created)
// app.post('/api/users', async (req, res) => { // Assuming you have a user creation route
//     try {
//         const newUser = new User(req.body);
//         newUser.referralCode = generateUniqueCode(); // Function to generate unique code
//         await newUser.save();
//         res.status(201).json(newUser);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// Get referral info (including QR code and URL)
// app.get('/api/referral/:username', async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.params.username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const baseUrl = `${req.protocol}://${req.get('host')}`; // Base URL of your app
//         const referralURL = `${baseUrl}/register?referral=${user.referralCode}`; // Construct referral URL
//         const qrCodeDataURL = await QRCode.toDataURL(referralURL); // Generate QR code

//         res.json({
//             referralCode: user.referralCode,
//             referralURL,
//             qrCodeDataURL,
//             friendsInvited: user.friendsInvited,
//             friendsCompleted: user.friendsCompleted,
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// Route to handle referral when a user signs up

// Route to handle referral when a user signs up
// app.post('/api/register', async (req, res) => {
//     try {
//         const { referralCode } = req.body; // Get referral code from signup form

//         if (referralCode) {
//             const referrer = await User.findOne({ referralCode });
//             if (referrer) {
//                 // Update referrer's friendsInvited count
//                 referrer.friendsInvited++;
//                 await referrer.save();

//                 // ... (Rest of your signup logic)

//                 // When the referred user completes requirements:
//                 // referrer.friendsCompleted++;
//                 // await referrer.save();
//                 // // Calculate and award bonus
//                 // const bonusAmount = calculateBonus(referrer, referredUser);
//                 // const referralBonus = new ReferralBonus({
//                 //   referrer: referrer._id,
//                 //   referred: referredUser._id,
//                 //   bonusAmount,
//                 // });
//                 // await referralBonus.save();
//             }
//         }
//         res.json({ message: 'Registration successful' }); // or redirect
//     } catch (error) {
//         console.error("Error during registration:", error);
//         res.status(500).json({ message: 'Registration failed' });
//     }
// });


// ... other routes (for updating user data, calculating rebates, etc.)

// Function to generate unique referral code (you'll need a good implementation)
// function generateUniqueCode() {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let code = '';
//     for (let i = 0; i < 6; i++) {
//         code += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return code;
// }

// Function to calculate bonus (implement your logic based on tiers, turnover, etc.)
// function calculateBonus(referrer, referredUser) {
//     // ... your bonus calculation logic ...
//     return 0; // Or the calculated amount
// }















// Bonus Record Schema (models/BonusRecord.js)
// const bonusRecordSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
//     bonusType: String, // "Invitation Bonus", "Achievement Bonus", "Betting Rebates"
//     rewardAmount: Number,
//     status: String, // "Available", "Complete", "Claimed", "Expired", "Rejected"
//     date: Date, // Bonus date
//     // ... other bonus-related fields
// });

const BonusRecord = mongoose.model('BonusRecord', bonusRecordSchema);

// User Schema (models/User.js -  Include necessary fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     // ... other user fields
// });

// const User = mongoose.model('User', userSchema);

// Routes (controllers/bonusRecordController.js - In this example, routes are in server.js)

// Get bonus records with filtering
// app.get('/api/bonus-records', async (req, res) => {
//     try {
//         const { page = 1, limit = 10, bonusType, status, fromDate, toDate, username } = req.query;

//         const query = {};

//         if (username) {
//             const user = await User.findOne({ username });
//             if (!user) {
//                 return res.status(404).json({ message: 'User not found' });
//             }
//             query.user = user._id;
//         }

//         if (bonusType && bonusType !== 'All') {
//             query.bonusType = bonusType;
//         }

//         if (status && status !== 'All') {
//             query.status = status;
//         }

//         if (fromDate && toDate) {
//             query.date = {
//                 $gte: new Date(fromDate),
//                 $lte: new Date(toDate),
//             };
//         } else if (fromDate) {
//             query.date = { $gte: new Date(fromDate) };
//         } else if (toDate) {
//             query.date = { $lte: new Date(toDate) };
//         }

//         const bonusRecords = await BonusRecord.find(query)
//             .populate('user', 'username')
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ date: -1 })
//             .exec();

//         const totalCount = await BonusRecord.countDocuments(query);

//         res.json({
//             bonusRecords,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: parseInt(page),
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });








// User Schema (models/User.js -  Include necessary fields)
// const userSchema = new mongoose.Schema({
//     username: String,
//     // ... other user fields
//     giftPoints: { type: Number, default: 0 },
//     totalTurnover: { type: Number, default: 0 }, // Add total turnover
// });

// const User = mongoose.model('User', userSchema);

// Turnover Record Schema (models/TurnoverRecord.js) - To track eligible turnover
// const turnoverRecordSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     amount: Number, // Eligible turnover amount
//     productType: String, // "Slots", "Lottery", "Sports", "Live Casino", "Table", "Crash"
//     date: Date,
// });

// const TurnoverRecord = mongoose.model('TurnoverRecord', turnoverRecordSchema);


// Routes (controllers/promotionController.js - In this example, routes are in server.js)

// Get user's gift points
// app.get('/api/users/:username/gift-points', async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.params.username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json({ giftPoints: user.giftPoints });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// Update user's gift points (e.g., after redemption)
// app.put('/api/users/:username/gift-points', async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.params.username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         user.giftPoints = req.body.giftPoints; // Update gift points
//         await user.save();
//         res.json({ message: 'Gift points updated' });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// Route to process turnover and award gift points (this would be called after a bet is settled)
// app.post('/api/process-turnover', async (req, res) => {
//     try {
//         const { username, turnoverAmount, productType } = req.body; // Turnover details

//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // 1. Check if the product type is eligible
//         const eligibleProducts = ["Slots", "Lottery", "Sports", "Live Casino", "Table", "Crash"]; // Add all eligible products
//         if (!eligibleProducts.includes(productType)) {
//           return res.status(400).json({ message: "Ineligible product type for gift points."});
//         }

//         // 2. Save the turnover record
//         const newTurnoverRecord = new TurnoverRecord({
//             user: user._id,
//             amount: turnoverAmount,
//             productType,
//             date: new Date(),
//         });
//         await newTurnoverRecord.save();

//         // 3. Calculate gift points based on turnover and product type
//         let giftPoints = 0;
//         if (productType === "Slots" || productType === "Lottery" || productType === "Sports") {
//             giftPoints = Math.floor(turnoverAmount / 1000);
//         } else if (productType === "Live Casino" || productType === "Table" || productType === "Crash") {
//             giftPoints = Math.floor(turnoverAmount / 2000);
//         }

//         // 4. Update user's gift points and total turnover
//         user.giftPoints += giftPoints;
//         user.totalTurnover += turnoverAmount;
//         await user.save();

//         res.json({ message: 'Turnover processed and gift points awarded', giftPoints });
//     } catch (error) {
//         console.error("Error processing turnover:", error);
//         res.status(500).json({ message: error.message });
//     }
// });
















// Game Schema (models/Game.js)
// const gameSchema = new mongoose.Schema({
//     name: String, // e.g., "JILI Fishing", "KA Table", "CQ9 Slots"
//     category: String, // "Fishing", "Table", "Slots" (Use consistent categories)
//     platform: String, // "JILI", "KA", "CQ9", etc.
//     // ... other game-related fields
// });

// const Game = mongoose.model('Game', gameSchema);

// Routes (controllers/gameController.js - In this example, routes are in server.js)

// Get games with filtering
// app.get('/api/games', async (req, res) => {
//     try {
//         const { category, platforms } = req.query; // Filter parameters

//         const query = {};

//         if (category) {
//             query.category = category;
//         }

//         if (platforms && platforms.length > 0) {
//             query.platform = { $in: platforms }; // Filter by platforms (array)
//         }

//         const games = await Game.find(query);
//         res.json(games);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });




// const AgentCommission = mongoose.model('AgentCommission');

// router.get('/commission', async (req, res) => {
//   try {
//     const commissions = await AgentCommission.find(); // You can customize this query to fetch agent-specific data
//     res.render('admin/commission', { commissions });
//   } catch (err) {
//     console.error(err);
//     res.json({ return: false, message: 'Something went wrong' });
//   }
// });



// const mongoose = require('mongoose');

// const DepositSchema = new mongoose.Schema({
//   deposit_id: { type: String, required: true },
//   deposit_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   amount: { type: Number, required: true },
//   status: { type: String, default: '0' }, // '0' - Pending, '1' - Accepted, '2' - Rejected
// });

// module.exports = mongoose.model('Deposit', DepositSchema);