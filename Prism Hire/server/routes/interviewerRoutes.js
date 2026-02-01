const express = require('express');
const { startChat, chat, feedback } = require('../controllers/interviewerController');
const router = express.Router();

router.post('/start-chat', startChat);
router.post('/chat', chat);
router.post('/feedback', feedback);

module.exports = router;
