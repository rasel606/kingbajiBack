const mongoose = require('mongoose');
const Banner = require('../models/Banner');
const Promotion = require('../models/PromotionSchema');

const parseBoolean = (value) => {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		if (value.toLowerCase() === 'true') return true;
		if (value.toLowerCase() === 'false') return false;
	}
	return undefined;
};

const getBanners = async (req, res) => {
	try {
		const filter = {};
		const isActive = parseBoolean(req.query.isActive);

		if (typeof isActive === 'boolean') {
			filter.isActive = isActive;
		}

		const banners = await Banner.find(filter)
			.populate('promotionId', 'name startDate endDate isActive')
			.sort({ priority: -1, createdAt: -1 });

		return res.status(200).json({ success: true, data: banners });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Failed to fetch banners', error: error.message });
	}
};

const getBannerById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: 'Invalid banner id' });
		}

		const banner = await Banner.findById(id).populate('promotionId', 'name startDate endDate isActive');

		if (!banner) {
			return res.status(404).json({ success: false, message: 'Banner not found' });
		}

		return res.status(200).json({ success: true, data: banner });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Failed to fetch banner', error: error.message });
	}
};

const createBanner = async (req, res) => {
	try {
		const banner = await Banner.create(req.body);
		return res.status(201).json({ success: true, data: banner });
	} catch (error) {
		return res.status(400).json({ success: false, message: 'Failed to create banner', error: error.message });
	}
};

const updateBanner = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: 'Invalid banner id' });
		}

		const banner = await Banner.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true
		});

		if (!banner) {
			return res.status(404).json({ success: false, message: 'Banner not found' });
		}

		return res.status(200).json({ success: true, data: banner });
	} catch (error) {
		return res.status(400).json({ success: false, message: 'Failed to update banner', error: error.message });
	}
};

const deleteBanner = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: 'Invalid banner id' });
		}

		const banner = await Banner.findByIdAndDelete(id);

		if (!banner) {
			return res.status(404).json({ success: false, message: 'Banner not found' });
		}

		return res.status(200).json({ success: true, message: 'Banner deleted successfully' });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Failed to delete banner', error: error.message });
	}
};

const toggleBannerActive = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: 'Invalid banner id' });
		}

		const banner = await Banner.findById(id);

		if (!banner) {
			return res.status(404).json({ success: false, message: 'Banner not found' });
		}

		banner.isActive = !banner.isActive;
		await banner.save();

		return res.status(200).json({ success: true, data: banner });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Failed to toggle banner status', error: error.message });
	}
};

const getPromotionsForBanner = async (_req, res) => {
	try {
		const promotions = await Promotion.find({ isActive: true })
			.select('_id name startDate endDate isActive')
			.sort({ startDate: -1 });

		return res.status(200).json({ success: true, data: promotions });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Failed to fetch promotions', error: error.message });
	}
};

module.exports = {
	getBanners,
	getBannerById,
	createBanner,
	updateBanner,
	deleteBanner,
	toggleBannerActive,
	getPromotionsForBanner
};
