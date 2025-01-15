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

// Middleware
app.use(express.json());
app.use(cors({ origin: 'https://vinkid-beatz.onrender.com' }));
const router = express.Router();

app.use("/api", authRoutes);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
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
      // Hash the admin password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Create new admin user
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

// Call this after MongoDB connection is established
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    initializeAdmin(); // Initialize admin user
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));




// Existing Beat Routes
app.get('/api/beats', async (req, res) => {
  try {
    const beats = await Beat.find();
    res.json(beats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beats' });
  }
});

app.post('/api/beats', async (req, res) => {
  try {
    const { title, picture, bpm, price, genre, audio } = req.body;
    if (!title || !picture || !bpm || !price || !genre || !audio) {
      return res.status(400).json({ error: 'All fields are required!' });
    }
    const newBeat = new Beat({
      title, picture, bpm, price, genre, audio,
    });
    await newBeat.save();
    res.status(201).json({ message: 'Beat added successfully', beat: newBeat });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add beat' });
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

// File Upload Route
app.post('/api/upload-beat', upload.fields([{ name: 'picture' }, { name: 'audio' }]), async (req, res) => {
  try {
    const { title, bpm, price, genre } = req.body;
    if (!title || !bpm || !price || !genre || !req.files.picture || !req.files.audio) {
      return res.status(400).json({ error: 'All fields and files are required!' });
    }
    const newBeat = new Beat({
      title,
      picture: `/uploads/${req.files.picture[0].filename}`,
      audio: `/uploads/${req.files.audio[0].filename}`,
      bpm,
      price,
      genre,
    });
    await newBeat.save();
    res.status(201).json({
      message: 'Beat uploaded successfully!',
      beat: newBeat,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload beat' });
  }
});

// Add these routes to your server.js file

// Update beat
app.put('/api/beats/:id', async (req, res) => {
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
app.delete('/api/beats/:id', async (req, res) => {
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
// Enhanced Stripe Routes
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
          unit_amount: Math.round(beat.price * 100), // Convert to cents
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${'https://vinkid-beatz.onrender.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${'https://vinkid-beatz.onrender.com'}/cart`,
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

app.use('/uploads', express.static('uploads'));

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Remove the bcrypt.hash here - let the User model handle it
    const newUser = new User({ username, email, password }); // Pass plain password
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
}); 
const AdminPassword = process.env.ADMIN_PASSWORD;
const AdminEmail = process.env.ADMIN_EMAIL;


// In server.js, replace the login route with this:
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Special handling for admin login
    if (email === process.env.ADMIN_EMAIL) {
      // Verify against both stored password and environment password
      const isEnvPasswordValid = password === process.env.ADMIN_PASSWORD;
      const isStoredPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isEnvPasswordValid && !isStoredPasswordValid) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Ensure admin flag is set
      if (!user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
    } else {
      // Regular user login
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Generate JWT token with admin status
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
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

// Add this function to ensure admin exists and has correct credentials
async function ensureAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not properly configured');
      return;
    }

    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      // Update existing admin
      adminUser.isAdmin = true;
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser.password = hashedPassword;
      await adminUser.save();
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = new User({
        username: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });
      await adminUser.save();
    }
    
    console.log('Admin user configured successfully');
  } catch (error) {
    console.error('Error configuring admin user:', error);
  }
}

// Call this after MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    ensureAdminUser(); // Ensure admin exists with correct credentials
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Add middleware to verify admin status
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

// Example protected admin route
app.get('/api/admin/dashboard', verifyAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard data' });
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

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      console.log('Payment successful:', session.id);
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  res.json({ received: true });
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
