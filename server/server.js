const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const slotRoutes = require('./routes/slotRoutes');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// Routes
app.use('/api/users', userRoutes);
app.use('/api/slots',slotRoutes);
app.use('/api/chats', chatRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  console.log(`Connected to database: ${mongoose.connection.name}`);
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
