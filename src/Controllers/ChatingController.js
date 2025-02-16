





router.post("/send", authMiddleware, async (req, res) => {
    const { receiver, message } = req.body;
    const newMessage = new Message({ sender: req.user.userId, receiver, message });
    await newMessage.save();
    res.json({ message: "Message sent" });
});

router.get("/:userId", authMiddleware, async (req, res) => {
    const messages = await Message.find({
        $or: [{ sender: req.user.userId, receiver: req.params.userId },
              { sender: req.params.userId, receiver: req.user.userId }]
    }).populate("sender receiver", "name role");
    res.json(messages);
});



// Send Message
router.post("/send", authMiddleware, async (req, res) => {
    const { receiver, message, media, group } = req.body;
    const newMessage = new Message({
        sender: req.user.userId,
        receiver,
        group,
        message,
        media,
    });
    await newMessage.save();

    // Update message status
    const updatedMessage = await Message.findById(newMessage._id);
    res.json(updatedMessage);
});

// Get Messages (for a specific chat or group)
router.get("/:chatId", authMiddleware, async (req, res) => {
    const { chatId } = req.params;
    const messages = await Message.find({ group: chatId }).populate("sender receiver", "name");
    res.json(messages);
});

// Create Group Chat
router.post("/group/create", authMiddleware, async (req, res) => {
    const { name, members } = req.body;
    const group = new GroupChat({
        name,
        members: [req.user.userId, ...members],
    });
    await group.save();
    res.json(group);
});



const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Socket.io Events
const users = {}; // To track user socket connections

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins chat room
    socket.on("join", (userId) => {
        users[userId] = socket.id;
        console.log("User joined:", userId);
    });

    // Send message to the receiver's socket
    socket.on("sendMessage", (data) => {
        const { receiverId } = data;
        if (users[receiverId]) {
            io.to(users[receiverId]).emit("receiveMessage", data);
        }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});
