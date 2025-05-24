const Slot = require('../models/Slot');

// Create a new slot
exports.createSlot = async (req, res) => {
  console.log('he');
    try {
    const slot = new Slot(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all slots
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate('providerUserId userUserId');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get slot by ID
exports.getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a slot
exports.updateSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if a given time slot is free
exports.checkSlotAvailability = async (req, res) => {
  const { providerUserId, date, startingTime, endingTime } = req.query;
  try {
    const overlappingSlots = await Slot.find({
      providerUserId,
      date,
      $or: [
        { startingTime: { $lt: endingTime }, endingTime: { $gt: startingTime } }
      ],
      status: { $ne: 'cancelled' }
    });

    if (overlappingSlots.length > 0) {
      return res.json({ available: false, overlappingSlots });
    }

    res.json({ available: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all free time slots between 9 AM - 6 PM (1-hour slots)
exports.getFreeSlots = async (req, res) => {
  const { providerUserId, date } = req.query;

  const allSlots = [];
  const startHour = 9;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
    allSlots.push({ start, end });
  }

  try {
    const bookedSlots = await Slot.find({
      providerUserId,
      date,
      status: { $ne: 'cancelled' }
    });

    const freeSlots = allSlots.filter(slot => {
      return !bookedSlots.some(b => (
        b.startingTime < slot.end && b.endingTime > slot.start
      ));
    });

    res.json(freeSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
