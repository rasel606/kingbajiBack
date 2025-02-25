
const app = require('./app'); // Import the main application

const socketIo = require('socket.io');



const http = require('http');

const httpServer = http.createServer(app);
const io = socketIo(httpServer);


io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Handle incoming messages
    socket.on('sendMessage', (data) => {
        io.to(data.receiver).emit('receiveMessage', data); // Emit to the receiver
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


httpServer.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
