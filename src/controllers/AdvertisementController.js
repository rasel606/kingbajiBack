import mongoose from 'mongoose';
import Advertisement from '../models/Advertisement.js';
// import Game from '../models/Game.js'; // Missing model - commented

const controllerWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAdvertisements = controllerWrapper(async (req, res) => {
  const ads = await Advertisement.find({}).sort({ priority: -1, createdAt: -1 }).populate('gameId', 'name icon');
  res.json({ success: true, data: ads });
});

export const getAdvertisementById = controllerWrapper(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id).populate('gameId', 'name icon');
  if (!ad) {
    return res.status(404).json({ success: false, message: 'Advertisement not found' });
  }
  res.json({ success: true, data: ad });
});

export const createAdvertisement = controllerWrapper(async (req, res) => {
  const adData = { 
    ...req.body,
    createdBy: req.user?.email || req.user?.userId || 'admin'
  };
  const ad = new Advertisement(adData);
  await ad.save();
  const populatedAd = await Advertisement.findById(ad._id).populate('gameId');
  res.status(201).json({ success: true, data: populatedAd });
});

export const updateAdvertisement = controllerWrapper(async (req, res) => {
  const ad = await Advertisement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('gameId');
  if (!ad) {
    return res.status(404).json({ success: false, message: 'Advertisement not found' });
  }
  res.json({ success: true, data: ad });
});

export const deleteAdvertisement = controllerWrapper(async (req, res) => {
  const ad = await Advertisement.findByIdAndDelete(req.params.id);
  if (!ad) {
    return res.status(404).json({ success: false, message: 'Advertisement not found' });
  }
  res.json({ success: true, message: 'Advertisement deleted' });
});

export const toggleAdvertisementActive = controllerWrapper(async (req, res) => {
  const ad = await Advertisement.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: !req.body.isActive } },
    { new: true }
  ).populate('gameId');
  res.json({ success: true, data: ad });
});

export const getGamesForAd = controllerWrapper(async (req, res) => {
  const games = await Game.find({ isActive: true });
  res.json({ success: true, data: games });
});

