import { defineStore } from 'pinia'
import axios from 'axios'
import { buildApiUrl } from '@/utils/apiBaseUrl'

export const useQuizStore = defineStore('quiz', () => {
  const api = axios.create({
    baseURL: buildApiUrl('/quizzes'),
    withCredentials: false,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })

  // ------------------ Utility Functions ------------------
  const shuffleArray = (array) => array.slice().sort(() => Math.random() - 0.5)

  // Validate drag-drop answer
  const validateDragDropAnswer = (userAnswer, correctAnswers) => {
    if (!userAnswer || !correctAnswers || !Array.isArray(correctAnswers)) return false
    return correctAnswers.every((correct, index) => {
      const userChoice = userAnswer[index]
      return userChoice && userChoice._id === correct._id
    })
  }

  // Calculate total quiz score
  const calculateDragDropScore = (userAnswers, questions) => {
    let correctCount = 0
    questions.forEach((q) => {
      const userAnswer = userAnswers[q._id]
      if (q.type === 'drag_drop') {
        if (validateDragDropAnswer(userAnswer, q.correctAnswers)) correctCount++
      } else {
        if (userAnswer === q.correctAnswerIndex) correctCount++
      }
    })
    return correctCount
  }

  // ------------------ Fetch Quiz ------------------
  const fetchQuizByCourseId = async (courseId, options = {}) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication token not found')

      const headers = { Authorization: `Bearer ${token}` }
      const params = {}
      if (options.quizId) params.quizId = options.quizId
      if (options.subSectionId) params.subSectionId = options.subSectionId
      let data

      // Try endpoint: /quiz/{courseId}
      const response = await api.get(`/quiz/${courseId}`, { headers, params })
      data = response.data

      if (!data || !data.success) throw new Error(data?.message || 'Failed to fetch quiz')

      const quiz = data.quiz || data.data
      if (!quiz || !Array.isArray(quiz.questions)) throw new Error('Invalid quiz data')

      // Format questions
      const formattedQuiz = {
        ...quiz,
        questions: quiz.questions.map((q, qIndex) => {
          const type = q.type?.toLowerCase() === 'dragdrop' || q.type?.toLowerCase() === 'drag_drop'
            ? 'drag_drop'
            : 'multiple_choice'

          if (type === 'drag_drop') {
            const pairs = q.pairs || []
            const options = shuffleArray(pairs.map((p, i) => ({
              _id: p._id || `pair_${qIndex}_${i}`,
              text: p.drag || p.draggable || '',
              originalIndex: i
            })))
            const dropZones = pairs.map((p, i) => ({
              _id: p._id || `zone_${qIndex}_${i}`,
              text: p.drop || p.droppable || '',
              label: p.dropLabel || p.drop || `Eneo ${i + 1}`,
              placeholder: p.placeholder || 'Buruta jibu hapa',
              originalIndex: i
            }))
            const correctAnswers = pairs.map((p, i) => ({
              _id: p._id || `correct_${qIndex}_${i}`,
              drag: p.drag || p.draggable || '',
              drop: p.drop || p.droppable || '',
              text: p.drag || p.draggable || '',
              zoneIndex: i,
              originalIndex: i
            }))
            return { _id: q._id || `q${qIndex}`, question: q.question || '', type, questionImage: q.questionImage || null, options, dropZones, correctAnswers, correctAnswerIndex: null, pairs }
          } else {
            return {
              _id: q._id || `q${qIndex}`,
              question: q.question || '',
              type,
              questionImage: q.questionImage || null,
              options: (q.options || []).map((opt, i) => ({
                _id: opt._id || `q${qIndex}o${i}`,
                text: opt.text || '',
                image: opt.image || null
              })),
              dropZones: [],
              correctAnswers: [],
              correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : null
            }
          }
        })
      }

      return formattedQuiz
    } catch (err) {
      console.error('Error fetching quiz:', err)
      throw new Error(err.response?.data?.message || err.message || 'Unexpected error fetching quiz')
    }
  }

  // ------------------ Submit Quiz ------------------
  const submitQuiz = async (quizData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication token not found')

      const data = JSON.parse(JSON.stringify(quizData)) // convert reactive objects

      if (!data.quizId || !data.courseId || !data.answers || !data.questions)
        throw new Error('Missing required quiz data')

      const processedAnswers = data.questions.map((q, idx) => {
        const answer = data.answers[q._id]
        if (q.type === 'drag_drop') {
          return q.dropZones.map((zone, zIdx) => {
            const ans = answer?.[zIdx]
            if (!ans) return null
            const original = q.options.find(o => o._id === ans._id)
            return { zoneIndex: zIdx, optionId: ans._id, optionText: ans.text, originalIndex: original?.originalIndex ?? null }
          })
        } else {
          return typeof answer === 'number' ? answer : null
        }
      })

      const response = await api.post(`/submit-quiz/${data.quizId}`, {
        courseId: data.courseId,
        answers: processedAnswers,
        score: data.score ?? 0,
        questions: data.questions,
        questionTypes: data.questions.map(q => q.type)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Check for successful response
      if (response.data) {
        const responseData = response.data

        // Handle both success formats
        if (responseData.success || responseData.message === 'Quiz submitted successfully') {
          return {
            success: true,
            message: responseData.message || 'Quiz submitted successfully',
            ...responseData.data, // Spread the data object
            data: responseData.data // Keep data property for backward compatibility
          }
        }
      }

      throw new Error('Unexpected response format from server')
    } catch (err) {
      console.error('Error submitting quiz:', err)
      throw new Error(err.response?.data?.message || err.message || 'Failed to submit quiz')
    }
  }

  // ------------------ Create Quiz (for instructors) ------------------
  const createQuiz = async (courseId, questions) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication token not found')

      if (!courseId || !questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error('Course ID and at least one question are required')
      }

      const response = await api.post('/createQuiz', {
        courseId,
        questions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to create quiz')
      }

      return {
        success: true,
        message: response.data.message || 'Quiz created successfully',
        quiz: response.data.quiz
      }
    } catch (err) {
      console.error('Error creating quiz:', err)
      throw new Error(err.response?.data?.message || err.message || 'Failed to create quiz')
    }
  }

  return { fetchQuizByCourseId, submitQuiz, createQuiz, validateDragDropAnswer, calculateDragDropScore }
})
