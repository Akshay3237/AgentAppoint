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
  const breakStart = 13;
  const breakEnd = 15;

  // Get current time and date (server time)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // format: YYYY-MM-DD
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  for (let hour = startHour; hour < endHour; hour++) {
    // Exclude break time
    if (hour >= breakStart && hour < breakEnd) continue;

    // Exclude past slots if selected date is today
    if (date === todayStr && (hour < currentHour || (hour === currentHour && currentMinutes > 0))) {
      continue;
    }

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


exports.bookSlot = async (req, res) => {
  const { providerUserId, userUserId, startingTime, endingTime, date, purpose } = req.body;

  try {
    const newSlot = new Slot({
      providerUserId,
      userUserId,
      startingTime,
      endingTime,
      date,
      purpose,
      status: 'approved'
    });

    await newSlot.save();
    res.status(201).json({ message: 'Slot booked successfully', slot: newSlot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all slots booked by a user with provider info
exports.getSlotsBookedByUser = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const slots = await Slot.find({ userUserId: userId })
      .populate('providerUserId', 'fullName email phone service')
      .sort({ date: -1 });

    const formatted = slots.map(slot => ({
      _id: slot._id,
      date: slot.date,
      startingTime: slot.startingTime,
      endingTime: slot.endingTime,
      purpose: slot.purpose,
      provider: {
        _id: slot.providerUserId._id,
        fullName: slot.providerUserId.fullName,
        email: slot.providerUserId.email,
        phone: slot.providerUserId.phone,
        service: slot.providerUserId.service,
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBookedSlotsForProvider = async (req, res) => {
  try {
    const { id: providerId } = req.params;
    const bookedSlots = await Slot.find({
      providerUserId: providerId,
      userUserId: { $ne: null } // only booked slots
    })
      .populate('userUserId', 'fullName email phone') // show user details
      .sort({ date: 1, startingTime: 1 });

    res.status(200).json(bookedSlots);
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.cancelAppointment = async (req, res) => {
  try {
    const slotId = req.params.slotId;

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    slot.status = 'cancelled';
    await slot.save();

    return res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling slot:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
