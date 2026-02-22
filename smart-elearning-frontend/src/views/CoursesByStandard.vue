<template>
    <div class="courses-view">
      <MainNav />
      <div class="container mx-auto px-4 py-8 max-w-7xl mt-20">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">
            {{ gradeLabel }} {{ currentStandard }} Courses
          </h1>
          <div class="flex space-x-4">
            <button 
              v-for="difficulty in ['All', 'Beginner', 'Intermediate', 'Advanced']"
              @click="filterDifficulty = difficulty"
              class="px-4 py-2 rounded-full"
              :class="{
                'bg-blue-600 text-white': filterDifficulty === difficulty,
                'bg-gray-200': filterDifficulty !== difficulty
              }"
            >
              {{ difficulty }}
            </button>
          </div>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard 
            v-for="course in filteredCourses"
            :key="course.id"
            :course="course"
            @enroll="handleEnroll"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import MainNav from '@/components/navigation/MainNav.vue'
  import CourseCard from '@/components/courses/CourseCard.vue'
  
  export default {
    components: { MainNav, CourseCard },
    setup() {
      const route = useRoute()
      const filterDifficulty = ref('All')
      
      const currentStandard = computed(() => {
        return route.params.standard.replace(/-/g, ' ')
      })
      
      const gradeLabel = computed(() => {
        return `Grade ${route.params.grade.toUpperCase()}`
      })
      
      const filteredCourses = computed(() => {
        // Sample data - replace with API call
        const allCourses = [
          {
            id: 1,
            title: 'Counting Basics',
            description: 'Learn numbers 1-20 with interactive exercises',
            standard: 'counting',
            grade: 'k',
            difficulty: 'Beginner',
            rating: 4.5,
            duration: '5 min',
            instructor: 'Ms. Johnson',
            thumbnail: '/images/counting-thumb.jpg'
          },
          // Add 7 more sample courses
        ]
        
        return allCourses.filter(course => 
          course.standard === route.params.standard.toLowerCase() &&
          course.grade === route.params.grade &&
          (filterDifficulty.value === 'All' || course.difficulty === filterDifficulty.value)
        )
      })
      
      const handleEnroll = (courseId) => {
        // Enrollment logic
      }
      
      return { currentStandard, gradeLabel, filteredCourses, filterDifficulty, handleEnroll }
    }
  }
  </script>