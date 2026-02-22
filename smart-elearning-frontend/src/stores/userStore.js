// stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCourseStore } from './courseStore' // if you want to use course data here

export const useUserStore = defineStore('user', () => {
  // Load from localStorage or initialize defaults
  const storedProfile = JSON.parse(localStorage.getItem('learningProfile')) || {
    learningStyle: null,
    interests: [],
    strengths: [],
    weaknesses: [],
    completedActivities: [],
    onboardingComplete: false
  }

  const profile = ref(storedProfile)

  // Save profile to localStorage
  const saveProfile = () => {
    localStorage.setItem('learningProfile', JSON.stringify(profile.value))
  }

  // Update learning style
  const updateLearningStyle = (style) => {
    profile.value.learningStyle = style
    saveProfile()
  }

  // Add interest without duplicates
  const addInterest = (interest) => {
    if (!profile.value.interests.includes(interest)) {
      profile.value.interests.push(interest)
      saveProfile()
    }
  }

  // Record activity and adjust strengths/weaknesses
  const recordActivity = (activity) => {
    profile.value.completedActivities.push(activity)

    if (activity.score > 75 && !profile.value.strengths.includes(activity.topic)) {
      profile.value.strengths.push(activity.topic)
    } else if (activity.score < 40 && !profile.value.weaknesses.includes(activity.topic)) {
      profile.value.weaknesses.push(activity.topic)
    }

    saveProfile()
  }

  // Mark onboarding as complete
   const completeOnboarding = (style, interests) => {
    profile.value.learningStyle = style
    profile.value.interests = interests
    profile.value.hasCompletedOnboarding = true
    saveProfile()
  }

  // Course recommendations
  const courseStore = useCourseStore()
  const recommendedCourses = computed(() => {
    return courseStore.courses.filter(course =>
      profile.value.interests.some(interest => course.tags.includes(interest))
    )
  })

  return { 
    profile,
    updateLearningStyle,
    addInterest,
    recordActivity,
    completeOnboarding,
    recommendedCourses
  }
})
