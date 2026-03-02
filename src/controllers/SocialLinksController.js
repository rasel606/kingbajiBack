// controllers/SocialLinksController.js
const SocialLink = require('../models/SocialLink');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Get all social links
exports.getAllSocialLinks = catchAsync(async (req, res, next) => {
  const socialLinks = await SocialLink.find().populate('user', 'firstName lastName email');
  
  res.status(200).json({
    status: 'success',
    data: socialLinks,
    count: socialLinks.length
  });
});

// Get social links by ID
exports.getSocialLink = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const socialLink = await SocialLink.findById(id).populate('user', 'firstName lastName email');
  
  if (!socialLink) {
    return next(new AppError('Social link not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: socialLink
  });
});

// Get current user's social links
exports.getMyLink = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;
  const socialLink = await SocialLink.findOne({ user: userId });
  
  if (!socialLink) {
    return next(new AppError('Social link not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: socialLink
  });
});

// Create social link
exports.createSocialLink = catchAsync(async (req, res, next) => {
  const { telegram, facebook, email, whatsapp, twitter, instagram, linkedin, youtube, platform, url } = req.body;
  const userId = req.user.userId || req.user._id;

  // Check if social link already exists for this user
  let socialLink = await SocialLink.findOne({ user: userId });

  if (socialLink) {
    return next(new AppError('Social link already exists for this user. Use update endpoint instead', 409));
  }

  // Handle both old format (individual fields) and new format (platform/url)
  let createData = { user: userId };
  
  if (platform && url) {
    // New format
    createData[platform.toLowerCase()] = url;
  } else {
    // Old format
    if (telegram) createData.telegram = telegram;
    if (facebook) createData.facebook = facebook;
    if (email) createData.email = email;
    if (whatsapp) createData.whatsapp = whatsapp;
    if (twitter) createData.twitter = twitter;
    if (instagram) createData.instagram = instagram;
    if (linkedin) createData.linkedin = linkedin;
    if (youtube) createData.youtube = youtube;
  }

  socialLink = await SocialLink.create(createData);

  res.status(201).json({
    status: 'success',
    message: 'Social link created successfully',
    data: socialLink
  });
});

// Update social link
exports.updateSocialLink = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { telegram, facebook, email, whatsapp, twitter, instagram, linkedin, youtube, platform, url } = req.body;

  let socialLink = await SocialLink.findById(id);

  if (!socialLink) {
    return next(new AppError('Social link not found', 404));
  }

  // Update specific fields if provided
  if (platform && url) {
    socialLink[platform.toLowerCase()] = url;
  } else {
    if (telegram !== undefined) socialLink.telegram = telegram;
    if (facebook !== undefined) socialLink.facebook = facebook;
    if (email !== undefined) socialLink.email = email;
    if (whatsapp !== undefined) socialLink.whatsapp = whatsapp;
    if (twitter !== undefined) socialLink.twitter = twitter;
    if (instagram !== undefined) socialLink.instagram = instagram;
    if (linkedin !== undefined) socialLink.linkedin = linkedin;
    if (youtube !== undefined) socialLink.youtube = youtube;
  }

  await socialLink.save();

  res.status(200).json({
    status: 'success',
    message: 'Social link updated successfully',
    data: socialLink
  });
});

// Delete social link
exports.deleteSocialLink = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const socialLink = await SocialLink.findByIdAndDelete(id);

  if (!socialLink) {
    return next(new AppError('Social link not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Social link deleted successfully'
  });
});

// Update social link platform
exports.updateSocialLinkPlatform = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;
  const { platform, url } = req.body;

  if (!platform || !url) {
    return next(new AppError('Platform and URL are required', 400));
  }

  let socialLink = await SocialLink.findOne({ user: userId });

  if (!socialLink) {
    // Create new if doesn't exist
    socialLink = await SocialLink.create({
      user: userId,
      [platform.toLowerCase()]: url
    });
  } else {
    socialLink[platform.toLowerCase()] = url;
    await socialLink.save();
  }

  res.status(200).json({
    status: 'success',
    message: `${platform} link updated successfully`,
    data: socialLink
  });
});
