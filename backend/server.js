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
const cloudinary = require('cloudinary').v2;

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to normalize file paths
function normalizeFilePath(filePath) {
  const filename = path.basename(filePath);
  return `/uploads/${filename}`;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(express.json());
app.use(cors({ 
  origin: ['https://vinkid-beatz.onrender.com', 'http://localhost:3000'],
  credentials: true
}));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
  
  if (file.fieldname === 'picture' && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === 'audio' && allowedAudioTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter,
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api", authRoutes);

async function initializeAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not properly configured');
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
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    initializeAdmin();
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (email === process.env.ADMIN_EMAIL) {
      const isEnvPasswordValid = password === process.env.ADMIN_PASSWORD;
      const isStoredPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isEnvPasswordValid && !isStoredPasswordValid) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      if (!user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
    } else {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      name: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware to verify admin status
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Beat Routes
app.get('/api/beats', async (req, res) => {
  try {
    const beats = await Beat.find();
    res.json(beats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beats' });
  }
});

app.get('/api/beats/search', async (req, res) => {
  const query = req.query.q;
  try {
    const beats = await Beat.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(beats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching beats' });
  }
});

app.get('/api/beats/genre/:genre', async (req, res) => {
  try {
    const genre = req.params.genre;
    const beats = await Beat.find({ genre });
    res.json(beats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beats by genre' });
  }
});

// Update beat
app.put('/api/beats/:id', verifyAdmin, async (req, res) => {
  try {
    const beatId = req.params.id;
    const updateData = req.body;
    
    const updatedBeat = await Beat.findByIdAndUpdate(
      beatId,
      updateData,
      { new: true }
    );
    
    if (!updatedBeat) {
      return res.status(404).json({ error: 'Beat not found' });
    }
    
    res.json(updatedBeat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update beat' });
  }
});

// Delete beat
app.delete('/api/beats/:id', verifyAdmin, async (req, res) => {
  try {
    const beatId = req.params.id;
    const beat = await Beat.findById(beatId);
    
    if (!beat) {
      return res.status(404).json({ error: 'Beat not found' });
    }
    
    // Delete associated files
    if (beat.picture) {
      const picturePath = path.join(__dirname, beat.picture);
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
      }
    }
    
    if (beat.audio) {
      const audioPath = path.join(__dirname, beat.audio);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
    
    await Beat.findByIdAndDelete(beatId);
    res.json({ message: 'Beat deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete beat' });
  }
});

// File Upload Route
app.post('/api/upload-beat', verifyAdmin, async (req, res) => {
  try {
    const { title, bpm, price, genre, picture, audio } = req.body;
    
    // Validate required fields
    if (!title || !bpm || !price || !genre) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    // Validate that we have both media URLs
    if (!picture || !audio) {
      return res.status(400).json({ error: 'Both picture and audio files are required!' });
    }

    // Create the beat document
    const newBeat = new Beat({
      title,
      picture, // Using the Cloudinary URL directly
      audio,   // Using the Cloudinary URL directly
      bpm: Number(bpm),
      price: Number(price),
      genre
    });

    await newBeat.save();

    res.status(201).json({
      message: 'Beat uploaded successfully!',
      beat: newBeat
    });
  } catch (err) {
    console.error('Upload error:', err);
    // Send more detailed error message
    res.status(500).json({ 
      error: 'Failed to upload beat',
      details: err.message 
    });
  }
});

// Stripe Routes
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
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve checkout session' });
  }
});

// Stripe Webhook
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      console.log('Payment successful:', session.id);
      // Here you can add additional logic for successful payments
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  res.json({ received: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Admin dashboard route
app.get('/api/admin/dashboard', verifyAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
