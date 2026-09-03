const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateCurrentUser);

module.exports = router;