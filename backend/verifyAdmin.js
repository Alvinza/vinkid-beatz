require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function verifyAndUpdateAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // First, let's check if admin exists
    let adminUser = await User.findOne({ email: 'vinkidbeatz@gmail.com' });
    
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('@vinkidbeatz2025!', salt);

    if (adminUser) {
      // Update existing admin
      adminUser.password = hashedPassword;
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log('Admin user updated:', adminUser.email);
    } else {
      // Create new admin
      adminUser = new User({
        username: 'Admin',
        email: 'vinkidbeatz@gmail.com',
        password: hashedPassword,
        isAdmin: true
      });
      await adminUser.save();
      console.log('New admin user created:', adminUser.email);
    }

    // Verify the update
    const verifiedAdmin = await User.findOne({ email: 'vinkidbeatz@gmail.com' });
    console.log('Admin verification:', {
      email: verifiedAdmin.email,
      isAdmin: verifiedAdmin.isAdmin,
      exists: !!verifiedAdmin
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAndUpdateAdmin();
