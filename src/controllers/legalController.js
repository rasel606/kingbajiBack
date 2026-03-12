const LegalContent = require('../models/LegalContent');
const FAQ = require('../models/FAQ');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

/**
 * ============================================
 * LEGAL CONTENT CONTROLLERS
 * ============================================
 */

/**
 * @desc    Get legal content by type
 * @route   GET /api/legal/:type
 * @access  Public
 */
exports.getLegalContent = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const { lang = 'en' } = req.query;

    // Validate type
    const validTypes = ['terms', 'privacy', 'rules', 'responsible-gambling', 'about', 'contact'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid content type. Valid types are: ${validTypes.join(', ')}`
      });
    }

    const content = await LegalContent.findOne({ 
      type, 
      language: lang,
      isActive: true 
    }).select('-versions');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: `Legal content of type "${type}" not found`
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching legal content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching legal content'
    });
  }
});

/**
 * @desc    Get all available legal pages
 * @route   GET /api/legal/pages
 * @access  Public
 */
exports.getLegalPages = asyncHandler(async (req, res) => {
  try {
    const { lang = 'en' } = req.query;

    const pages = await LegalContent.find({ 
      language: lang,
      isActive: true 
    }).select('type title metaDescription').sort({ createdAt: 1 });

    const formattedPages = pages.map(page => ({
      id: page.type,
      title: page.title,
      description: page.metaDescription,
      path: `/${page.type.replace('responsible-gambling', 'responsible-gambling')}`,
      type: page.type
    }));

    res.json({
      success: true,
      count: formattedPages.length,
      data: formattedPages
    });
  } catch (error) {
    console.error('Error fetching legal pages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching legal pages'
    });
  }
});

/**
 * @desc    Search legal content
 * @route   GET /api/legal/search
 * @access  Public
 */
exports.searchLegalContent = asyncHandler(async (req, res) => {
  try {
    const { q, type, lang = 'en' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchQuery = {};
    if (type) searchQuery.type = type;
    searchQuery.language = lang;
    searchQuery.isActive = true;

    // Text search
    const results = await LegalContent.find(
      { $text: { $search: q }, ...searchQuery },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(10);

    // If no text search results, try regex search
    let finalResults = results;
    if (results.length === 0) {
      const regexQuery = {
        $or: [
          { content: { $regex: q, $options: 'i' } },
          { title: { $regex: q, $options: 'i' } }
        ],
        ...searchQuery
      };
      finalResults = await LegalContent.find(regexQuery).limit(10);
    }

    const formattedResults = finalResults.map(item => ({
      type: item.type,
      title: item.title,
      snippet: extractSnippet(item.content, q, 200),
      path: `/${item.type}`
    }));

    res.json({
      success: true,
      count: formattedResults.length,
      results: formattedResults
    });
  } catch (error) {
    console.error('Error searching legal content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching legal content'
    });
  }
});

/**
 * @desc    Create or update legal content (Admin)
 * @route   POST /api/legal/content
 * @access  Private/Admin
 */
exports.createLegalContent = asyncHandler(async (req, res) => {
  try {
    const { type, title, content, metaDescription, metaKeywords, language = 'en' } = req.body;

    // Validation
    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and content are required'
      });
    }

    // Check if content already exists
    let legalContent = await LegalContent.findOne({ type, language });

    if (legalContent) {
      // Save current version to history
      const newVersion = {
        content: legalContent.content,
        version: legalContent.version,
        updatedAt: legalContent.updatedAt,
        updatedBy: legalContent.updatedBy
      };

      if (!legalContent.versions) {
        legalContent.versions = [];
      }
      legalContent.versions.push(newVersion);

      // Update content
      legalContent.title = title;
      legalContent.content = content;
      legalContent.metaDescription = metaDescription;
      legalContent.metaKeywords = metaKeywords;
      legalContent.version = legalContent.version + 1;
      legalContent.updatedBy = req.user?._id;
      legalContent.updatedAt = Date.now();
    } else {
      // Create new content
      legalContent = new LegalContent({
        type,
        title,
        content,
        metaDescription,
        metaKeywords,
        language,
        updatedBy: req.user?._id
      });
    }

    await legalContent.save();

    res.status(201).json({
      success: true,
      message: legalContent.version > 1 ? 'Legal content updated successfully' : 'Legal content created successfully',
      data: legalContent
    });
  } catch (error) {
    console.error('Error creating/updating legal content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating/updating legal content'
    });
  }
});

/**
 * @desc    Get legal content versions history (Admin)
 * @route   GET /api/legal/:type/versions
 * @access  Private/Admin
 */
exports.getLegalContentVersions = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const { lang = 'en' } = req.query;

    const content = await LegalContent.findOne({ type, language: lang });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Legal content not found'
      });
    }

    const versions = [
      {
        version: content.version,
        content: content.content,
        updatedAt: content.updatedAt,
        updatedBy: content.updatedBy,
        isCurrent: true
      },
      ...(content.versions || [])
    ];

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Error fetching legal content versions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching versions'
    });
  }
});

/**
 * @desc    Restore previous version (Admin)
 * @route   PUT /api/legal/:type/restore/:version
 * @access  Private/Admin
 */
exports.restoreLegalContentVersion = asyncHandler(async (req, res) => {
  try {
    const { type, version } = req.params;
    const { lang = 'en' } = req.query;

    const desiredVersion = parseInt(version, 10);
    const content = await LegalContent.findOne({ type, language: lang });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Legal content not found'
      });
    }

    // Save current version
    const newVersion = {
      content: content.content,
      version: content.version,
      updatedAt: content.updatedAt,
      updatedBy: content.updatedBy
    };

    if (!content.versions) {
      content.versions = [];
    }
    content.versions.push(newVersion);

    // Find and restore version
    const versionToRestore = content.versions.find(v => v.version === desiredVersion);

    if (!versionToRestore) {
      return res.status(404).json({
        success: false,
        message: `Version ${desiredVersion} not found`
      });
    }

    content.content = versionToRestore.content;
    content.version = content.version + 1;
    content.updatedBy = req.user?._id;
    content.updatedAt = Date.now();

    // Remove the restored version from history
    content.versions = content.versions.filter(v => v.version !== desiredVersion);

    await content.save();

    res.json({
      success: true,
      message: `Restored version ${desiredVersion}`,
      data: content
    });
  } catch (error) {
    console.error('Error restoring legal content version:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while restoring version'
    });
  }
});

/**
 * @desc    Toggle legal content status (Admin)
 * @route   PATCH /api/legal/:type/toggle
 * @access  Private/Admin
 */
exports.toggleLegalContentStatus = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const { lang = 'en' } = req.query;

    const content = await LegalContent.findOne({ type, language: lang });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Legal content not found'
      });
    }

    content.isActive = !content.isActive;
    await content.save();

    res.json({
      success: true,
      message: `Legal content ${content.isActive ? 'activated' : 'deactivated'}`,
      data: content
    });
  } catch (error) {
    console.error('Error toggling legal content status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling status'
    });
  }
});

/**
 * ============================================
 * FAQ CONTROLLERS
 * ============================================
 */

/**
 * @desc    Get FAQ items
 * @route   GET /api/legal/faq
 * @access  Public
 */
exports.getFAQItems = asyncHandler(async (req, res) => {
  try {
    const { category = 'all', lang = 'en', featured = false } = req.query;

    const query = { isActive: true, language: lang };
    
    if (category !== 'all') {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const items = await FAQ.find(query)
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .select('-keywords -updatedBy');

    res.json({
      success: true,
      count: items.length,
      data: { items }
    });
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FAQ items'
    });
  }
});

/**
 * @desc    Get single FAQ item
 * @route   GET /api/legal/faq/:id
 * @access  Public
 */
exports.getFAQItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const item = await FAQ.findById(id);

    if (!item || !item.isActive) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    // Increment views
    item.views = (item.views || 0) + 1;
    await item.save();

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching FAQ item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FAQ item'
    });
  }
});

/**
 * @desc    Search FAQ items
 * @route   GET /api/legal/faq/search
 * @access  Public
 */
exports.searchFAQ = asyncHandler(async (req, res) => {
  try {
    const { q, category, lang = 'en' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchQuery = { isActive: true, language: lang };
    if (category && category !== 'all') {
      searchQuery.category = category;
    }

    // Text search
    const results = await FAQ.find(
      { $text: { $search: q }, ...searchQuery },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(20);

    // If no text search results, try regex search
    let finalResults = results;
    if (results.length === 0) {
      const regexQuery = {
        $or: [
          { question: { $regex: q, $options: 'i' } },
          { answer: { $regex: q, $options: 'i' } },
          { keywords: { $regex: q, $options: 'i' } }
        ],
        ...searchQuery
      };
      finalResults = await FAQ.find(regexQuery).limit(20);
    }

    res.json({
      success: true,
      count: finalResults.length,
      data: { items: finalResults }
    });
  } catch (error) {
    console.error('Error searching FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching FAQ'
    });
  }
});

/**
 * @desc    Vote on FAQ item (helpful/not helpful)
 * @route   POST /api/legal/faq/:id/vote
 * @access  Public
 */
exports.voteFAQ = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful = true } = req.body;

    const item = await FAQ.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    if (helpful) {
      item.helpfulVotes = (item.helpfulVotes || 0) + 1;
    } else {
      item.notHelpfulVotes = (item.notHelpfulVotes || 0) + 1;
    }

    await item.save();

    const totalVotes = (item.helpfulVotes || 0) + (item.notHelpfulVotes || 0);
    const helpfulPercentage = totalVotes > 0 ? ((item.helpfulVotes || 0) / totalVotes * 100).toFixed(2) : 0;

    res.json({
      success: true,
      message: 'Vote recorded',
      data: {
        helpfulVotes: item.helpfulVotes,
        notHelpfulVotes: item.notHelpfulVotes,
        totalVotes,
        helpfulPercentage
      }
    });
  } catch (error) {
    console.error('Error voting on FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while voting'
    });
  }
});

/**
 * @desc    Create FAQ item (Admin)
 * @route   POST /api/legal/faq
 * @access  Private/Admin
 */
exports.createFAQ = asyncHandler(async (req, res) => {
  try {
    const { category, question, answer, keywords = [], order = 0, language = 'en' } = req.body;

    // Validation
    if (!category || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Category, question, and answer are required'
      });
    }

    const faqItem = new FAQ({
      category,
      question,
      answer,
      keywords,
      order,
      language,
      updatedBy: req.user?._id
    });

    await faqItem.save();

    res.status(201).json({
      success: true,
      message: 'FAQ item created successfully',
      data: faqItem
    });
  } catch (error) {
    console.error('Error creating FAQ item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating FAQ item'
    });
  }
});

/**
 * @desc    Update FAQ item (Admin)
 * @route   PUT /api/legal/faq/:id
 * @access  Private/Admin
 */
exports.updateFAQ = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, answer, keywords, order, isFeatured } = req.body;

    let item = await FAQ.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    // Update fields
    if (category) item.category = category;
    if (question) item.question = question;
    if (answer) item.answer = answer;
    if (keywords) item.keywords = keywords;
    if (order !== undefined) item.order = order;
    if (isFeatured !== undefined) item.isFeatured = isFeatured;

    item.version = item.version + 1;
    item.updatedBy = req.user?._id;
    item.updatedAt = Date.now();

    await item.save();

    res.json({
      success: true,
      message: 'FAQ item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating FAQ item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating FAQ item'
    });
  }
});

/**
 * @desc    Delete FAQ item (Admin)
 * @route   DELETE /api/legal/faq/:id
 * @access  Private/Admin
 */
exports.deleteFAQ = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const item = await FAQ.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    res.json({
      success: true,
      message: 'FAQ item deleted successfully',
      data: item
    });
  } catch (error) {
    console.error('Error deleting FAQ item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting FAQ item'
    });
  }
});

/**
 * @desc    Toggle FAQ item status (Admin)
 * @route   PATCH /api/legal/faq/:id/toggle
 * @access  Private/Admin
 */
exports.toggleFAQStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const item = await FAQ.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.json({
      success: true,
      message: `FAQ item ${item.isActive ? 'activated' : 'deactivated'}`,
      data: item
    });
  } catch (error) {
    console.error('Error toggling FAQ status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling FAQ status'
    });
  }
});

/**
 * @desc    Bulk update FAQ order (Admin)
 * @route   PUT /api/legal/faq/bulk/order
 * @access  Private/Admin
 */
exports.bulkUpdateFAQOrder = asyncHandler(async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const updates = await Promise.all(
      items.map(item =>
        FAQ.findByIdAndUpdate(
          item.id,
          { order: item.order },
          { new: true }
        )
      )
    );

    res.json({
      success: true,
      message: 'FAQ items reordered successfully',
      data: updates
    });
  } catch (error) {
    console.error('Error updating FAQ order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating FAQ order'
    });
  }
});

/**
 * Helper function to extract snippet from content
 */
function extractSnippet(content, query, length = 200) {
  // Remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const index = cleanContent.toLowerCase().indexOf(query.toLowerCase());

  if (index === -1) return cleanContent.substring(0, length);

  const start = Math.max(0, index - length / 2);
  const end = Math.min(cleanContent.length, index + length / 2);

  let snippet = cleanContent.substring(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < cleanContent.length) snippet = snippet + '...';

  return snippet;
}
