const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Generate 8-character code
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    return `${result}${timestamp.substring(timestamp.length - 4)}`;
  };
  
  module.exports = generateReferralCode;