// routes/admin.js
const express = require("express");

const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const Admin = require("../models/admin");
const Profile = require('../models/InstructorModels/InstructorProfile');
const StudentProfile = require('../models/StudentModels/profile');
const Student = require("../models/StudentModels/studentModels");
const Instructor = require("../models/InstructorModels/InstructorModels");
const Course = require("../models/course"); // Correct path
const Category = require('../models/category');

//================= Dashboard Stats ====================
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalStudents = await Student.countDocuments();
    const totalInstructors = await Instructor.countDocuments();
    const totalCourses = await Course.countDocuments();

    // 2. Recent Courses (Last 5)
    // Return shape suitable for DataTable
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('instructor', 'firstName lastName')
      .select('courseName courseDescription createdAt instructor studentsEnrolled price level status')
      .lean();

    // 3. Trending Courses (Top 5 by enrollment)
    // Using aggregation to sort by array size
    const trendingCourses = await Course.aggregate([
      {
        $addFields: {
          enrollmentCount: { $size: { $ifNull: ["$studentsEnrolled", []] } }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: "instructors", // Assuming collection name is 'instructors' (default Mongoose plural)
          localField: "instructor",
          foreignField: "_id",
          as: "instructorDetails"
        }
      },
      {
        $project: {
          courseName: 1,
          thumbnail: 1,
          price: 1,
          level: 1,
          enrollmentCount: 1,
          ratingAndReviews: 1
        }
      }
    ]);

    // 4. Analytics: Course Distribution by Category
    // We need category names. 
    // First group by category ID
    const categoryGroups = await Course.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Populate category names
    const categoryStats = await Category.populate(categoryGroups, { path: "_id", select: "name" });
    const formattedCategoryStats = categoryStats.map(c => ({
      id: c._id?._id || 'unknown',
      name: c._id?.name || 'Uncategorized',
      value: c.count
    }));


    // 5. Reports: Student Signups (Last 12 Months)
    // Simple aggregation by month
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);

    const signupStats = await Student.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Fill in missing months? For simplicity, we send what we have. 
    // Ideally frontend handles filling or we do it here. 
    // Let's just map it to a simple array if possible, or send the array of objects.

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalInstructors,
        totalCourses,
        recentCourses,
        trendingCourses,
        categoryStats: formattedCategoryStats,
        signupStats
      }
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats", error: err.message });
  }
};


//================admin Login ========================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Optionally set cookie:
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

//======================Admin crud operations on student ===========

// Get all students
// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find(); // ✅ Removed the .populate()
    res.status(200).json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//======================Admin function to get all courses ===========

// Create a student
// exports.createStudent = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password,
//       //image,
//         //additionalDetails
//          } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newStudent = await Student.create({
//       firstName, lastName, email, password: hashedPassword,
//        //image, additionalDetails
//     });
//     res.status(201).json({ success: true, data: newStudent });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
exports.createStudent = async (req, res) => {
  try {
    // extract data 
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(401).json({
        success: false,
        message: 'All fields are required..!'
      });
    }

    // check both pass matches or not
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        messgae: 'passowrd & confirm password does not match, Please try again..!'
      });
    }

    // check user have registered already
    const checkUserAlreadyExits = await Student.findOne({ email });

    // if yes ,then say to login
    if (checkUserAlreadyExits) {
      return res.status(400).json({
        success: false,
        message: 'User registered already, go to Login Page'
      });
    }



    // hash - secure passoword
    let hashedPassword = await bcrypt.hash(password, 10);

    // additionDetails (required by the student schema; mirror the signup flow)
    const profileDetails = await StudentProfile.create({
      dateOfBirth: null, about: null
    });

    // create entry in DB
    const userData = await Student.create({
      firstName, lastName, email, password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    });

    // // Generate and save OTP
    // const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // await OTP.create({ email, otp: generatedOtp });


    // send email logic here (optional to keep inside a helper)
    //await mailSender(email, `Your OTP is ${generatedOtp}`, "Verify your email");

    // return success message
    res.status(200).json({
      success: true,
      message: 'User Registered Successfully'
    });
  }

  catch (error) {
    console.log('Error while registering user (signup)');
    console.log(error)
    res.status(401).json({
      success: false,
      error: error.message,
      messgae: 'User cannot be registered , Please try again..!'
    })
  }
}
// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const update = req.body;

    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    const student = await Student.findByIdAndUpdate(studentId, update, { new: true });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    await Student.findByIdAndDelete(studentId);
    res.status(200).json({ success: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//===============INSTRUCTORS========================

exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().populate("additionalDetails");
    res.status(200).json({ success: true, data: instructors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// exports.createInstructor = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, image, additionalDetails } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newInstructor = await Instructor.create({
//       firstName, lastName, email, password: hashedPassword, image, additionalDetails
//     });
//     res.status(201).json({ success: true, data: newInstructor });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
exports.createInstructor = async (req, res) => {
  try {
    // extract data 
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(401).json({
        success: false,
        message: 'All fields are required..!'
      });
    }

    // check both pass matches or not
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        messgae: 'passowrd & confirm password does not match, Please try again..!'
      });
    }

    // check user have registered already
    const checkUserAlreadyExits = await Instructor.findOne({ email });

    // if yes ,then say to login
    if (checkUserAlreadyExits) {
      return res.status(400).json({
        success: false,
        message: 'User registered already, go to Login Page'
      });
    }



    // hash - secure passoword
    let hashedPassword = await bcrypt.hash(password, 10);

    // additionDetails
    const profileDetails = await Profile.create({
      gender: null, dateOfBirth: null, about: null, contactNumber: null
    });


    // create entry in DB
    const userData = await Instructor.create({
      firstName, lastName, email, password: hashedPassword,
      //contactNumber,
      additionalDetails: profileDetails._id,

      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    });

    // // Generate and save OTP
    // const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // await OTP.create({ email, otp: generatedOtp });


    // send email logic here (optional to keep inside a helper)
    //await mailSender(email, `Your OTP is ${generatedOtp}`, "Verify your email");

    // return success message
    res.status(200).json({
      success: true,
      message: 'User Registered Successfully'
    });
  }

  catch (error) {
    console.log('Error while registering user (signup)');
    console.log(error)
    res.status(401).json({
      success: false,
      error: error.message,
      messgae: 'User cannot be registered , Please try again..!'
    })
  }
}

exports.updateInstructor = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const update = req.body;

    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    const instructor = await Instructor.findByIdAndUpdate(instructorId, update, { new: true });
    res.status(200).json({ success: true, data: instructor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.deleteInstructor = async (req, res) => {
  try {
    const instructorId = req.params.id;
    console.log(`the instructor id is ${instructorId}`)
    await Instructor.findByIdAndDelete(instructorId);
    res.status(200).json({ success: true, message: "Instructor deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};