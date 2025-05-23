const Chat = require('../models/chatModel');

// Create chat
exports.createChat = async (req, res) => {
  try {
    const chat = new Chat(req.body);
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all chats
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().populate('userId');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('userId');
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update chat
exports.updateChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get chats by userId and date
exports.getChatsByUserAndDate = async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    if (!userId || !date) {
      return res.status(400).json({ error: "Both userId and date are required" });
    }

    // Convert to start and end of the date
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    
    const chats = await Chat.find({
      userId,
      date: { $gte: start, $lte: end }
    }).populate('userId');
    
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  const { sessionId } = req.params;
  await Chat.deleteMany({ sessionId });
  res.status(200).send('Chat session ended');
};

exports.startChat = async (req, res) => {
  const { userId } = req.body;
  const sessionId = `${userId}-${Date.now()}`;

  res.json({ sessionId });
};

const geminiChat = require('../utils/gemini');

exports.message = async (req, res) => {
  const { prompt, sessionId, userId } = req.body;

  try {
    const response_prompt = await geminiChat(prompt);

    const chat = new Chat({ prompt, response_prompt, sessionId, userId });
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Chat failed: ' + error.message });
  }
};

