<template>
  <div class="suggestion-container">
    <div class="suggestion-card">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1>Level Recommendation</h1>
      <p>Based on your assessment results, we recommend starting with {{ suggestedLevel }} level courses.</p>
      <p>This will help build a strong foundation before moving to more advanced content.</p>
      
      <div class="actions">
        <button @click="acceptSuggestion" class="accept-btn">
          Go to {{ suggestedLevel }} Courses
        </button>
        <button @click="retryAssessment" class="retry-btn" v-if="canRetry">
          Retry Assessment
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const suggestedLevel = route.params.level || 'beginner';

const canRetry = computed(() => {
  return suggestedLevel === 'beginner';
});

const acceptSuggestion = () => {
  router.push('/courses');
};

const retryAssessment = () => {
  router.push('/level-assessment/intermediate');
};
</script>

<style scoped>
.suggestion-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.suggestion-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.icon {
  color: #FF9800;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

p {
  color: #666;
  margin-bottom: 1rem;
}

.actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.accept-btn {
  background: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
}

.retry-btn {
  background: #2196F3;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
}
</style>