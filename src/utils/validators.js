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
const validateFullName = (name) => {
  const errors = [];
  
  if (!name || typeof name !== 'string') {
    errors.push('দয়া করে আপনার সম্পূর্ণ নাম লিখুন');
    return { isValid: false, errors };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    errors.push('নামটি কমপক্ষে ২ অক্ষরের হতে হবে');
  }
  
  if (trimmedName.length > 100) {
    errors.push('নামটি ১০০ অক্ষরের বেশি হতে পারবে না');
  }
  
  // Check for valid Bengali/English characters and spaces
  const nameRegex = /^[a-zA-Z\u0980-\u09FF\s\.\-]+$/;
  if (!nameRegex.test(trimmedName)) {
    errors.push('নামে শুধুমাত্র বাংলা, ইংরেজি অক্ষর, স্পেস এবং ড্যাশ ব্যবহার করা যাবে');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateBirthday = (dateString) => {
  const errors = [];
  
  if (!dateString) {
    errors.push('দয়া করে আপনার জন্মদিন নির্বাচন করুন');
    return { isValid: false, errors };
  }

  const selectedDate = new Date(dateString);
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 100); // 100 years ago
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 18); // Must be at least 18 years old

  // Check if date is valid
  if (isNaN(selectedDate.getTime())) {
    errors.push('অবৈধ তারিখ নির্বাচন করা হয়েছে');
    return { isValid: false, errors };
  }

  // Check if user is at least 18 years old
  if (selectedDate > maxDate) {
    errors.push('আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে');
  }

  // Check if date is not more than 100 years ago
  if (selectedDate < minDate) {
    errors.push('জন্মদিন ১০০ বছরের বেশি পুরানো হতে পারবে না');
  }

  // Check if date is not in the future
  if (selectedDate > today) {
    errors.push('ভবিষ্যতের তারিখ নির্বাচন করা যাবে না');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('পাসওয়ার্ড প্রদান করুন');
    return { isValid: false, errors };
  }

  // Check length
  if (password.length < 6 || password.length > 20) {
    errors.push('পাসওয়ার্ড ৬~২০ অক্ষরের মধ্যে হতে হবে');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('পাসওয়ার্ডে অন্তত একটি বড় হাতের বর্ণমালা থাকতে হবে');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('পাসওয়ার্ডে কমপক্ষে একটি সংখ্যা থাকতে হবে');
  }

  // Check for special characters (optional, but allowed)
  // Special characters are allowed but not required

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate required fields
 * @param {Object} fields - Object with field names as keys and values to check
 * @param {Object} res - Express response object (optional, for direct error response)
 * @returns {Object} { isValid: boolean, missing: Array }
 */
const validateRequiredFields = (fields, res = null) => {
  const missing = [];
  
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      missing.push(key);
    }
  });
  
  const isValid = missing.length === 0;
  
  // If response object provided and validation fails, send error response
  if (!isValid && res) {
    return res.status(400).json({
      success: false,
      message: 'Required fields missing',
      missing
    });
  }
  
  return { isValid, missing };
};

/**
 * Validate user is logged in (userId exists)
 * @param {string} userId - User ID from request
 * @param {Object} res - Express response object (optional)
 * @returns {boolean} true if valid, false otherwise
 */
const validateUserId = (userId, res = null) => {
  if (!userId) {
    if (res) {
      res.status(400).json({ 
        errCode: 2, 
        errMsg: 'Please Login' 
      });
    }
    return false;
  }
  return true;
};

module.exports = {
  validateFullName,
  validateRegistration,
  validateLogin,
  validateBirthday,
  validatePassword,
  validateRequiredFields,
  validateUserId
};