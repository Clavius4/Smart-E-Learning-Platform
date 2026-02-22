<template>
  <div class="dashboard min-h-screen bg-gray-50">
    <MainNav />
    <div class="container mx-auto px-4 py-8 max-w-7xl mt-20 flex">
      <!-- Sidebar Navigation -->
      <div class="w-64 mr-8 hidden lg:block">
        <div class="bg-white rounded-lg shadow-md p-4 sticky top-28">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Learning Dashboard</h3>
          <nav class="space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center"
              :class="{
                'bg-blue-50 text-blue-600': activeTab === tab.id,
                'text-gray-700 hover:bg-gray-100': activeTab !== tab.id
              }"
            >
              <component :is="tab.icon" class="w-5 h-5 mr-3" />
              {{ tab.label }}
              <span v-if="tab.count" class="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Mobile Tabs -->
      <div class="lg:hidden mb-6 w-full">
        <select 
          v-model="activeTab"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
            {{ tab.label }}
          </option>
        </select>
      </div>

      <!-- Main Content -->
      <div class="flex-1">
        <!-- Enrolled Courses Tab -->
        <div v-if="activeTab === 'enrolled'" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Your Courses</h2>
            <div class="relative">
              <select 
                v-model="courseFilter"
                class="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Courses</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="new">New</option>
              </select>
              <ChevronDownIcon class="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div v-if="filteredCourses.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCourseCard 
              v-for="course in filteredCourses"
              :key="course.id"
              :course="course"
              @continue-course="continueCourse(course.id)"
              @review-course="reviewCourse(course.id)"
            />
          </div>
          <div v-else class="text-center py-12">
            <AcademicCapIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
            <p class="mt-1 text-gray-500">You haven't enrolled in any courses yet.</p>
            <button 
              @click="$router.push('/learning-courses')"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Courses
            </button>
          </div>
        </div>

        <!-- Progress Tab -->
        <div v-if="activeTab === 'progress'" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold mb-6">Your Learning Progress</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="stats-card">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Completion Rate</h3>
              <CircularProgress :percentage="completionRate" size="lg" />
              <p class="mt-3 text-sm text-gray-500">
                {{ completedCoursesCount }} of {{ enrolledCourses.length }} courses completed
              </p>
            </div>
            <div class="stats-card">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Time Spent</h3>
              <div class="text-3xl font-bold text-blue-600">12h 45m</div>
              <p class="mt-1 text-sm text-gray-500">This week</p>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div class="space-y-4">
              <div 
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-start p-3 border-b border-gray-100"
              >
                <div class="flex-shrink-0 mt-1">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <component :is="activity.icon" class="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                  <p class="text-sm text-gray-500">{{ activity.description }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievements Tab -->
        <div v-if="activeTab === 'achievements'" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold mb-6">Your Achievements</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div 
              v-for="badge in achievements"
              :key="badge.id"
              class="text-center p-4"
            >
              <div class="mx-auto h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                <TrophyIcon class="h-8 w-8 text-yellow-600" />
              </div>
              <h3 class="text-sm font-medium text-gray-900">{{ badge.title }}</h3>
              <p class="text-xs text-gray-500">{{ badge.date }}</p>
            </div>
          </div>
        </div>

        <!-- Certificates Tab -->
        <div v-if="activeTab === 'certificates'" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold mb-6">Your Certificates</h2>
          <div v-if="certificates.length > 0" class="grid grid-cols-1 gap-6">
            <div 
              v-for="cert in certificates"
              :key="cert.id"
              class="border border-gray-200 rounded-lg p-4 flex items-center"
            >
              <div class="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">{{ cert.course }}</h3>
                <p class="text-sm text-gray-500">Completed on {{ cert.date }}</p>
              </div>
              <button 
                @click="downloadCertificate(cert.id)"
                class="ml-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Download
              </button>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-lg font-medium text-gray-900">No certificates yet</h3>
            <p class="mt-1 text-gray-500">Complete courses to earn certificates.</p>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold mb-6">Account Settings</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              <div class="space-y-2">
                <div v-for="pref in notificationPrefs" :key="pref.id" class="flex items-start">
                  <div class="flex items-center h-5">
                    <input 
                      :id="pref.id" 
                      :name="pref.id" 
                      type="checkbox" 
                      v-model="pref.enabled"
                      class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    >
                  </div>
                  <div class="ml-3 text-sm">
                    <label :for="pref.id" class="font-medium text-gray-700">{{ pref.label }}</label>
                    <p class="text-gray-500">{{ pref.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-200">
              <button 
                type="submit" 
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  AcademicCapIcon,
  BookmarkIcon,
  ChartBarIcon,
  TrophyIcon,
  DocumentTextIcon,
  CogIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import MainNav from '@/components/navigation/MainNav.vue'
import DashboardCourseCard from '@/components/navigation/DashboardCourseCard.vue'
import CircularProgress from '@/components/common/AppLoader.vue'

const router = useRouter()

// Tabs configuration
const tabs = ref([
  { id: 'enrolled', label: 'My Courses', icon: BookmarkIcon, count: 5 },
  { id: 'progress', label: 'Progress', icon: ChartBarIcon },
  // { id: 'achievements', label: 'Achievements', icon: TrophyIcon, count: 3 },
  // { id: 'certificates', label: 'Certificates', icon: DocumentTextIcon, count: 2 },
  { id: 'settings', label: 'Settings', icon: CogIcon }
])

const activeTab = ref('enrolled')
const courseFilter = ref('all')

// Sample data - replace with API calls
const enrolledCourses = ref([
  {
    id: 'ela-k-language-1',
    title: 'Basic Phonics',
    thumbnail: '/images/phonics.jpg',
    progress: 65,
    lastAccessed: '2 days ago',
    difficulty: 'Beginner',
    category: 'ELA'
  },
  {
    id: 'math-1-counting-1',
    title: 'Counting to 100',
    thumbnail: '/images/counting.jpg',
    progress: 100,
    lastAccessed: '1 week ago',
    difficulty: 'Beginner',
    category: 'Math'
  },
  {
    id: 'ela-1-reading-1',
    title: 'Sight Words',
    thumbnail: '/images/sight-words.jpg',
    progress: 30,
    lastAccessed: 'Yesterday',
    difficulty: 'Intermediate',
    category: 'ELA'
  },
  {
    id: 'math-k-shapes-1',
    title: 'Basic Shapes',
    thumbnail: '/images/shapes.jpg',
    progress: 0,
    lastAccessed: '',
    difficulty: 'Beginner',
    category: 'Math'
  },
  {
    id: 'science-1-animals-1',
    title: 'Animal Habitats',
    thumbnail: '/images/animals.jpg',
    progress: 85,
    lastAccessed: 'Today',
    difficulty: 'Intermediate',
    category: 'Science'
  }
])

const recentActivities = ref([
  {
    id: 1,
    title: 'Completed lesson',
    description: 'Letter Sounds N-Z in Basic Phonics',
    time: '2 hours ago',
    icon: AcademicCapIcon
  },
  {
    id: 2,
    title: 'Started new course',
    description: 'Animal Habitats',
    time: '1 day ago',
    icon: BookmarkIcon
  },
  {
    id: 3,
    title: 'Earned badge',
    description: 'Fast Learner - Completed 5 lessons in one day',
    time: '3 days ago',
    icon: TrophyIcon
  }
])

const achievements = ref([
  { id: 1, title: 'Fast Learner', date: 'Jun 12, 2023' },
  { id: 2, title: 'Perfect Score', date: 'May 28, 2023' },
  { id: 3, title: 'Course Master', date: 'Apr 15, 2023' }
])

const certificates = ref([
  { id: 1, course: 'Counting to 100', date: 'June 5, 2023' },
  { id: 2, course: 'Basic Shapes', date: 'May 20, 2023' }
])

const notificationPrefs = ref([
  {
    id: 'course-updates',
    label: 'Course updates',
    description: 'Get notified when new lessons are added',
    enabled: true
  },
  {
    id: 'progress-reports',
    label: 'Progress reports',
    description: 'Weekly summaries of your learning progress',
    enabled: true
  },
  {
    id: 'promotional',
    label: 'Promotional offers',
    description: 'Receive special offers and discounts',
    enabled: false
  }
])

// Computed properties
const filteredCourses = computed(() => {
  if (courseFilter.value === 'all') return enrolledCourses.value
  if (courseFilter.value === 'in-progress') {
    return enrolledCourses.value.filter(c => c.progress > 0 && c.progress < 100)
  }
  if (courseFilter.value === 'completed') {
    return enrolledCourses.value.filter(c => c.progress === 100)
  }
  if (courseFilter.value === 'new') {
    return enrolledCourses.value.filter(c => c.progress === 0)
  }
  return enrolledCourses.value
})

const completedCoursesCount = computed(() => {
  return enrolledCourses.value.filter(c => c.progress === 100).length
})

const completionRate = computed(() => {
  if (enrolledCourses.value.length === 0) return 0
  const completed = enrolledCourses.value.filter(c => c.progress === 100).length
  return Math.round((completed / enrolledCourses.value.length) * 100)
})

// Methods
const continueCourse = (courseId) => {
  router.push({ name: 'course-player', params: { id: courseId } })
}

const reviewCourse = (courseId) => {
  router.push({ name: 'course-player', params: { id: courseId } })
}

const downloadCertificate = (certId) => {
  // In a real app, this would trigger a download
  alert(`Downloading certificate ${certId}`)
}
</script>

<style scoped>
.stats-card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-100;
}

.dashboard {
  background-color: #f8fafc;
}
</style>