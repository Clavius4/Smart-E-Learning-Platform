<template>
  <div class="course-quiz">
    <MainNav />
    <div class="container mx-auto px-4 py-8 max-w-3xl mt-20">
      <!-- Pre-Quiz Warm-up Section -->
      <div v-if="showWarmup" class="bg-blue-50 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Quick Review Before Quiz</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(item, index) in warmupItems" :key="index" 
               class="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
            <img :src="item.image" :alt="item.text" class="w-full h-24 object-contain mb-2">
            <div class="text-center font-medium">{{ item.text }}</div>
          </div>
        </div>
        <button @click="startQuiz" 
                class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Start Quiz
        </button>
      </div>

      <!-- Main Quiz Section -->
      <div v-else>
        <!-- Visual Progress Bar -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Progress</span>
            <span class="text-sm font-medium">{{ Math.round((currentQuestionIndex / questions.length) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div 
              class="bg-blue-600 h-4 rounded-full transition-all duration-300" 
              :style="{ width: `${(currentQuestionIndex / questions.length) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-8">
          <!-- Quiz Header with Streak Indicator -->
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold">{{ course.title }} Quiz</h1>
              <div class="ml-3 flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                <span class="text-yellow-800 font-bold mr-1">{{ streakCount }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="text-lg font-medium">
              Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
            </div>
          </div>
          
          <!-- Current Question with Visual Support -->
          <div class="mb-8">
            <div class="flex items-center mb-6">
              <h2 class="text-xl font-semibold mr-3">{{ currentQuestion.text }}</h2>
              <!-- Sign Language Video Button -->
              <button v-if="currentQuestion.signLanguageVideo" @click="playSignLanguageVideo" class="ml-2 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            <!-- Visual Prompt (Image/Diagram) -->
            <div v-if="currentQuestion.visualPrompt" class="mb-6 border rounded-lg overflow-hidden">
              <img :src="currentQuestion.visualPrompt" alt="Question visual aid" class="w-full h-auto">
            </div>
            
            <!-- Multiple Choice Options with Images -->
            <div v-if="currentQuestion.type === 'multiple-choice'" class="grid grid-cols-2 gap-4">
              <button
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                @click="selectAnswer(index)"
                class="p-4 border rounded-lg transition-all flex items-center"
                :class="{
                  'bg-blue-100 border-blue-300 shadow-md': selectedAnswer === index,
                  'hover:bg-gray-50': selectedAnswer !== index,
                  'ring-2 ring-green-500': showCorrectAnswer && option.correct,
                  'ring-2 ring-red-500': showCorrectAnswer && selectedAnswer === index && !option.correct
                }"
              >
                <div v-if="option.image" class="w-16 h-16 mr-3 flex-shrink-0">
                  <img :src="option.image" :alt="option.text" class="w-full h-full object-contain">
                </div>
                <span>{{ option.text }}</span>
              </button>
            </div>
            
            <!-- Sign Language Recognition Question -->
            <div v-else-if="currentQuestion.type === 'sign-language-recognition'" class="space-y-4">
              <div class="border rounded-lg p-4 bg-gray-50">
                <video :src="currentQuestion.signLanguageVideo" controls class="w-full max-h-64"></video>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <button
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  @click="selectAnswer(index)"
                  class="p-4 border rounded-lg transition-all flex items-center justify-center"
                  :class="{
                    'bg-blue-100 border-blue-300 shadow-md': selectedAnswer === index,
                    'hover:bg-gray-50': selectedAnswer !== index,
                    'ring-2 ring-green-500': showCorrectAnswer && option.correct,
                    'ring-2 ring-red-500': showCorrectAnswer && selectedAnswer === index && !option.correct
                  }"
                >
                  <span class="text-2xl font-bold">{{ option.text }}</span>
                </button>
              </div>
            </div>
            
            <!-- Matching Question Type -->
            <div v-else-if="currentQuestion.type === 'matching'" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div v-for="(item, index) in currentQuestion.items" :key="index" 
                  class="border p-3 rounded-lg bg-gray-50">
                  <div v-if="item.image" class="mb-2">
                    <img :src="item.image" :alt="item.text" class="w-full h-20 object-contain">
                  </div>
                  <div>{{ item.text }}</div>
                </div>
              </div>
              <div class="text-center text-gray-500">
                Drag items from the left to match with items on the right
              </div>
            </div>
            
            <!-- Sequencing Question Type -->
            <div v-else-if="currentQuestion.type === 'sequencing'" class="space-y-3">
              <div 
                v-for="(item, index) in currentQuestion.items" 
                :key="index"
                class="border p-3 rounded-lg bg-gray-50 cursor-move"
                draggable="true"
                @dragstart="dragStart(index)"
                @dragover.prevent="dragOver(index)"
                @drop="drop(index)"
              >
                <div class="flex items-center">
                  <span class="mr-2 text-gray-500">{{ index + 1 }}.</span>
                  <div v-if="item.image" class="w-12 h-12 mr-3">
                    <img :src="item.image" :alt="item.text" class="w-full h-full object-contain">
                  </div>
                  <span>{{ item.text }}</span>
                </div>
              </div>
            </div>
            
            <!-- Writing Pad with Visual Support -->
            <div v-else-if="currentQuestion.type === 'writing'">
              <div v-if="currentQuestion.writingPrompt" class="mb-4 border rounded-lg overflow-hidden">
                <img :src="currentQuestion.writingPrompt" alt="Writing prompt" class="w-full h-auto">
              </div>
              <textarea
                v-model="writtenAnswer"
                class="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Type your answer here..."
              ></textarea>
            </div>
          </div>
          
          <!-- Feedback Area -->
          <div v-if="showFeedback" class="mb-6 p-4 rounded-lg" 
            :class="{
              'bg-green-100 text-green-800': isAnswerCorrect,
              'bg-red-100 text-red-800': !isAnswerCorrect
            }">
            <div class="flex items-start">
              <svg v-if="isAnswerCorrect" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <p class="font-medium">{{ isAnswerCorrect ? 'Correct!' : 'Not quite right' }}</p>
                <p v-if="currentQuestion.explanation" class="mt-1">{{ currentQuestion.explanation }}</p>
              </div>
            </div>
          </div>
          
          <!-- Navigation -->
          <div class="flex justify-between">
            <button
              v-if="currentQuestionIndex > 0"
              @click="previousQuestion"
              class="px-4 py-2 text-blue-600 rounded-lg border border-blue-600"
            >
              Previous
            </button>
            <button
              v-else
              disabled
              class="px-4 py-2 text-gray-400 rounded-lg border border-gray-300"
            >
              Previous
            </button>
            
            <button
              v-if="showNextButton"
              @click="checkAnswer"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Check Answer
            </button>
            <button
              v-else-if="currentQuestionIndex < questions.length - 1"
              @click="nextQuestion"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
            <button
              v-else
              @click="submitQuiz"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Quiz
            </button>
          </div>
        </div>
        
        <!-- XP Earned Notification -->
        <transition name="fade">
          <div v-if="showXPEarned" class="fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
            <span class="font-bold mr-2">+{{ xpEarned }} XP!</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import { useCourseStore } from '@/stores/courseStore'

export default {
  name: 'CourseQuiz',
  components: { MainNav },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseStore = useCourseStore()
    const selectedAnswer = ref(null)
    const writtenAnswer = ref('')
    const currentQuestionIndex = ref(0)
    const showFeedback = ref(false)
    const isAnswerCorrect = ref(false)
    const showCorrectAnswer = ref(false)
    const streakCount = ref(0)
    const showXPEarned = ref(false)
    const xpEarned = ref(0)
    const draggedItemIndex = ref(null)
    const showWarmup = ref(true)
    
    const course = computed(() => courseStore.getCourseById(route.params.courseId))
    const questions = computed(() => courseStore.getQuizQuestions(route.params.courseId))
    const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
    
    const warmupItems = computed(() => {
      if (!course.value) return []
      return [
        { text: 'Letter A', image: '/images/letter-a.jpg' },
        { text: 'Letter B', image: '/images/letter-b.jpg' },
        { text: 'Apple', image: '/images/apple.jpg' },
        { text: 'Ball', image: '/images/ball.jpg' }
      ]
    })

    const showNextButton = computed(() => {
      return !showFeedback.value && 
        ((['multiple-choice', 'sign-language-recognition'].includes(currentQuestion.value.type) && selectedAnswer.value !== null) ||
         (currentQuestion.value.type === 'writing' && writtenAnswer.value.trim() !== '') ||
         (currentQuestion.value.type === 'sequencing' && currentQuestion.value.items.length > 0))
    })
    
    const startQuiz = () => {
      showWarmup.value = false
    }
    
    const playSignLanguageVideo = () => {
      if (currentQuestion.value.signLanguageVideo) {
        // The video will play through the native HTML5 video controls
      }
    }
    
    const dragStart = (index) => {
      draggedItemIndex.value = index
    }
    
    const dragOver = (index) => {
      // Handle visual feedback during drag over if needed
    }
    
    const drop = (index) => {
      if (draggedItemIndex.value !== null && draggedItemIndex.value !== index) {
        // Reorder items in the sequence
        const reorderedItems = [...currentQuestion.value.items]
        const draggedItem = reorderedItems[draggedItemIndex.value]
        reorderedItems.splice(draggedItemIndex.value, 1)
        reorderedItems.splice(index, 0, draggedItem)
        
        // Update the question with reordered items
        courseStore.updateQuizQuestionItems(
          route.params.courseId,
          currentQuestionIndex.value,
          reorderedItems
        )
      }
    }
    
    const checkAnswer = () => {
      let correct = false
      let answerToStore = selectedAnswer.value
      
      if (['multiple-choice', 'sign-language-recognition'].includes(currentQuestion.value.type)) {
        correct = currentQuestion.value.options[selectedAnswer.value]?.correct
      } 
      else if (currentQuestion.value.type === 'writing') {
        correct = writtenAnswer.value.trim().toLowerCase() === 
                 currentQuestion.value.expectedAnswer.toLowerCase()
        answerToStore = writtenAnswer.value
      } 
      else if (currentQuestion.value.type === 'sequencing') {
        correct = currentQuestion.value.items.every((item, index) => 
          item.correctPosition === index + 1
        )
        answerToStore = [...currentQuestion.value.items]
      }
      
      isAnswerCorrect.value = correct
      showFeedback.value = true
      showCorrectAnswer.value = true
      
      // Store the answer
      courseStore.recordQuizAnswer(
        route.params.courseId,
        currentQuestionIndex.value,
        answerToStore
      )
      
      if (correct) {
        streakCount.value += 1
        xpEarned.value = streakCount.value * 10
        showXPEarnedNotification()
      } else {
        streakCount.value = 0
      }
    }
    
    const showXPEarnedNotification = () => {
      showXPEarned.value = true
      setTimeout(() => {
        showXPEarned.value = false
      }, 3000)
    }
    
    const nextQuestion = () => {
      currentQuestionIndex.value++
      selectedAnswer.value = null
      writtenAnswer.value = ''
      showFeedback.value = false
      showCorrectAnswer.value = false
    }
    
    const previousQuestion = () => {
      currentQuestionIndex.value--
      // Load previous answer if exists
      const prevAnswer = courseStore.getQuizAnswer(
        route.params.courseId,
        currentQuestionIndex.value
      )
      if (['multiple-choice', 'sign-language-recognition'].includes(currentQuestion.value.type)) {
        selectedAnswer.value = prevAnswer
      } else if (currentQuestion.value.type === 'writing') {
        writtenAnswer.value = prevAnswer
      }
      showFeedback.value = false
      showCorrectAnswer.value = false
    }
    
const submitQuiz = () => {
  // First check if we need to record the current answer
  if (showNextButton.value) {
    checkAnswer()
    // Wait for the next tick to ensure answer is recorded
    nextTick(() => {
      proceedWithSubmission()
    })
  } else {
    proceedWithSubmission()
  }
}

const proceedWithSubmission = async () => {
  try {
    // Submit to backend
    const response = await courseStore.completeQuiz(route.params.courseId)
    
    if (response.success && response.data) {
        const resultData = response.data
        
        router.push({
            name: 'quiz-results',
            params: {
              courseId: route.params.courseId,
              score: Math.round(resultData.percentage), // Pass percentage for display
              // We can pass complex objects via state or query if needed, 
              // but params are usually string/number.
              // For rich data like badges, passing via query encoded or store is better.
              // Let's rely on store or encode simple flags.
              passed: resultData.passed ? 'true' : 'false',
              levelChanged: resultData.studentLevel?.levelChanged ? 'true' : 'false',
              newLevel: resultData.studentLevel?.newLevel || ''
            },
            query: {
                // Pass rewards via query to avoid potential param issues
                xp: resultData.score * 10, 
                badge: resultData.studentLevel?.levelChanged ? 'Level Master' : '',
                previousLevel: resultData.studentLevel?.previousLevel || '',
                levelChanged: resultData.studentLevel?.levelChanged ? 'true' : 'false',
                newLevel: resultData.studentLevel?.newLevel || ''
            }
        })
    }
  } catch(err) {
    console.error('Submission failed:', err)
    alert('Failed to submit quiz. Please try again.')
  }
}
    
    onMounted(async () => {
        // Fetch course metadata
        if (!course.value) {
           await courseStore.fetchCourseDetails(route.params.courseId) // Ensure fetchCourseDetails is correct name or fallback
        }
        // Fetch specific quiz data (Questions & ID)
        await courseStore.fetchQuiz(route.params.courseId)
    })
    
    return {
      selectedAnswer,
      writtenAnswer,
      currentQuestionIndex,
      course,
      questions,
      currentQuestion,
      showFeedback,
      isAnswerCorrect,
      showCorrectAnswer,
      streakCount,
      showXPEarned,
      xpEarned,
      showNextButton,
      showWarmup,
      warmupItems,
      startQuiz,
      playSignLanguageVideo,
      dragStart,
      dragOver,
      drop,
      checkAnswer,
      nextQuestion,
      previousQuestion,
      submitQuiz
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.cursor-move {
  cursor: move;
}
</style>