// // // var jwt = require('jsonwebtoken');
// // // const CreateService = async (req, dataModel) => {
// // //     let reqBody = req.body;

// // // console.log(reqBody)
// // //     let datas = await dataModel.findOne({ email: req.body.email })


// // //     if (!datas) {

// // //         const { userId, phone, password ,countryCode,referredbyCode} = req.body;
// // //     console.log(req.body)
// // //     try {
        
// // //         // const hashedPassword = await bcrypt.hash(password, 10);
// // //       const referredCode = Math.random().toString(36).substring(2, 8);
// // //       const newUser = await dataModel.create({
// // //         userId,
// // //         phone,
// // //         countryCode,
// // //         password, // Hash this in production
// // //         referredbyCode: referredbyCode || null,
// // //         referredCode,
// // //         referredLink: `http://localhost:3000/${referredCode}`,
// // //       });

      
// // //      console.log("newUser",newUser)
// // //      if(!newUser){
// // //         const user =  await dataModel.aggregate([
// // //             { $match: { userId } },
// // //             {
// // //               $project: {
// // //                 userId: 1,
// // //                 name: 1,
// // //                 phone: 1,
// // //                 countryCode:1,
// // //                 balance: 1,
// // //                 referredbyCode:1,
// // //                 referredLink:1,
// // //                 referredCode:1
// // //               },
// // //             },
// // //           ]);



// // //           console.log(user[0].userId);
// // //           const token = jwt.sign({ id: user[0].userId }, "Kingbaji", { expiresIn: '1h' });
// // //           console.log(token)
// // //           return res.status(201).json({message: "Ac created successfully",token,user: user[0],
            
// // //           });
// // //      }else{
// // //           return  res.status(500).json({ error: error.message });
// // //      }

      



      

// // //     //   const token = jwt.sign({ id: user[0].userId }, "Kingbaji", { expiresIn: '1h' });

// // //     //   res.status(201).json({
// // //     //     message: "User created successfully",
// // //     //     token,
// // //     //     user: user[0],
        
// // //     //   });
// // //     } catch (error) {
// // //       res.status(500).json({ error: error.message });
// // //     }
// // //   }

// // // }
// // // module.exports = CreateService 


// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const AppError = require('../utils/appError');

// // const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

// // const generateToken = (userId) => {
// //   return jwt.sign({ userId }, JWT_SECRET, {
// //     expiresIn: process.env.JWT_EXPIRES_IN || '1d',
// //   });
// // };

// // const CreateService = async (req, dataModel) => {
// //   const { userId, email, mobile, password} = req.body;

// //   // 1. Check if user exists
// //   const existingUser = await dataModel.findOne({
// //     $or: [{ email }, { userId }]
// //   });

// //   if (existingUser) {
// //     throw new AppError('User already exists with this email or userId', 400);
// //   }

// //   // 2. Hash password (schema pre-save hook is better, but we’ll hash here if not used)
// //   const hashedPassword = await bcrypt.hash(password, 10);

// //   // 3. Generate unique referral code
// //   let referredCode;
// //   let isUnique = false;
// //   while (!isUnique) {
// //     referredCode = Math.random().toString(36).substring(2, 8).toUpperCase();
// //     const exists = await dataModel.findOne({ referredCode });
// //     if (!exists) isUnique = true;
// //   }

// //   // 4. Create user
// //   const newUser = await dataModel.create({
// //     userId,
// //     email,
// //     phone,
// //     countryCode,
// //     password: hashedPassword,
// //     referredbyCode: referredbyCode || null,
// //     referredCode,
// //     referredLink: `http://localhost:3000/${referredCode}`,
// //   });

// //   // 5. Return user data + token
// //   return {
// //     userId: newUser.userId,
// //     email: newUser.email,
// //     phone: newUser.phone,
// //     countryCode: newUser.countryCode,
// //     referredCode: newUser.referredCode,
// //     referredLink: newUser.referredLink,
// //     token: generateToken(newUser.userId),
// //   };
// // };

// // module.exports = { CreateService };


// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const AppError = require('../utils/appError');

// const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

// const generateToken = (userId) => {
//   return jwt.sign({ userId }, JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || '1d',
//   });
// };

// const CreateService = async (req, dataModel) => {
//   const { userId, email, mobile, password } = req.body;

//   // 1. Check if user exists
//   const existingUser = await dataModel.findOne({
//     $or: [{ email }, { userId }]
//   });

//   if (existingUser) {
//     throw new AppError('User already exists with this email or userId', 400);
//   }

//   // 2. Hash password (schema pre-save hook is better, but we’ll hash here if not used)
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // 3. Generate unique referral code
//   let referredCode;
//   let isUnique = false;
//   while (!isUnique) {
//     referredCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//     const exists = await dataModel.findOne({ referredCode });
//     if (!exists) isUnique = true;
//   }

//   // 4. Create user
//   const newUser = await dataModel.create({
//     userId,
//     email,
//     mobile,
//     countryCode,
//     password: hashedPassword,
//     referredCode,

//   });

//   // 5. Return user data + token
//   return {
//     userId: newUser.userId,
//     email: newUser.email,
//     mobile: newUser.mobile,
//     token: generateToken(newUser.userId),
//   };
// };

// module.exports = { CreateService };



const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');

const JWT_SECRET =  "Kingbaji";

const generateToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const createUser = async (req, dataModel) => {
  const { userId, email, password, mobile,refeeredBy } = req.body;

  // Check if user exists
  const existingUser = await dataModel.findOne({ $or: [{ email }, { userId }] });
  console.log(existingUser);
  if (existingUser) {
    throw new AppError("User already exists with this email or userId", 400);
  }

  // Hash password (schema pre-save will do it if implemented)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate unique referral code
  let referredCode;
  let isUnique = false;
  while (!isUnique) {
    referredCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const exists = await dataModel.findOne({ referredCode });
    if (!exists) isUnique = true;
  }

    
  // Create user
  const newUser = await dataModel.create({
    userId:referredCode,
    email,
    mobile,
    password: hashedPassword, // safe
    referredCode,
    refeeredBy
  });

  // Return response object
  return {
    message: "User created successfully",
    data: {
      userId: newUser.userId,
      email: newUser.email,
      mobile: newUser.mobile,
      referredCode: newUser.referredCode,
      token: generateToken(newUser.email),
    },
    success: true,
    
  };
};

module.exports = { createUser };
