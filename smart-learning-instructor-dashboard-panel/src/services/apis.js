import { resolveBackendOrigin } from "../utils/backendOrigin";

export const BASE_URL = resolveBackendOrigin();
// AUTH ENDPOINTS FOR INSTRUCTOR
export const endpoints = {
  SENDOTP_API: BASE_URL + "/api/auth/sendotp",
  SIGNUP_API: BASE_URL + "/api/instructor/signup",
  LOGIN_API: BASE_URL + "/api/instructor/login",
  RESETPASSTOKEN_API: BASE_URL + "/api/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/api/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/api/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/api/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/api/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
}

// COURSE ENDPOINTS - FIXED
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/api/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/api/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/api/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/api/admin/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/api/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/api/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/api/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/api/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/api/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/api/course/getInstructorCourses", // FIXED
  DELETE_SECTION_API: BASE_URL + "/api/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/api/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/api/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: BASE_URL + "/api/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/api/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
  CREATE_QUIZ_API: BASE_URL + "/api/quizzes/createQuiz",
  EDIT_QUIZ_API: BASE_URL + "/api/quizzes", // POST /:quizId
  GET_INSTRUCTOR_QUIZZES_API: BASE_URL + "/api/quizzes",
  GET_COURSE_INROLLED_STUDENTS_API: BASE_URL + "/api/course/instructor-course-progress/:courseId",
}

//ASSESSMENT ENDPOINTS
export const assessmentEndpoints = {
  CREATE_ASSESSMENT: BASE_URL + "/api/assessments/create",
  GET_ALL_ASSESSMENTS: BASE_URL + "/api/assessments/",
  UPDATE_ASSESSMENT: BASE_URL + "/api/assessments/update/:assessmentId",
  GET_ALL_ASSESSMENTS_LEVEL: BASE_URL + "/api/assessments/level/:level",
  SUBMIT_ASSESSMENT: BASE_URL + "/api/assessments/submit/:assessmentId",
  DELETE_ASSESSMENT: BASE_URL + "/api/assessments/del/:assessmentId",

}
// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateUserProfileImage",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
}


// REPORT ENDPOINTS
export const reportEndpoints = {
  INSTRUCTOR_DASHBOARD: BASE_URL + "/api/report/dashboard",
  INSTRUCTOR_PDF: BASE_URL + "/api/report/pdf",
  STUDENT_REPORT: BASE_URL + "/api/report/student",
  STUDENT_PDF: BASE_URL + "/api/report/student/pdf",
  STUDENT_EXCEL: BASE_URL + "/api/report/student/excel",
}
