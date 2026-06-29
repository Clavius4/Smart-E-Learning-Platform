// stores/courseStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { buildApiUrl } from '@/utils/apiBaseUrl'

export const useCourseStore = defineStore('course', () => {
  const authStore = useAuthStore()

  // State
  const courses = ref([])
  const enrolledCourses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Configure axios instance
  const api = axios.create({
    baseURL: buildApiUrl('/course'),
    withCredentials: false,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // Create a separate instance for profile endpoints
  const profileApi = axios.create({
    baseURL: buildApiUrl(),
    withCredentials: false,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // Fetch all courses
  const fetchAllCourses = async () => {
    try {
      loading.value = true
      error.value = null

      const token = localStorage.getItem('token')

      const response = await api.get('/recommended', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      courses.value = response.data.courses || []
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch courses'
      console.error('Error fetching courses:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      loading.value = true
      error.value = null

      const token = localStorage.getItem('token')
      const response = await profileApi.get('/profile/getEnrolledCourses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      enrolledCourses.value = response.data.data || []
      console.log('✅ Fetched enrolled courses:', enrolledCourses.value.length)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch enrolled courses'
      console.error('Error fetching enrolled courses:', err)
      // Don't throw - allow the app to continue even if enrolled courses fail
      enrolledCourses.value = []
      return { data: [] }
    } finally {
      loading.value = false
    }
  }

  // Add these methods to your courseStore
  const getCourseProgress = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await profileApi.get(`course/course-progress/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.progress || 0;
    } catch (err) {
      console.error('Error fetching progress:', err);
      return 0;
    }
  };

  // const fetchCourseDetails = async (courseId) => {
  //   try {
  //     loading.value = true;
  //     error.value = null;

  //     const token = localStorage.getItem('token');
  //     const headers = token ? { Authorization: `Bearer ${token}` } : {};

  //     const response = await api.get(`/getFullCourseDetails/${courseId}`, {
  //       headers,
  //       timeout: 15000
  //     });

  //     // Handle different response scenarios
  //     if (response.data?.success === false) {
  //       if (response.data.isDraft) {
  //         throw new Error('This course is not yet published');
  //       } else if (response.data.requiresEnrollment) {
  //         throw new Error('You need to enroll in this course first');
  //       } else if (response.data.hasPrerequisites) {
  //         throw new Error('Complete prerequisite courses first');
  //       } else {
  //         throw new Error(response.data.message || 'Failed to fetch course');
  //       }
  //     }

  //     if (!response.data?.data) {
  //       throw new Error('Invalid course data received');
  //     }

  //     const courseData = response.data.data;

  //     // Extract user's progress to filter remedial content
  //     const remedialIds = (courseData.progress?.remedialContent || []).map(r => r.subSectionId);

  //     // Filter courseContent: include normal videos + assigned remedial videos only
  //    const filteredContent = (courseData.courseContent || []).map(section => {
  //   const subs = section.subSection || [];
  //   const filteredSubs = subs.filter(sub => !sub.isRemedial || remedialIds.includes(sub._id));
  //   return { ...section, subSection: filteredSubs };
  // });


  //     return {
  //       ...courseData,
  //       courseName: courseData.courseName || 'Untitled Course',
  //       courseContent: filteredContent || [],
  //       quizzes: courseData.quizzes || [],
  //       completedVideos: courseData.completedVideos || [],
  //       isEnrolled: courseData.isEnrolled || false
  //     };

  //   } catch (err) {
  //     let errorMessage = 'Failed to fetch course details';

  //     if (err.response) {
  //       if (err.response.status === 403) {
  //         errorMessage = err.response.data?.message || 'Access denied';
  //       } else if (err.response.status === 404) {
  //         errorMessage = 'Course not found';
  //       }
  //     } else {
  //       errorMessage = err.message;
  //     }

  //     error.value = errorMessage;
  //     console.error('Course details error:', err);

  //     throw {
  //       message: errorMessage,
  //       isDraft: err.response?.data?.isDraft,
  //       requiresEnrollment: err.response?.data?.requiresEnrollment,
  //       hasPrerequisites: err.response?.data?.hasPrerequisites
  //     };
  //   } finally {
  //     loading.value = false;
  //   }
  // };


  const fetchCourseDetails = async (courseId) => {
    try {
      loading.value = true;
      error.value = null;

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.get(`/getFullCourseDetails/${courseId}`, {
        headers,
        timeout: 15000
      });

      if (response.data?.success === false) {
        if (response.data.isDraft) {
          throw new Error('This course is not yet published');
        } else if (response.data.requiresEnrollment) {
          throw new Error('You need to enroll in this course first');
        } else if (response.data.hasPrerequisites) {
          throw new Error('Complete prerequisite courses first');
        } else {
          throw new Error(response.data.message || 'Failed to fetch course');
        }
      }

      if (!response.data?.data) {
        throw new Error('Invalid course data received');
      }

      let courseData = response.data.data;

      // Handle nested courseDetails structure if present (fix for missing content)
      if (courseData.courseDetails) {
        console.log('📦 Unwrapping nested course details...')
        courseData = {
          ...courseData.courseDetails,
          completedVideos: courseData.completedVideos || [],
          totalDuration: courseData.totalDuration
        }
      }

      console.log('📚 Course Store Debug:', {
        isInRemedialMode: courseData.isInRemedialMode,
        assignedRemedials: courseData.assignedRemedials?.length || 0,
        totalSections: courseData.courseContent?.length || 0,
        completedVideos: courseData.completedVideos?.length || 0
      });

      return {
        ...courseData,
        courseName: courseData.courseName || 'Untitled Course',
        courseContent: courseData.courseContent || [],
        quizzes: courseData.quizzes || [],
        completedVideos: courseData.completedVideos || [],
        isEnrolled: courseData.isEnrolled || false,
        isInRemedialMode: courseData.isInRemedialMode || false, // NEW
        assignedRemedials: courseData.assignedRemedials || [] // NEW
      };

    } catch (err) {
      let errorMessage = 'Failed to fetch course details';

      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = err.response.data?.message || 'Access denied';
        } else if (err.response.status === 404) {
          errorMessage = 'Course not found';
        }
      } else {
        errorMessage = err.message;
      }

      error.value = errorMessage;
      console.error('Course details error:', err);

      throw {
        message: errorMessage,
        isDraft: err.response?.data?.isDraft,
        requiresEnrollment: err.response?.data?.requiresEnrollment,
        hasPrerequisites: err.response?.data?.hasPrerequisites
      };
    } finally {
      loading.value = false;
    }
  };

  const updateCourseProgress = async (courseId, lessonId, timeSpent = 0, completed = false) => {
    try {
      const token = localStorage.getItem('token')
      const response = await profileApi.post('course/profile/update-progress', {
        courseId,
        lessonId,
        timeSpent,
        completed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Enhanced logging
      console.log('✅ Progress Update Response:', {
        message: response.data.message,
        nextType: response.data.next?.type,
        nextId: response.data.next?.id,
        completedCount: response.data.progress?.completedVideos?.length,
        debug: response.data.debug
      })

      return response.data
    } catch (err) {
      console.error('❌ Error updating progress:', err)
      throw err
    }
  }

  // Add request interceptor for logging
  profileApi.interceptors.request.use(config => {
    console.log('🚀 Sending request to:', config.url)
    console.log('📝 Request payload:', config.data)
    console.log('🔑 Request headers:', config.headers)
    return config
  })

  // Add response interceptor for logging
  profileApi.interceptors.response.use(response => {
    console.log('✅ Response from:', response.config.url)
    console.log('📊 Response data:', response.data)
    return response
  }, error => {
    console.error('❌ Error response:', error.config.url)
    console.error('📋 Error details:', error.response?.data || error.message)
    return Promise.reject(error)
  })

  const enrollInCourse = async (courseId) => {
    try {
      loading.value = true
      error.value = null

      const token = localStorage.getItem('token')
      if (token) {
        profileApi.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      // Create payload with proper format
      const payload = {
        courses: [courseId] // Array of course IDs
      }

      console.log('Final enrollment payload:', JSON.stringify(payload, null, 2))

      const response = await profileApi.post('/profile/enroll', payload, {
        timeout: 130000,
      });

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to enroll in course'
      console.error('Full error object:', err)

      // Specific timeout error handling
      if (err.code === 'ECONNABORTED') {
        error.value = 'Request timed out. Please check your connection and try again.'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  // Quiz State Management
  const storedQuizzes = ref({}) // Map of courseId -> { quizId, questions, answers, ... }

  const fetchQuiz = async (courseId) => {
    try {
      loading.value = true
      const token = localStorage.getItem('token')
      const response = await profileApi.get(`/quizzes/quiz/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const quizData = response.data.quiz
        storedQuizzes.value[courseId] = {
          id: quizData._id,
          questions: quizData.questions,
          answers: new Array(quizData.questions.length).fill(null)
        }
        return quizData
      }
      return null
    } catch (err) {
      console.error('Error fetching quiz:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getQuizQuestions = (courseId) => {
    return storedQuizzes.value[courseId]?.questions || []
  }

  const recordQuizAnswer = (courseId, index, answer) => {
    if (!storedQuizzes.value[courseId]) return
    storedQuizzes.value[courseId].answers[index] = answer
  }

  const getQuizAnswer = (courseId, index) => {
    return storedQuizzes.value[courseId]?.answers[index]
  }

  // Helper for UI immediate feedback (optional usage)
  const calculateQuizScore = (courseId) => {
    const quiz = storedQuizzes.value[courseId]
    if (!quiz) return 0

    let correctCount = 0
    quiz.questions.forEach((q, idx) => {
      const userAns = quiz.answers[idx]
      // Simple MCQ check for now, can expand based on type
      if (q.type === 'mcq' || q.type === 'multiple-choice') {
        if (String(userAns) === String(q.correctAnswerIndex)) correctCount++
      }
      // Add other types if needed (dragdrop etc)
    })
    return Math.round((correctCount / quiz.questions.length) * 100)
  }

  const updateQuizQuestionItems = (courseId, index, items) => {
    if (!storedQuizzes.value[courseId]) return
    // useful for drag/drop state persistence
    // implementation depends on how question items are stored/displayed
  }

  const completeQuiz = async (courseId) => {
    try {
      loading.value = true
      const quiz = storedQuizzes.value[courseId]
      if (!quiz || !quiz.id) throw new Error("Quiz data not found for submission")

      const token = localStorage.getItem('token')
      const payload = {
        answers: quiz.answers
      }

      console.log('📝 Submitting Quiz Payload:', payload)

      const response = await profileApi.post(`/quizzes/submit-quiz/${quiz.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('✅ Quiz Submission Result:', response.data)
      return response.data // Returns { success, data: { score, passed, studentLevel, ... } }

    } catch (err) {
      console.error('Error submitting quiz:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    courses,
    enrolledCourses,
    loading,
    error,
    fetchAllCourses,
    fetchEnrolledCourses,
    fetchCourseDetails,
    getCourseProgress,
    updateCourseProgress,
    enrollInCourse,
    // Quiz Actions
    storedQuizzes,
    fetchQuiz,
    getQuizQuestions,
    recordQuizAnswer,
    getQuizAnswer,
    calculateQuizScore,
    completeQuiz,
    updateQuizQuestionItems
  }
})
