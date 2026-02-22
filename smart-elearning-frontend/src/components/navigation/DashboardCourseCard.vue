<template>
  <div class="modern-course-card bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 relative transform hover:-translate-y-2">
    
    <!-- Course Thumbnail -->
    <div class="relative h-48 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-hidden">
      <img 
        :src="course.thumbnail || '/images/course-placeholder.jpg'" 
        :alt="course.title"
        class="w-full h-full object-cover mix-blend-overlay opacity-90"
      >
      
      <!-- Subtle decorative elements -->
      <div class="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
        <div class="w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
      </div>
      <div class="absolute top-4 left-4 w-8 h-8 bg-white/15 rounded-lg backdrop-blur-sm"></div>
      <div class="absolute bottom-4 right-4 w-6 h-6 bg-white/10 rounded-full"></div>
      
      <!-- Title Banner -->
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/90 to-transparent p-4">
        <h3 class="text-white font-bold text-xl md:text-2xl leading-tight modern-font">
          {{ course.title }}
        </h3>
      </div>
    </div>

    <!-- Course Content -->
    <div class="p-6 bg-gradient-to-b from-blue-50 to-white">
      
      <!-- Progress Section -->
      <div class="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-xl border border-blue-200 relative">
        <div class="flex justify-between items-center mb-3">
          <span class="text-lg font-bold text-blue-800 modern-font">
            Maendeleo
          </span>
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
            {{ course.progress }}%
          </div>
        </div>
        
        <!-- Clean Progress Bar -->
        <div class="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
          <div 
            class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-700 ease-out relative" 
            :style="{ width: `${course.progress}%` }"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
          </div>
        </div>
      </div>

      <!-- Course Details -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <!-- Difficulty Badge -->
        <div class="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl border border-blue-300 text-center hover:from-blue-200 hover:to-blue-300 transition-colors">
          <div class="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div class="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <div class="text-sm font-bold text-blue-800 modern-font">
            {{ course.difficulty || 'Rahisi' }}
          </div>
        </div>

        <!-- Rating Badge -->
        <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 rounded-xl border border-yellow-300 text-center hover:from-yellow-200 hover:to-yellow-300 transition-colors">
          <div class="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div class="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div class="text-sm font-bold text-yellow-800 modern-font">
            {{ course.rating || '5' }} Nyota
          </div>
        </div>

        <!-- Category Badge -->
        <div class="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl border border-green-300 text-center hover:from-green-200 hover:to-green-300 transition-colors">
          <div class="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div class="w-4 h-4 bg-white rounded-triangle"></div>
          </div>
          <div class="text-sm font-bold text-green-800 modern-font">
            {{ course.category || 'Hesabu' }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button 
          v-if="course.progress === 0"
          @click="$emit('start-course')"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-lg modern-font"
        >
          Anza Somo
        </button>
        
        <button 
          v-else-if="course.progress < 100"
          @click="$emit('continue-course')"
          class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-lg modern-font"
        >
          Endelea ({{ course.progress }}%)
        </button>
        
        <button 
          v-else
          @click="$emit('review-course')"
          class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-lg modern-font"
        >
          Cheza Tena - Umeshinda!
        </button>
        
        <button 
          @click="$emit('view-details')"
          class="w-full bg-white border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700 py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-bold modern-font"
        >
          Angalia Zaidi
        </button>
      </div>

      <!-- Encouragement Footer -->
      <div class="mt-6 text-center bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-xl border border-blue-200">
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
          <div class="w-4 h-4 bg-white rounded-full"></div>
        </div>
        <span class="text-base font-bold text-blue-800 modern-font">
          {{ getEncouragementMessage() }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { StarIcon } from '@heroicons/vue/20/solid'

export default {
  name: 'ModernCourseCard',
  components: {
    StarIcon
  },
  props: {
    course: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        title: 'Somo la Kujifunza',
        thumbnail: '',
        progress: 0,
        lastAccessed: '',
        difficulty: 'Rahisi',
        rating: 5,
        category: 'Hesabu'
      }),
      validator: (course) => {
        return course.progress >= 0 && course.progress <= 100
      }
    }
  },
  emits: ['start-course', 'continue-course', 'review-course', 'view-details'],
  methods: {
    getEncouragementMessage() {
      const messages = [
        'Wewe ni Shujaa wa Kujifunza!',
        'Kujifunza ni Furaha Kubwa!',
        'Umefanya Vizuri Sana!',
        'Endelea Hivyo, Bingwa!',
        'Wewe ni Mvumbuzi Mkuu!',
        'Kazi Nzuri Sana!',
        'Umefanya Vizuri Mno!'
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    }
  }
}
</script>

<style scoped>
/* Import clean, readable fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

.modern-font {
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.modern-course-card {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom geometric shapes */
.rounded-triangle {
  clip-path: polygon(50% 20%, 20% 80%, 80% 80%);
}

/* Enhanced hover effects */
.modern-course-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Button hover effects */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}

/* Progress bar animation */
.modern-course-card .bg-gradient-to-r.from-blue-500.to-blue-600 {
  position: relative;
  overflow: hidden;
}

.modern-course-card .bg-gradient-to-r.from-blue-500.to-blue-600::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

/* Subtle pulse animation for decorative elements */
@keyframes gentle-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.animate-pulse {
  animation: gentle-pulse 3s infinite;
}

/* Badge hover effects */
.grid > div {
  transition: all 0.3s ease;
}

.grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
}

/* Focus states for accessibility */
button:focus {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modern-font {
    font-size: 0.95em;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
  
  .text-xl {
    font-size: 1.125rem;
  }
  
  .text-lg {
    font-size: 1rem;
  }
}

/* Card entrance animation */
.modern-course-card {
  animation: card-entrance 0.6s ease-out;
}

@keyframes card-entrance {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Smooth gradient transitions */
.bg-gradient-to-r, .bg-gradient-to-br {
  background-size: 200% 200%;
  transition: background-position 0.3s ease;
}

.bg-gradient-to-r:hover, .bg-gradient-to-br:hover {
  background-position: right center;
}

/* Enhanced shadow system */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.hover\:shadow-2xl:hover {
  box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.05);
}
</style>