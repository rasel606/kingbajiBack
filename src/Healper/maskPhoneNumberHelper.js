// src/Helper/phoneHelper.js
exports.maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/(\d{4})(\d+)(\d{2})/, '$1******$3');
};

exports.validatePhoneNumber = (phoneNumber) => {
  const regex = /^\+8801[3-9]\d{8}$/; // BD numbers only
  return regex.test(phoneNumber);
};
