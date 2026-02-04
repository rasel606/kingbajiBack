// const Joi = require('joi');

// const bonusValidation = Joi.object({
//   name: Joi.string().required().max(100),
//   description: Joi.string().required(),
  
//   howtoClaim: Joi.object().pattern(
//     Joi.string().pattern(/^step\d+$/),
//     Joi.string().allow('')
//   ).default({}),
  
//   howtoUse: Joi.object().pattern(
//     Joi.string().pattern(/^step\d+$/),
//     Joi.string().allow('')
//   ).default({}),
  
//   terms: Joi.object().pattern(
//     Joi.string().pattern(/^step\d+$/),
//     Joi.string().allow('')
//   ).default({}),
  
//   bonusType: Joi.string().valid(
//     'deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral', 'other',
//     'referralRebate', 'normalDeposit', 'signup', 'birthday', 'welcomeBonus',
//     'firstDeposit', 'freeSpins', 'freeSpinsDaily', 'freeSpinsWeekly',
//     'freeSpinsMonthly', 'freeSpinsYearly', 'freeSpinsLifetime', 'adminCut'
//   ).required(),
  
//   level1Percent: Joi.number().min(0).max(100),
//   level2Percent: Joi.number().min(0).max(100),
//   level3Percent: Joi.number().min(0).max(100),
  
//   img: Joi.string().uri().allow(''),
  
//   percentage: Joi.number().min(0).max(1000),
//   fixedAmount: Joi.number().min(0),
//   minDeposit: Joi.number().min(0).default(0),
//   maxBonus: Joi.number().min(0),
//   minTurnover: Joi.number().min(0).default(0),
//   maxTurnover: Joi.number().min(0),
//   wageringRequirement: Joi.number().min(0).default(1),
//   validDays: Joi.number().min(1).default(30),
  
//   eligibleGames: Joi.array().items(Joi.string()),
  
//   cetegory: Joi.array().items(Joi.string()).default([]),
  
//   isActive: Joi.boolean().default(true),
//   startDate: Joi.date().default(Date.now),
//   endDate: Joi.date().greater(Joi.ref('startDate')).allow(null)
// });

// const validateBonus = (req, res, next) => {
//   const { error, value } = bonusValidation.validate(req.body, {
//     abortEarly: false,
//     stripUnknown: true,
//     convert: true
//   });
  
//   if (error) {
//     const errors = error.details.map(detail => ({
//       field: detail.path.join('.'),
//       message: detail.message.replace(/"/g, ''),
//       type: detail.type
//     }));
    
//     return res.status(400).json({
//       success: false,
//       message: 'Validation error',
//       errors
//     });
//   }
  
//   req.validatedData = value;
//   next();
// };

// const validatePartialBonus = (req, res, next) => {
//   const partialSchema = bonusValidation.fork(
//     Object.keys(bonusValidation.describe().keys),
//     (schema) => schema.optional()
//   );
  
//   const { error, value } = partialSchema.validate(req.body, {
//     abortEarly: false,
//     stripUnknown: true,
//     convert: true
//   });
  
//   if (error) {
//     const errors = error.details.map(detail => ({
//       field: detail.path.join('.'),
//       message: detail.message.replace(/"/g, ''),
//       type: detail.type
//     }));
    
//     return res.status(400).json({
//       success: false,
//       message: 'Validation error',
//       errors
//     });
//   }
  
//   req.validatedData = value;
//   next();
// };

// const validateQuery = Joi.object({
//   q: Joi.string().allow(''),
//   bonusType: Joi.string().allow(''),
//   isActive: Joi.string().valid('true', 'false', '').default(''),
//   cetegory: Joi.string().allow(''),
//   page: Joi.number().min(1).default(1),
//   limit: Joi.number().min(1).max(100).default(10),
//   sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'bonusType', 'isActive').default('createdAt'),
//   sortOrder: Joi.string().valid('asc', 'desc').default('desc')
// });

// const validateBonusQuery = (req, res, next) => {
//   const { error, value } = validateQuery.validate(req.query, {
//     abortEarly: false,
//     stripUnknown: true,
//     convert: true
//   });
  
//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid query parameters',
//       errors: error.details.map(detail => ({
//         field: detail.path.join('.'),
//         message: detail.message.replace(/"/g, '')
//       }))
//     });
//   }
  
//   req.query = value;
//   next();
// };

// module.exports = {
//   validateBonus,
//   validatePartialBonus,
//   validateBonusQuery,
//   bonusValidation
// };

const Joi = require('joi');

const stepSchema = Joi.object({
  title: Joi.string().allow(''),
  description: Joi.string().allow(''),
  order: Joi.number()
});

exports.bonusCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().required(),

  howtoClaim: Joi.array().items(stepSchema),
  howtoUse: Joi.array().items(stepSchema),
  terms: Joi.array().items(stepSchema),

  bonusType: Joi.string().required(),

  percentage: Joi.number().min(0).max(100),
  fixedAmount: Joi.number().min(0),

  minDeposit: Joi.number().min(0),
  maxBonus: Joi.number().min(0),

  wageringRequirement: Joi.number().min(0),
  validDays: Joi.number().min(1),

  eligibleGames: Joi.array().items(
    Joi.object({
      g_code: Joi.string().required(),
      p_code: Joi.string().required(),
      g_type: Joi.string().required()
    })
  ),

  category: Joi.array().items(
    Joi.string().valid('casino','sports','live','slots','poker','lottery','all')
  ),

  isActive: Joi.boolean(),
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref('startDate'))
});

exports.bonusUpdateSchema = exports.bonusCreateSchema.fork(
  Object.keys(exports.bonusCreateSchema.describe().keys),
  schema => schema.optional()
);
