// Import dependencies
require('dotenv').config(); 
const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors'); 
const bcrypt = require('bcryptjs'); 
const path = require('path'); // File path utility
const Stripe = require('stripe'); // Payment processing library

// Local Imports
const authRoutes = require("./routes/authRoutes"); 
const beatRoutes = require("./routes/beatRoutes");
const User = require('./models/User');
const { verifyAdmin } = require("./middleware/authMiddleware");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cors({ 
  origin: ['https://vinkid-beatz.onrender.com'], // Allowed origin for CORS
  credentials: true // Allow credentials (cookies, authorization headers)
}));

// Routes
app.use("/api", authRoutes); 
app.use("/api/beats", beatRoutes);  // beats CRUD (upload, search, update, delete)

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
      success_url: `${process.env.FRONTEND_URL}/#success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/#cart`,
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
