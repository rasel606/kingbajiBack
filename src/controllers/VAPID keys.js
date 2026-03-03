// const webPush = require('web-push');

// // Generate VAPID keys
// const vapidKeys = webPush.generateVAPIDKeys();
// console.log(vapidKeys);



// // VAPID keys (replace with your generated keys)
// const publicVapidKey = 'your_public_vapid_key';
// const privateVapidKey = 'your_private_vapid_key';

// webPush.setVapidDetails(
//   'mailto:example@yourdomain.com',
//   publicVapidKey,
//   privateVapidKey
// );

// // Middleware
// app.use(bodyParser.json());

// // Store subscription data
// let pushSubscriptions = []; // In a real application, save this in a database

// // API endpoint to send push notifications
// app.post('/send-notification', (req, res) => {
//   const { title, message, target } = req.body; // title, message, target userId

//   const payload = JSON.stringify({ title, message });

//   pushSubscriptions.forEach(subscription => {
//     if (subscription.userId === target) {
//       webPush.sendNotification(subscription, payload)
//         .catch(err => console.error(err));
//     }
//   });

//   res.status(200).send('Notification sent');
// });

// // API endpoint to subscribe to push notifications
// app.post('/subscribe', (req, res) => {
//   const subscription = req.body;

//   // Store subscription (in a real app, save to DB)
//   pushSubscriptions.push(subscription);
//   res.status(201).json({});
// });
