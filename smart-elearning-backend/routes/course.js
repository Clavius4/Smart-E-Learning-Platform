const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this line at the top
const Course = require('../models/course'); // Adjust path as needed
// Add these at the top of the file
// const Enrollment = require('../models/Enrollment'); // Make sure this path is correct
const CourseProgress = require('../models/courseProgress'); // Make sure this path is correct

// Move the helper function to the top
function convertSecondsToDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Import required controllers

// course controllers 
const {
  createCourse,
  getCourseDetails,
  getAllCourses,
  getFullCourseDetails,
  editCourse,
  deleteCourse,
  getInstructorCourses,
  getCoursesByLevelExplicit,
  getCoursesForOnboardedUser,


} = require('../controllers/course')

const { updateCourseProgress } = require('../controllers/courseProgress')
const { getProgressPercentage } = require('../controllers/courseProgress')
const { getCourseProgressForInstructorss } = require('../controllers/courseProgress')




// sections controllers
const {
  createSection,
  updateSection,
  deleteSection,
} = require('../controllers/section');


// subSections controllers
const {
  createSubSection,
  updateSubSection,
  deleteSubSection
} = require('../controllers/subSection');


// rating controllers
const {
  createRating,
  getAverageRating,
  getAllRatingReview
} = require('../controllers/ratingAndReview');


// Middlewares
//const { auth, isAdmin, isInstructor, isStudent, authInstructor } = require('../middleware/InstuctorMW')
const authorize = require('./../middleware/authorize');
const authenticate = require('./../middleware/authenticate');
// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************
// Courses can Only be Created by Instructors

router.post('/createCourse',
  authenticate,
  authorize(['instructor', 'admin']),
  createCourse);

// //Add a Section to a Course
router.post('/addSection',
  authenticate,
  authorize(['instructor']),
  createSection);

// // Update a Section
router.post('/updateSection',
  authenticate,
  authorize(['instructor']),
  updateSection);

// // Delete a Section
router.post('/deleteSection',
  authenticate,
  authorize(['instructor']),
  deleteSection);

// // Add a Sub Section to a Section
router.post('/addSubSection',
  authenticate,
  authorize(['instructor']),
  createSubSection);

// // Edit Sub Section
router.post('/updateSubSection',
  authenticate,
  authorize(['instructor']),
  updateSubSection);

// // Delete Sub Section
router.post('/deleteSubSection',
  authenticate,
  authorize(['instructor']),
  deleteSubSection);


// Get Details for a Specific Courses
router.post('/getCourseDetails',
  getCourseDetails);
// Get all Courses
router.get('/getAllCourses',
  getAllCourses);

//  // get full course details
//  router.post('/getFullCourseDetails',
//     authenticate,
//     getFullCourseDetails);

// // Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses",
  authenticate,
  authorize(['instructor']),
  getInstructorCourses)


// Edit Course routes
router.post("/editCourse",
  authenticate,
  authorize(['instructor']),
  editCourse)

// Delete a Course
router.delete("/deleteCourse",
  authenticate,
  authorize(['instructor']),
  deleteCourse)

// // update Course Progress
//  router.post("/updateCourseProgress",
//      authenticate, 
//      authorize(['student']), 
//      updateCourseProgress)

//  router.post("/getProgressPercentage",
//      authenticate, 
//      authorize(['student']), 
//      getProgressPercentage)

// // ********************************************************************************************************
// //                                      Category routes (Only by Admin)
// // ********************************************************************************************************
// // Category can Only be Created by Admin


router.post(
  "/profile/update-progress",
  authenticate,
  authorize(["student"]),
  updateCourseProgress
);

// Get course progress percentage
router.get(
  "/course-progress/:courseId",
  authenticate,
  authorize(["student"]),
  getProgressPercentage
);
// Get course progress (add this new route)
// router.get('/course-progress/:courseId',
//     authenticate,
//     authorize(['student']),
//     async (req, res) => {
//         try {
//             const progress = await getProgressPercentage(req.params.courseId, req.user.id);
//             res.json({ progress });
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     }
// );


// Replace all getFullCourseDetails routes with this single implementation:
// Helper function for duration formatting
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Updated getFullCourseDetails route
// router.get('/getFullCourseDetails/:courseId', authenticate, async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.user?.id;

//     // Validate course ID
//     if (!mongoose.Types.ObjectId.isValid(courseId)) {
//       return res.status(400).json({ success: false, message: 'Invalid course ID format' });
//     }

//     // Find course with populated data
//     const course = await Course.findById(courseId)
//       .populate({
//         path: 'instructor',
//         select: 'firstName lastName email',
//         populate: {
//           path: 'additionalDetails',
//           select: 'contactNumber about'
//         }
//       })
//       .populate('category', 'name description')
//       .populate({
//         path: 'courseContent',
//         populate: {
//           path: 'subSection',
//           select: 'title timeDuration description videoUrl'
//         }
//       })
//       .lean();

//     if (!course) {
//       return res.status(404).json({ success: false, message: 'Course not found' });
//     }

//     // Transform course content structure
//     let totalDurationInSeconds = 0;
//     const transformedContent = course.courseContent.map(section => {
//       const lessons = section.subSection.map(sub => {
//         const duration = parseFloat(sub.timeDuration) || 0;
//         totalDurationInSeconds += duration;

//         return {
//           _id: sub._id,
//           title: sub.title,
//           videoUrl: sub.videoUrl,
//           duration: formatDuration(duration),
//           description: sub.description
//         };
//       });

//       return {
//         _id: section._id,
//         title: section.sectionName || `Section ${section._id}`,
//         lessons
//       };
//     });

//     // Get user progress
//     let completedVideos = [];
//     if (userId) {
//       const progress = await CourseProgress.findOne({
//         courseID: courseId,
//         userId: userId
//       }).select('completedVideos');
//       completedVideos = progress?.completedVideos || [];
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         ...course,
//         courseContent: transformedContent,
//         totalDuration: formatDuration(totalDurationInSeconds),
//         completedVideos,
//         isEnrolled: course.studentsEnrolled.some(id => id.toString() === userId)
//       }
//     });

//   } catch (error) {
//     console.error('Error in getFullCourseDetails:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch course details',
//       error: error.message
//     });
//   }
// });


// router.get('/getFullCourseDetails/:courseId', authenticate, async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.user?.id;

//     if (!mongoose.Types.ObjectId.isValid(courseId)) {
//       return res.status(400).json({ success: false, message: 'Invalid course ID format' });
//     }

//     const course = await Course.findById(courseId)
//       .populate({
//         path: 'instructor',
//         select: 'firstName lastName email',
//         populate: { path: 'additionalDetails', select: 'contactNumber about' }
//       })
//       .populate('category', 'name description')
//       .populate({
//         path: 'courseContent',
//         populate: {
//           path: 'subSection',
//           select: 'title timeDuration description videoUrl isRemedial'
//         }
//       })
//       .lean();

//     if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

//     // ================================
//     // Get user progress
//     // ================================
//     let completedVideos = [];
//     let remedialIds = [];
//     let lastQuizFailed = false;

//     if (userId) {
//       const progress = await CourseProgress.findOne({ courseID: courseId, userId })
//         .select('completedVideos remedialContent passedLevelQuiz');

//       completedVideos = progress?.completedVideos || [];
//       remedialIds = progress?.remedialContent?.map(r => r.subSectionId.toString()) || [];

//       // Check if last quiz failed
//       const lastQuiz = progress?.passedLevelQuiz?.slice(-1)[0];
//       lastQuizFailed = lastQuiz && lastQuiz.passed === false;
//     }

//     // ================================
//     // Transform course content
//     // ================================
//     let totalDurationInSeconds = 0;
//     const transformedContent = course.courseContent.map(section => {
//       const lessons = section.subSection
//         .filter(sub => {
//           if (sub.isRemedial) {
//             return remedialIds.includes(sub._id.toString()); // show only assigned remedial
//           }
//           // If last quiz failed, hide normal lessons
//           if (lastQuizFailed) return false;
//           return true; // normal lessons always visible if no quiz fail
//         })
//         .map(sub => {
//           const duration = parseFloat(sub.timeDuration) || 0;
//           totalDurationInSeconds += duration;

//           return {
//             _id: sub._id,
//             title: sub.title,
//             videoUrl: sub.videoUrl,
//             duration: formatDuration(duration),
//             description: sub.description,
//             isRemedial: sub.isRemedial
//           };
//         });

//       return {
//         _id: section._id,
//         title: section.sectionName || `Section ${section._id}`,
//         lessons
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       data: {
//         ...course,
//         courseContent: transformedContent,
//         totalDuration: formatDuration(totalDurationInSeconds),
//         completedVideos,
//         isEnrolled: course.studentsEnrolled.some(id => id.toString() === userId)
//       }
//     });

//   } catch (error) {
//     console.error('Error in getFullCourseDetails:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch course details',
//       error: error.message
//     });
//   }
// });




router.get('/getFullCourseDetails/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID format' });
    }

    const course = await Course.findById(courseId)
      .populate({
        path: 'instructor',
        select: 'firstName lastName email',
        populate: { path: 'additionalDetails', select: 'contactNumber about' }
      })
      .populate('category', 'name description')
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
          select: 'title timeDuration description videoUrl isRemedial order'
        }
      })
      .lean();

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Get user progress
    let completedVideos = [];
    let remedialIds = [];
    let isInRemedialMode = false;
    let assignedRemedialIds = [];

    if (userId) {
      const progress = await CourseProgress.findOne({ courseID: courseId, userId })
        .select('completedVideos remedialContent passedLevelQuiz needsRemedial quizAttempts');

      completedVideos = progress?.completedVideos || [];
      isInRemedialMode = progress?.needsRemedial || false;
      assignedRemedialIds = progress?.remedialContent?.map(r => r.subSectionId.toString()) || [];

      // If not in remedial mode but last quiz failed, activate remedial mode
      const lastQuizAttempt = progress?.quizAttempts?.slice(-1)[0];
      const quizFailed = lastQuizAttempt && lastQuizAttempt.passed === false;

      if (quizFailed && !isInRemedialMode) {
        isInRemedialMode = true;
        // Get all remedial subsections for assignment
        const allRemedialIds = [];
        course.courseContent.forEach(section => {
          section.subSection.forEach(sub => {
            if (sub.isRemedial) {
              allRemedialIds.push(sub._id.toString());
            }
          });
        });
        assignedRemedialIds = allRemedialIds;
      }
    }

    // Transform course content based on mode
    let totalDurationInSeconds = 0;
    const transformedContent = course.courseContent.map(section => {
      const lessons = section.subSection
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // Sort by order
        .filter(sub => {
          if (isInRemedialMode) {
            // In remedial mode: show only assigned remedial lessons
            return sub.isRemedial && assignedRemedialIds.includes(sub._id.toString());
          } else {
            // Normal mode: show only non-remedial lessons
            return !sub.isRemedial;
          }
        })
        .map(sub => {
          const duration = parseFloat(sub.timeDuration) || 0;
          totalDurationInSeconds += duration;

          return {
            _id: sub._id,
            title: sub.title,
            videoUrl: sub.videoUrl,
            duration: formatDuration(duration),
            description: sub.description,
            isRemedial: sub.isRemedial || false
          };
        });

      return {
        _id: section._id,
        title: section.sectionName || `Section ${section._id}`,
        lessons: lessons.filter(lesson => lesson.lessons !== undefined ? lesson.lessons.length > 0 : lesson.videoUrl) // Only include sections with lessons
      };
    }).filter(section => section.lessons.length > 0); // Remove empty sections

    console.log(`Course Content Debug:
      - User ID: ${userId}
      - Remedial Mode: ${isInRemedialMode}
      - Assigned Remedials: ${assignedRemedialIds.length}
      - Transformed Sections: ${transformedContent.length}
      - Total Lessons: ${transformedContent.reduce((sum, s) => sum + s.lessons.length, 0)}
    `);

    return res.status(200).json({
      success: true,
      data: {
        ...course,
        courseContent: transformedContent,
        totalDuration: formatDuration(totalDurationInSeconds),
        completedVideos,
        isEnrolled: course.studentsEnrolled.some(id => id.toString() === userId),
        isInRemedialMode, // NEW: Send remedial mode status
        assignedRemedials: assignedRemedialIds // NEW: Send assigned remedial IDs
      }
    });

  } catch (error) {
    console.error('Error in getFullCourseDetails:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
      error: error.message
    });
  }
});

// Helper function to format duration
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}



// routes/course.js
router.get("/instructor-course-progress/:courseId",
  authenticate,
  authorize(['instructor']),
  getCourseProgressForInstructorss
);

router.get('/courses-level/:level', authenticate, getCoursesByLevelExplicit);
router.get("/recommended", authenticate, getCoursesForOnboardedUser);
// // ********************************************************************************************************
// //                                      Rating and Review
// // ********************************************************************************************************
// router.post('/createRating', auth, isStudent, createRating);
// router.get('/getAverageRating', getAverageRating);
// router.get('/getReviews', getAllRatingReview);


module.exports = router;