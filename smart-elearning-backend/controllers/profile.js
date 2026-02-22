const Profile = require('../models/StudentModels/profile');
const User = require('./../models/StudentModels/studentModels');
const CourseProgress = require('../models/courseProgress')
const Course = require('../models/course')
const mailSender = require('./../utils/mailSender');
const mongoose = require('mongoose'); // ✅ if CommonJS
const PDFDocument = require("pdfkit");

const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');
const { convertSecondsToDuration } = require('../utils/secToDuration')
// const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail'); 


// ================ update Profile ================
exports.updateProfile = async (req, res) => {
  try {
    // extract data
    const { gender = '', dateOfBirth = "", about = "", contactNumber = '', firstName, lastName } = req.body;

    // extract userId
    const userId = req.user.id;


    // find profile
    const userDetails = await User.findById(userId);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    // console.log('User profileDetails -> ', profileDetails);

    // Update the profile fields
    userDetails.firstName = firstName;
    userDetails.lastName = lastName;
    await userDetails.save()

    profileDetails.gender = gender;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;

    // save data to DB
    await profileDetails.save();

    const updatedUserDetails = await User.findById(userId)
      .populate({
        path: 'additionalDetails'
      })
    // console.log('updatedUserDetails -> ', updatedUserDetails);

    // return response
    res.status(200).json({
      success: true,
      updatedUserDetails,
      message: 'Profile updated successfully'
    });
  }
  catch (error) {
    console.log('Error while updating profile');
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while updating profile'
    })
  }
}


// ================ delete Account ================
exports.deleteAccount = async (req, res) => {
  try {
    // extract user id
    const userId = req.user.id;
    // console.log('userId = ', userId)

    // validation
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // delete user profile picture From Cloudinary
    await deleteResourceFromCloudinary(userDetails.image);

    // if any student delete their account && enrollded in any course then ,
    // student entrolled in particular course sholud be decreae by one
    // user - courses - studentsEnrolled
    const userEnrolledCoursesId = userDetails.courses
    console.log('userEnrolledCourses ids = ', userEnrolledCoursesId)

    for (const courseId of userEnrolledCoursesId) {
      await Course.findByIdAndUpdate(courseId, {
        $pull: { studentsEnrolled: userId }
      })
    }

    // first - delete profie (profileDetails)
    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    // second - delete account
    await User.findByIdAndDelete(userId);


    // sheduale this deleting account , crone job

    // return response
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    })
  }
  catch (error) {
    console.log('Error while updating profile');
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while deleting profile'
    })
  }
}


// ================ get details of user ================
exports.getUserDetails = async (req, res) => {
  try {
    // extract userId
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('ID:', userId, 'Role:', userRole);


    // get user details
    const userDetails = await User.findById(userId).populate('additionalDetails').exec();


    res.status(200).json({
      success: true,
      data: userDetails,
      message: 'User data fetched successfully'
    })
  }
  catch (error) {
    console.log('Error while fetching user details');
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while fetching user details'
    })
  }
}



// ================ Update User profile Image ================
exports.updateUserProfileImage = async (req, res) => {
  try {
    const profileImage = req.files?.profileImage;
    const userId = req.user.id;

    // validation
    // console.log('profileImage = ', profileImage)

    // upload imga eto cloudinary
    const image = await uploadImageToCloudinary(profileImage,
      process.env.FOLDER_NAME, 1000, 1000);

    // console.log('image url - ', image);

    // update in DB 
    const updatedUserDetails = await User.findByIdAndUpdate(userId,
      { image: image.secure_url },
      { new: true }
    )
      .populate({
        path: 'additionalDetails'

      })

    // success response
    res.status(200).json({
      success: true,
      message: `Image Updated successfully`,
      data: updatedUserDetails,
    })
  }
  catch (error) {
    console.log('Error while updating user profile image');
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while updating user profile image',
    })
  }
}




// ================ Get Enrolled Courses ================
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({ _id: userId, })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()

    userDetails = userDetails.toObject()

    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)

        userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds)
        SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length
      }

      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })

      courseProgressCount = courseProgressCount?.completedVideos.length

      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round((courseProgressCount / SubsectionLength) * 100 * multiplier) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}




// ================ instructor Dashboard ================
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      //const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        //totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json(
      {
        courses: courseData,
        message: 'Instructor Dashboard Data fetched successfully'
      },

    )
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// ================ enroll Students to course after payment ================

exports.enrollStudents = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user.id;

    console.log("Incoming enroll body:", req.body);
    console.log("User from token:", req.user);


    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: "Courses must be provided as an array."
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing."
      });
    }

    const results = await Promise.allSettled(
      courses.map(async (courseId) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new Error(`Invalid course ID: ${courseId}`);
          }

          // 1. Fetch the course with instructor
          const courseDoc = await Course.findById(courseId).select("instructor");
          if (!courseDoc) {
            throw new Error(`Course not found: ${courseId}`);
          }
          if (!courseDoc.instructor) {
            throw new Error(`Instructor missing for course: ${courseId}`);
          }

          // 2. Add user to course's student list
          await Course.findByIdAndUpdate(
            courseId,
            { $addToSet: { studentsEnrolled: userId } },
            { new: true }
          );

          // 3. Create course progress with instructor included
          await CourseProgress.create({
            courseID: courseId,
            userId: userId,
            instructor: courseDoc.instructor, // ✅ Now required field is set
            completedVideos: [],
            passedLevelQuiz: [],
            lastAccessed: new Date(),
            completionStatus: "not_started"
          });

          // 4. Link course to user
          await User.findByIdAndUpdate(
            userId,
            {
              $addToSet: {
                courses: courseId
              }
            }
          );

          return { courseId, success: true };

        } catch (error) {
          console.error(`Enrollment failed for course ${courseId}:`, error);
          throw error;
        }
      })
    );

    const coreFailures = results.filter(r => r.status === 'rejected');

    if (coreFailures.length > 0) {
      console.error("❌ Core enrollment failures:");
      coreFailures.forEach(f => console.error(" - Reason:", f.reason));

      return res.status(207).json({
        success: false,
        message: "Some enrollments failed",
        failures: coreFailures.map(f => f.reason.message)
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrolled to all courses successfully."
    });

    // Inside the loop after successful enrollment
    const ActivityLog = require('../models/ActivityLog');

    ActivityLog.log({
      userId,
      userModel: 'students',
      userRole: 'student',
      action: 'course_enroll',
      courseId,
      metadata: { courseName: courseDoc.courseName }
    }).catch(console.error);

  } catch (error) {
    console.error("Enrollment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.onBoardDetails = async (req, res) => {
  try {
    const { learningStyle, interests, difficultyPreference, avatar } = req.body;
    console.log(`Onboarding Request for User ${req.user.id}:`, { learningStyle, interests, difficultyPreference, avatar });

    if (!learningStyle || !difficultyPreference) {
      return res.status(400).json({ message: 'Missing required onboarding fields' });
    }

    const normalizedDifficulty = difficultyPreference?.toLowerCase();
    const updateData = {
      learningStyle,
      interests,
      avatar,
      onboardingComplete: true
    };

    if (normalizedDifficulty === 'beginner') {
      updateData.difficultyPreference = 'beginner';
      updateData.desiredLevel = null;
    } else if (normalizedDifficulty === 'intermediate' || normalizedDifficulty === 'advanced') {
      updateData.desiredLevel = normalizedDifficulty;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found in Onboarding' });
    }

    res.status(200).json({ message: 'Onboarding complete', user: updatedUser });
  } catch (err) {
    console.error('Onboarding Server Error:', err);
    res.status(500).json({ message: 'Server error during onboarding', error: err.message });
  }
};

exports.ChildReport = async (req, res) => {
  try {
    const { childId } = req.params;

    const user = await User.findById(childId)
      .populate('courses')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `child-report-${user.firstName}-${user.lastName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);


    // ======= HEADER ========
    doc
      .font('Times-Bold')
      .fontSize(20)
      .fillColor('#1f3b87')
      .text('Child Learning Report', { align: 'center', underline: true });

    doc.moveDown(2);

    // ======= CHILD INFO SECTION ========
    doc
      .fontSize(14)
      .font('Times-Bold')
      .fillColor('#000')
      .text('Child Profile Information', { underline: true });

    doc.moveDown(0.5);

    // Draw info box
    const infoBoxTop = doc.y;
    const infoBoxLeft = doc.x;
    const boxWidth = 500;

    // Child data
    const infoFields = [
      { label: 'Full Name', value: `${user.firstName} ${user.lastName}` },
      { label: 'Email', value: user.email },
      { label: 'Learning Style', value: user.learningStyle },
      { label: 'Sign Language', value: user.signLanguage },
      { label: 'Interests', value: (user.interests || []).join(', ') },
      { label: 'Registered Date', value: new Date(user.createdAt).toLocaleDateString() },
    ];

    doc
      .fontSize(12)
      .font('Times-Roman')
      .fillColor('#000');

    infoFields.forEach(({ label, value }) => {
      doc.text(`${label}:`, infoBoxLeft + 10, doc.y).fillColor('#444');
      doc.text(`${value}`, { indent: 20 });
      doc.moveDown(0.5);
    });

    doc.moveDown(2);

    // ======= COURSES SECTION ========
    doc
      .fontSize(14)
      .font('Times-Bold')
      .fillColor('#000')
      .text('Enrolled Courses', { underline: true });

    doc.moveDown(1);

    for (const course of user.courses) {
      const leftPadding = 60;
      const lineHeight = 16;

      doc
        .fontSize(13)
        .font('Times-Bold')
        .fillColor('#1a1a1a')
        .text(`${course.courseName} (${course.level})`, leftPadding, doc.y);

      doc
        .fontSize(12)
        .font('Times-Roman')
        .fillColor('#333')
        .text(`Description: ${course.courseDescription}`, leftPadding, doc.y + 5, {
          width: 480 - leftPadding,
        });

      const progress = await CourseProgress.findOne({
        courseID: course._id,
        userId: childId
      });

      const completed = progress?.completedVideos?.length || 0;
      const total = course.courseContent.length;
      const percent = total ? Math.round((completed / total) * 100) : 0;

      // Progress label
      doc
        .fontSize(11)
        .font('Times-Italic')
        .fillColor('#000')
        .text(`Progress: ${percent}%`, leftPadding, doc.y + 8);

      // Progress bar
      const barX = leftPadding;
      const barY = doc.y + 2;
      const barWidth = 300;
      const barHeight = 10;
      const filledWidth = (percent / 100) * barWidth;

      doc
        .strokeColor('#aaa')
        .lineWidth(1)
        .rect(barX, barY, barWidth, barHeight)
        .stroke();

      doc
        .fillColor('#4caf50')
        .rect(barX, barY, filledWidth, barHeight)
        .fill();

      doc.moveDown(2);
    }

    // ======= FOOTER ========
    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Times-Italic')
      .text(
        'Report generated by Smart Learning System for Hearing Impairment Support',
        50,
        770,
        { align: 'center' }
      );
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('Error generating report:', err.message);
    //     if (!res.headersSent) {
    //       res.status(500).json({
    //         success: false,
    //         message: 'Failed to generate report',
    //         error: err.message
    //       });
    //     }
  }
};

// ================ Update Learning Style ================
exports.updateLearningStyle = async (req, res) => {
  try {
    const { learningStyle } = req.body;
    const userId = req.user.id;

    if (!learningStyle || !['visual', 'text', 'literacy', 'numeracy'].includes(learningStyle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid learning style. Must be: visual, text, literacy, or numeracy'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { learningStyle },
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Learning style updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Learning style update error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating learning style'
    });
  }
};

// ================ Update Difficulty Level ================
exports.updateDifficultyLevel = async (req, res) => {
  try {
    const { difficultyPreference } = req.body;
    const userId = req.user.id;

    if (!difficultyPreference || !['beginner', 'intermediate', 'advanced'].includes(difficultyPreference.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level. Must be: beginner, intermediate, or advanced'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { difficultyPreference: difficultyPreference.toLowerCase() },
      { new: true, runValidators: false }
    ).populate('additionalDetails');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Difficulty level updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Difficulty level update error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating difficulty level'
    });
  }
};

