require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function verifyAndUpdateAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const adminEmail = 'vinkidbeatz@gmail.com';
    const adminPassword = '@vinkidbeatz2025!';
    
    // First verify if admin exists
    let admin = await User.findOne({ email: adminEmail });
    console.log('Existing admin found:', !!admin);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    if (admin) {
      // Update existing admin
      admin.password = hashedPassword;
      admin.isAdmin = true;
      admin.username = 'Admin';
      await admin.save();
      console.log('Admin updated');
    } else {
      // Create new admin
      admin = new User({
        username: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });
      await admin.save();
      console.log('New admin created');
    }
    
    // Verify the admin account
    const verifiedAdmin = await User.findOne({ email: adminEmail });
    console.log('Admin verification:', {
      exists: !!verifiedAdmin,
      email: verifiedAdmin?.email,
      isAdmin: verifiedAdmin?.isAdmin,
      hasPassword: !!verifiedAdmin?.password,
      passwordLength: verifiedAdmin?.password?.length
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAndUpdateAdmin();
