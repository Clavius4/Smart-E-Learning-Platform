<template>
  <div 
    class="modern-course-card bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border max-w-lg mx-auto"
    :class="[
      `style-${userStore.profile.learningStyle}`,
      getDifficultyBorderColor(course.level),
      course.isLocked ? 'grayscale opacity-90 cursor-not-allowed' : 'hover:shadow-xl transform hover:scale-102 hover:translate-y-[-4px]'
    ]"
  >
    <div class="relative">
      <img 
        :src="course.thumbnail" 
        :alt="course.courseName"
        class="w-full h-56 object-cover"
      >
      
      <!-- Overlay for Locked Courses -->
      <div v-if="course.isLocked" class="absolute inset-0 bg-gray-900/50 flex flex-col items-center justify-center z-20">
        <span class="text-6xl mb-2">🔒</span>
        <span class="text-white font-bold text-xl px-4 py-2 bg-black/40 rounded-lg backdrop-blur-sm">Locked</span>
      </div>

      <!-- Subtle decorative elements -->
      <div class="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent"></div>
      
      <!-- Difficulty Badge -->
      <div 
        class="absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border z-10"
        :class="course.isLocked ? 'bg-gray-200 text-gray-600 border-gray-300' : getDifficultyColors(course.level)"
      >
        <span class="mr-1">{{ getDifficultyIcon(course.level) }}</span>
        {{ getDifficultyText(course.level) }}
      </div>
    </div>
    
    <div class="p-6 bg-gradient-to-br from-white to-blue-50/30">
      <!-- Course Title -->
      <div class="mb-4">
        <h3 class="font-bold text-2xl mb-2 text-gray-800 leading-tight line-clamp-2">
          {{ course.courseName }}
        </h3>
        <p class="text-lg font-medium text-blue-600">
          {{ getSwahiliTitle() }}
        </p>
      </div>
      
      <!-- Description -->
      <div class="mb-6">
        <p class="text-gray-600 text-base mb-2 line-clamp-2 leading-relaxed">
          {{ course.courseDescription }}
        </p>
        <p class="text-blue-500 text-sm font-medium">
          {{ getSwahiliDescription() }}
        </p>
      </div>
      
      <!-- Interest Tags -->
      <div class="tags flex flex-wrap gap-2 mb-6">
        <span 
          v-for="(tag, index) in matchingTags" 
          :key="tag"
          class="px-3 py-1 text-sm font-medium rounded-full border transition-transform hover:scale-105"
          :class="getTagColors(index)"
        >
          {{ getTagIcon(tag) }} {{ tag }}
          <span class="text-xs opacity-75 ml-1">({{ getSwahiliTag(tag) }})</span>
        </span>
      </div>
      
      <!-- Enrollment/Progress Status Badge -->
      <div v-if="course.isEnrolled && !course.isCompleted" class="mb-4">
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center">
          <span class="text-sm font-semibold text-green-800">✓ In Progress</span>
        </div>
      </div>

       <div v-if="course.isCompleted" class="mb-4">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-center">
          <span class="text-sm font-semibold text-blue-800">🎉 Completed</span>
        </div>
      </div>
      
      <!-- Action Button -->
      <div class="mb-4">
        <button 
          @click="handleClick"
          :disabled="loading || course.isLocked"
          class="w-full py-3 px-6 rounded-xl text-base font-semibold transition-all duration-200 border relative overflow-hidden"
          :class="{
            'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed': course.isLocked,
            'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105': !course.isLocked && !course.isEnrolled,
            'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border-green-600 shadow-lg hover:shadow-xl transform hover:scale-105': course.isEnrolled && !course.isCompleted,
             'bg-blue-600 text-white border-blue-600': course.isCompleted,
            'opacity-50': loading
          }"
        >
          <span v-if="loading" class="inline-block mr-2">⟳</span>
          <div class="flex flex-col items-center">
            <span>{{ getButtonText() }}</span>
            <span v-if="!course.isLocked" class="text-sm opacity-90">({{ getSwahiliButtonText() }})</span>
          </div>
        </button>
      </div>
      
      <!-- Encouragement Message -->
      <div class="text-center" v-if="!course.isLocked">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <span class="text-sm font-medium text-blue-800 block">{{ getEncouragementMessage() }}</span>
          <span class="text-xs text-blue-600">({{ getSwahiliEncouragement() }})</span>
        </div>
      </div>

      <div class="text-center" v-else>
         <div class="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <span class="text-sm font-medium text-gray-500 block">Complete previous course to unlock</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'
import { useCourseStore } from '@/stores/courseStore'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  course: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['enroll'])
const userStore = useUserStore()
const courseStore = useCourseStore()

const matchingTags = computed(() => {
  return props.course.tag?.filter(tag => 
    userStore.profile.interests?.includes(tag)
  ) || []
})

const handleClick = () => {
  if (props.course.isLocked) {
    console.log('Interaction blocked: Course is locked');
    return;
  }

  try {
    emit('enroll', props.course._id);
  } catch (error) {
    console.error('Enrollment click error:', error);
  }
}

// Professional helper functions
const getDifficultyColors = (level) => {
  const colors = {
    'Beginner': 'bg-green-100/80 text-green-700 border-green-200',
    'Intermediate': 'bg-amber-100/80 text-amber-700 border-amber-200',
    'Advanced': 'bg-red-100/80 text-red-700 border-red-200'
  }
  return colors[level] || 'bg-blue-100/80 text-blue-700 border-blue-200'
}

const getDifficultyBorderColor = (level) => {
  const colors = {
    'Beginner': 'border-l-4 border-l-green-400',
    'Intermediate': 'border-l-4 border-l-amber-400',
    'Advanced': 'border-l-4 border-l-red-400'
  }
  return colors[level] || 'border-l-4 border-l-blue-400'
}

const getDifficultyIcon = (level) => {
  const icons = {
    'Beginner': '●',
    'Intermediate': '●●',
    'Advanced': '●●●'
  }
  return icons[level] || '●'
}

const getDifficultyText = (level) => {
  const texts = {
    'Beginner': 'Beginner',
    'Intermediate': 'Intermediate',
    'Advanced': 'Advanced'
  }
  return texts[level] || 'Standard'
}

const getTagColors = (index) => {
  const colorCombos = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-slate-100 text-slate-700 border-slate-200',
    'bg-sky-100 text-sky-700 border-sky-200'
  ]
  return colorCombos[index % colorCombos.length]
}

const getTagIcon = (tag) => {
  const iconMap = {
    'Math': '∑',
    'Science': '⚗',
    'Reading': '📖',
    'Art': '🎨',
    'Music': '♪',
    'Games': '▶',
    'Animals': '🐾',
    'Space': '○',
    'Colors': '◐',
    'Numbers': '#'
  }
  return iconMap[tag] || '●'
}

const getSwahiliTag = (tag) => {
  const swahiliMap = {
    'Math': 'Hesabu',
    'Science': 'Sayansi',
    'Reading': 'Kusoma',
    'Art': 'Sanaa',
    'Music': 'Muziki',
    'Games': 'Mchezo',
    'Animals': 'Wanyamapori',
    'Space': 'Anga',
    'Colors': 'Rangi',
    'Numbers': 'Nambari'
  }
  return swahiliMap[tag] || 'Mada'
}

const getSwahiliTitle = () => {
  return 'Kozi ya Kujifunza'
}

const getSwahiliDescription = () => {
  return 'Utajifunza mambo mazuri sana'
}

const getButtonText = () => {
  if (props.loading) return 'Loading...'
  if (props.course.isLocked) return 'LOCKED'
  if (props.course.isCompleted) return 'Review Course'
  if (props.course.isEnrolled) return 'Continue Learning'
  return 'Enroll Now'
}

const getSwahiliButtonText = () => {
  if (props.loading) return 'Inaandaa...'
  if (props.course.isLocked) return 'Imefungwa'
  if (props.course.isCompleted) return 'Pitia Tena'
  if (props.course.isEnrolled) return 'Endelea Kujifunza'
  return 'Jiunga Sasa'
}

const getEncouragementMessage = () => {
  const messages = [
    'Kujifunza ni safari ya ajabu',
    'Utapenda hii sana',
    'Tayari kufurahia?',
    'Wewe ni nyota ya kujifunza',
    'Wakati wa kugundua',
    'Twende tuchunguze pamoja'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

const getSwahiliEncouragement = () => {
  const messages = [
    'Learning is an adventure',
    'You will love this',
    'Ready to enjoy?',
    'You are a learning star',
    'Discovery time',
    'Let us explore together'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

.modern-course-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  min-height: 500px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.modern-font {
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.modern-course-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Learning style variations */
.style-visual {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
}

.style-auditory {
  border-left: 4px solid #6366f1;
  background: linear-gradient(135deg, #ffffff 0%, #eef2ff 100%);
}

.style-kinesthetic {
  border-left: 4px solid #0ea5e9;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

/* Enhanced button hover effects */
button:not(:disabled):hover {
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  transform: scale(1.02) translateY(-1px);
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Card entrance animation */
@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modern-course-card {
  animation: fadeInUp 0.4s ease-out;
}

/* Hover state for tags */
.tags span:hover {
  background-color: rgb(59 130 246 / 0.1);
  border-color: rgb(59 130 246 / 0.3);
}

/* Professional loading animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

button [class*="inline-block"] {
  animation: spin 1s linear infinite;
}

/* Subtle shadow variations */
.modern-course-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.modern-course-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Text hierarchy improvements */
h3 {
  letter-spacing: -0.025em;
  line-height: 1.25;
}

p {
  line-height: 1.5;
}

/* Modern spacing and typography */
.modern-course-card {
  letter-spacing: -0.01em;
}
</style>