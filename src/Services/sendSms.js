var https = require('follow-redirects').https;
var fs = require('fs');



const sendSms = (phone_number, verificationCode) => {
    // console.log(to, text);
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        messages: [
          {
            destinations: [{ phone_number }],
            from: "Kingbaji",
            verificationCode
          }
        ]
      });


var options = {
    'method': 'POST',
    'hostname': 'd9xxnl.api.infobip.com',
    'path': '/sms/2/text/advanced',
    'headers': {
        'Authorization': 'App b4113beeadcd014851267fc7c25e7169-7a876002-426c-4723-bb59-cd6458fc914f',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    'maxRedirects': 20
};

var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject('Invalid JSON response');
          }
    });

    res.on("error", function (error) {
        console.log("Error sending SMS:", error);
        console.error(error);
    });
});



req.write(postData);

req.end();


    })
}

exports.sendSms = sendSms;


// services/smsService.js
// // const twilio = require('twilio');

// class SMSService {
//   constructor() {
//     this.client = null;
//     this.isEnabled = process.env.SMS_SERVICE_ENABLED === 'true';
    
//     // if (this.isEnabled && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
//     //   this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//     // }
//   }

//   async sendVerificationCode(phoneNumber, code) {
//     // if (!this.isEnabled || !this.client) {
//     //   // Mock SMS for development
//     //   console.log(`[DEV SMS] Verification code for ${phoneNumber}: ${code}`);
//     //   return { success: true, message: 'SMS sent successfully (development mode)' };
//     // }

//     // try {
//     //   const message = await this.client.messages.create({
//     //     body: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
//     //     from: process.env.TWILIO_PHONE_NUMBER,
//     //     to: phoneNumber
//     //   });

//     //   return { 
//     //     success: true, 
//     //     message: 'SMS sent successfully',
//     //     sid: message.sid 
//     //   };
//     // } catch (error) {
//     //   console.error('SMS sending error:', error);
//     //   return { 
//     //     success: false, 
//     //     message: 'Failed to send SMS',
//     //     error: error.message 
//     //   };
//     // }
//   }
// }

// module.exports = new SMSService();