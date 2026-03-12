const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp();

// Load your Express app
const app = require('./app.js');

// Apply CORS
app.use(cors({ origin: true }));

// Export as Cloud Function
exports.api = functions.https.onRequest(app);

// Alternative: If you want to deploy specific routes
// exports.api = functions
//   .region('us-central1')
//   .https.onRequest((req, res) => {
//     return app(req, res);
//   });
