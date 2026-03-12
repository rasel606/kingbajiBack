import mongoose from 'mongoose';
import Banner from '../models/Banner.js';
import Promotion from '../models/PromotionSchema.js';

const controllerWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getBanners = controllerWrapper(async (req, res) => {
  const banners = await Banner.find({}).populate('promotionId', 'name bonusAmount startDate endDate');
  res.json({ success: true, data: banners });
});

export const getBannerById = controllerWrapper(async (req, res) => {
  const banner = await Banner.findById(req.params.id).populate('promotionId', 'name bonusAmount startDate endDate');
  if (!banner) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }
  res.json({ success: true, data: banner });
});

export const createBanner = controllerWrapper(async (req, res) => {
  const bannerData = { 
    ...req.body,
    createdBy: req.user?.email || req.user?.userId || 'admin'
  };
  const banner = new Banner(bannerData);
  await banner.save();
  const populatedBanner = await Banner.findById(banner._id).populate('promotionId', 'name bonusAmount startDate endDate');
  res.status(201).json({ success: true, data: populatedBanner });
});

export const updateBanner = controllerWrapper(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('promotionId', 'name bonusAmount startDate endDate');
  if (!banner) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }
  res.json({ success: true, data: banner });
});

export const deleteBanner = controllerWrapper(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }
  res.json({ success: true, message: 'Banner deleted' });
});

export const toggleBannerActive = controllerWrapper(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: !req.body.isActive } },
    { new: true }
  ).populate('promotionId');
  res.json({ success: true, data: banner });
});

export const getPromotionsForBanner = controllerWrapper(async (req, res) => {
  const promotions = await Promotion.find({ isActive: true });
  res.json({ success: true, data: promotions });
});
