const KYCModal = require('../models/KYCModal');
const { uploadToImageBB } = require('../utils/imageUpload');

// Get KYC data for a user
const getKYCData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("userId getKYCData",userId);
    const identityKYC = await KYCModal.findOne({ userId, type: 'identity' });
    const addressKYC = await KYCModal.findOne({ userId, type: 'address' });
    
    res.json({
      success: true,
      data: {
        identity: identityKYC || null,
        address: addressKYC || null
      }
    });
  } catch (error) {
    console.error('Get KYC data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC data'
    });
  }
};

// Submit KYC data
const submitKYC = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("userId",userId);
    const { type, documentType, documentNo, expiryDate } = req.body;
    
    // Check if KYC already exists for this type
    const existingKYC = await KYC.findOne({ userId, type });
    if (existingKYC && ['pending', 'verified'].includes(existingKYC.status)) {
      return res.status(400).json({
        success: false,
        message: `KYC for ${type} already exists`
      });
    }
    
    // Upload images to ImageBB
    let frontImageData, backImageData, otherImageData;
    
    try {
      if (req.body.frontImage) {
        frontImageData = await uploadToImageBB(req.body.frontImage, `${userId}_${type}_front`);
      }
      
      if (req.body.backImage) {
        backImageData = await uploadToImageBB(req.body.backImage, `${userId}_${type}_back`);
      }
      
      if (req.body.otherImage) {
        otherImageData = await uploadToImageBB(req.body.otherImage, `${userId}_${type}_other`);
      }
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload images'
      });
    }
    
    // Create or update KYC record
    const kycData = {
      userId,
      type,
      documentType,
      documentNo,
      expiryDate: expiryDate || null,
      frontImage: frontImageData || null,
      backImage: backImageData || null,
      otherImage: otherImageData || null,
      status: 'pending',
      submittedAt: new Date()
    };
    
    let kycRecord;
    if (existingKYC) {
      kycRecord = await KYC.findByIdAndUpdate(existingKYC._id, kycData, { new: true });
    } else {
      kycRecord = await KYC.create(kycData);
    }
    
    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully',
      data: kycRecord
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit KYC'
    });
  }
};

// Admin: Get all KYC submissions
const getAllKYC = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const kycs = await KYC.find(query)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await KYC.countDocuments(query);
    
    res.json({
      success: true,
      data: kycs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC submissions'
    });
  }
};

// Admin: Update KYC status
const updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const reviewedBy = req.user.id;
    console.log("req.body",req.body);
    const kyc = await KYC.findById(id);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC record not found'
      });
    }
    
    kyc.status = status;
    kyc.rejectionReason = rejectionReason || '';
    kyc.reviewedAt = new Date();
    kyc.reviewedBy = reviewedBy;
    
    await kyc.save();
    
    res.json({
      success: true,
      message: `KYC ${status} successfully`,
      data: kyc
    });
  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update KYC status'
    });
  }
};

module.exports = {
  getKYCData,
  submitKYC,
  getAllKYC,
  updateKYCStatus
};