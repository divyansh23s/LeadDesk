require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');

const Lead = require('./models/Lead');
const Admin = require('./models/Admin');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LeadDesk API is running"
  });
});

// Public: Submit Lead
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, budget, message } = req.body;
    
    // Server-side validation
    if (!name || !email || !budget || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const lead = new Lead({ name, email, budget, message });
    await lead.save();
    
    res.status(201).json({ message: 'Lead created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { admin: { id: admin.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: Get all leads
app.get('/api/leads', auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: Update lead status
app.patch('/api/leads/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'Contacted', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup Initial Admin Account (Run once)
app.post('/api/admin/setup', async (req, res) => {
  try {
    const { username, password, secretKey } = req.body;
    
    // Require a secret key to prevent random people from creating admins
    if (secretKey !== (process.env.SETUP_SECRET || 'setup123')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
