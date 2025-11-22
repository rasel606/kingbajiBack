// controllers/linkController.js
const Link = require('../Models/LinkModal');
// const Domain = require('../Models/DomainModal');
const { generateShortCode, generateAffiliateLink, getLandingPageName } = require('../utils/helpers');
// const generateQRCode = require('../utils/generateQR');
const QRCode = require('qrcode'); // Add this import at the top
// Get all links for affiliate
const getLinks = async (req, res) => {
   try {
    const links = await Link.find({ affiliate: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create new affiliate link
const createLink = async (req, res) => {
  try {
    const { domainId, keyword, landingPage, color } = req.body;
    
    // Check if keyword already exists for this affiliate
    const existingLink = await Link.findOne({ 
      affiliate: req.user.id, 
      keyword 
    });
    
    if (existingLink) {
      return res.status(400).json({
        success: false,
        message: 'Link with this keyword already exists'
      });
    }
    
    // Generate short code and affiliate link
    const shortCode = generateShortCode();
    const generatedLink = generateAffiliateLink(domainId, keyword, shortCode);
    
    // Create new link
    const newLink = new Link({
      affiliate: req.user.id,
      domainId,
      keyword,
      landingPage,
      color,
      generatedLink,
      shortCode
    });
    
    await newLink.save();
    
    res.status(201).json({
      success: true,
      message: 'Link created successfully',
      data: newLink
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update affiliate link
const updateLink = async (req, res) => {
 try {
    const { domainId, keyword, landingPage, color } = req.body;
    
    const link = await Link.findOne({ _id: req.params.id, affiliate: req.user.id });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }
    
    // Check if keyword is being changed and if it already exists
    if (keyword && keyword !== link.keyword) {
      const existingLink = await Link.findOne({ 
        affiliate: req.user.id, 
        keyword,
        _id: { $ne: req.params.id }
      });
      
      if (existingLink) {
        return res.status(400).json({
          success: false,
          message: 'Link with this keyword already exists'
        });
      }
      
      // Regenerate the link if keyword changed
      const generatedLink = generateAffiliateLink(domainId || link.domainId, keyword, link.shortCode);
      link.generatedLink = generatedLink;
      link.keyword = keyword;
    }
    
    if (domainId) link.domainId = domainId;
    if (landingPage) link.landingPage = landingPage;
    if (color) link.color = color;
    
    await link.save();
    
    res.json({
      success: true,
      message: 'Link updated successfully',
      data: link
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Generate link preview (for modal)
const generateLinkPreview = async (req, res) => {
try {
  console.log("req.body ---------------------1",req.body);
    const { domainId, keyword, landingPage, favcolor } = req.body;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Keyword is required for preview'
      });
    }
    
    // For preview, we generate a temporary short code
    const shortCode = 'preview';
    const generatedLink = generateAffiliateLink(domainId, keyword, shortCode);
    console.log("req.body ---------------------1",generatedLink);
    console.log('Received preview data:', generatedLink);
    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(generatedLink, {
      color: {
        dark: favcolor || '#000000',
        light: '#FFFFFF'
      },
      width: 256,
      margin: 1
    });
    console.log('Generated QR code data URL: -----------------------2', qrCodeDataURL);
    res.json({
      success: true,
      data: {
        link: generatedLink,
        qrCode: qrCodeDataURL,
        color: favcolor || '#000000'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Redirect affiliate link
const redirectLink = async (req, res) => {

 try {
    const { shortCode } = req.params;
    const { ref } = req.query;
    console.log("req.query ---------------------1",req.query);
    console.log("shortCode.query ------------------1",shortCode);
    const link = await Link.findOne({ shortCode, status: 'active' });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found or inactive'
      });
    }
    
    // Increment click count
    link.clicks += 1;
    await link.save();
    
    // Determine landing page URL based on landingPage code
    let landingUrl = `https://${link.domainId}`;
    if (link.landingPage !== '1') {
      landingUrl = `${landingUrl}/landing/${link.landingPage}`;
    }
    
    // Add tracking parameters
    const trackingParams = `?affiliate=${link.affiliate}&ref=${ref || link.keyword}`;
    
    res.redirect(`${landingUrl}${trackingParams}`);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}

module.exports = {
  getLinks,
  createLink,
  updateLink,
  generateLinkPreview,
  redirectLink
};