require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const admin = await User.findOne({ email: 'vinkidbeatz@gmail.com' });
    
    if (!admin) {
      console.log('Admin user does not exist!');
      return;
    }

    console.log('Admin user found:', {
      email: admin.email,
      username: admin.username,
      isAdmin: admin.isAdmin,
      hasPassword: !!admin.password,
      passwordLength: admin.password?.length
    });

    // Test password match
    const testPassword = '@vinkidbeatz2025!';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('Password match test:', isMatch);

    // If password doesn't match, update it
    if (!isMatch) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('Admin password updated');
      
      // Verify the update
      const newMatch = await bcrypt.compare(testPassword, admin.password);
      console.log('New password match test:', newMatch);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmin();
