const BetProviderTable = require('../Models/BetProviderTable');

// Get all providers
exports.getAllProviders = async (req, res) => {
  try {
    const {  search = '', g_type } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { providercode: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (g_type) {
      query.g_type = { $in: [g_type] };
    }

    const providers = await BetProviderTable.find({})
    //   .sort({ name: 1 })
    //   .limit(limit * 1)
    //   .skip((page - 1) * limit)
    //   .lean();

    const total = await BetProviderTable.countDocuments();
console.log(total);
    res.json({
      success: true,
      data: providers,
    //   pagination: {
    //     page: parseInt(page),
    //     limit: parseInt(limit),
    //     total,
    //     pages: Math.ceil(total / limit)
    //   }
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching providers',
      error: error.message
    });
  }
};

// Get provider by ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await BetProviderTable.findOne({providercode:req.params.providercode}).lean();
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching provider',
      error: error.message
    });
  }
};

// Create new provider
exports.createProvider = async (req, res) => {
  try {
    const { name, providercode, company, url, image_url, login_url, type, g_type = [], id_active = true } = req.body;

    // Check if provider already exists
    const existingProvider = await BetProviderTable.findOne({
      $or: [
        { name },
        { providercode }
      ]
    });

    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'Provider with this name or code already exists'
      });
    }

    const provider = new BetProviderTable({
      name,
      providercode,
      company,
      url,
      image_url,
      login_url,
      type,
      g_type: Array.isArray(g_type) ? g_type : [g_type],
      id_active
    });

    await provider.save();

    res.status(201).json({
      success: true,
      message: 'Provider created successfully',
      data: provider
    });
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating provider',
      error: error.message
    });
  }
};

// Update provider
exports.updateProvider = async (req, res) => {
  try {
    const { providercode } = req.params;
    const updateData = { ...req.body, updatetimestamp: new Date() };

    // Ensure g_type is always an array
    if (updateData.g_type && !Array.isArray(updateData.g_type)) {
      updateData.g_type = [updateData.g_type];
    }

    const provider = await BetProviderTable.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      message: 'Provider updated successfully',
      data: provider
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating provider',
      error: error.message
    });
  }
};

// Delete provider
exports.deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await BetProviderTable.findByIdAndDelete(id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      message: 'Provider deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting provider',
      error: error.message
    });
  }
};