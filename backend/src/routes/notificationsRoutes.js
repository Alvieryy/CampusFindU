const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

router.get('/', notificationsController.getNotifications);
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;