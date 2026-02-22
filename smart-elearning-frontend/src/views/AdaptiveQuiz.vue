<!-- components/AdaptiveQuiz.vue -->
<template>
    <div class="quiz-container">
      <div v-if="currentQuestion">
        <h2>{{ currentQuestion.text }}</h2>
        
        <!-- Visual version for visual learners -->
        <div v-if="userStore.profile.learningStyle === 'visual'">
          <img v-if="currentQuestion.visualPrompt" :src="currentQuestion.visualPrompt">
          <div class="visual-options">
            <!-- Visual answer options -->
          </div>
        </div>
        
        <!-- Text version for others -->
        <div v-else>
          <p>{{ currentQuestion.textExplanation }}</p>
          <div class="text-options">
            <!-- Text answer options -->
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  
  const userStore = useUserStore()
  const props = defineProps(['questions'])
  
  // Adapt questions based on user profile
  const adaptedQuestions = computed(() => {
    return props.questions.map(q => {
      if (userStore.profile.learningStyle === 'visual') {
        return {
          ...q,
          text: q.visualText || q.text,
          options: q.visualOptions || q.options
        }
      }
      return q
    })
  })
  </script>