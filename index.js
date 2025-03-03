const app = require('./app'); // Import the main application
// const http = require('http');
require('dotenv').config();

// const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT || 80, () => {
    console.log(`Server running on port ${PORT}`);
});