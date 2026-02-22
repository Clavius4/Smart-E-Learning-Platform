import { defineStore } from 'pinia'
import axios from 'axios'

export const useAssessmentStore = defineStore('assessment', {
  state: () => ({
    currentAssessment: null,
    assessmentResults: null,
    loading: false,
    error: null,
    submitting: false,
    alreadyPassed: false
  }),

  getters: {
    getCurrentAssessment: (state) => state.currentAssessment,
    getAssessmentResults: (state) => state.assessmentResults,
    isAssessmentPassed: (state) => state.alreadyPassed
  },

  actions: {
    setLoading(loading) {
      this.loading = loading
    },

    setError(error) {
      this.error = error
    },

    setSubmitting(submitting) {
      this.submitting = submitting
    },

    clearError() {
      this.error = null
    },

    clearAssessment() {
      this.currentAssessment = null
      this.assessmentResults = null
      this.error = null
      this.alreadyPassed = false
    },

    async accessAssessmentByLevel(level) {
      this.loading = true
      this.error = null
      this.alreadyPassed = false

      try {
        const response = await api.get(`/assessments/level/${level}`)

        if (response.data.success) {
          if (response.data.message === 'Assessment already passed') {
            this.currentAssessment = null
            this.alreadyPassed = true
          } else {
            this.currentAssessment = response.data.assessment
            this.alreadyPassed = false
          }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load assessment'
        this.currentAssessment = null
        this.alreadyPassed = false
        console.error('Error accessing assessment:', error)
      } finally {
        this.loading = false
      }
    },

    async submitAssessment(assessmentId, answers) {
      this.submitting = true
      this.error = null

      try {
        const response = await api.post(`/assessments/submit/${assessmentId}`, { answers })

        if (response.data.success) {
          this.assessmentResults = {
            score: response.data.score,
            total: response.data.total,
            percentage: response.data.percentage,
            passed: response.data.passed,
            results: response.data.results,
            message: response.data.message
          }
          return response.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to submit assessment'
        console.error('Error submitting assessment:', error)
        throw error
      } finally {
        this.submitting = false
      }
    },

    validateAnswers(answers) {
      const assessment = this.currentAssessment

      if (!assessment) {
        return { valid: false, error: 'No assessment loaded' }
      }

      if (!Array.isArray(answers)) {
        return { valid: false, error: 'Answers must be an array' }
      }

      if (answers.length !== assessment.questions.length) {
        return { valid: false, error: 'Incomplete answers submitted' }
      }

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i]
        const question = assessment.questions[i]

        if (question.type === 'mcq') {
          if (answer.selected === undefined || answer.selected === null) {
            return { valid: false, error: `Question ${i + 1} is not answered` }
          }
        } else if (question.type === 'dragdrop') {
          if (!Array.isArray(answer.selectedPairs) || answer.selectedPairs.length === 0) {
            return { valid: false, error: `Question ${i + 1} drag-drop pairs not completed` }
          }
        }
      }

      return { valid: true }
    },

    calculateLocalScore(answers) {
      const assessment = this.currentAssessment

      if (!assessment || !Array.isArray(answers)) {
        return { score: 0, total: 0, percentage: 0 }
      }

      let score = 0
      const total = assessment.questions.length

      for (let i = 0; i < Math.min(answers.length, total); i++) {
        const question = assessment.questions[i]
        const answer = answers[i]
        let correct = false

        if (question.type === 'mcq') {
          correct = answer.selected === question.correctAnswerIndex
        } else if (question.type === 'dragdrop') {
          correct =
            Array.isArray(answer.selectedPairs) &&
            answer.selectedPairs.length === question.pairs.length &&
            answer.selectedPairs.every(
              (pair, index) =>
                pair.drag === question.pairs[index].drag &&
                pair.drop === question.pairs[index].drop
            )
        }

        if (correct) score++
      }

      const percentage = total > 0 ? (score / total) * 100 : 0

      return { score, total, percentage }
    },

    reset() {
      this.currentAssessment = null
      this.assessmentResults = null
      this.loading = false
      this.error = null
      this.submitting = false
      this.alreadyPassed = false
    }
  }
})
