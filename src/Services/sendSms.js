var https = require('follow-redirects').https;
var fs = require('fs');



const sendSms = (to, text) => {
    console.log(to, text);
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        messages: [
          {
            destinations: [{ to }],
            from: "Kingbaji",
            text
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
        console.error(error);
    });
});



req.write(postData);

req.end();


    })
}

exports.sendSms = sendSms;
