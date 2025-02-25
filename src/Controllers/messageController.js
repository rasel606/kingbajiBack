const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { receiver, content, file } = req.body;
        const sender = req.user.id;

        const newMessage = new Message({
            sender,
            receiver,
            content,
            file,
        });

        await newMessage.save();

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { receiver } = req.params;
        const sender = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender },
            ],
        }).sort('timestamp');

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
