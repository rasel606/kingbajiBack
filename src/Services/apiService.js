const axios = require("axios");
const crypto = require("crypto");

class ApiService {
  constructor() {
    this.operatorCode = process.env.API_OPERATOR_CODE || "rbdb";
    this.secret = process.env.API_SECRET_KEY || "9332fd9144a3a1a8bd3ab7afac3100b0";
    this.baseUrl = process.env.API_BASE_URL || "http://fetch.336699bet.com";
  }

  async verifyUser(username) {
    try {
      const signature = crypto
        .createHash("md5")
        .update(this.operatorCode + username + this.secret)
        .digest("hex")
        .toUpperCase();

      const apiUrl = `${this.baseUrl}/createMember.aspx?operatorcode=${this.operatorCode}&username=${username}&signature=${signature}`;

      console.log(`🔗 Calling API: ${apiUrl}`);

      const response = await axios.get(apiUrl, { timeout: 10000 });
      
      console.log(`✅ API Response:`, response.data);
      
      return response.data?.errMsg === "SUCCESS";

    } catch (error) {
      console.error('❌ API Request Failed:', error.message);
      return false;
    }
  }

  // Retry mechanism
  async verifyUserWithRetry(username, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 API Verification Attempt ${attempt} for ${username}`);
      
      const success = await this.verifyUser(username);
      if (success) {
        return true;
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return false;
  }
}

module.exports = new ApiService();