<template>
  <div 
    class="learning-style-switcher"
    :title="`Badili: ${currentStyleLabel}`"
  >
    <button 
      @click="toggleLearningStyle"
      class="switcher-button"
      :class="switcherClass"
      :disabled="loading"
    >
      <div class="switcher-track">
        <div class="switcher-thumb" :class="thumbPosition">
          <span class="thumb-icon">{{ currentIcon }}</span>
        </div>
      </div>
      <div class="switcher-labels">
        <span class="label" :class="{ active: currentStyle === 'literacy' }">
          📚 Kusoma
        </span>
        <span class="label" :class="{ active: currentStyle === 'numeracy' }">
          🔢 Kuandika
        </span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/axios'

const authStore = useAuthStore()
const loading = ref(false)

const currentStyle = computed(() => {
  return authStore.user?.learningStyle || 'literacy'
})

const currentStyleLabel = computed(() => {
  return currentStyle.value === 'literacy' ? 'Kusoma (Literacy)' : 'Kuandika (Numeracy)'
})

const currentIcon = computed(() => {
  return currentStyle.value === 'literacy' ? '📚' : '🔢'
})

const switcherClass = computed(() => {
  return `style-${currentStyle.value}`
})

const thumbPosition = computed(() => {
  return currentStyle.value === 'literacy' ? 'left' : 'right'
})

const toggleLearningStyle = async () => {
  if (loading.value) return
  
  const newStyle = currentStyle.value === 'literacy' ? 'numeracy' : 'literacy'
  
  try {
    loading.value = true
    
    const response = await api.put('/profile/update-learning-style', {
      learningStyle: newStyle
    })
    
    if (response.data.success) {
      // Update auth store
      authStore.setUser(response.data.user)
      
      // Reload page to refresh courses
      window.location.reload()
    }
  } catch (error) {
    console.error('Failed to update learning style:', error)
    alert('Imeshindikana kubadilisha. Tafadhali jaribu tena.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.learning-style-switcher {
  display: flex;
  align-items: center;
}

.switcher-button {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 3px solid;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.switcher-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.switcher-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.style-literacy {
  border-color: #3B82F6;
}

.style-numeracy {
  border-color: #F59E0B;
}

.switcher-track {
  position: relative;
  width: 60px;
  height: 30px;
  background: linear-gradient(90deg, #3B82F6 0%, #F59E0B 100%);
  border-radius: 15px;
  overflow: hidden;
}

.switcher-thumb {
  position: absolute;
  top: 3px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switcher-thumb.left {
  left: 3px;
}

.switcher-thumb.right {
  left: calc(100% - 27px);
}

.switcher-labels {
  display: flex;
  gap: 12px;
  font-size: 11px;
  font-weight: 800;
}

.label {
  color: #9CA3AF;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.label.active {
  color: #1F2937;
  transform: scale(1.1);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .switcher-button {
    padding: 6px 10px;
  }
  
  .switcher-track {
    width: 50px;
    height: 26px;
  }
  
  .switcher-thumb {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
  
  .switcher-labels {
    font-size: 10px;
    gap: 8px;
  }
}
</style>
