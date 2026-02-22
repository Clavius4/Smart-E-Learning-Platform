<template>
  <div 
    class="level-badge" 
    :class="levelClass"
    :title="`Kiwango chako: ${levelLabel}`"
  >
    <div class="level-icon">{{ levelIcon }}</div>
    <div class="level-text">
      <div class="level-label">{{ levelLabel }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const studentLevel = computed(() => {
  return authStore.user?.difficultyPreference || 'beginner'
})

const levelLabel = computed(() => {
  const labels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  }
  return labels[studentLevel.value] || 'Beginner'
})

const levelIcon = computed(() => {
  const icons = {
    beginner: '🌱',
    intermediate: '🌟',
    advanced: '🏆'
  }
  return icons[studentLevel.value] || '🌱'
})

const levelClass = computed(() => {
  return `level-${studentLevel.value}`
})
</script>

<style scoped>
.level-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: default;
  border: 3px solid;
}

.level-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.level-icon {
  font-size: 20px;
  animation: bounce 2s ease-in-out infinite;
}

.level-text {
  display: flex;
  flex-direction: column;
}

.level-label {
  font-size: 14px;
  text-transform: capitalize;
  font-weight: 900;
}

/* Beginner - Blue */
.level-beginner {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-color: #1D4ED8;
  color: white;
}

/* Intermediate - Orange/Yellow */
.level-intermediate {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border-color: #B45309;
  color: white;
}

/* Advanced - Purple/Gold */
.level-advanced {
  background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%);
  border-color: #6B21A8;
  color: white;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .level-badge {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .level-icon {
    font-size: 16px;
  }
  
  .level-label {
    font-size: 12px;
  }
}
</style>
