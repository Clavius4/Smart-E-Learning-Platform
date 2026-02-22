<template>
  <div class="quiz-results">
    <MainNav />
    
    <!-- LEVEL CELEBRATION VIEW -->
    <div v-if="showLevelCelebration" class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div class="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl">
        <!-- Badge -->
        <div class="mb-6">
          <img src="@/assets/images/gold-star.png" alt="Level Complete" 
               class="w-32 h-32 md:w-40 md:h-40 mx-auto animate-bounce drop-shadow-2xl">
        </div>
        
        <!-- Title -->
        <h1 class="text-5xl md:text-6xl font-black text-purple-900 mb-6">
          🎉 Hongera Sana! 🎉
        </h1>
        
        <!-- Message -->
        <div class="bg-purple-50 rounded-2xl p-6 mb-8">
          <p class="text-2xl md:text-3xl font-bold text-purple-900 mb-4">
            Umekamilisha kiwango cha {{ capitalizeLevel(previousLevelValue) }}!
          </p>
          <p class="text-lg text-gray-700">
            Umefanikiwa kupita masomo yote. Uko tayari kwa changamoto kubwa zaidi!
          </p>
        </div>
        
        <!-- Level Transition -->
        <div class="flex items-center justify-center gap-4 mb-8 flex-wrap">
          <div class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xl">
            {{ capitalizeLevel(previousLevelValue) }}
          </div>
          <div class="text-purple-900 text-4xl font-black">→</div>
          <div class="bg-yellow-400 text-purple-900 px-6 py-3 rounded-xl font-bold text-xl animate-pulse">
            {{ capitalizeLevel(newLevelValue) }}
          </div>
        </div>
        
        <!-- Button -->
        <button @click="moveToNextLevel"
                class="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl font-black rounded-full hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all shadow-xl">
          🚀 Nenda {{ capitalizeLevel(newLevelValue) }}
        </button>
      </div>
    </div>
    
    <!-- NORMAL QUIZ RESULTS VIEW -->
    <div v-else class="container mx-auto px-4 py-8 max-w-3xl mt-20">
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <!-- Animated Celebration -->
        <div v-if="score >= 70" class="mb-6">
          <div class="relative mx-auto w-48 h-48">
            <img src="@/assets/images/confetti.png" class="absolute inset-0 w-full h-full animate-pulse" alt="Celebration">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
                <span class="text-4xl font-bold text-green-600">{{ score }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-6"
          :class="{
            'bg-yellow-100 text-yellow-600': score >= 50,
            'bg-red-100 text-red-600': score < 50
          }"
        >
          <span class="text-4xl font-bold">{{ score }}%</span>
        </div>
        
        <h1 class="text-3xl font-bold mb-4">
          {{ score >= 70 ? 'Congratulations!' : 'Keep Practicing!' }}
        </h1>
        <p class="text-gray-600 mb-6">
          {{ score >= 70 
             ? 'You passed the quiz with flying colors!'
             : 'Review the course material and try again.' 
          }}
        </p>
        
        <!-- XP and Badges -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <div class="flex justify-center items-center">
            <div class="mr-6">
              <div class="text-sm text-gray-500">XP Earned</div>
              <div class="text-2xl font-bold text-blue-600">+{{ xpEarned }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">New Badge</div>
              <div v-if="newBadge" class="flex items-center">
                <img :src="newBadge.image" :alt="newBadge.name" 
                     class="h-12 w-12 mr-2" :class="{ 'animate-bounce': newBadge.isBabyBadge }">
                <span class="font-bold text-lg text-yellow-600">{{ newBadge.name }}</span>
              </div>
              <div v-else class="text-gray-400">Keep going!</div>
            </div>
          </div>
        </div>
        
        <!-- Buttons -->
        <div class="flex justify-center gap-4">
          <button @click="retakeQuiz"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            🔄 Retake Quiz
          </button>
          <button @click="backToCourse"
            class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            Endelea →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/axios'

export default {
  components: { MainNav },
  props: {
    score: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const isUpdating = ref(false)
    
    const xpEarned = computed(() => {
      return route.query.xp ? Number(route.query.xp) : Math.floor(props.score / 10) * 50
    })
    
    const newBadge = computed(() => {
      if (route.query.badge) {
         return {
             name: route.query.badge,
             image: require('@/assets/images/gold-star.png'),
             isBabyBadge: true
         }
      }
      
      if (props.score >= 90) {
        return {
          name: 'Super Star 🌟',
          image: require('@/assets/images/gold-star.png'),
          isBabyBadge: true
        }
      } else if (props.score >= 70) {
        return {
          name: 'Smart Cookie 🍪', 
          image: require('@/assets/images/silver-star.png'),
          isBabyBadge: true
        }
      }
      return null
    })

    // Level Celebration Logic
    const showLevelCelebration = computed(() => route.query.levelChanged === 'true')
    const previousLevelValue = computed(() => route.query.previousLevel || 'beginner')
    const newLevelValue = computed(() => route.query.newLevel || 'intermediate')
    
    const capitalizeLevel = (level) => {
      if (!level) return ''
      return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
    }
    
    const moveToNextLevel = async () => {
      if (isUpdating.value) return
      
      try {
        isUpdating.value = true
        
        // Call backend to update student level
        const response = await api.put('/profile/update-difficulty-level', {
          difficultyPreference: newLevelValue.value
        })
        
        if (response.data.success) {
          // Update auth store with new user data
          authStore.setUser(response.data.user)
          
          // Redirect to courses dashboard
          router.push('/courses')
        }
      } catch (error) {
        console.error('Error updating level:', error)
        alert('Samahani, tumeshindwa kusasisha kiwango chako. Tafadhali jaribu tena.')
      } finally {
        isUpdating.value = false
      }
    }

    const retakeQuiz = () => {
      router.push({ 
        name: 'course-quiz', 
        params: { 
          id: route.params.courseId
        }
      })
    }

    const backToCourse = () => {
      router.push('/courses')
    }
    
    return { 
      xpEarned,
      newBadge,
      retakeQuiz, 
      backToCourse,
      showLevelCelebration,
      previousLevelValue,
      newLevelValue,
      capitalizeLevel,
      moveToNextLevel,
      isUpdating
    }
  }
}
</script>

<style scoped>
/* Animations */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>