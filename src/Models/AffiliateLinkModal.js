
const mongoose = require('mongoose');




const linksSchema = new mongoose.Schema({
    domain: { type: String, trim: true, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    keywords: { type: String, required: true },
    pageAction: { type: String, required: true }
});




const AffiliateLink = mongoose.model('AffiliateLink', linksSchema);
module.exports = AffiliateLink