// updateAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust path as needed

async function updateAdminCredentials() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Update or create admin user
    const result = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        username: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      },
      { upsert: true, new: true }
    );

    console.log('Admin credentials updated successfully');
    console.log('Admin email:', result.email);
    console.log('Admin username:', result.username);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating admin:', error);
  }
}

updateAdminCredentials();