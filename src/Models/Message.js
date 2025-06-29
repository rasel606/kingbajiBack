const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: String,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    file: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Message', messageSchema);
