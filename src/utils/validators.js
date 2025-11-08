const validateRegistration = (data) => {
  const errors = [];
  
  if (!data.userId || data.userId.length < 3) {
    errors.push('User ID কমপক্ষে ৩ ক্যারেক্টার হতে হবে');
  }
  
  if (!data.phone || !/^\d{10,15}$/.test(data.phone)) {
    errors.push('সঠিক মোবাইল নম্বর দিন');
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push('পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে');
  }
  
  if (!data.countryCode) {
    errors.push('কান্ট্রি কোড দিন');
  }
  
  // Email validation removed - optional
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateLogin = (data) => {
  const errors = [];
  
  if (!data.userId) {
    errors.push('User ID দিন');
  }
  
  if (!data.password) {
    errors.push('পাসওয়ার্ড দিন');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateRegistration,
  validateLogin
};