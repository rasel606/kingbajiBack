
const Bonus = require('../Models/Bonus');


// Create a new bonus
exports.createBonus = async (req, res) => {
  try {
    const {
      name,
      description,
      bonusType,
      img,
      percentage,
      fixedAmount,
      minDeposit,
      maxBonus,
      wageringRequirement,
      validDays,
      eligibleGames,
      isActive,
      startDate,
      endDate,
    } = req.body;

    // Create new Bonus document
    const bonus = new Bonus({
      name,
      description,
      bonusType,
      img,
      percentage,
      fixedAmount,
      minDeposit,
      maxBonus,
      wageringRequirement,
      validDays,
      eligibleGames,
      isActive,
      startDate,
      endDate,
    });

    // Save to DB
    const savedBonus = await bonus.save();

    return res.status(201).json({
      success: true,
      message: 'Bonus created successfully',
      data: savedBonus
    });
  } catch (error) {
    console.error('Error creating bonus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create bonus',
      error: error.message
    });
  }
}



// GET /api/bonuses
exports.getAllBonuses = async (req, res) => {
  try {
    const bonuses = await Bonus.find({
      $or: [
        { status: { $ne: "isActive" } },
        { bonusType: "normalDeposit" } // always include normalDeposit
      ],
      bonusType: {
        $in: ['deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral', 'other', 'referralRebate', 'normalDeposit', 'signup', 'birthday']
      }
    });
    res.json({
      success: true,
      data: bonuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bonuses',
      error: error.message
    });
  }
}
// exports.getAllBonuses = async (req, res) => {
//   try {
//     const bonuses = await Bonus.find({ isActive: true, bonusType: { $in: ['deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral', 'other', 'referralRebate', 'signup', 'birthday'] } });
//     res.json({
//       success: true,
//       data: bonuses
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch bonuses',
//       error: error.message
//     });
//   }
// }


exports.getBonuses = async (req, res, next) => {
  try {
    const {
      bonusType,
      isActive,
      page = 1,
      limit = 20,
      cetegory
    } = req.query;
    const userId = req.user.userId

    const filter = {};
    // if (q) {
    //   // simple text search over name/description
    //   filter.$or = [
    //     { name: { $regex: q, $options: "i" } },
    //     { description: { $regex: q, $options: "i" } },
    //   ];
    // }
    if (bonusType) filter.bonusType = bonusType;
    if (cetegory) filter.cetegory = cetegory;
    if (userId) filter.cetegory = cetegory;

    if (isActive !== undefined) filter.isActive = isActive === "true";


    const skip = (Math.max(Number(page), 1) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Bonus.find(filter)
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Bonus.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit) || 1),
    });
  } catch (err) {
    next(err);
  }
};

// Get single
exports.getBonusById = async (req, res, next) => {
  try {
    const bonus = await Bonus.findById(req.params.id);
    if (!bonus) {
      res.status(404);
      throw new Error("Bonus not found");
    }
    res.json(bonus);
  } catch (err) {
    next(err);
  }
};

// Update
exports.updateBonus = async (req, res, next) => {
  try {
    // Validate partial update: allow missing required fields but validate types
    const partialSchema = bonusValidation.fork(Object.keys(bonusValidation.describe().keys), (schema) => schema.optional());
    const { error, value } = partialSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400);
      throw error;
    }

    const bonus = await Bonus.findByIdAndUpdate(req.params.id, { $set: value, updatedAt: Date.now() }, { new: true });
    if (!bonus) {
      res.status(404);
      throw new Error("Bonus not found");
    }

    res.json(bonus);
  } catch (err) {
    next(err);
  }
};

// Delete
exports.deleteBonus = async (req, res, next) => {
  try {
    const bonus = await Bonus.findByIdAndDelete(req.params.id);
    if (!bonus) {
      res.status(404);
      throw new Error("Bonus not found");
    }
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
};

// Optional: upload to ImgBB (server-side)
// expects multipart/form-data with field "image" (file). Returns { url }
exports.imgbbUpload = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      res.status(500);
      throw new Error("IMGBB_API_KEY not configured in server");
    }

    // convert buffer to base64
    const base64 = req.file.buffer.toString("base64");

    const form = new URLSearchParams();
    form.append("key", apiKey);
    form.append("image", base64);

    const response = await axios.post("https://api.imgbb.com/1/upload", form.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    });

    if (response.data && response.data.data && response.data.data.url) {
      res.json({ url: response.data.data.url, data: response.data.data });
    } else {
      res.status(500);
      throw new Error("ImgBB upload failed");
    }
  } catch (err) {
    next(err);
  }
};




// // GET /api/bonuses
// exports.getAllBonuses =  async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const now = new Date();

//     // Step 1: Get all system-wide active bonuses (not expired)
//     const allBonuses = await Bonus.find({
//       isActive: true,
//       endDate: { $gt: now }
//     });

//     // ❌ No userId? Return all active bonuses
//     if (!userId) {
//       return res.status(200).json({
//         success: true,
//         message: 'All active bonuses retrieved successfully',
//         availableBonuses: allBonuses,
//         count: allBonuses.length
//       });
//     }

//     // ✅ If userId exists: get user's active and unexpired bonuses
//     const userBonuses = await UserBonus.find({
//       userId,
//       expiryDate: { $gt: now }
//     });

//     // Get claimed bonusId list
//     const claimedBonusIds = userBonuses.map(b => b.bonusId.toString());

//     // Filter out bonuses already claimed
//     const availableBonuses = allBonuses.filter(bonus =>
//       !claimedBonusIds.includes(bonus._id.toString())
//     );

//     return res.status(200).json({
//       success: true,
//       message: availableBonuses.length
//         ? 'Available bonuses retrieved successfully'
//         : 'No new bonuses available for this user',
//       availableBonuses,
//       count: availableBonuses.length
//     });

//   } catch (error) {
//     console.error('checkAvailableBonuses error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message
//     });
//   }
// };




// const Bonus = require('../Models/Bonus');
// const axios = require('axios');

// // Validation (you'll need to implement this based on your schema)
// const bonusValidation = {
//   // Add your validation logic here
// };

// // Constants
// const BONUS_TYPES = [
//   'deposit', 'dailyRebate', 'weeklyBonus', 'vip', 'referral', 
//   'other', 'referralRebate', 'normalDeposit', 'signup', 'birthday'
// ];

// const DEFAULT_PAGINATION = {
//   page: 1,
//   limit: 20
// };

// // Create a new bonus
// exports.createBonus = async (req, res) => {
//   try {
//     const bonus = new Bonus({
//       ...req.body,
//       // Ensure dates are properly formatted
//       startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
//       endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
//     });

//     const savedBonus = await bonus.save();

//     return res.status(201).json({
//       success: true,
//       message: 'Bonus created successfully',
//       data: savedBonus
//     });
//   } catch (error) {
//     console.error('Error creating bonus:', error);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         error: error.message
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Failed to create bonus',
//       error: error.message
//     });
//   }
// };

// // Get all active bonuses (public endpoint)
// exports.getAllBonuses = async (req, res) => {
//   try {
//     const now = new Date();
    
//     const bonuses = await Bonus.find({
//       $or: [
//         { isActive: true, endDate: { $gt: now } },
//         { bonusType: "normalDeposit" }
//       ],
//       bonusType: { $in: BONUS_TYPES }
//     }).select('-__v').sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       data: bonuses,
//       count: bonuses.length
//     });
//   } catch (error) {
//     console.error('Error fetching bonuses:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch bonuses',
//       error: error.message
//     });
//   }
// };

// // Get bonuses with filtering and pagination (admin endpoint)
// exports.getBonuses = async (req, res) => {
//   try {
//     const {
//       bonusType,
//       isActive,
//       category,
//       page = DEFAULT_PAGINATION.page,
//       limit = DEFAULT_PAGINATION.limit,
//       sortBy = 'createdAt',
//       sortOrder = 'desc'
//     } = req.query;

//     const filter = {};
    
//     // Build filter conditions
//     if (bonusType) filter.bonusType = bonusType;
//     if (category) filter.category = category;
//     if (isActive !== undefined) {
//       filter.isActive = isActive === 'true';
//     }

//     const skip = (Math.max(Number(page), 1) - 1) * Number(limit);
//     const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

//     const [items, total] = await Promise.all([
//       Bonus.find(filter)
//         .sort(sort)
//         .skip(skip)
//         .limit(Number(limit))
//         .lean(),
//       Bonus.countDocuments(filter)
//     ]);

//     res.json({
//       success: true,
//       data: {
//         items,
//         total,
//         page: Number(page),
//         limit: Number(limit),
//         pages: Math.ceil(total / Number(limit))
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching paginated bonuses:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch bonuses',
//       error: error.message
//     });
//   }
// };

// // Get single bonus by ID
// exports.getBonusById = async (req, res) => {
//   try {
//     const bonus = await Bonus.findById(req.params.id);
    
//     if (!bonus) {
//       return res.status(404).json({
//         success: false,
//         message: 'Bonus not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: bonus
//     });
//   } catch (error) {
//     console.error('Error fetching bonus:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid bonus ID'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch bonus',
//       error: error.message
//     });
//   }
// };

// // Update bonus
// exports.updateBonus = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Add updatedAt timestamp
//     const updateData = {
//       ...req.body,
//       updatedAt: new Date()
//     };

//     const bonus = await Bonus.findByIdAndUpdate(
//       id, 
//       updateData, 
//       { new: true, runValidators: true }
//     );

//     if (!bonus) {
//       return res.status(404).json({
//         success: false,
//         message: 'Bonus not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Bonus updated successfully',
//       data: bonus
//     });
//   } catch (error) {
//     console.error('Error updating bonus:', error);
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         error: error.message
//       });
//     }

//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid bonus ID'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Failed to update bonus',
//       error: error.message
//     });
//   }
// };

// // Delete bonus
// exports.deleteBonus = async (req, res) => {
//   try {
//     const bonus = await Bonus.findByIdAndDelete(req.params.id);
    
//     if (!bonus) {
//       return res.status(404).json({
//         success: false,
//         message: 'Bonus not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Bonus deleted successfully',
//       data: { id: req.params.id }
//     });
//   } catch (error) {
//     console.error('Error deleting bonus:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid bonus ID'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete bonus',
//       error: error.message
//     });
//   }
// };

// // Image upload to ImgBB
// exports.imgbbUpload = async (req, res) => {
//   try {
//     if (!req.file || !req.file.buffer) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }

//     const apiKey = process.env.IMGBB_API_KEY;
//     if (!apiKey) {
//       return res.status(500).json({
//         success: false,
//         message: 'Image upload service not configured'
//       });
//     }

//     const base64 = req.file.buffer.toString('base64');
//     const form = new URLSearchParams();
//     form.append('key', apiKey);
//     form.append('image', base64);

//     const response = await axios.post('https://api.imgbb.com/1/upload', form, {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       timeout: 30000
//     });

//     if (response.data?.data?.url) {
//       res.json({
//         success: true,
//         data: {
//           url: response.data.data.url,
//           ...response.data.data
//         }
//       });
//     } else {
//       throw new Error('ImgBB upload failed - no URL returned');
//     }
//   } catch (error) {
//     console.error('Image upload error:', error);
    
//     if (error.response) {
//       // ImgBB API error
//       return res.status(error.response.status).json({
//         success: false,
//         message: 'Image upload service error',
//         error: error.response.data?.error?.message || error.message
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Failed to upload image',
//       error: error.message
//     });
//   }
// };