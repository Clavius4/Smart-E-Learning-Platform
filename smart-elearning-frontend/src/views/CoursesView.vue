<template>
  <div class="courses-view relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="background-animations">
      <!-- Floating Clouds -->
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">☁️</div>
      <div class="cloud cloud-3">☁️</div>
      
      <!-- Floating Stars -->
      <div class="star star-1">⭐</div>
      <div class="star star-2">✨</div>
      <div class="star star-3">🌟</div>
      <div class="star star-4">⭐</div>
      
      <!-- Bouncing Shapes -->
      <div class="shape shape-circle">🔵</div>
      <div class="shape shape-triangle">🔺</div>
      <div class="shape shape-square">🟦</div>
      
      <!-- Flying Butterflies -->
      <div class="butterfly butterfly-1">🦋</div>
      <div class="butterfly butterfly-2">🦋</div>
      
      <!-- Rainbow -->
      <div class="rainbow"></div>
    </div>
    
    <MainNav />
    
    <div class="container mx-auto px-4 py-8 max-w-7xl mt-20 relative z-10">
      <!-- Header with Search and Filters -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div class="w-full md:w-1/2">
          <h1 class="text-6xl font-black text-white mb-6 drop-shadow-lg animate-bounce-slow">
            🎓 Masomo Yangu
          </h1>
          <p class="text-2xl font-bold text-yellow-200 mb-6 drop-shadow-md">
            Chagua masomo yako ya kufurahisha! 🌟
          </p>
          
          <div class="relative transform hover:scale-105 transition-transform duration-300">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Tafuta masomo..." 
              class="w-full pl-6 pr-16 py-4 text-xl font-bold border-4 border-yellow-400 rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 bg-white shadow-xl transform hover:shadow-2xl transition-all duration-300"
              @keyup.enter="applyFilters"
            >
            <div class="absolute right-4 top-4 text-3xl animate-pulse">🔍</div>
          </div>
        </div>
        
        <!-- Fun Stats -->
        <div class="w-full md:w-1/2 flex flex-wrap gap-4 justify-end">
          <div class="stats-card bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-3xl p-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
            <div class="text-4xl mb-2">📚</div>
            <div class="text-3xl font-black">{{ filteredCourses.length }}</div>
            <div class="text-lg font-bold">Masomo</div>
          </div>
          <div class="stats-card bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-3xl p-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
            <div class="text-4xl mb-2">🎯</div>
            <div class="text-3xl font-black">{{ courseStore.enrolledCourses?.length || 0 }}</div>
            <div class="text-lg font-bold">Nimejiunga</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block relative">
          <div class="animate-spin rounded-full h-24 w-24 border-8 border-yellow-400 border-t-pink-500 shadow-xl"></div>
          <div class="absolute inset-0 flex items-center justify-center text-4xl">📖</div>
        </div>
        <p class="mt-6 text-3xl font-bold text-white drop-shadow-lg animate-pulse">
          Tunaongeza masomo... 🎈
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-gradient-to-r from-red-400 to-pink-500 border-4 border-red-600 rounded-3xl p-8 mb-8 shadow-xl">
        <div class="flex items-center">
          <div class="text-6xl mr-4 animate-bounce">😟</div>
          <div>
            <p class="text-2xl font-bold text-white mb-4">Samahani! Kuna tatizo.</p>
            <p class="text-xl text-white">{{ error }}</p>
            <button 
              @click="fetchCourses"
              class="mt-4 px-8 py-3 bg-white text-red-500 font-black text-xl rounded-full hover:bg-yellow-100 transition-colors duration-300 shadow-lg transform hover:scale-105"
            >
              🔄 Jaribu Tena
            </button>
          </div>
        </div>
      </div>

      <!-- Courses Grid -->
      <div v-else>
        <div v-if="filteredCourses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <CourseCard 
            v-for="course in paginatedCourses"
            :key="course._id"
            :course="course"
            :loading="loading" 
            @enroll="handleEnroll"
            class="course-card-animated"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-3xl shadow-2xl p-16 text-center">
          <div class="mx-auto max-w-md">
            <div class="text-8xl mb-6 animate-bounce">🔍</div>
            <h3 class="text-4xl font-black text-white mb-4 drop-shadow-lg">
              Hakuna masomo yaliyopatikana!
            </h3>
            <p class="text-2xl font-bold text-white mb-8 drop-shadow-md">
              Jaribu kutafuta kwa njia nyingine 
            </p>
            <div class="mt-8">
              <button 
                @click="resetFilters"
                class="inline-flex items-center px-12 py-4 text-2xl font-black text-purple-600 bg-white rounded-full shadow-xl hover:bg-yellow-100 focus:outline-none transform hover:scale-110 transition-all duration-300"
              >
                🔄 Anza Upya
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredCourses.length > 0" class="mt-12 flex justify-center">
          <nav class="inline-flex rounded-3xl shadow-2xl bg-white p-2">
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-6 py-3 text-xl font-bold rounded-full border-4 border-blue-300 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 mr-2"
            >
              ⬅️ Iliyopita
            </button>
            <div class="flex gap-2">
              <button 
                v-for="page in totalPages"
                :key="page"
                @click="currentPage = page"
                :class="{
                  'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-110': currentPage === page,
                  'bg-white text-blue-600 hover:bg-blue-50': currentPage !== page
                }"
                class="px-4 py-3 text-xl font-black rounded-full border-4 border-blue-300 transform hover:scale-105 transition-all duration-300 min-w-[4rem]"
              >
                {{ page }}
              </button>
            </div>
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-6 py-3 text-xl font-bold rounded-full border-4 border-blue-300 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ml-2"
            >
              Ifuatayo ➡️
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import CourseCard from '@/components/navigation/CourseCard.vue'
import { useCourseStore } from '@/stores/courseStore'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const toast = useToast()
const authStore = useAuthStore()
const router = useRouter()
const courseStore = useCourseStore()

// State
const searchQuery = ref('')
const filterLevel = ref('all')
const filterSubject = ref('all')
const currentPage = ref(1)
const itemsPerPage = 8

// Fetch courses with error handling
const fetchCourses = async () => {
  try {
    await courseStore.fetchRecommendedCourses()
  } catch (error) {
    console.error('Failed to load recommended courses:', error)
  }
}

const CATEGORY_MAP = {
  'literacy': '68d7c0f165485406bf5aa6fa', // Kusoma
  'numeracy': '68d7c5341138e183c59cee36'  // Kuhesabu
}

onMounted(async () => {
  await Promise.all([
    fetchCourses(),
    courseStore.fetchEnrolledCourses()
  ])

  console.log('🎓 Recommended courses loaded:', courseStore.courses?.length)
  console.log('📚 Enrolled courses loaded:', courseStore.enrolledCourses?.length)
})

// Computed properties
const filteredCourses = computed(() => {
  console.log('🔍 Filtering courses. Active filters:', {
    level: filterLevel.value,
    subject: filterSubject.value,
    search: searchQuery.value
  })
  
  // Merge all courses with enrolled courses to ensure enrolled courses are always shown
  const allCoursesToFilter = courseStore.courses || []
  const enrolledCourseIds = new Set(courseStore.enrolledCourses.map(ec => ec._id?.toString()))
  
  // Add enrolled courses that aren't in the main courses list
  const mergedCourses = [
    ...allCoursesToFilter,
    ...courseStore.enrolledCourses.filter(ec => 
      !allCoursesToFilter.some(c => c._id?.toString() === ec._id?.toString())
    )
  ]
  
  console.log('📋 Total courses to filter (merged):', mergedCourses.length, {
    fromCatalog: allCoursesToFilter.length,
    fromEnrolled: courseStore.enrolledCourses.length,
    uniqueEnrolled: courseStore.enrolledCourses.filter(ec => 
      !allCoursesToFilter.some(c => c._id?.toString() === ec._id?.toString())
    ).length
  })
  
  if (mergedCourses.length === 0) {
    console.log('⚠️ No courses available (neither in catalog nor enrolled)')
    return []
  }
  
  const filtered = mergedCourses.filter(course => {
    // ALWAYS show enrolled courses - they bypass all filters
    // Convert IDs to strings for proper comparison (MongoDB ObjectIds)
    const courseIdStr = course._id?.toString()
    const isEnrolled = enrolledCourseIds.has(courseIdStr)
    
    if (isEnrolled) {
      console.log('📚 Enrolled course BYPASSING filters:', course.courseName)
      return true
    }
    
    // For non-enrolled courses, apply filters normally
    const matchesSearch = searchQuery.value === '' || 
      course.courseName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      course.courseDescription?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesLevel = filterLevel.value === 'all' || 
      course.level?.toLowerCase() === filterLevel.value.toLowerCase()
    
    const matchesSubject = filterSubject.value === 'all' || 
      course.category?.toString().toLowerCase() === filterSubject.value.toLowerCase()
    
    const matches = matchesSearch && matchesLevel && matchesSubject
    
    if (!matches && !isEnrolled) {
      console.log('❌ Course filtered out:', course.courseName, {
        matchesSearch,
        matchesLevel,
        matchesSubject,
        courseLevel: course.level,
        courseCategory: course.category
      })
    }
    
    return matches
  })
  
  console.log('📊 Filtered results:', filtered.length, 'courses')
  
  return filtered.map(course => {
    // DEBUG: Check locking status
    if (course.isLocked) {
      console.log(`🔒 Course Locked: ${course.courseName}`, { completed: course.isCompleted, locked: course.isLocked });
    }
    
    return {
      ...course,
      image: course.thumbnail,
      title: course.courseName,
      description: course.courseDescription,
      difficulty: course.level,
      isEnrolled: courseStore.enrolledCourses.some(ec => ec._id?.toString() === course._id?.toString())
    }
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredCourses.value.length / itemsPerPage)
})

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCourses.value.slice(start, end)
})

// Methods
const applyFilters = () => currentPage.value = 1
const resetFilters = () => {
  searchQuery.value = ''
  filterLevel.value = 'all'
  filterSubject.value = 'all'
  currentPage.value = 1
}
const prevPage = () => currentPage.value > 1 && currentPage.value--
const nextPage = () => currentPage.value < totalPages.value && currentPage.value++

const handleEnroll = async (courseId) => {
  try {
    if (!authStore.isAuthenticated) {
      toast.warning('Tafadhali ingia ili kujiunga na masomo');
      return router.push('/login');
    }

    const result = await courseStore.enrollInCourse(courseId);
    
    if (result.success) {
      toast.success('Umejiunga kikamilifu! 🎉');
      router.push({ 
        name: 'course-player',
        params: { id: courseId } 
      });
    } else {
      toast.warning(result.message || 'Kujiunga kumekamilika na matatizo machache');
    }
  } catch (error) {
    console.error('Enrollment error:', error);
    toast.error(error.message || 'Imeshindwa kujiunga na masomo');
    
    if (error.response?.status === 401) {
      authStore.clearAuth();
      router.push('/login');
    }
  }
};

// Expose store state to template
const loading = computed(() => courseStore.loading)
const error = computed(() => courseStore.error)
</script>

<style scoped>
.courses-view {
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  min-height: 100vh;
  position: relative;
}

.background-animations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
}

/* Cloud animations */
.cloud {
  position: absolute;
  font-size: 3rem;
  animation: float 20s infinite ease-in-out;
}

.cloud-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.cloud-2 {
  top: 20%;
  right: 15%;
  animation-delay: -7s;
}

.cloud-3 {
  top: 60%;
  left: 5%;
  animation-delay: -14s;
}

/* Star animations */
.star {
  position: absolute;
  font-size: 2rem;
  animation: twinkle 3s infinite ease-in-out;
}

.star-1 {
  top: 15%;
  left: 70%;
  animation-delay: 0s;
}

.star-2 {
  top: 40%;
  right: 10%;
  animation-delay: -1s;
}

.star-3 {
  top: 70%;
  left: 80%;
  animation-delay: -2s;
}

.star-4 {
  top: 80%;
  left: 20%;
  animation-delay: -1.5s;
}

/* Shape animations */
.shape {
  position: absolute;
  font-size: 2.5rem;
  animation: bounce 4s infinite ease-in-out;
}

.shape-circle {
  top: 30%;
  left: 85%;
  animation-delay: 0s;
}

.shape-triangle {
  top: 50%;
  right: 5%;
  animation-delay: -1.5s;
}

.shape-square {
  top: 90%;
  left: 60%;
  animation-delay: -3s;
}

/* Butterfly animations */
.butterfly {
  position: absolute;
  font-size: 3rem;
  animation: fly 15s infinite linear;
}

.butterfly-1 {
  top: 35%;
  left: -10%;
  animation-delay: 0s;
}

.butterfly-2 {
  top: 65%;
  left: -10%;
  animation-delay: -7s;
}

/* Rainbow */
.rainbow {
  position: absolute;
  top: 5%;
  right: 20%;
  font-size: 4rem;
  animation: glow 4s infinite ease-in-out;
}

/* Course card animations */
.course-card-animated {
  animation: slideInUp 0.8s ease-out;
  animation-fill-mode: both;
}

.course-card-animated:nth-child(1) { animation-delay: 0.1s; }
.course-card-animated:nth-child(2) { animation-delay: 0.2s; }
.course-card-animated:nth-child(3) { animation-delay: 0.3s; }
.course-card-animated:nth-child(4) { animation-delay: 0.4s; }
.course-card-animated:nth-child(5) { animation-delay: 0.5s; }
.course-card-animated:nth-child(6) { animation-delay: 0.6s; }
.course-card-animated:nth-child(7) { animation-delay: 0.7s; }
.course-card-animated:nth-child(8) { animation-delay: 0.8s; }

/* Stats cards */
.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: scale(1.1) rotate(5deg);
}

/* Keyframe animations */
@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(0px) translateX(20px); }
  75% { transform: translateY(-10px) translateX(10px); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0px); }
  25% { transform: translateY(-30px); }
  50% { transform: translateY(-15px); }
  75% { transform: translateY(-5px); }
}

@keyframes fly {
  0% { transform: translateX(-100px) translateY(0px); }
  25% { transform: translateX(25vw) translateY(-50px); }
  50% { transform: translateX(50vw) translateY(20px); }
  75% { transform: translateX(75vw) translateY(-30px); }
  100% { transform: translateX(100vw) translateY(10px); }
}

@keyframes glow {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cloud, .star, .shape, .butterfly, .rainbow {
    font-size: 1.5rem;
  }
  
  .courses-view h1 {
    font-size: 3rem;
  }
  
  .courses-view p {
    font-size: 1.5rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .cloud, .star, .shape, .butterfly, .rainbow,
  .course-card-animated, .animate-bounce-slow {
    animation: none;
  }
}
</style>