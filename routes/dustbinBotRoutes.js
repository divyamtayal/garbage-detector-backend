const express = require('express');
const dustbinBotController = require('./../controllers/dustbinBotController');

const router = express.Router();

router.post('/register', dustbinBotController.registerDustbinBot);
router.post('/updateStatus', dustbinBotController.updateDustbinBotStatus);
router.get('/getAll', dustbinBotController.getAllDustbinBots);
router.get('/getDustbinBot', dustbinBotController.getDustbinBot);

module.exports = router;
