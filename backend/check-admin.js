require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createOrUpdateAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'vinkidbeatz@gmail.com';
    const adminPassword = '@vinkidbeatz2025!';

    // First, delete any existing admin user to start fresh
    await User.deleteOne({ email: adminEmail });
    console.log('Cleaned up any existing admin accounts');

    // Create new admin user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new User({
      username: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true
    });

    await newAdmin.save();
    console.log('New admin user created');

    // Verify the admin user
    const verifiedAdmin = await User.findOne({ email: adminEmail });
    const passwordMatch = await bcrypt.compare(adminPassword, verifiedAdmin.password);

    console.log('Admin verification:', {
      exists: !!verifiedAdmin,
      email: verifiedAdmin.email,
      isAdmin: verifiedAdmin.isAdmin,
      hasPassword: !!verifiedAdmin.password,
      passwordLength: verifiedAdmin.password.length,
      passwordMatch: passwordMatch
    });

    if (!passwordMatch) {
      throw new Error('Password verification failed!');
    }

    console.log('\nAdmin account created successfully!');
    console.log('Login credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createOrUpdateAdmin();
