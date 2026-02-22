const Course = require('../models/course');
const User = require('../models/user');
const instructor = require('../models/InstructorModels/InstructorModels')
const Category = require('../models/category');
const Section = require('../models/section')
const SubSection = require('../models/subSection')
const CourseProgress = require('../models/courseProgress')

//const student=require('../models/StudentModels/studentModels');

const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');
const { convertSecondsToDuration } = require("../utils/secToDuration");
const studentModels = require('../models/StudentModels/studentModels');


// ================ create new course ================
exports.createCourse = async (req, res) => {
  try {
    let { courseName, courseDescription, whatYouWillLearn, category, level, status, tag: _tag } = req.body;

    const tag = JSON.parse(_tag);
    const thumbnail = req.files?.thumbnailImage;

    if (!level || !courseName || !courseDescription || !whatYouWillLearn || !category || !thumbnail || !tag.length) {
      return res.status(400).json({
        success: false,
        message: 'All Fields are required'
      });
    }

    if (!status) {
      status = "Draft";
    }

    // If Admin, use provided instructorId. If Instructor, use their own ID.
    let instructorId = req.user.id;
    if (req.user.role === 'admin' && req.body.instructorId) {
      instructorId = req.body.instructorId;
    }

    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(401).json({
        success: false,
        message: 'Category Details not found'
      });
    }

    // upload thumbnail
    const thumbnailDetails = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

    // 🔑 find the max order from existing courses
    const lastCourse = await Course.findOne().sort({ order: -1 }).select("order");
    const nextOrder = lastCourse ? lastCourse.order + 1 : 1;

    // create new course with auto-incremented order
    const newCourse = await Course.create({
      level,
      courseName,
      courseDescription,
      instructor: instructorId,
      whatYouWillLearn,
      category: categoryDetails._id,
      tag,
      status,
      thumbnail: thumbnailDetails.secure_url,
      order: nextOrder,
      createdAt: Date.now(),
    });

    // add course to instructor
    await instructor.findByIdAndUpdate(
      instructorId,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // add course to category
    await Category.findByIdAndUpdate(
      { _id: category },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: newCourse,
      message: 'New Course created successfully'
    });
  } catch (error) {
    console.log('Error while creating new course:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while creating new course'
    });
  }
};

// ================= Get Next Content for Autoplay =================
exports.getNextContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Get progress
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .exec();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 1️⃣ Check remedial first
    if (courseProgress?.needsRemedial) {
      const nextRemedial = courseProgress.remedialContent.find(r => !r.completed);
      if (nextRemedial) {
        const subSection = await SubSection.findById(nextRemedial.subSectionId);
        return res.status(200).json({
          type: "remedial",
          message: "Continue remedial content",
          content: subSection,
        });
      } else {
        // If all remedials done, clear flags
        courseProgress.needsRemedial = false;
        courseProgress.remedialContent = [];
        await courseProgress.save();
      }
    }

    // 2️⃣ Otherwise normal flow → find next uncompleted video
    const completedIds = courseProgress?.completedVideos.map(v => v.subsectionId.toString()) || [];

    for (const section of course.courseContent) {
      for (const subSection of section.subSection) {
        if (!completedIds.includes(subSection._id.toString())) {
          return res.status(200).json({
            type: "lesson",
            message: "Next lesson",
            content: subSection,
          });
        }
      }
    }

    // 3️⃣ If NO videos left → Check for Quiz
    // Check if course has a global quiz attached
    if (course.quizzes && course.quizzes.length > 0) {
      // Check if this quiz is already passed? (optional, but good practice)
      return res.status(200).json({
        type: "quiz",
        message: "Time for a quiz!",
        id: course.quizzes[0] // Return the quiz ID
      });
    }

    const currentOrder = course.order || 1;
    const nextCourseInLevel = await Course.findOne({
      level: course.level,
      order: { $gt: currentOrder }
    }).sort({ order: 1 });

    if (nextCourseInLevel) {
      return res.status(200).json({
        type: "nextCourse",
        message: `You have completed ${course.courseName}. Continue with next course in ${course.level}.`,
        course: nextCourseInLevel,
      });
    }



    // 4️⃣ If no more in this level → Check strict completion before suggesting next level
    const levelOrder = ["Beginner", "Intermediate", "Advanced"];
    const currentLevelIndex = levelOrder.indexOf(course.level);
    const nextLevel = levelOrder[currentLevelIndex + 1];

    if (nextLevel) {
      // STRICT CHECK: Are all courses in current level completed?
      const currentLevelCourses = await Course.find({
        level: course.level,
        status: 'Published'
      }).select('_id');

      const allProgress = await CourseProgress.find({
        userId: userId,
        courseID: { $in: currentLevelCourses.map(c => c._id) }
      }).select('passedLevelQuiz isCourseCompleted');

      // Check if all are passed
      const completedCourseIds = new Set();
      allProgress.forEach(p => {
        // Accept either passedLevelQuiz OR explicit completion (for legacy compatibility)
        if ((p.passedLevelQuiz && p.passedLevelQuiz.some(q => q.passed)) || p.isCourseCompleted) {
          completedCourseIds.add(p.courseID.toString());
        }
      });

      const allCurrentLevelCompleted = currentLevelCourses.every(c => completedCourseIds.has(c._id.toString()));

      if (allCurrentLevelCompleted) {
        const firstCourseNextLevel = await Course.findOne({ level: nextLevel }).sort({ order: 1 });
        if (firstCourseNextLevel) {
          return res.status(200).json({
            type: "nextCourse",
            message: `You have mastered ${course.level}! Move to ${nextLevel}.`,
            course: firstCourseNextLevel,
            canAdvance: true
          });
        }
      } else {
        // Not done yet
        const remaining = currentLevelCourses.length - completedCourseIds.size;
        return res.status(200).json({
          type: "completed",
          message: `You have finished this course, but have ${remaining} more ${course.level} courses to complete before unlocking ${nextLevel}.`,
          canAdvance: false
        });
      }
    }


    // 4️⃣ No more content
    return res.status(200).json({
      type: "completed",
      message: "You have completed all content",
    });

  } catch (err) {
    console.error("getNextContent error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getCoursesByLevel = async (req, res) => {
  try {
    const studentId = req.user.id
    const student = await studentModels.findById(studentId)

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Get courses for student's level
    const courses = await Course.find({
      level: student.level,
      // Optionally filter by student interests
      ...(student.interests.length > 0 ? { tags: { $in: student.interests } } : {})
    }).populate('instructor')

    res.status(200).json({
      success: true,
      courses,
      studentLevel: student.level
    })

  } catch (err) {
    console.error('Course fetching error:', err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
}


// ================ show all courses ================
exports.getAllCourses = async (req, res) => {
  try {
    // Get student's current level from auth
    const studentId = req.user?.id;
    let studentLevel = 'Beginner'; // Default to Beginner

    if (studentId) {
      const Student = require('../models/StudentModels/studentModels');
      const student = await Student.findById(studentId).select('difficultyPreference');
      if (student && student.difficultyPreference) {
        // Convert to match course level format: beginner -> Beginner
        studentLevel = student.difficultyPreference.charAt(0).toUpperCase() +
          student.difficultyPreference.slice(1);
      }
    }

    // Filter courses by student's level
    const allCourses = await Course.find({ level: studentLevel },
      {
        courseName: true, courseDescription: true, price: true, thumbnail: true, instructor: true,
        ratingAndReviews: true, studentsEnrolled: true, level: true
      })
      .populate({
        path: 'instructor',
        select: 'firstName lastName email image'
      })
      .exec();

    return res.status(200).json({
      success: true,
      data: allCourses,
      studentLevel: studentLevel,
      message: `Courses for ${studentLevel} level fetched successfully`
    });
  }

  catch (error) {
    console.log('Error while fetching data of all courses');
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while fetching data of all courses'
    })
  }
}



// ================ Get Course Details ================
exports.getCourseDetails = async (req, res) => {
  try {
    // get course ID
    const { courseId } = req.body;

    // find course details
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      //.populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()


    //validation
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    // console.log('courseDetails -> ', courseDetails)
    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    //return response
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
      message: 'Fetched course data successfully'
    })
  }

  catch (error) {
    console.log('Error while fetching course details');
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while fetching course details',
    });
  }
}





exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });


    // Restrict Intermediate and Advanced access ONLY for users who chose a higher level on onboarding
    if (courseDetails.level !== "Beginner") {
      const normalizedLevel = courseDetails.level?.toLowerCase();
      const student = await studentModels.findById(userId).select('difficultyPreference desiredLevel');
      const isSkipFlow =
        student?.difficultyPreference === 'beginner' &&
        student?.desiredLevel &&
        student?.desiredLevel !== 'beginner';

      if (isSkipFlow) {
        if (normalizedLevel !== student.desiredLevel) {
          return res.status(403).json({
            success: false,
            message: `Access to ${courseDetails.level} course requires passing the ${student.desiredLevel} assessment first.`,
            requireQuiz: true,
            requiredLevel: student.desiredLevel,
          });
        }

        const categoryName = courseDetails.category?.name || "";
        const normalizedCategory = (() => {
          const name = categoryName.toLowerCase();
          if (name === "kusoma") return "literacy";
          if (name === "kuandika" || name === "kuhesabu") return "numeracy";
          return null;
        })();

        const passedAssessments = courseProgressCount?.passedLevelQuiz || [];
        const hasPassed = passedAssessments.some(
          (entry) =>
            entry.passed === true &&
            entry.level === normalizedLevel &&
            (!normalizedCategory || entry.category === normalizedCategory)
        );

        if (!hasPassed) {
          return res.status(403).json({
            success: false,
            message: `Access to ${courseDetails.level} course requires passing the ${courseDetails.level} assessment first.`,
            requireQuiz: true,
            requiredLevel: courseDetails.level,
          });
        }
      }
    }

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // ✅ Only block draft access for non-instructors
    if (
      courseDetails.status === "Draft" &&
      courseDetails.instructor._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: `Accessing a draft course is forbidden`,
      });
    }

    // Total duration calculation
    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================ Edit Course Details ================
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      // console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag"
          //|| key === "instructions"
        ) {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    // updatedAt
    course.updatedAt = Date.now();

    //   save data
    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      //.populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    // success response
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error while updating course",
      error: error.message,
    })
  }
}



// ================ Get a list of Course for a given Instructor ================
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({ instructor: instructorId, }).sort({ createdAt: -1 })


    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
      totalDurationInSeconds: totalDurationInSeconds,
      message: 'Courses made by Instructor fetched successfully'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}



// ================ Delete the Course ================
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await studentModels.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // delete course thumbnail From Cloudinary
    await deleteResourceFromCloudinary(course?.thumbnail);

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          const subSection = await SubSection.findById(subSectionId)
          if (subSection) {
            await deleteResourceFromCloudinary(subSection.videoUrl) // delete course videos From Cloudinary
          }
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Error while Deleting course",
      error: error.message,
    })
  }
}


// GET /courses/level/:level
exports.getCoursesByLevelExplicit = async (req, res) => {
  try {
    const level = req.params.level;
    const studentId = req.user.id;

    const student = await studentModels.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }


    // Map learning style to Category Name
    const styleToCategoryMap = {
      'literacy': 'Kusoma',
      'numeracy': 'Kuhesabu'
    };
    const learningStyle = student.learningStyle?.toLowerCase();
    const categoryName = styleToCategoryMap[learningStyle] || learningStyle;

    const matchedCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
    });

    // Gate Intermediate/Advanced courses ONLY for users who chose a higher level on onboarding
    const normalizedLevel = level?.toLowerCase();
    const isSkipFlow =
      student?.difficultyPreference === 'beginner' &&
      student?.desiredLevel &&
      student?.desiredLevel !== 'beginner';

    if (isSkipFlow && normalizedLevel !== 'beginner') {
      if (normalizedLevel !== student.desiredLevel) {
        return res.status(403).json({
          success: false,
          courses: [],
          requestedLevel: level,
          message: `Access to ${level} courses requires passing the ${student.desiredLevel} assessment first.`,
          requireQuiz: true,
          requiredLevel: student.desiredLevel
        });
      }

      const progress = await CourseProgress.findOne({ userId: studentId });
      const normalizedCategory = categoryName?.toLowerCase() === 'kusoma' ? 'literacy' : 'numeracy';
      const hasPassedAssessment = progress?.passedLevelQuiz?.some(
        (entry) =>
          entry.passed === true &&
          entry.level === normalizedLevel &&
          entry.category === normalizedCategory
      );

      if (!hasPassedAssessment) {
        return res.status(403).json({
          success: false,
          courses: [],
          requestedLevel: level,
          message: `Access to ${level} courses requires passing the ${level} assessment first.`,
          requireQuiz: true,
          requiredLevel: level
        });
      }
    }

    const query = {
      level: level.charAt(0).toUpperCase() + level.slice(1).toLowerCase(), // Capitalize "Beginner"
      ...(student.interests?.length > 0 ? { tags: { $in: student.interests } } : {})
    };

    if (matchedCategory) {
      query.category = matchedCategory._id;
    } else if (categoryName) {
      // If a specific category was expected but not found, return empty to avoid showing wrong content
      return res.status(200).json({
        success: true,
        courses: [],
        requestedLevel: level,
        message: `No content found for ${categoryName}`
      });
    }

    const courses = await Course.find(query)

    res.status(200).json({
      success: true,
      courses,
      requestedLevel: level,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getCoursesForOnboardedUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await studentModels.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { learningStyle, interests, difficultyPreference } = user;
    const formattedLevel = difficultyPreference.charAt(0).toUpperCase() + difficultyPreference.slice(1).toLowerCase();

    // 1️⃣ Map learning style to Category Name
    const styleToCategoryMap = {
      'literacy': 'Kusoma',
      'numeracy': 'Kuhesabu',
      'numbers': 'Kuhesabu'
    };

    // Use mapped name or fallback to original if not found
    const normalizedStyle = learningStyle?.toLowerCase();
    const categoryName = styleToCategoryMap[normalizedStyle] || normalizedStyle;

    console.log(`🔍 Filtering for User: ${userId}`);
    console.log(`   Style: ${learningStyle} -> Category: ${categoryName}`);
    console.log(`   Level: ${formattedLevel}`);

    // Find category by mapped name
    const matchedCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
    });

    if (!matchedCategory) {
      console.log(`⚠️ Category '${categoryName}' not found in DB`);
      return res.status(200).json({
        success: true,
        message: `No courses found for category: ${categoryName}`,
        courses: []
      });
    }

    // 2️⃣ Build Strict Query
    // We ONLY want courses that match the Category AND Level.
    const query = {
      level: formattedLevel,
      category: matchedCategory._id
    };

    if (process.env.NODE_ENV === 'production') {
      query.status = 'Published';
    }

    // 3️⃣ Fetch Courses SORTED BY ORDER
    let courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email')
      .sort({ order: 1 }); // STRICT SEQUENTIAL ORDER

    // 4️⃣ Fetch User Progress for these courses
    const courseIds = courses.map(c => c._id);
    const progressRecords = await CourseProgress.find({
      userId: userId,
      courseID: { $in: courseIds }
    });

    const progressMap = {};
    progressRecords.forEach(p => {
      progressMap[p.courseID.toString()] = p;
    });

    console.log(`✅ Found ${courses.length} courses for ${categoryName} (${formattedLevel})`);

    // 5️⃣ Calculate Locked Status
    let previousCourseCompleted = true; // First course is always unlocked (previous "virtual" course is completed)

    const personalizedCourses = courses.map((course, index) => {
      let reason = `Recommended for ${categoryName} - ${course.level}`;

      if (interests && interests.some(interest =>
        course.tag.some(tag => tag.toLowerCase() === interest.toLowerCase())
      )) {
        reason += ` & matches your interests`;
      }

      const progress = progressMap[course._id.toString()];
      const isCompleted = progress?.isCourseCompleted || false;

      // Lock logic: Locked if previous course is NOT completed
      // Exception: First course (index 0) is never locked
      const isLocked = !previousCourseCompleted;

      // Update for next iteration
      previousCourseCompleted = isCompleted;

      return {
        ...course.toObject(),
        recommendationReason: reason,
        isCompleted,
        isLocked
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Personalized course recommendations',
      courses: personalizedCourses
    });

  } catch (error) {
    console.error('Error in getCoursesForOnboardedUser:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
