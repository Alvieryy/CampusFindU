const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');
// Lost Items Routes
router.get('/lost-items', itemsController.getAllLostItems);
router.get('/lost-items/:id', itemsController.getLostItemById);
router.post('/lost-items', itemsController.createLostItem);
router.put('/lost-items/:id', itemsController.updateLostItem);
router.delete('/lost-items/:id', itemsController.deleteLostItem);
// Found Items Routes
router.get('/found-items', itemsController.getAllFoundItems);
router.get('/found-items/:id', itemsController.getFoundItemById);
router.post('/found-items', itemsController.createFoundItem);
router.put('/found-items/:id', itemsController.updateFoundItem);
router.delete('/found-items/:id', itemsController.deleteFoundItem);
module.exports = router;