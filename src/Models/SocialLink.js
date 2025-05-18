const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  telegram: {
    type: String,
    validate: {
      validator: v => /^(https?:\/\/)?(www\.)?(t.me|telegram.me)\/.+/.test(v),
      message: props => `${props.value} is not a valid Telegram link!`
    }
  },
  facebook: {
    type: String,
    validate: {
      validator: v => /^(https?:\/\/)?(www\.)?(m.me|facebook.com)\/.+/.test(v),
      message: props => `${props.value} is not a valid Facebook Messenger link!`
    }
  },
  email: {
    type: String,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} is not a valid email address!`
    }
  }
});

module.exports = mongoose.model('SocialLink', socialLinkSchema);