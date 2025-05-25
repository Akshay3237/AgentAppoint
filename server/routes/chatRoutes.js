const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.createChat);
router.get('/', chatController.getAllChats);
router.get('/filter/by-user-date', chatController.getChatsByUserAndDate);
router.post('/start',chatController.startChat);
router.post('/message',chatController.message);
router.post('/end/:sessionId',chatController.deleteChat);
router.get('/:id', chatController.getChatById);
router.put('/:id', chatController.updateChat);
router.delete('/:id', chatController.deleteChat);

module.exports = router;
