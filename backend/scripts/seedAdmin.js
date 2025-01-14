const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Adjust path based on location

const seedAdminUser = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/your_database_name", {

    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt); // Secure admin password

    const adminUser = new User({
      username: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      isAdmin: true,
    });

    await adminUser.save();
    console.log("Admin user created!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating admin user:", error);
    mongoose.connection.close();
  }
};

seedAdminUser();
