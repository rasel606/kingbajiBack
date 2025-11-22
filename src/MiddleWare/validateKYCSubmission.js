const validateKYCSubmission = (req, res, next) => {
  const { type, documentType, documentNo, frontImage } = req.body;
  
  if (!type || !['identity', 'address'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid KYC type'
    });
  }
  
  if (!documentType) {
    return res.status(400).json({
      success: false,
      message: 'Document type is required'
    });
  }
  
  if (!documentNo) {
    return res.status(400).json({
      success: false,
      message: 'Document number is required'
    });
  }
  
  if (!frontImage) {
    return res.status(400).json({
      success: false,
      message: 'Front image is required'
    });
  }
  
  next();
};

module.exports = { validateKYCSubmission };