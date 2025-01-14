require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Beat = require('./models/Beat.js');
const Stripe = require('stripe');
const User = require('./models/User.js');
const jwt = require('jsonwebtoken');
const authRoutes = require("./routes/authRoutes");
const bcrypt = require('bcryptjs');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something broke!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Enhanced CORS configuration
app.use(cors({ 
  origin: [
    'http://localhost:3000',
    'https://vinkid-beatz.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
const router = express.Router();

app.use("/api", authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Enhanced Admin initialization
async function initializeAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not properly configured in environment variables');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const adminUser = new User({
        username: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('Admin user initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// Enhanced MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database connection string:', process.env.MONGO_URI.split('@')[1]); // Log database location (safely)
    initializeAdmin();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if database connection fails
  });

// Token verification route
app.get('/api/verify-token', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      name: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Registration attempt for:', email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    console.log('User registered successfully:', email);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Enhanced login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        isAdmin: user.isAdmin || false 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log('Login successful for:', email);
    res.status(200).json({
      name: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false,
      token: token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: "Server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Beat Routes
app.get('/api/beats', async (req, res) => {
  try {
    const beats = await Beat.find();
    res.json(beats);
  } catch (err) {
    console.error('Error fetching beats:', err);
    res.status(500).json({ error: 'Failed to fetch beats' });
  }
});

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
});

// Enhanced Stripe configuration
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cart } = req.body;
    
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.map((beat) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: beat.title,
            images: beat.picture ? [`https://vinkid-beatz-backend.onrender.com${beat.picture}`] : [],
            description: `${beat.genre} beat - ${beat.bpm} BPM`,
          },
          unit_amount: Math.round(beat.price * 100),
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'https://vinkid-beatz.onrender.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://vinkid-beatz.onrender.com'}/cart`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Static file serving
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
