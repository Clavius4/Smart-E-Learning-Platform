<!-- <script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import { useCourseStore } from '@/stores/courseStore'
import { useAuthStore } from '@/stores/auth'

const realTimeCompletedVideos = ref(new Set())


const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const authStore = useAuthStore()

// State
const loading = ref(true)
const error = ref(null)
const course = ref({
  courseName: '',
  courseContent: [],
  quizzes: []
})
const currentSectionIndex = ref(0)
const currentLessonIndex = ref(0)
const videoProgress = ref(0)
const isVideoCompleted = ref(false)
const retryCount = ref(0)
const maxRetries = 3
const lessonStartTime = ref(null)
const lessonWatchedSeconds = ref(0)





const handleVideoPlay = () => {
  lessonStartTime.value = Date.now()
}


const handleVideoPause = () => {
  if (lessonStartTime.value) {
    lessonWatchedSeconds.value += Math.floor((Date.now() - lessonStartTime.value) / 1000)
    lessonStartTime.value = null
  }
}

const handleVideoEnded = () => {
  handleVideoPause() // ensure final duration is added
  markLessonCompleted(lessonWatchedSeconds.value)
}

// Computed properties
const currentSection = computed(() => {
  return course.value?.courseContent?.[currentSectionIndex.value] || { lessons: [] }
})

const currentLesson = computed(() => {
  return currentSection.value.lessons?.[currentLessonIndex.value] || {}
})

const hasQuizzes = computed(() => {
  return course.value.quizzes?.length > 0
})

// const isLessonCompleted = computed(() => {
//   return course.value.completedVideos?.some(
//     v => v.subsectionId === currentLesson.value._id
//   ) || false
// })
const isLessonCompleted = computed(() =>
  course.value.completedVideos?.some(v => v.subsectionId === currentLesson.value._id)
)

// 1. Count all videos across all lessons
const totalVideoCount = computed(() => {
  return course.value.courseContent?.reduce((count, section) => {
    const lessonVideos = section.lessons?.filter(lesson => lesson.videoUrl)?.length || 0
    return count + lessonVideos
  }, 0)
})

// 2. Count completed videos: includes both saved + temporary (real-time) completions
const completedVideoCount = computed(() => {
  const saved = course.value.completedVideos || []
  const temp = Array.from(realTimeCompletedVideos.value || [])

  return course.value.courseContent?.reduce((count, section) => {
    const completedInSection = section.lessons?.filter(lesson =>
      lesson.videoUrl && (saved.includes(lesson._id) || temp.includes(lesson._id))
    )?.length || 0
    return count + completedInSection
  }, 0)
})

// 3. Calculate percentage
const totalCourseProgress = computed(() => {
  if (totalVideoCount.value === 0) return 0
  return Math.round((completedVideoCount.value / totalVideoCount.value) * 100)
})


// Methods
const loadCourseData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const data = await courseStore.fetchCourseDetails(route.params.id)
    course.value = data
    
    // Set first available lesson
    if (course.value.courseContent?.length > 0) {
      const firstSectionWithLessons = course.value.courseContent.find(
        section => section.lessons?.length > 0
      )
      if (firstSectionWithLessons) {
        currentSectionIndex.value = course.value.courseContent.indexOf(firstSectionWithLessons)
        currentLessonIndex.value = 0
      }
    }
    
    retryCount.value = 0
  } catch (err) {
    error.value = err.message
    
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.warn(`Retrying... Attempt ${retryCount.value} of ${maxRetries}`)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.value))
      await loadCourseData()
      return
    }
    
    console.error('Final error after retries:', err)
    // Fallback to empty course data
    course.value = {
      courseName: 'Hitilafu katika Kupakia Kozi',
      courseContent: [],
      quizzes: []
    }
  } finally {
    loading.value = false
  }
}

const changeLesson = async (sectionIndex, lessonIndex) => {
  currentSectionIndex.value = sectionIndex
  currentLessonIndex.value = lessonIndex
  videoProgress.value = 0
  isVideoCompleted.value = false
}

const handleVideoProgress = (event) => {
  const video = event.target
  const progress = (video.currentTime / video.duration) * 100
  videoProgress.value = progress
  

}



const findNextUncompletedLesson = () => {
  for (const section of course.value.courseContent) {
    for (const lesson of section.lessons) {
      const alreadyDone = course.value.completedVideos.some(
        c => c.subsectionId === lesson._id
      )
      if (!alreadyDone) return lesson
    }
  }
  return null
}






const markLessonCompleted = async (timeSpent) => {
  try {
    if (!currentLesson.value._id || isVideoCompleted.value) return

    const result = await courseStore.updateCourseProgress(
      route.params.id,
      currentLesson.value._id,
      timeSpent
    )

    isVideoCompleted.value = true

    // ✅ update local progress from backend
    course.value.completedVideos = result.progress.completedVideos || []
    course.value.completionStatus = result.progress.completionStatus

    // ✅ auto-navigate
    if (result.next?.type === "video" || result.next?.type === "remedial") {
      if (result.next.id) goToNextLesson(result.next.id)
    } else if (result.next?.type === "quiz") {
      router.push(`/course/${route.params.id}/quiz`)
    }

  } catch (err) {
    console.error('Error marking lesson complete:', err)
  }
}




const goToNextLesson = (lessonId) => {
  if (!lessonId) return
  for (let sIndex = 0; sIndex < course.value.courseContent.length; sIndex++) {
    const lessons = course.value.courseContent[sIndex].lessons || []
    const lIndex = lessons.findIndex(l => l._id === lessonId)
    if (lIndex !== -1) {
      changeLesson(sIndex, lIndex)
      return
    }
  }
}


const startQuiz = () => {
  if (hasQuizzes.value) {
    router.push(`/course/${route.params.id}/quiz`)
  }
}

onMounted(() => {
  loadCourseData()
})
</script> -->
<script setup>

// Frontend - CoursePlayer.vue <script setup> section
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import { useCourseStore } from '@/stores/courseStore'
import { useAuthStore } from '@/stores/auth'

// 1. Import quiz store
import { useQuizStore } from '@/stores/quizStore'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const quizStore = useQuizStore() // Initialize quiz store

// State
const loading = ref(true)
const error = ref(null)
const course = ref({
  courseName: '',
  courseContent: [],
  quizzes: []
})
const currentSectionIndex = ref(0)
const currentLessonIndex = ref(0)
const videoProgress = ref(0)
const isVideoCompleted = ref(false)
const retryCount = ref(0)
const maxRetries = 3
const lessonStartTime = ref(null)
const lessonWatchedSeconds = ref(0)
const isProcessingCompletion = ref(false)
const isInRemedialMode = ref(false)
const isRedirectingToQuiz = ref(false)
const hasQuizExternal = ref(false) // New State for external quiz check

const handleVideoPlay = () => {
  lessonStartTime.value = Date.now()
}

const handleVideoPause = () => {
  if (lessonStartTime.value) {
    lessonWatchedSeconds.value += Math.floor((Date.now() - lessonStartTime.value) / 1000)
    lessonStartTime.value = null
  }
}

const handleVideoEnded = (event) => {
  handleVideoPause()
  // The video reached its end → it is genuinely watched. Report the real video
  // duration (not the fragile wall-clock count, which under-counts on autoplay/
  // buffering/tab-switch) so the backend reliably marks it complete and returns
  // the NEXT item instead of replaying this one.
  const watched = Math.ceil(event?.target?.duration || 0) || lessonWatchedSeconds.value
  markLessonCompleted(watched, true) // ended => definitively completed
}

// Computed properties
const currentSection = computed(() => {
  return course.value?.courseContent?.[currentSectionIndex.value] || { lessons: [] }
})

const currentLesson = computed(() => {
  return currentSection.value.lessons?.[currentLessonIndex.value] || {}
})

const getCompletedSubsectionId = (entry) => {
  const id = entry?.subsectionId?._id || entry?.subsectionId || entry?._id || entry
  return id ? String(id) : null
}

const completedVideoIds = computed(() => {
  return new Set(
    (course.value.completedVideos || [])
      .map(getCompletedSubsectionId)
      .filter(Boolean)
  )
})

const isLessonCompletedById = (lessonId) => {
  return completedVideoIds.value.has(String(lessonId))
}

const hasQuizzes = computed(() => {
  return (course.value.quizzes?.length > 0) || hasQuizExternal.value
})

const isLessonCompleted = computed(() => {
  return currentLesson.value._id ? isLessonCompletedById(currentLesson.value._id) : false
})

const totalVideoCount = computed(() => {
  return course.value.courseContent?.reduce((count, section) => {
    const lessonVideos = section.lessons?.filter(lesson => lesson.videoUrl)?.length || 0
    return count + lessonVideos
  }, 0)
})

const completedVideoCount = computed(() => {
  return course.value.courseContent?.reduce((count, section) => {
    const completedLessons = section.lessons?.filter(lesson =>
      lesson.videoUrl && isLessonCompletedById(lesson._id)
    )?.length || 0
    return count + completedLessons
  }, 0) || 0
})

const totalCourseProgress = computed(() => {
  if (totalVideoCount.value === 0) return 0
  return Math.round((completedVideoCount.value / totalVideoCount.value) * 100)
})

// Methods
const loadCourseData = async () => {
  try {
    loading.value = true
    error.value = null

    const data = await courseStore.fetchCourseDetails(route.params.id)
    course.value = data

    // Check for external quiz if not present in course details
    if (!course.value.quizzes?.length) {
      try {
        console.log('🔍 Checking for quiz via QuizStore...')
        const quizData = await quizStore.fetchQuizByCourseId(route.params.id)
        if (quizData && (quizData.questions?.length > 0 || quizData.quiz?.questions?.length > 0)) {
           console.log('✅ Found quiz externally via QuizStore')
           hasQuizExternal.value = true
        }
      } catch (quizErr) {
        console.warn('⚠️ No external quiz found:', quizErr.message)
      }
    }

    console.log('📚 Loaded course data:', {
      totalSections: data.courseContent?.length,
      hasRemedialContent: data.courseContent?.some(s => s.lessons?.some(l => l.isRemedial)),
      completedVideos: data.completedVideos?.length
    })

    // NEW: Check if we're in remedial mode
    isInRemedialMode.value = data.isInRemedialMode || false

    // Find the appropriate first lesson
    let firstLesson = null
    let sectionIndex = 0
    let lessonIndex = 0

    if (isInRemedialMode.value) {
      console.log('🔄 In remedial mode - looking for first uncompleted remedial lesson')
      // Find first uncompleted remedial lesson
      for (let sIndex = 0; sIndex < course.value.courseContent.length; sIndex++) {
        const section = course.value.courseContent[sIndex]
        for (let lIndex = 0; lIndex < section.lessons.length; lIndex++) {
          const lesson = section.lessons[lIndex]
          if (lesson.isRemedial && !data.completedVideos?.some(cv => cv.subsectionId === lesson._id)) {
            firstLesson = lesson
            sectionIndex = sIndex
            lessonIndex = lIndex
            break
          }
        }
        if (firstLesson) break
      }
    }

    // If no remedial lesson found or not in remedial mode, find first unfinished normal lesson
    if (!firstLesson) {
      console.log('📖 Looking for first unfinished normal lesson')
      const completedIds = new Set((data.completedVideos || []).map(getCompletedSubsectionId).filter(Boolean))
      for (let sIndex = 0; sIndex < course.value.courseContent.length; sIndex++) {
        const section = course.value.courseContent[sIndex]
        for (let lIndex = 0; lIndex < section.lessons.length; lIndex++) {
          const lesson = section.lessons[lIndex]
          if (!lesson.isRemedial && !completedIds.has(String(lesson._id))) {
            firstLesson = lesson
            sectionIndex = sIndex
            lessonIndex = lIndex
            break
          }
        }
        if (firstLesson) break
      }
    }

    if (!firstLesson) {
      for (let sIndex = 0; sIndex < course.value.courseContent.length; sIndex++) {
        const section = course.value.courseContent[sIndex]
        for (let lIndex = 0; lIndex < section.lessons.length; lIndex++) {
          const lesson = section.lessons[lIndex]
          if (!lesson.isRemedial) {
            firstLesson = lesson
            sectionIndex = sIndex
            lessonIndex = lIndex
            break
          }
        }
        if (firstLesson) break
      }
    }

    if (firstLesson) {
      console.log(`🎯 Starting with lesson: ${firstLesson.title} (Section ${sectionIndex}, Lesson ${lessonIndex})`)
      currentSectionIndex.value = sectionIndex
      currentLessonIndex.value = lessonIndex
    } else {
      console.log('⚠️ No suitable first lesson found')
    }

  } catch (err) {
    error.value = err.message
    console.error('Error loading course:', err)
  } finally {
    loading.value = false
  }
}

const changeLesson = async (sectionIndex, lessonIndex) => {
  console.log(`🎯 Changing to lesson: Section ${sectionIndex}, Lesson ${lessonIndex}`)

  // Prevent skipping unless lesson is completed
  if (!isVideoCompleted.value && !isLessonCompleted.value) {
    alert("⏳ Tafadhali maliza somo hili kabla ya kuendelea!");
    return;
  }
  
  currentSectionIndex.value = sectionIndex
  currentLessonIndex.value = lessonIndex
  videoProgress.value = 0
  isVideoCompleted.value = false
  lessonWatchedSeconds.value = 0
  isProcessingCompletion.value = false
  
  // Reset video player
  await nextTick()
  const video = document.querySelector('.video-player')
  if (video) {
    video.currentTime = 0
    video.load()
    video.play()
  }
}

const handleVideoProgress = (event) => {
  const video = event.target
  const progress = (video.currentTime / video.duration) * 100
  videoProgress.value = progress
  
  if (progress > 99.5 && !isVideoCompleted.value && !isProcessingCompletion.value && authStore.isAuthenticated) {
    handleVideoPause()
    // Reached the end of the clip => definitively completed.
    markLessonCompleted(Math.ceil(video.duration || 0) || lessonWatchedSeconds.value, true)
  }
}

const openQuiz = (quizId = null, subSectionId = null) => {
  const query = {}
  if (quizId) query.quizId = String(quizId)
  if (subSectionId) query.subSectionId = String(subSectionId)

  return router.push({
    name: 'QuizPage',
    params: { id: route.params.id },
    query
  })
}

const markLessonCompleted = async (timeSpent, completed = false) => {
  try {
    if (!currentLesson.value._id || isVideoCompleted.value || isProcessingCompletion.value) {
      console.log('⚠️ Skipping completion - already processing or completed')
      return
    }

    console.log(`🏁 Marking lesson completed: ${currentLesson.value._id} with ${timeSpent}s (completed=${completed})`)
    isProcessingCompletion.value = true
    isVideoCompleted.value = true

    const result = await courseStore.updateCourseProgress(
      route.params.id,
      currentLesson.value._id,
      timeSpent,
      completed
    )

    console.log('📊 Backend response:', result)

    // Update local course progress
    if (result.progress) {
      course.value.completedVideos = result.progress.completedVideos || []
      course.value.completionStatus = result.progress.completionStatus
      
      // NEW: Update remedial mode status
      isInRemedialMode.value = result.progress.needsRemedial || false
    }

    // Handle navigation based on backend response
    if (result.next) {
      const { type, id } = result.next

      if (type === "remedial" && id) {
        console.log(`🔄 Auto-navigating to remedial lesson: ${id}`)
        // Reload course data to get updated remedial content
        await loadCourseData()
        setTimeout(() => goToNextLesson(id), 1500)
      } else if (type === "video" && id) {
        if (String(id) === String(currentLesson.value._id)) {
          // Safety net: backend returned THIS video as "next" (e.g. stored
          // timeDuration doesn't match the real clip). Advance locally so the
          // player never gets stuck replaying the same lesson.
          console.warn('⚠️ Backend returned the current video as next — advancing locally to avoid a replay loop')
          advanceLocally()
        } else {
          console.log(`🎬 Auto-navigating to next video: ${id}`)
          setTimeout(() => goToNextLesson(id), 1500)
        }
      } else if (type === "quiz") {
        console.log('🎯 Redirecting to quiz...')
        isRedirectingToQuiz.value = true
        setTimeout(() => openQuiz(id, result.next.subSectionId || currentLesson.value._id), 2000)
      } else {
        console.log('✅ Course completed or no explicit next lesson from backend!')
      }
    } else {
      // Fallback: If backend doesn't provide next lesson, calculate it locally
      console.log('⚠️ No next lesson info from backend, trying local calculation...')
      advanceLocally()
    }

  } catch (err) {
    console.error('❌ Error marking lesson complete:', err)
    isVideoCompleted.value = false
  } finally {
    isProcessingCompletion.value = false
  }
}

// Advance to the next lesson by position (next lesson → next section → quiz).
// Used as a fallback and as the loop safety-net.
const advanceLocally = () => {
  let nextSection = currentSectionIndex.value
  let nextLesson = currentLessonIndex.value + 1

  if (course.value.courseContent?.[nextSection]?.lessons?.[nextLesson]) {
    console.log('👉 Local: next lesson in same section')
    setTimeout(() => changeLesson(nextSection, nextLesson), 1500)
    return
  }

  nextSection++
  nextLesson = 0
  if (course.value.courseContent?.[nextSection]?.lessons?.[nextLesson]) {
    console.log('👉 Local: first lesson of next section')
    setTimeout(() => changeLesson(nextSection, nextLesson), 1500)
  } else if (hasQuizzes.value) {
    console.log('🎯 Local: all videos done, going to quiz')
    isRedirectingToQuiz.value = true
    setTimeout(() => openQuiz(), 2000)
  } else {
    console.log('✅ Local: no further lessons or quiz — course complete')
  }
}

const goToNextLesson = (lessonId) => {
  if (!lessonId) return

  console.log(`🔍 Looking for lesson ID: ${lessonId}`)
  
  for (let sIndex = 0; sIndex < course.value.courseContent.length; sIndex++) {
    const lessons = course.value.courseContent[sIndex].lessons || []
    const lIndex = lessons.findIndex(l => l._id === lessonId)
    if (lIndex !== -1) {
      console.log(`✅ Found lesson at Section ${sIndex}, Lesson ${lIndex}`)
      changeLesson(sIndex, lIndex)
      return
    }
  }
  
  console.log('❌ Lesson not found in course content')
}

const startQuiz = () => {
  if (hasQuizzes.value) {
    openQuiz()
  }
}

const allVideosCompleted = computed(() => {
  const totalVideos = totalVideoCount.value
  const completed = completedVideoCount.value
  return totalVideos > 0 && completed >= totalVideos
})


onMounted(() => {
  loadCourseData()
})
</script>

<template>
  <div class="course-player">
    <MainNav />
    <div class="container">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="loading-card">
          <div class="loading-owl">
            <div class="owl-body">
              <div class="owl-eyes">
                <div class="eye left-eye"></div>
                <div class="eye right-eye"></div>
              </div>
              <div class="owl-beak"></div>
            </div>
            <div class="loading-books">
              <div class="book book1"></div>
              <div class="book book2"></div>
              <div class="book book3"></div>
            </div>
          </div>
          <div class="loading-content">
            <h3>🎒 Tunapakia Masomo Yako...</h3>
            <p>Subiri kidogo, tunatengeneza mazingira ya kufuraha!</p>
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <div class="error-card">
          <div class="error-character">
            <div class="sad-face">
              <div class="sad-eyes">
                <div class="eye sad-eye-left"></div>
                <div class="eye sad-eye-right"></div>
              </div>
              <div class="sad-mouth"></div>
            </div>
          </div>
          <div class="error-content">
            <h3>😥 Oops! Kuna Tatizo</h3>
            <p>{{ error }}</p>
            <button @click="loadCourseData" class="retry-btn">
              <span class="btn-icon">🔄</span>
              Jaribu Tena
              <div class="btn-sparkles">
                <div class="sparkle"></div>
                <div class="sparkle"></div>
                <div class="sparkle"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Course content -->
      <div v-else-if="course" class="course-layout">
        <!-- Main video area -->
        <div class="video-section">
          <!-- Video player card -->
          <div class="video-card">
            <div class="video-header">
              <div class="video-status">
                <div class="status-indicator" :class="{ 'active': currentLesson.videoUrl }">
                  <div class="pulse-ring"></div>
                </div>
                <span>{{ currentLesson.videoUrl ? '🎬 Video Ipo!' : '📱 Hakuna Video' }}</span>
              </div>
              <div class="fun-decoration">
                <div class="floating-star star1">⭐</div>
                <div class="floating-star star2">🌟</div>
                <div class="floating-star star3">✨</div>
              </div>
            </div>
            
            <div class="video-container">
             <video
    v-if="currentLesson.videoUrl"
  ref="videoPlayer"
  autoplay   
  playsinline
  controls
  class="video-player"
  @timeupdate="handleVideoProgress"
  @play="handleVideoPlay"
  @pause="handleVideoPause"
  @ended="handleVideoEnded"
>

                <source :src="currentLesson.videoUrl" type="video/mp4">
                Kivinjari chako hakitumii video.
              </video>
              <div v-else class="video-placeholder">
                <div class="placeholder-character">
                  <div class="character-body">
                    <div class="character-eyes">
                      <div class="eye"></div>
                      <div class="eye"></div>
                    </div>
                    <div class="character-mouth"></div>
                  </div>
                  <div class="character-arms">
                    <div class="arm left-arm"></div>
                    <div class="arm right-arm"></div>
                  </div>
                </div>
                <h3>🎭 Maudhui ya Video Hayapatikani</h3>
                <p>Video ya somo hili haijapakiwa bado, lakini tutaongeza hivi karibuni!</p>
              </div>
            </div>
          </div>
  
          <!-- Progress card -->
          <div v-if="currentLesson.videoUrl" class="progress-card">
            <div class="progress-header">
              <div class="progress-info">
                <div class="progress-character">
                  <div class="happy-face">
                    <div class="eyes">
                      <div class="eye"></div>
                      <div class="eye"></div>
                    </div>
                    <div class="smile"></div>
                  </div>
                </div>
                <div class="progress-text">
                  <span class="progress-label">🎯 Maendeleo ya Kutazama</span>
                  <span class="progress-percentage">{{ Math.round(videoProgress) }}%</span>
                </div>
              </div>
              <div v-if="isLessonCompleted || isVideoCompleted" class="completion-badge">
                <span class="completion-emoji">🏆</span>
                <span>Umefanikiwa!</span>
                <div class="confetti">
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                </div>
              </div>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${videoProgress}%` }">
                  <div class="progress-character-runner">🏃‍♂️</div>
                </div>
              </div>
              <div class="progress-milestone">🏁</div>
            </div>
          </div>
          
          <!-- Lesson info card -->
          <div class="lesson-info-card">
            <div class="lesson-header">
              <div class="lesson-number">
                <span class="lesson-emoji">📚</span>
                Somo {{ currentLessonIndex + 1 }}
              </div>
              <div class="lesson-meta">
                <div class="lesson-duration">
                  <span class="duration-emoji">⏰</span>
                  {{ currentLesson.duration || 'Muda haujaainishwa' }}
                </div>
              </div>
            </div>
            <div class="lesson-content">
              <h1 class="lesson-title">{{ currentLesson.title || 'Somo bila Jina' }}</h1>
              <p class="lesson-description">{{ currentLesson.description || 'Hakuna maelezo yaliyotolewa kwa somo hili.' }}</p>
            </div>
            <div class="lesson-decoration">
              <div class="deco-element">🎨</div>
              <div class="deco-element">🎪</div>
            </div>
          </div>
        </div>
        
        <!-- Course content sidebar -->
        <div class="sidebar-section">
          <div class="course-sidebar-card">
            <!-- Course header -->
            <div class="course-header">
              <div class="course-mascot">
                <div class="mascot-body">
                  <div class="mascot-eyes">
                    <div class="eye"></div>
                    <div class="eye"></div>
                  </div>
                  <div class="mascot-smile"></div>
                </div>
                <div class="mascot-hat">🎓</div>
              </div>
              <div class="course-info">
                <h2 class="course-title">{{ course.courseName }}</h2>
                <p class="course-subtitle">🎪 Maudhui ya Kozi</p>
              </div>
              <div class="header-decoration">
                <div class="floating-emoji emoji1">🎈</div>
                <div class="floating-emoji emoji2">🎭</div>
              </div>
            </div>
            
            <!-- Course progress overview -->
            <div class="course-progress-overview">
              <div class="progress-stats">
                <div class="stat-item">
                  <div class="stat-icon">📖</div>
                  <div class="stat-number">{{ course.courseContent?.length || 0 }}</div>
                  <div class="stat-label">Sehemu</div>
                </div>
                <div class="stat-divider">
                  <div class="divider-star">⭐</div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">📝</div>
                  <div class="stat-number">
                    {{ course.courseContent?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0 }}
                  </div>
                  <div class="stat-label">Masomo</div>
                </div>
                <div class="stat-divider">
                  <div class="divider-star">⭐</div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">🏆</div>
                  <div class="stat-number">{{ course.completedVideos?.length || 0 }}</div>
                  <div class="stat-label">Zilizomaliza</div>
                </div>
              </div>

              <!-- Progress bar added here -->
  <div class="progress-bar-wrapper">
  <div class="progress-bar-container">
    <div
      class="progress-bar-fill"
      :style="{ width: totalCourseProgress + '%' }"
    ></div>
  </div>
  <!-- <div class="progress-bar-label">
    🎉 {{ totalCourseProgress }}% ya masomo yote umemaliza! 💪
  </div> -->
</div>

            </div>
            
            <!-- Sections list -->
            <div class="sections-container">
              <div class="sections-header">
                <h3>🎯 Orodha ya Masomo</h3>
                <div class="header-decoration">
                  <span class="deco">🌟</span>
                </div>
              </div>
              <div class="sections-list">
                <div v-for="(section, sIndex) in course.courseContent" :key="section._id" class="section-card">
                  <div class="section-header">
                    <div class="section-number">
                      <span class="section-emoji">🎨</span>
                      {{ sIndex + 1 }}
                    </div>
                    <!-- <h4 class="section-title">{{ section.title || `Sehemu ya ${sIndex + 1}` }}</h4> -->
                    <div class="section-decoration">
                      <span class="section-star">⭐</span>
                    </div>
                  </div>
                  
                  <div class="lessons-list">
                    <div
                      v-for="(lesson, lIndex) in section.lessons"
                      :key="lesson._id"
                      @click="changeLesson(sIndex, lIndex)"
                      class="lesson-item"
                      :class="{
                        'active': currentSectionIndex === sIndex && currentLessonIndex === lIndex,
                        'completed': isLessonCompletedById(lesson._id)
                      }"
                    >
                      <div class="lesson-indicator">
                        <div class="lesson-circle">
                          <span v-if="isLessonCompletedById(lesson._id)" class="lesson-emoji">✅</span>
                          <span v-else-if="currentSectionIndex === sIndex && currentLessonIndex === lIndex" class="lesson-emoji">▶️</span>
                          <span v-else class="lesson-number">{{ lIndex + 1 }}</span>
                        </div>
                      </div>
                      <div class="lesson-details">
                        <div class="lesson-name">{{ lesson.title || `Somo la ${lIndex + 1}` }}</div>
                        <!-- <div class="lesson-duration-small">
                          <span class="duration-icon">⏱️</span>
                          {{ lesson.duration || 'N/A' }}
                        </div> -->
                      </div>
                      <div class="lesson-status">
                        <div v-if="currentSectionIndex === sIndex && currentLessonIndex === lIndex" class="playing-indicator">
                          <div class="sound-waves">
                            <div class="wave"></div>
                            <div class="wave"></div>
                            <div class="wave"></div>
                          </div>
                        </div>
                        <div v-if="isLessonCompletedById(lesson._id)" class="completion-stars">
                          <span class="star">⭐</span>
                          <span class="star">⭐</span>
                          <span class="star">⭐</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quiz Section in Sidebar -->
                <div v-if="hasQuizzes" class="section-card quiz-section-card" :class="{ 'locked': !allVideosCompleted }">
                  <div class="section-header quiz-header">
                    <div class="section-number">
                      <span class="section-emoji">📝</span>
                    </div>
                    <h4 class="section-title">Jaribio</h4>
                  </div>
                  <div class="lessons-list">
                    <div 
                      @click="allVideosCompleted ? startQuiz() : null"
                      class="lesson-item quiz-item"
                      :class="{ 'clickable': allVideosCompleted }"
                    >
                       <div class="lesson-indicator">
                        <div class="lesson-circle">
                          <span class="lesson-emoji">{{ allVideosCompleted ? '🔓' : '🔒' }}</span>
                        </div>
                      </div>
                      <div class="lesson-details">
                        <div class="lesson-name">Jaribio la Kozi</div>
                        <div class="lesson-duration-small" v-if="!allVideosCompleted">
                          <span class="text-xs text-gray-500">Maliza video kwanza</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

<!-- Quiz Button -->
<div v-if="allVideosCompleted && hasQuizzes" class="mt-8">
  <div v-if="isRedirectingToQuiz" class="text-center p-4 bg-yellow-100 rounded-xl border-2 border-yellow-400">
    <p class="text-xl font-bold text-yellow-800 mb-2">🔄 Tunakupeleka kwenye Jaribio...</p>
    <div class="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
  
  <button
    v-else
    @click="startQuiz"
    class="flex items-center justify-between w-full p-5 rounded-xl border-4 border-yellow-400 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse"
  >
    <div class="flex items-center gap-4">
      <div class="relative flex items-center justify-center w-14 h-14 bg-white border-2 border-yellow-500 rounded-full shadow-md">
        <div class="absolute -top-6 text-3xl animate-bounce">🎓</div>
        <div class="flex gap-1 mt-3">
          <div class="w-2 h-2 bg-black rounded-full animate-ping"></div>
          <div class="w-2 h-2 bg-black rounded-full animate-ping delay-150"></div>
        </div>
      </div>

      <div class="text-left">
        <span class="block font-extrabold text-lg text-yellow-900">🎯 Anza Jaribio Sasa!</span>
        <span class="text-sm text-yellow-800">📢 Pima ujuzi wako na upate alama!</span>
      </div>
    </div>

    <div class="flex items-center text-3xl animate-bounce">
      🚀
    </div>
  </button>
</div>


          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&display=swap');

.course-player {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FECA57 100%);
  background-size: 300% 300%;
  animation: gradientShift 15s ease infinite;
  font-family: 'Nunito', sans-serif;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  margin-top: 5rem;
}

/* Loading State - Owl Character */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-card {
  background: linear-gradient(145deg, #ffffff, #f0f9ff);
  padding: 3rem;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(255, 107, 107, 0.3);
  text-align: center;
  border: 4px solid #FF6B6B;
  position: relative;
  overflow: hidden;
}

.loading-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 107, 107, 0.1), transparent);
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-owl {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.owl-body {
  width: 80px;
  height: 80px;
  background: linear-gradient(145deg, #FF6B6B, #FF8E8E);
  border-radius: 50%;
  position: relative;
  margin-bottom: 1rem;
}

.owl-eyes {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px 0;
}

.eye {
  width: 15px;
  height: 15px;
  background: white;
  border-radius: 50%;
  position: relative;
}

.eye::after {
  content: '';
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  animation: blink 3s infinite;
}

@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

.owl-beak {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #FFA500;
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
}

.loading-books {
  display: flex;
  gap: 10px;
}

.book {
  width: 20px;
  height: 25px;
  border-radius: 3px;
  animation: bounce 1.5s infinite;
}

.book1 {
  background: #4ECDC4;
  animation-delay: 0s;
}

.book2 {
  background: #45B7D1;
  animation-delay: 0.3s;
}

.book3 {
  background: #96CEB4;
  animation-delay: 0.6s;
}

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
}

.loading-content h3 {
  color: #FF6B6B;
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.loading-content p {
  color: #4ECDC4;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.loading-dots span {
  width: 12px;
  height: 12px;
  background: #FECA57;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
    background: #FECA57;
  }
  40% {
    transform: scale(1);
    background: #FF6B6B;
  }
}

/* Error State */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.error-card {
  background: linear-gradient(145deg, #ffffff, #fef2f2);
  padding: 3rem;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(239, 68, 68, 0.2);
  text-align: center;
  border: 4px solid #FF6B6B;
  max-width: 500px;
  position: relative;
  overflow: hidden;
}

.error-character {
  margin-bottom: 2rem;
}

.sad-face {
  width: 80px;
  height: 80px;
  background: linear-gradient(145deg, #FFB6B6, #FF8E8E);
  border-radius: 50%;
  margin: 0 auto;
  position: relative;
  animation: sadFloat 3s ease-in-out infinite;
}


/* progress */
.progress-bar-wrapper {
  margin-top: 1.5rem;
  text-align: center;
}

.progress-bar-container {
  background-color: #ddd;
  height: 18px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
  margin: 0 auto;
  width: 80%;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  border-radius: 20px 0 0 20px;
  transition: width 0.8s ease-in-out;
}

/* .progress-bar-label {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  text-shadow: 1px 1px 1px #fff;
  animation: popText 1.5s ease-in-out infinite alternate;
} */

.progress-bar-label {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  text-shadow: 1px 1px 1px #fff;
  animation: popText 2s ease-in-out infinite;
}


/* @keyframes popText {
  from {
    transform: scale(1);
    color: #2c3e50;
  }
  to {
    transform: scale(1.05);
    color: #4CAF50;
  }
} */

@keyframes popText {
  0% {
    transform: scale(1);
    color: #2c3e50;
  }
  25% {
    transform: scale(1.05);
    color: #e91e63; /* pink */
  }
  50% {
    transform: scale(1);
    color: #ff9800; /* orange */
  }
  75% {
    transform: scale(1.05);
    color: #03a9f4; /* blue */
  }
  100% {
    transform: scale(1);
    color: #4CAF50; /* green */
  }
}


@keyframes sadFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.sad-eyes {
  display: flex;
  justify-content: space-between;
  padding: 20px 25px 0;
}

.sad-eye-left, .sad-eye-right {
  width: 12px;
  height: 12px;
  background: #333;
  border-radius: 50%;
}

.sad-mouth {
  width: 25px;
  height: 12px;
  border: 3px solid #333;
  border-top: none;
  border-radius: 0 0 25px 25px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
}

.error-content h3 {
  color: #FF6B6B;
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.error-content p {
  color: #64748b;
  margin-bottom: 2rem;
  font-weight: 600;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(145deg, #FF6B6B, #FF8E8E);
  color: white;
  padding: 1.2rem 2.5rem;
  border: none;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.retry-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.5);
}

.btn-icon {
  font-size: 1.3rem;
  animation: spin 2s linear infinite;
}

.btn-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #FECA57;
  border-radius: 50%;
  animation: sparkleFloat 2s infinite linear;
}

.sparkle:nth-child(1) { top: 20%; left: 20%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 50%; right: 20%; animation-delay: 0.7s; }
.sparkle:nth-child(3) { bottom: 20%; left: 50%; animation-delay: 1.4s; }

@keyframes sparkleFloat {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

/* Course Layout */
.course-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 2rem;
  align-items: start;
}

/* Video Section */
.video-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Video Card */
.video-card {
  background: linear-gradient(145deg, #ffffff, #f8faff);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(69, 183, 209, 0.2);
  border: 3px solid #4ECDC4;
  position: relative;
}

.video-header {
  background: linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%);
  padding: 1.5rem 2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.video-header::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.video-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  font-size: 1.1rem;
  z-index: 2;
}

.status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FF6B6B;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator.active {
  background: #96CEB4;
}

.pulse-ring {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.fun-decoration {
  display: flex;
  gap: 1rem;
  z-index: 2;
}

.floating-star {
  font-size: 1.5rem;
  animation: floatStar 3s ease-in-out infinite;
}

.star1 { animation-delay: 0s; }
.star2 { animation-delay: 1s; }
.star3 { animation-delay: 2s; }

@keyframes floatStar {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
}

.video-container {
  position: relative;
  aspect-ratio: 16/9;
  background: linear-gradient(145deg, #1a1a1a, #333);
  border-radius: 0 0 22px 22px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0 0 22px 22px;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  text-align: center;
  padding: 3rem;
  background: linear-gradient(145deg, #4ECDC4, #45B7D1);
}

.placeholder-character {
  margin-bottom: 2rem;
}

.character-body {
  width: 100px;
  height: 100px;
  background: linear-gradient(145deg, #FECA57, #FFD93D);
  border-radius: 50%;
  position: relative;
  margin: 0 auto 1rem;
  animation: characterBounce 2s ease-in-out infinite;
}

@keyframes characterBounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

.character-eyes {
  display: flex;
  justify-content: space-between;
  padding: 25px 30px 0;
}

.character-eyes .eye {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: relative;
}

.character-eyes .eye::after {
  content: '';
  width: 10px;
  height: 10px;
  background: #333;
  border-radius: 50%;
  position: absolute;
  top: 4px;
  left: 4px;
  animation: eyeMove 4s infinite;
}

@keyframes eyeMove {
  0%, 50%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 0); }
  75% { transform: translate(2px, 0); }
}

.character-mouth {
  width: 25px;
  height: 12px;
  border: 3px solid #333;
  border-top: none;
  border-radius: 0 0 25px 25px;
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.character-arms {
  display: flex;
  justify-content: space-between;
  width: 120px;
  margin: 0 auto;
}

.arm {
  width: 30px;
  height: 8px;
  background: #FECA57;
  border-radius: 4px;
  animation: armWave 2s ease-in-out infinite;
}

.left-arm {
  transform-origin: left;
  animation-delay: 0s;
}

.right-arm {
  transform-origin: right;
  animation-delay: 1s;
}

@keyframes armWave {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-20deg); }
}

.video-placeholder h3 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.video-placeholder p {
  color: rgba(255,255,255,0.9);
  font-size: 1.1rem;
  font-weight: 600;
}

/* Progress Card */
.progress-card {
  background: linear-gradient(145deg, #ffffff, #f0f9ff);
  padding: 2rem;
  border-radius: 25px;
  box-shadow: 0 12px 30px rgba(255, 107, 107, 0.15);
  border: 3px solid #FF6B6B;
  position: relative;
  overflow: hidden;
}

.progress-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FECA57);
  background-size: 400% 400%;
  border-radius: 25px;
  z-index: -1;
  animation: gradientBorder 4s ease infinite;
}

@keyframes gradientBorder {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.progress-character {
  width: 60px;
  height: 60px;
}

.happy-face {
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #FECA57, #FFD93D);
  border-radius: 50%;
  position: relative;
  animation: happyBounce 2s ease-in-out infinite;
}

@keyframes happyBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.happy-face .eyes {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px 0;
}

.happy-face .eyes .eye {
  width: 12px;
  height: 12px;
  background: #333;
  border-radius: 50%;
  animation: happyBlink 3s infinite;
}

@keyframes happyBlink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

.smile {
  width: 20px;
  height: 10px;
  border: 3px solid #333;
  border-top: none;
  border-radius: 0 0 20px 20px;
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
}

.progress-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-label {
  font-weight: 700;
  color: #4ECDC4;
  font-size: 1.1rem;
}

.progress-percentage {
  background: linear-gradient(145deg, #FF6B6B, #FF8E8E);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
  text-align: center;
}

.completion-badge {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(145deg, #96CEB4, #6BCF7F);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 8px 20px rgba(150, 206, 180, 0.4);
  position: relative;
  overflow: hidden;
}

.completion-emoji {
  font-size: 1.5rem;
  animation: trophyShine 2s ease-in-out infinite;
}

@keyframes trophyShine {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: confettiFall 3s infinite linear;
}

.confetti-piece:nth-child(1) {
  background: #FECA57;
  left: 20%;
  animation-delay: 0s;
}

.confetti-piece:nth-child(2) {
  background: #FF6B6B;
  left: 50%;
  animation-delay: 1s;
}

.confetti-piece:nth-child(3) {
  background: #4ECDC4;
  left: 80%;
  animation-delay: 2s;
}

@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100px) rotate(360deg);
    opacity: 0;
  }
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  border: 2px solid #4ECDC4;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%);
  border-radius: 13px;
  transition: width 0.6s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
}

.progress-character-runner {
  font-size: 1.2rem;
  animation: run 1s ease-in-out infinite;
}

@keyframes run {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.progress-milestone {
  font-size: 2rem;
  animation: flagWave 2s ease-in-out infinite;
}

@keyframes flagWave {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

/* Lesson Info Card */
.lesson-info-card {
  background: linear-gradient(145deg, #ffffff, #f8f4ff);
  padding: 2.5rem;
  border-radius: 25px;
  box-shadow: 0 15px 40px rgba(150, 206, 180, 0.2);
  border: 3px solid #96CEB4;
  position: relative;
  overflow: hidden;
}

.lesson-info-card::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: conic-gradient(from 0deg, transparent, rgba(150, 206, 180, 0.1), transparent);
  animation: rotate 30s linear infinite;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.lesson-number {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(145deg, #96CEB4, #6BCF7F);
  color: white;
  padding: 1rem 2rem;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 8px 20px rgba(150, 206, 180, 0.3);
}

.lesson-emoji {
  font-size: 1.5rem;
  animation: bookFlip 3s ease-in-out infinite;
}

@keyframes bookFlip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lesson-duration {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(145deg, #FECA57, #FFD93D);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 15px;
  font-weight: 700;
  box-shadow: 0 6px 15px rgba(254, 202, 87, 0.3);
}

.duration-emoji {
  font-size: 1.2rem;
  animation: tickTock 2s ease-in-out infinite;
}

@keyframes tickTock {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

.lesson-content {
  text-align: left;
  position: relative;
  z-index: 2;
}

.lesson-title {
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(145deg, #4ECDC4, #45B7D1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.lesson-description {
  color: #64748b;
  font-size: 1.2rem;
  line-height: 1.6;
  font-weight: 600;
}

.lesson-decoration {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.deco-element {
  font-size: 2rem;
  animation: decoFloat 4s ease-in-out infinite;
}

.deco-element:nth-child(1) { animation-delay: 0s; }
.deco-element:nth-child(2) { animation-delay: 1.3s; }
.deco-element:nth-child(3) { animation-delay: 2.6s; }

@keyframes decoFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(120deg); }
  66% { transform: translateY(-5px) rotate(240deg); }
}

/* Sidebar Section */
.sidebar-section {
  position: sticky;
  top: 1rem;
}

.course-sidebar-card {
  background: linear-gradient(145deg, #ffffff, #faf5ff);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(69, 183, 209, 0.2);
  border: 3px solid #45B7D1;
}

/* Course Header */
.course-header {
  background: linear-gradient(135deg, #45B7D1 0%, #4ECDC4 50%, #96CEB4 100%);
  padding: 2rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

.course-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  animation: headerShimmer 8s linear infinite;
}

@keyframes headerShimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.course-mascot {
  position: relative;
  z-index: 2;
}

.mascot-body {
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #FECA57, #FFD93D);
  border-radius: 50%;
  position: relative;
  animation: mascotBounce 3s ease-in-out infinite;
}

@keyframes mascotBounce {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(10deg); }
}

.mascot-eyes {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px 0;
}

.mascot-eyes .eye {
  width: 10px;
  height: 10px;
  background: #333;
  border-radius: 50%;
  animation: mascotBlink 4s infinite;
}

@keyframes mascotBlink {
  0%, 92%, 100% { transform: scaleY(1); }
  96% { transform: scaleY(0.1); }
}

.mascot-smile {
  width: 18px;
  height: 9px;
  border: 2px solid #333;
  border-top: none;
  border-radius: 0 0 18px 18px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.mascot-hat {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.8rem;
  animation: hatWiggle 4s ease-in-out infinite;
}

@keyframes hatWiggle {
  0%, 100% { transform: translateX(-50%) rotate(-5deg); }
  50% { transform: translateX(-50%) rotate(5deg); }
}

.course-info {
  flex: 1;
  z-index: 2;
}

.course-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.course-subtitle {
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
  font-weight: 600;
}

.header-decoration {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 2;
}

.floating-emoji {
  font-size: 1.5rem;
  animation: emojiFloat 3s ease-in-out infinite;
}

.emoji1 { animation-delay: 0s; }
.emoji2 { animation-delay: 1.5s; }

@keyframes emojiFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(15deg); }
}

/* Course Progress Overview */
.course-progress-overview {
  padding: 2rem;
  background: linear-gradient(145deg, #f0f9ff, #e0f2fe);
  border-bottom: 3px solid #4ECDC4;
}

.progress-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(69, 183, 209, 0.1);
  border: 2px solid #4ECDC4;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #4ECDC4, #45B7D1);
  border-radius: 20px;
  z-index: -1;
}

.stat-icon {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  animation: statIconBounce 2s ease-in-out infinite;
}

@keyframes statIconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.stat-number {
  font-size: 2rem;
  font-weight: 900;
  color: #45B7D1;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #4ECDC4;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider-star {
  font-size: 1.5rem;
  animation: starTwinkle 2s ease-in-out infinite;
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Sections Container */
.sections-container {
  max-height: 500px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4ECDC4 #f1f5f9;
}

.sections-container::-webkit-scrollbar {
  width: 8px;
}

.sections-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.sections-container::-webkit-scrollbar-thumb {
  background: linear-gradient(145deg, #4ECDC4, #45B7D1);
  border-radius: 4px;
}

.sections-header {
  padding: 2rem 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(145deg, #fef7cd, #fef3c7);
  border-bottom: 3px solid #FECA57;
}

.sections-header h3 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #92400e;
  margin: 0;
}

.header-decoration .deco {
  font-size: 1.5rem;
  animation: decoSpin 4s linear infinite;
}

@keyframes decoSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sections-list {
  padding: 1.5rem;
}

/* Section Card */
.section-card {
  margin-bottom: 2rem;
  background: linear-gradient(145deg, #fefefe, #f8fafc);
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, #FF6B6B, #FF8E8E);
  color: white;
  position: relative;
  overflow: hidden;
}

.section-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: sectionShimmer 6s linear infinite;
}

@keyframes sectionShimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.section-number {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.2);
  padding: 0.8rem 1.2rem;
  border-radius: 15px;
  font-weight: 800;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  z-index: 2;
}

.section-emoji {
  font-size: 1.2rem;
  animation: sectionEmojiSpin 4s ease-in-out infinite;
}

@keyframes sectionEmojiSpin {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

.section-title {
  flex: 1;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  z-index: 2;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.section-decoration {
  z-index: 2;
}

.section-star {
  font-size: 1.5rem;
  animation: sectionStarPulse 2s ease-in-out infinite;
}

@keyframes sectionStarPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.lessons-list {
  padding: 1rem;
}

/* Lesson Item */
.lesson-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.2rem;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.8rem;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.lesson-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(76, 204, 196, 0.1), transparent);
  transition: left 0.5s ease;
}

.lesson-item:hover::before {
  left: 100%;
}

.lesson-item:hover {
  transform: translateX(8px);
  box-shadow: 0 12px 30px rgba(76, 204, 196, 0.2);
  border-color: #4ECDC4;
}

.lesson-item.active {
  background: linear-gradient(145deg, #4ECDC4, #45B7D1);
  color: white;
  border-color: #4ECDC4;
  box-shadow: 0 15px 35px rgba(76, 204, 196, 0.4);
  transform: scale(1.02);
}

.lesson-item.completed {
  background: linear-gradient(145deg, #96CEB4, #6BCF7F);
  color: white;
  border-color: #96CEB4;
}

.lesson-indicator {
  position: relative;
}

.lesson-circle {
  width: 50px;
  height: 50px;
  background: linear-gradient(145deg, #FECA57, #FFD93D);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  box-shadow: 0 6px 15px rgba(254, 202, 87, 0.3);
  position: relative;
  overflow: hidden;
}

.lesson-item.active .lesson-circle {
  background: linear-gradient(145deg, #ffffff, #f0f9ff);
  color: #4ECDC4;
  animation: activePulse 2s ease-in-out infinite;
}

@keyframes activePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 6px 15px rgba(76, 204, 196, 0.3); }
  50% { transform: scale(1.1); box-shadow: 0 8px 20px rgba(76, 204, 196, 0.5); }
}

.lesson-item.completed .lesson-circle {
  background: linear-gradient(145deg, #ffffff, #f0f9ff);
  color: #96CEB4;
}
</style>
