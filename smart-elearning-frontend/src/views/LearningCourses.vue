<template>
  <div class="standards-view">
    <MainNav />
    
    <div class="container mx-auto px-4 py-8 max-w-6xl mt-20">
      <h1 class="text-3xl font-bold mb-6 text-center">
        COMMON CORE STANDARDS & NEXT GENERATION SCIENCE STANDARDS
      </h1>
      
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Left Sidebar - Grade Selection -->
        <div class="w-full md:w-1/4">
          <div class="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 class="text-xl font-bold mb-4">SORT BY:</h2>
            <div class="space-y-3">
              <button 
                v-for="tab in tabs" 
                :key="tab" 
                @click="activeTab = tab"
                :class="{
                  'bg-blue-600 text-white': activeTab === tab,
                  'bg-gray-100 hover:bg-gray-200': activeTab !== tab
                }"
                class="w-full py-2 px-4 rounded-lg text-left transition-colors"
              >
                {{ tab }}
              </button>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-md p-4">
            <h2 class="text-xl font-bold mb-4">GRADES</h2>
            <div class="space-y-2">
              <button 
                v-for="grade in grades" 
                :key="grade.value" 
                @click="selectedGrade = grade.value"
                :class="{
                  'bg-blue-600 text-white': selectedGrade === grade.value,
                  'bg-gray-100 hover:bg-gray-200': selectedGrade !== grade.value
                }"
                class="w-full py-2 px-4 rounded-lg text-left transition-colors flex justify-between items-center"
              >
                <span>{{ grade.label }}</span>
                <span v-if="grade.completed" class="text-green-500">✅</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Main Content - Standards Display -->
        <div class="w-full md:w-3/4">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="relative mb-6">
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Search Standards" 
                class="w-full pl-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <svg class="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <h2 class="text-2xl font-bold mb-6">GRADE {{ selectedGrade.toUpperCase() }}</h2>
            
            <!-- English Language Arts Section -->
            <div v-if="activeTab === 'STANDARDS' || activeTab === 'PRINTABLES'" class="mb-8">
              <h3 class="text-xl font-bold mb-4 border-b pb-2">ENGLISH LANGUAGE ARTS</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="standard in filteredStandards.ela" 
                  :key="standard" 
                  class="standard-card"
                  @click="navigateToCourses(standard, 'ela')"
                >
                  {{ standard }}
                </div>
              </div>
            </div>
            
            <!-- Mathematics Section -->
            <div v-if="activeTab === 'STANDARDS' || activeTab === 'PRINTABLES'" class="mb-8">
              <h3 class="text-xl font-bold mb-4 border-b pb-2">MATHEMATICS</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="standard in filteredStandards.math" 
                  :key="standard" 
                  class="standard-card"
                  @click="navigateToCourses(standard, 'math')"
                >
                  {{ standard }}
                </div>
              </div>
            </div>
            
            <!-- Science Standards Section -->
            <div v-if="activeTab === 'STANDARDS' || activeTab === 'PRINTABLES'" class="mb-8">
              <h3 class="text-xl font-bold mb-4 border-b pb-2">NEXT GENERATION SCIENCE STANDARDS</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="standard in filteredStandards.science" 
                  :key="standard" 
                  class="standard-card"
                  @click="navigateToCourses(standard, 'science')"
                >
                  {{ standard }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import { useCourseStore } from '@/stores/courseStore'

const router = useRouter()
const courseStore = useCourseStore()

const tabs = ref(['STANDARDS', 'GAMES', 'PRINTABLES'])
const activeTab = ref('STANDARDS')
const selectedGrade = ref('k')
const searchQuery = ref('')

const grades = ref([
  { value: 'k', label: 'GRADE K', completed: true },
  { value: '1', label: 'GRADE 1', completed: true },
  { value: '2', label: 'GRADE 2', completed: true },
  { value: '3', label: 'GRADE 3', completed: true },
  { value: '4', label: 'GRADE 4', completed: true },
  { value: '5', label: 'GRADE 5', completed: true },
  { value: '6', label: 'GRADE 6', completed: false }
])

const standards = ref({
  k: {
    ela: [
      'Language',
      'Reading: Foundational Skills',
      'Reading: Informational Text',
      'Reading: Literature',
      'Speaking & Listening',
      'Writing'
    ],
    math: [
      'Counting & Cardinality',
      'Operations & Algebraic Thinking',
      'Number & Operations in Base Ten',
      'Measurement & Data',
      'Geometry'
    ],
    science: [
      'Physical Sciences',
      'Life Sciences',
      'Earth and Space Sciences',
      'Engineering Design'
    ]
  },
  1: {
    ela: [
      'Language',
      'Reading: Foundational Skills',
      'Reading: Informational Text',
      'Reading: Literature',
      'Speaking & Listening',
      'Writing'
    ],
    math: [
      'Operations & Algebraic Thinking',
      'Number & Operations in Base Ten',
      'Measurement & Data',
      'Geometry',
      'Math Practice'
    ],
    science: [
      'Waves: Light and Sound',
      'Structure, Function, and Information Processing',
      'Space Systems: Patterns and Cycles'
    ]
  }
})

const filteredStandards = computed(() => {
  const gradeStandards = standards.value[selectedGrade.value] || {}
  const filtered = {
    ela: [],
    math: [],
    science: []
  }
  
  if (!searchQuery.value) {
    return gradeStandards
  }
  
  const query = searchQuery.value.toLowerCase()
  
  for (const category in gradeStandards) {
    filtered[category] = gradeStandards[category].filter(standard => 
      standard.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const navigateToCourses = (standard, subject) => {
  const standardSlug = standard.toLowerCase().replace(/[ :]/g, '-')
  router.push({
    name: 'courses-view',
    params: { 
      grade: selectedGrade.value,
      standard: standardSlug,
      subject: subject
    }
  })
}

// Fetch all courses on mount
onMounted(async () => {
  await courseStore.fetchAllCourses()
})
</script>

<style scoped>
.standards-view {
  min-height: 100vh;
  background-color: #f8fafc;
}

.standard-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  cursor: pointer;
}

.standard-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transform: translateY(-2px);
  background-color: #f0f7ff;
}
</style>