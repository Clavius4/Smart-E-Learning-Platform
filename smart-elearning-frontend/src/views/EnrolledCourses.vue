<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100">
    <MainNav />
    
    <div class="container mx-auto px-4 py-8 max-w-6xl mt-20">
      <!-- Header Section with Fun Design -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mb-4 shadow-lg">
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-4">
          🎓 Masomo Yangu 🎓
        </h1>
        <p class="text-xl text-gray-600 mb-6">Endelea kujifunza na kufurahia!</p>
        <router-link 
          to="/courses"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white text-lg font-bold rounded-full shadow-lg hover:from-green-500 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
        >
          🔍 Tafuta Masomo Zaidi
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
          <div class="animate-spin rounded-full h-8 w-8 border-t-3 border-b-3 border-blue-500"></div>
        </div>
        <p class="text-xl text-gray-600 font-semibold">Inapakia masomo...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-md mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center border-4 border-red-200">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Oops! Kuna tatizo</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            @click="fetchEnrolledCourses"
            class="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-full shadow-lg hover:from-blue-500 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
          >
            🔄 Jaribu Tena
          </button>
        </div>
      </div>

      <!-- Courses Grid -->
      <div v-else>
        <div v-if="courses.length > 0">
          <!-- Progress Overview -->
          <div class="bg-white rounded-2xl shadow-xl p-6 mb-8 border-4 border-yellow-200">
            <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              ⭐ Maendeleo Yako
            </h2>
            <div class="flex flex-wrap gap-4">
              <div class="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4 flex-1 min-w-32">
                <div class="text-3xl font-bold text-blue-600">{{ courses.length }}</div>
                <div class="text-sm text-gray-600 font-semibold">Masomo Yote</div>
              </div>
              <div class="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 flex-1 min-w-32">
                <div class="text-3xl font-bold text-green-600">{{ completedCourses }}</div>
                <div class="text-sm text-gray-600 font-semibold">Masomo Yaliyo Kamili</div>
              </div>
              <div class="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4 flex-1 min-w-32">
                <div class="text-3xl font-bold text-purple-600">{{ averageProgress.toFixed(0) }}%</div>
                <div class="text-sm text-gray-600 font-semibold">Wastani wa Maendeleo</div>
              </div>
            </div>
          </div>

          <!-- Courses Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              v-for="course in courses"
              :key="course._id"
              class="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-transparent hover:border-yellow-300"
            >
              <!-- Course Image -->
              <div class="h-48 overflow-hidden relative">
                <img 
                  :src="course.thumbnail || 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=📚+Somo'" 
                  :alt="course.courseName"
                  class="w-full h-full object-cover"
                >
                <div class="absolute top-3 right-3">
                  <div class="bg-white rounded-full px-3 py-1 shadow-lg">
                    <span class="text-sm font-bold text-gray-700">{{ course.progress || 0 }}%</span>
                  </div>
                </div>
              </div>

              <!-- Course Content -->
              <div class="p-6">
                <h3 class="text-xl font-bold mb-3 text-gray-800 leading-tight">{{ course.courseName }}</h3>
                <p class="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">{{ course.courseDescription }}</p>
                
                <!-- Progress Bar -->
                <div class="mb-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-semibold text-gray-600">Maendeleo:</span>
                    <span class="text-sm font-bold text-blue-600">{{ course.progress || 0 }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      class="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                      :style="{ width: (course.progress || 0) + '%' }"
                    ></div>
                  </div>
                </div>

                <!-- Action Button -->
                <router-link 
                  :to="{ name: 'course-player', params: { id: course._id } }"
                  class="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-xl shadow-lg hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-200"
                >
                  {{ (course.progress || 0) > 0 ? '📖 Endelea Kusoma' : '🚀 Anza Somo' }}
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="max-w-lg mx-auto">
          <div class="bg-white rounded-2xl shadow-xl p-12 text-center border-4 border-blue-200">
            <div class="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">🎒 Hakuna Masomo Bado</h3>
            <p class="text-gray-600 mb-6 text-lg">Haujajisajili katika somo lolote. Hebu tuanze safari ya kujifunza!</p>
            <router-link 
              to="/courses"
              class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold text-lg rounded-full shadow-xl hover:from-orange-500 hover:to-red-500 transform hover:scale-105 transition-all duration-200"
            >
              🔍 Tafuta Masomo
            </router-link>
          </div>
        </div>
      </div>

      <!-- Motivational Section -->
      <div v-if="courses.length > 0" class="mt-12 bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 rounded-2xl p-8 text-center shadow-xl">
        <h2 class="text-3xl font-bold text-white mb-4">🎉 Hongera! 🎉</h2>
        <p class="text-xl text-white font-semibold">Unafanya vizuri sana! Endelea kujifunza na kuwa mzuri zaidi kila siku.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MainNav from '@/components/navigation/MainNav.vue'

const authStore = useAuthStore()
const courses = ref([])
const loading = ref(false)
const error = ref(null)

const completedCourses = computed(() => {
  return courses.value.filter(course => (course.progress || 0) >= 100).length
})

const averageProgress = computed(() => {
  if (courses.value.length === 0) return 0
  const totalProgress = courses.value.reduce((sum, course) => sum + (course.progress || 0), 0)
  return totalProgress / courses.value.length
})

const fetchEnrolledCourses = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await authStore.getEnrolledCourses()
    
    // Handle both response structures
    courses.value = response.data?.courses || 
                   response.data?.data || 
                   []
  } catch (err) {
    error.value = err.message || 'Imeshindwa kupakia masomo'
    console.error('Full error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEnrolledCourses()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>