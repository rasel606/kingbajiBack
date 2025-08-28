const Bank = require('../Models/Bank');


// @desc    Get all banks for affiliate
// @route   GET /api/bank
// @access  Private
exports.getBanks = async (req, res, next) => {
  try {
    const banks = await Bank.find({ affiliate: req.user.id });
    res.status(200).json({
      success: true,
      count: banks.length,
      data: banks
    });
  }  catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// @desc    Add new bank account
// @route   POST /api/bank
// @access  Private
exports.addBank = async (req, res, next) => {
  try {
    const { bankName, bankBranch, bankHolder, bankCardNo, swiftCode } = req.body;
    
    const bank = await Bank.create({
      affiliate: req.user.id,
      bankName,
      bankBranch,
      bankHolder,
      bankCardNo,
      swiftCode
    });
    
    res.status(201).json({
      success: true,
      data: bank
    });
  }  catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// @desc    Update bank account
// @route   PUT /api/bank/:id
// @access  Private
exports.updateBank = async (req, res, next) => {
  try {
    let bank = await Bank.findById(req.params.id);
    
    if (!bank) {
      return next(new ErrorResponse(`Bank not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure affiliate owns the bank account
    if (bank.affiliate.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to update this bank account`, 401));
    }
    
    bank = await Bank.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: bank
    });
  }  catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// @desc    Delete bank account
// @route   DELETE /api/bank/:id
// @access  Private
exports.deleteBank = async (req, res, next) => {
  try {
    const bank = await Bank.findById(req.params.id);
    
    if (!bank) {
      return next(new ErrorResponse(`Bank not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure affiliate owns the bank account
    if (bank.affiliate.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to delete this bank account`, 401));
    }
    
    await bank.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  }  catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};