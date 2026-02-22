// scripts/createAdmin.js
//run node scripts/createAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./../models/admin");
require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const existing = await Admin.findOne({ email: "sharkjoe@gmail.com" });
  if (existing) {
    console.log("Admin already exists.");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("sharkjoe123", 10);
  await Admin.create({ email: "sharkjoe@gmail.com", password: hashedPassword });
  console.log("Admin created successfully!");
  process.exit();
}).catch(console.error);
