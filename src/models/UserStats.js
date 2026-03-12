const mongoose = require('mongoose')

const UserStatsSchema = new mongoose.Schema({}, { strict: false })

module.exports = mongoose.models.UserStats || mongoose.model('UserStats', UserStatsSchema)
