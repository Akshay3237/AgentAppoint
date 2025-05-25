const express = require('express');
const router = express.Router();
const geminiChat = require('../utils/gemini');
const Slot = require('../models/Slot');
const User = require('../models/User');

// Simple chat route
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const response = await geminiChat(prompt);
    return res.json({ response });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Booking via AI
router.post('/book-via-ai', async (req, res) => {
  const { prompt, userUserId } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  if (!userUserId) return res.status(401).json({ error: 'Unauthorized' });

  const aiPrompt = `
You are a helpful assistant that extracts booking details from user input.
Extract the booking details and return ONLY a JSON object with these fields:
{
  "date": "25-05-2025",        // format: DD-MM-YYYY
  "startingTime": "09:00",     // 24h format
  "endingTime": "10:00",       // 24h format
  "providerName": "Jay Chavda",
  "purpose": "doctor"
}
User input: "${prompt}"
`;

  try {
    const aiResponseText = await geminiChat(aiPrompt);
    let cleanedResponse = aiResponseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let bookingDetails;
    try {
      bookingDetails = JSON.parse(cleanedResponse);
    } catch (parseErr) {
      return res.status(400).json({
        error: 'Could not parse booking details from AI response',
        raw: aiResponseText
      });
    }

    const { date, startingTime, endingTime, providerName, purpose } = bookingDetails;

    const missingFields = [];
    if (!date) missingFields.push("date");
    if (!startingTime) missingFields.push("startingTime");
    if (!endingTime) missingFields.push("endingTime");
    if (!providerName) missingFields.push("providerName");
    if (!purpose) missingFields.push("purpose");

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required booking fields: ${missingFields.join(', ')}`,
        bookingDetails
      });
    }

    const provider = await User.findOne({
      fullName: { $regex: new RegExp(providerName, 'i') },
      service: { $regex: new RegExp(purpose, 'i') }
    });

    if (!provider) {
      return res.status(404).json({
        error: `Provider "${providerName}" with service "${purpose}" not found.`
      });
    }

    const newSlot = new Slot({
      providerUserId: provider._id,
      userUserId,
      startingTime,
      endingTime,
      date,
      purpose,
      status: 'approved'
    });

    await newSlot.save();

    return res.status(201).json({ message: 'Slot booked successfully via AI', slot: newSlot });

  } catch (error) {
    console.error('Error booking slot via AI:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/cancel-via-ai', async (req, res) => {
  const { prompt, providerUserId } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  if (!providerUserId) return res.status(401).json({ error: 'Unauthorized' });

  const aiPrompt = `
You are an assistant that extracts cancellation details from provider requests.
Extract the following as JSON:
- date in format DD/MM/YYYY (e.g., 25/05/2025)
- fromTime (start of range) in 24-hour HH:mm format (e.g., 14:00)
- toTime (end of range) in 24-hour HH:mm format (e.g., 16:00)

User request: "${prompt}"

Output ONLY the JSON object without explanation.
`;

  try {
    const aiResponseText = await geminiChat(aiPrompt);
    let cleanedResponse = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();

    let cancelDetails;
    try {
      cancelDetails = JSON.parse(cleanedResponse);
    } catch (parseErr) {
      return res.status(400).json({
        error: 'Could not parse cancellation details from AI response',
        aiResponseText,
      });
    }

    let { date, fromTime, toTime } = cancelDetails;

    // Normalize
    function convertDateFormat(ddmmyyyy) {
      const [dd, mm, yyyy] = ddmmyyyy.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }

    if (!date || !fromTime || !toTime) {
      return res.status(400).json({
        error: 'Date, fromTime, and toTime are required',
        cancelDetails,
      });
    }

    date = convertDateFormat(date);

    // Ensure provider exists
    const provider = await User.findOne({ _id: providerUserId, type: 'provider' });
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found or unauthorized' });
    }

    // Cancel all matching slots
    const slots = await Slot.find({
      providerUserId,
      date,
      startingTime: { $gte: fromTime, $lt: toTime },
      status: { $ne: 'cancelled' }
    });

    if (slots.length === 0) {
      return res.status(404).json({
        error: 'No active slots found in the given time range',
        searchParams: { providerUserId, date, fromTime, toTime },
      });
    }

    // Update all found slots
    for (const slot of slots) {
      slot.status = 'cancelled';
      await slot.save();
    }

    return res.status(200).json({
      message: `Canceled ${slots.length} slots between ${fromTime} and ${toTime} on ${date}`,
      slots
    });

  } catch (error) {
    console.error('Error canceling slot via AI:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
