const mongoose = require("mongoose")
const Section = require("../models/section")
const SubSection = require("../models/subSection")
const CourseProgress = require("../models/courseProgress")
const course = require("../models/course")
const User = require("../models/StudentModels/studentModels")

// ================ update Course Progress ================

exports.getCourseProgressForInstructorss = async (req, res) => {
  try {
    const { courseId } = req.params;

    const instructorId = req.user.id;

    console.log(`the instuctor id is ${courseId}`)

    // Use the Course model here — careful with variable names
    const courseDoc = await course.findOne({
      _id: courseId,
      instructor: instructorId
    })
      .populate({
        path: "studentsEnrolled",
        select: "firstName lastName email"
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "_id"
        }
      });

    if (!courseDoc) {
      return res.status(403).json({ error: "Not authorized or course not found" });
    }

    const progressDocs = await CourseProgress.find({
      courseID: courseId
    }).populate("userId", "firstName lastName email");

    const results = courseDoc.studentsEnrolled.map(student => {
      const progress = progressDocs.find(p => p.userId._id.equals(student._id));

      const totalVideos = courseDoc.courseContent.reduce((count, section) =>
        count + (section.subSection?.length || 0), 0
      );

      const completedCount = progress?.completedVideos?.length || 0;
      const percentage = totalVideos > 0 ? ((completedCount / totalVideos) * 100).toFixed(2) : 0;

      return {
        studentId: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        percentage,
        lastAccessed: progress?.lastAccessed || null,
        passedLevelQuiz: progress?.passedLevelQuiz || []
      };
    });

    res.json({ courseName: courseDoc.courseName, students: results });
  } catch (err) {
    console.error("Error fetching instructor course progress:", err);
    res.status(500).json({ error: "Server error" });
  }
};



// // Helper function to determine if user level should be updated
// const shouldUpdateUserLevel = (currentUserLevel, courseLevel) => {
//   const levels = ['Beginner', 'Intermediate', 'Advanced'];
//   const currentLevelIndex = levels.indexOf(currentUserLevel);
//   const courseLevelIndex = levels.indexOf(courseLevel);

//   // Update if course level is higher than current user level
//   // or if user has no level set (undefined/null)
//   return !currentUserLevel || courseLevelIndex > currentLevelIndex;
// };


// // Backend Controller - Fixed updateCourseProgress
// exports.updateCourseProgress = async (req, res) => {
//   const { courseId, lessonId, timeSpent } = req.body;
//   const userId = req.user?.id;

//   if (!courseId || !lessonId) {
//     return res.status(400).json({ error: "courseId and lessonId are required" });
//   }

//   try {
//     // 1. Validate lesson existence
//     const subsection = await SubSection.findById(lessonId);
//     if (!subsection) return res.status(404).json({ error: "Invalid lesson/subsection" });

//     const MIN_TIME_FOR_COMPLETION = subsection?.duration ? subsection.duration * 0.8 : 5;

//     // 2. Get course with sections + subsections
//     const courseDoc = await course.findById(courseId)
//       .select("instructor courseContent")
//       .populate({
//         path: "courseContent",
//         populate: { path: "subSection" }
//       });

//     if (!courseDoc) return res.status(404).json({ error: "Course not found" });

//     // 3. Find or create progress doc
//     let courseProgress = await CourseProgress.findOne({ courseID: courseId, userId });
//     if (!courseProgress) {
//       courseProgress = new CourseProgress({
//         courseID: courseId,
//         userId,
//         instructor: courseDoc.instructor,
//         completedVideos: [],
//         remedialContent: [],
//         passedLevelQuiz: [],
//         quizAttempts: [], // Make sure this exists
//         totalTimeSpent: 0,
//         completionStatus: "not_started",
//         needsRemedial: false
//       });
//     }

//     // 4. Update video completion
//     const existingVideo = courseProgress.completedVideos.find(
//       vid => vid.subsectionId?.toString() === lessonId
//     );

//     if (timeSpent >= MIN_TIME_FOR_COMPLETION) {
//       if (existingVideo) {
//         existingVideo.timeSpent = Math.max(existingVideo.timeSpent, timeSpent);
//       } else {
//         courseProgress.completedVideos.push({ 
//           subsectionId: lessonId, 
//           completedAt: new Date(), 
//           timeSpent 
//         });
//       }
//     } else {
//       if (existingVideo) {
//         existingVideo.timeSpent = Math.max(existingVideo.timeSpent, timeSpent);
//       }
//     }

//     // 5. Update total time spent
//     courseProgress.totalTimeSpent = courseProgress.completedVideos.reduce(
//       (sum, v) => sum + (v.timeSpent || 0), 0
//     );

//     // 6. Get all subsections in order
//     const flatSubsections = [];
//     courseDoc.courseContent.forEach(sec => {
//       const sortedSubs = [...sec.subSection].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//       sortedSubs.forEach(sub => {
//         flatSubsections.push({
//           sectionId: sec._id,
//           subId: sub._id.toString(),
//           isRemedial: sub.isRemedial || false,
//           hasVideo: !!sub.videoUrl
//         });
//       });
//     });

//     // 7. Check quiz failure status
//     const lastQuizAttempt = courseProgress.quizAttempts?.slice(-1)[0];
//     const quizFailed = lastQuizAttempt && lastQuizAttempt.passed === false;

//     // 8. Handle remedial assignment if quiz failed
//     if (quizFailed && !courseProgress.needsRemedial) {
//       console.log('🚨 Quiz failed - activating remedial mode');
//       courseProgress.needsRemedial = true;

//       // Assign all remedial lessons
//       const remedialSubsections = flatSubsections.filter(s => s.isRemedial && s.hasVideo);
//       remedialSubsections.forEach(r => {
//         if (!courseProgress.remedialContent?.some(rc => rc.subSectionId.toString() === r.subId)) {
//           courseProgress.remedialContent.push({ 
//             subSectionId: r.subId, 
//             assignedAt: new Date() 
//           });
//         }
//       });
//     }

//     // 9. Determine next lesson logic
//     let nextItem = null;
//     let nextType = null;

//     const completedIds = new Set(courseProgress.completedVideos
//       .filter(v => v.timeSpent >= MIN_TIME_FOR_COMPLETION)
//       .map(v => v.subsectionId.toString()));

//     if (courseProgress.needsRemedial) {
//       // In remedial mode - only show remedial lessons
//       const assignedRemedialIds = courseProgress.remedialContent?.map(rc => rc.subSectionId.toString()) || [];
//       const remedialSubsections = flatSubsections.filter(s => 
//         s.isRemedial && s.hasVideo && assignedRemedialIds.includes(s.subId)
//       );

//       // Find next uncompleted remedial
//       const nextRemedial = remedialSubsections.find(r => !completedIds.has(r.subId));

//       if (nextRemedial) {
//         nextItem = nextRemedial.subId;
//         nextType = "remedial";
//       } else {
//         // All remedials completed - back to quiz
//         nextItem = lastQuizAttempt?.quizId || null;
//         nextType = "quiz";
//       }
//     } else {
//       // Normal mode - show normal lessons
//       const normalSubsections = flatSubsections.filter(s => !s.isRemedial && s.hasVideo);
//       const nextNormal = normalSubsections.find(n => !completedIds.has(n.subId));

//       if (nextNormal) {
//         nextItem = nextNormal.subId;
//         nextType = "video";
//       } else {
//         nextType = "quiz";
//         nextItem = null; // Course-level quiz
//       }
//     }

//     // 10. Update completion status
//     const relevantSubsections = courseProgress.needsRemedial 
//       ? flatSubsections.filter(s => s.isRemedial && s.hasVideo)
//       : flatSubsections.filter(s => !s.isRemedial && s.hasVideo);

//     if (relevantSubsections.length > 0 && completedIds.size >= relevantSubsections.length) {
//       courseProgress.completionStatus = courseProgress.needsRemedial ? "remedial_completed" : "completed";
//     } else if (completedIds.size > 0) {
//       courseProgress.completionStatus = "in_progress";
//     }

//     // 11. Save progress
//     await courseProgress.save();

//     // 12. Debug logging
//     console.log(`Progress Update Debug:
//       - Current lesson: ${lessonId}
//       - Completed videos: ${completedIds.size}
//       - Remedial mode: ${courseProgress.needsRemedial}
//       - Next type: ${nextType}
//       - Next ID: ${nextItem}
//       - Quiz failed: ${quizFailed}
//     `);

//     return res.status(200).json({
//       message: "Progress updated successfully",
//       progress: courseProgress,
//       next: { type: nextType, id: nextItem || null },
//       debug: { 
//         completedCount: completedIds.size, 
//         remedialMode: courseProgress.needsRemedial,
//         quizFailed 
//       }
//     });

//   } catch (err) {
//     console.error("Update progress error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };


// Helper function to determine if user difficulty preference should be updated
const shouldUpdateUserDifficulty = (currentDifficulty, courseLevel) => {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const courseLevels = ['Beginner', 'Intermediate', 'Advanced'];

  // Convert course level to lowercase to match user schema
  const courseLevelLower = courseLevel ? courseLevel.toLowerCase() : 'beginner';

  const currentLevelIndex = levels.indexOf(currentDifficulty);
  const courseLevelIndex = levels.indexOf(courseLevelLower);

  // Update if course level is higher than current user difficulty
  // or if user has no difficulty set (undefined/null)
  return !currentDifficulty || courseLevelIndex > currentLevelIndex;
};

// Backend Controller - Enhanced updateCourseProgress with User Level Update
exports.updateCourseProgress = async (req, res) => {
  const ActivityLog = require('../models/ActivityLog');

// Log video progress
  ActivityLog.log({
    userId: req.user.id,
    userModel: 'students',
    userRole: 'student',
    action: timeSpent >= MIN_TIME_FOR_COMPLETION ? 'video_complete' : 'video_progress',
    courseId,
    metadata: { lessonId, timeSpent, completed: timeSpent >= MIN_TIME_FOR_COMPLETION }
  }).catch(console.error);

  const { courseId, lessonId, timeSpent } = req.body;
  const userId = req.user?.id;

  if (!courseId || !lessonId) {
    return res.status(400).json({ error: "courseId and lessonId are required" });
  }

  try {
    // 1. Validate lesson existence
    const subsection = await SubSection.findById(lessonId);
    if (!subsection) return res.status(404).json({ error: "Invalid lesson/subsection" });

    const MIN_TIME_FOR_COMPLETION = subsection?.duration ? subsection.duration * 0.8 : 5;

    // 2. Get course with sections + subsections (including level)
    const courseDoc = await course.findById(courseId)
      .select("instructor courseContent level courseName quizzes")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" }
      });

    if (!courseDoc) return res.status(404).json({ error: "Course not found" });

    // 3. Get current user details
    const currentUser = await User.findById(userId).select("difficultyPreference firstName lastName");
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // 4. Check if user difficulty preference should be updated
    let userDifficultyUpdated = false;
    // STRICT MODE: Disable auto-promotion. Level only changes upon completing ALL courses in a level (via Quiz submission).
    /*
    if (shouldUpdateUserDifficulty(currentUser.difficultyPreference, courseDoc.level)) {
      try {
        const newDifficulty = courseDoc.level ? courseDoc.level.toLowerCase() : 'beginner';
        await User.findByIdAndUpdate(
          userId,
          {
            difficultyPreference: newDifficulty,
            updatedAt: new Date()
          },
          { new: true }
        );
        userDifficultyUpdated = true;
        console.log(`🎯 User difficulty updated from "${currentUser.difficultyPreference}" to "${newDifficulty}" for user ${currentUser.firstName} ${currentUser.lastName}`);
      } catch (difficultyUpdateError) {
        console.error("Error updating user difficulty preference:", difficultyUpdateError);
        // Continue with progress update even if difficulty update fails
      }
    }
    */

    // 5. Find or create progress doc
    let courseProgress = await CourseProgress.findOne({ courseID: courseId, userId });
    if (!courseProgress) {
      courseProgress = new CourseProgress({
        courseID: courseId,
        userId,
        instructor: courseDoc.instructor,
        completedVideos: [],
        remedialContent: [],
        passedLevelQuiz: [],
        quizAttempts: [], // Make sure this exists
        totalTimeSpent: 0,
        completionStatus: "not_started",
        needsRemedial: false
      });
    }

    // 6. Update video completion
    const existingVideo = courseProgress.completedVideos.find(
      vid => vid.subsectionId?.toString() === lessonId
    );

    if (timeSpent >= MIN_TIME_FOR_COMPLETION) {
      if (existingVideo) {
        existingVideo.timeSpent = Math.max(existingVideo.timeSpent, timeSpent);
      } else {
        courseProgress.completedVideos.push({
          subsectionId: lessonId,
          completedAt: new Date(),
          timeSpent
        });
      }
    } else {
      if (existingVideo) {
        existingVideo.timeSpent = Math.max(existingVideo.timeSpent, timeSpent);
      }
    }

    // 7. Update total time spent
    courseProgress.totalTimeSpent = courseProgress.completedVideos.reduce(
      (sum, v) => sum + (v.timeSpent || 0), 0
    );

    // 8. Get all subsections in order
    const flatSubsections = [];
    courseDoc.courseContent.forEach(sec => {
      const sortedSubs = [...sec.subSection].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      sortedSubs.forEach(sub => {
        flatSubsections.push({
          sectionId: sec._id,
          subId: sub._id.toString(),
          isRemedial: sub.isRemedial || false,
          hasVideo: !!sub.videoUrl
        });
      });
    });

    // 9. Check quiz failure status
    const lastQuizAttempt = courseProgress.quizAttempts?.slice(-1)[0];
    const quizFailed = lastQuizAttempt && lastQuizAttempt.passed === false;

    // 10. Handle remedial assignment if quiz failed
    if (quizFailed && !courseProgress.needsRemedial) {
      console.log('🚨 Quiz failed - activating remedial mode');
      courseProgress.needsRemedial = true;

      // Assign all remedial lessons
      const remedialSubsections = flatSubsections.filter(s => s.isRemedial && s.hasVideo);
      remedialSubsections.forEach(r => {
        if (!courseProgress.remedialContent?.some(rc => rc.subSectionId.toString() === r.subId)) {
          courseProgress.remedialContent.push({
            subSectionId: r.subId,
            assignedAt: new Date()
          });
        }
      });
    }

    // 11. Determine next lesson logic
    let nextItem = null;
    let nextType = null;

    const completedIds = new Set(courseProgress.completedVideos
      .filter(v => v.timeSpent >= MIN_TIME_FOR_COMPLETION)
      .map(v => v.subsectionId.toString()));

    if (courseProgress.needsRemedial) {
      // In remedial mode - only show remedial lessons
      const assignedRemedialIds = courseProgress.remedialContent?.map(rc => rc.subSectionId.toString()) || [];
      const remedialSubsections = flatSubsections.filter(s =>
        s.isRemedial && s.hasVideo && assignedRemedialIds.includes(s.subId)
      );

      // Find next uncompleted remedial
      const nextRemedial = remedialSubsections.find(r => !completedIds.has(r.subId));

      if (nextRemedial) {
        nextItem = nextRemedial.subId;
        nextType = "remedial";
      } else {
        // All remedials completed - back to quiz
        nextItem = lastQuizAttempt?.quizId || null;
        nextType = "quiz";
      }
    } else {
      // Normal mode - show normal lessons
      const normalSubsections = flatSubsections.filter(s => !s.isRemedial && s.hasVideo);
      const nextNormal = normalSubsections.find(n => !completedIds.has(n.subId));

      if (nextNormal) {
        nextItem = nextNormal.subId;
        nextType = "video";
      } else {
        // All videos completed - assign Quiz if exists
        nextType = "quiz";
        if (courseDoc.quizzes && courseDoc.quizzes.length > 0) {
          nextItem = courseDoc.quizzes[0]._id || courseDoc.quizzes[0];
        } else {
          nextItem = null;
        }
      }
    }

    // 12. Update completion status
    const relevantSubsections = courseProgress.needsRemedial
      ? flatSubsections.filter(s => s.isRemedial && s.hasVideo)
      : flatSubsections.filter(s => !s.isRemedial && s.hasVideo);

    if (relevantSubsections.length > 0 && completedIds.size >= relevantSubsections.length) {
      courseProgress.completionStatus = courseProgress.needsRemedial ? "remedial_completed" : "completed";
    } else if (completedIds.size > 0) {
      courseProgress.completionStatus = "in_progress";
    }

    // 13. Save progress
    await courseProgress.save();

    // 14. Debug logging
    console.log(`Progress Update Debug:
      - Current lesson: ${lessonId}
      - Completed videos: ${completedIds.size}
      - Remedial mode: ${courseProgress.needsRemedial}
      - Next type: ${nextType}
      - Next ID: ${nextItem}
      - Quiz failed: ${quizFailed}
      - Course level: ${courseDoc.level}
      - User difficulty updated: ${userDifficultyUpdated}
    `);

    return res.status(200).json({
      message: "Progress updated successfully",
      progress: courseProgress,
      next: { type: nextType, id: nextItem || null },
      userDifficultyUpdated,
      courseLevel: courseDoc.level,
      debug: {
        completedCount: completedIds.size,
        remedialMode: courseProgress.needsRemedial,
        quizFailed,
        difficultyUpdated: userDifficultyUpdated
      }
    });

  } catch (err) {
    console.error("Update progress error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Optional: Function to update user difficulty preference when enrolling in a course
exports.updateUserDifficultyOnEnrollment = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user?.id;

  try {
    // Get course level
    const courseDoc = await course.findById(courseId).select("level courseName");
    if (!courseDoc) return res.status(404).json({ error: "Course not found" });

    // Get current user
    const currentUser = await User.findById(userId).select("difficultyPreference firstName lastName");
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // Update difficulty if needed
    if (shouldUpdateUserDifficulty(currentUser.difficultyPreference, courseDoc.level)) {
      const newDifficulty = courseDoc.level ? courseDoc.level.toLowerCase() : 'beginner';
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          difficultyPreference: newDifficulty,
          updatedAt: new Date()
        },
        { new: true }
      );

      return res.status(200).json({
        message: `Difficulty preference updated to ${newDifficulty}`,
        previousDifficulty: currentUser.difficultyPreference,
        newDifficulty: newDifficulty,
        courseName: courseDoc.courseName
      });
    }

    return res.status(200).json({
      message: "No difficulty update needed",
      currentDifficulty: currentUser.difficultyPreference,
      courseLevel: courseDoc.level
    });

  } catch (err) {
    console.error("Difficulty update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ===== Get Progress Percentage =====
exports.getProgressPercentage = async (req, res) => {
  const courseId = req.params.courseId;
  const userId = req.user.id;

  try {
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId
    }).populate({
      path: "courseID",
      populate: { path: "courseContent", populate: { path: "subSection" } }
    });

    if (!courseProgress) {
      return res.status(200).json({ progress: 0 });
    }

    const totalVideos = courseProgress.courseID.courseContent.reduce(
      (count, section) => count + (section.subSection?.length || 0),
      0
    );

    const completedCount = courseProgress.completedVideos.length;
    const progressPercentage = totalVideos > 0
      ? ((completedCount / totalVideos) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      progress: Number(progressPercentage),
      completedCount,
      totalVideos,
      totalTimeSpent: courseProgress.totalTimeSpent || 0,
      lastAccessed: courseProgress.lastAccessed || null,
      status: courseProgress.completionStatus
    });


  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ error: error.message });
  }
};
