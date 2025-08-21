// Import required dependencies
require('dotenv').config(); // Load environment variables
const express = require('express'); // Web application framework
const mongoose = require('mongoose'); // MongoDB object modeling tool
const cors = require('cors'); // Cross-Origin Resource Sharing middleware
const path = require('path'); // File path utility
const fs = require('fs'); // File system operations
const multer = require('multer'); // Middleware for handling multipart/form-data (file uploads)
const Beat = require('./models/Beat.js'); // Beat model schema
const Stripe = require('stripe'); // Payment processing library
const User = require('./models/User.js'); // User model schema
const jwt = require('jsonwebtoken'); // JSON Web Token implementation
const authRoutes = require("./routes/authRoutes"); // Custom authentication routes
const bcrypt = require('bcryptjs'); // Password hashing library
const cloudinary = require('cloudinary').v2; // Cloud storage for media files

// Initialize Express application
const app = express();
// Initialize Stripe with secret key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to normalize file paths for consistent URL generation
function normalizeFilePath(filePath) {
  const filename = path.basename(filePath);
  return `/uploads/${filename}`;
}

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Configure Cloudinary for cloud file storage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cors({ 
  origin: ['https://vinkid-beatz.onrender.com'], // Allowed origin for CORS
  credentials: true // Allow credentials (cookies, authorization headers)
}));

// Ensure uploads directory exists for local file storage
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File Upload Configuration
const storage = multer.diskStorage({
  // Set destination for uploaded files
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Generate unique filename for each uploaded file
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File type validation for uploads
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
  
  // Validate image uploads
  if (file.fieldname === 'picture' && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } 
  // Validate audio uploads  
  else if (file.fieldname === 'audio' && allowedAudioTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Configure multer for file uploads
const upload = multer({
  storage, // Use custom storage configuration
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
  fileFilter, // Use custom file type validation
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Include authentication routes
app.use("/api", authRoutes);

// Function to initialize admin user during application startup
async function initializeAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Validate admin credentials are configured
    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not properly configured');
      return;
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      // Generate salt and hash password for secure storage
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

// MongoDB Connection with initialization of admin user
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    initializeAdmin(); // Create admin user if not exists
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// User Registration Route
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login Route
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
      const isEnvPasswordValid = password === process.env.ADMIN_PASSWORD;
      const isStoredPasswordValid = await bcrypt.compare(password, user.password);
      
      // Validate admin password
      if (!isEnvPasswordValid && !isStoredPasswordValid) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Ensure admin status
      if (!user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
    } else {
      // Regular user password validation
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user details and token
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

// Middleware to verify admin authentication
const verifyAdmin = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check admin status
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Beat Routes continue... (fetching, searching, updating, deleting beats)
app.get('/api/beats', async (req, res) => {
  try {
    const beats = await Beat.find();
    res.json(beats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beats' });
  }
});

// Search beats by title or genre
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

// Fetch beats by specific genre
app.get('/api/beats/genre/:genre', async (req, res) => {
  try {
    const genre = req.params.genre;
    const beats = await Beat.find({ genre });
    res.json(beats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beats by genre' });
  }
});

// Update beat (admin-only)
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

// Delete beat (admin-only)
app.delete('/api/beats/:id', verifyAdmin, async (req, res) => {
  try {
    const beatId = req.params.id;
    const beat = await Beat.findById(beatId);
    
    if (!beat) {
      return res.status(404).json({ error: 'Beat not found' });
    }
    
    // Delete associated local files
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
// Beat Upload Route (Admin-only)
app.post('/api/upload-beat', verifyAdmin, async (req, res) => {
  try {
    const { title, bpm, price, genre, picture, audio } = req.body;
    
    // Validate required fields
    if (!title || !bpm || !price || !genre) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    // Ensure both media URLs are present
    if (!picture || !audio) {
      return res.status(400).json({ error: 'Both picture and audio files are required!' });
    }

    // Create new beat document
    const newBeat = new Beat({
      title,
      picture, // Cloudinary URL
      audio,   // Cloudinary URL
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
    res.status(500).json({ 
      error: 'Failed to upload beat',
      details: err.message 
    });
  }
});

// Stripe Checkout Session Creation Route
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cart } = req.body;
    
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.map((beat) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: beat.title,
            images: beat.picture ? [beat.picture] : [],
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

// Retrieve Stripe Checkout Session
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve checkout session' });
  }
});

// Stripe Webhook Handler
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
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
      // Additional post-payment processing can be added here
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  res.json({ received: true });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Admin Dashboard Route
app.get('/api/admin/dashboard', verifyAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

// Catch-all Route for React Single Page Application
app.get('*', (req, res) => {
  // Prevent redirecting API calls
  if (!req.url.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  } else {
    // Return 404 for unmatched API routes
    res.status(404).json({ error: 'API route not found' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown Handler
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
