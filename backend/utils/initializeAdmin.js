const bcrypt = require("bcryptjs");
const User = require("../models/User"); 

// Function to initialize admin user during application startup
async function initializeAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate admin credentials are configured
    if (!adminEmail || !adminPassword) {
      console.error("Admin credentials not properly configured");
      return;
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const adminUser = new User({
        username: "Admin",
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      });

      await adminUser.save();
      console.log("✅ Admin user created successfully");
    }
  } catch (error) {
    console.error("❌ Error initializing admin:", error);
  }
}

module.exports = initializeAdmin;
