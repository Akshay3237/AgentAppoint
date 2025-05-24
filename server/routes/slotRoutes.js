const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');

// Slot logic
router.get('/check/availability', slotController.checkSlotAvailability);
router.get('/free', slotController.getFreeSlots);
router.post('/book',slotController.bookSlot);
router.get('/booked-by-user', slotController.getSlotsBookedByUser);

router.post('/', slotController.createSlot);
router.get('/', slotController.getAllSlots);
router.get('/:id', slotController.getSlotById);
router.put('/:id', slotController.updateSlot);
router.delete('/:id', slotController.deleteSlot);

module.exports = router;
