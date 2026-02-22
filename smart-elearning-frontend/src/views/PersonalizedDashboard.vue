<!-- components/PersonalizedDashboard.vue -->
<template>
    <div class="dashboard">
      <div class="progress-section">
        <h2>Your Progress</h2>
        <div class="strengths-weaknesses">
          <div class="strengths">
            <h3>You're great at:</h3>
            <ul>
              <li v-for="strength in userStore.profile.strengths">
                {{ strength }}
              </li>
            </ul>
          </div>
          <div class="weaknesses">
            <h3>Keep practicing:</h3>
            <ul>
              <li v-for="weakness in userStore.profile.weaknesses">
                {{ weakness }}
              </li>
            </ul>
          </div>
        </div>
      </div>
  
      <div class="recommendations">
        <h2>Recommended for You</h2>
        <CourseCarousel :courses="recommendedCourses" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import { getRecommendedCourses } from '@/utils/recommendations'
  
  const userStore = useUserStore()
  const recommendedCourses = computed(() => {
    return getRecommendedCourses(userStore.profile, allCourses)
  })
  </script>