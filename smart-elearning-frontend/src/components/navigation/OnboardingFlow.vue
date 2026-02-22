<template>
  <div class="min-h-screen relative overflow-hidden" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);">
    
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Floating Stars -->
      <div class="floating-star top-10 left-10 text-yellow-300 text-4xl">⭐</div>
      <div class="floating-star top-20 right-20 text-yellow-200 text-3xl" style="animation-delay: -2s;">✨</div>
      <div class="floating-star top-40 left-1/4 text-yellow-400 text-2xl" style="animation-delay: -4s;">🌟</div>
      <div class="floating-star bottom-32 right-1/3 text-yellow-300 text-5xl" style="animation-delay: -1s;">⭐</div>
      
      <!-- Floating Clouds -->
      <div class="floating-cloud top-16 left-1/3 text-white text-6xl" style="animation-delay: -1s;">☁️</div>
      <div class="floating-cloud top-32 right-1/4 text-blue-100 text-5xl" style="animation-delay: -3s;">☁️</div>
      <div class="floating-cloud bottom-40 left-1/5 text-white text-4xl">☁️</div>
      
      <!-- Floating Balloons -->
      <div class="floating-balloon top-24 right-12 text-6xl" style="animation-delay: -0.5s;">🎈</div>
      <div class="floating-balloon bottom-20 left-8 text-5xl" style="animation-delay: -2.5s;">🎈</div>
      <div class="floating-balloon top-1/2 left-12 text-4xl" style="animation-delay: -1.5s;">🎈</div>
      
      <!-- Rainbow Elements -->
      <div class="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse" style="animation-delay: -1s;"></div>
      <div class="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse" style="animation-delay: -2s;"></div>
    </div>

    <div class="relative z-10 flex items-center justify-center p-4 min-h-screen">
      <div class="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50">
        
        <!-- Progress Bar with Rainbow -->
        <div class="h-4 bg-gradient-to-r from-purple-200 to-pink-200 relative">
          <div 
            class="h-full bg-gradient-to-r from-purple-500 via-blue-500 via-green-500 via-yellow-500 to-red-500 transition-all duration-700 rounded-r-full" 
            :style="{ width: `${(currentStep / 5) * 100}%` }"
          ></div>
          <div class="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
        </div>

        <div class="p-8 md:p-12">
          
          <!-- Step 1: Learning Style -->
          <div v-if="currentStep === 1" class="space-y-10">
            <div class="text-center relative">
              <div class="text-8xl mb-6 animate-bounce">🎓</div>
              <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                Karibu Mfumo wa Kujifunza!
              </h1>
              <p class="text-2xl text-purple-700 font-bold">Hebu tujenge mazingira yako ya kujifunza</p>
            </div>
            
            <div>
              <h2 class="text-4xl font-black text-center mb-8 text-blue-800">Unapenda kujifunza vipi?</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button 
                  @click="selectStyle('literacy')"
                  class="p-8 border-4 rounded-3xl hover:border-purple-500 transition-all transform hover:scale-105 hover:rotate-1 duration-300 flex flex-col items-center relative overflow-hidden"
                  :class="{ 'border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 shadow-2xl': userStore.profile.learningStyle === 'literacy' }"
                >
                  <div class="w-24 h-24 mb-6 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg">
                  <span class="text-5xl"> 🔠</span>
                  </div>
                  <span class="font-black text-3xl text-purple-800">Kusoma</span>
                  <p class="text-xl text-purple-600 mt-3 text-center font-bold">Picha, video na lugha ya alama</p>
                  <div class="absolute -top-2 -right-2 text-yellow-400 text-3xl animate-spin">✨</div>
                </button>
                
                <button 
                  @click="selectStyle('numeracy')"
                  class="p-8 border-4 rounded-3xl hover:border-blue-500 transition-all transform hover:scale-105 hover:-rotate-1 duration-300 flex flex-col items-center relative overflow-hidden"
                  :class="{ 'border-blue-500 bg-gradient-to-br from-blue-100 to-cyan-100 shadow-2xl': userStore.profile.learningStyle === 'numeracy' }"
                >
                  <div class="w-24 h-24 mb-6 flex items-center justify-center bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full shadow-lg">
                    <span class="text-5xl"> 🔢</span>
                  </div>
                  <span class="font-black text-3xl text-blue-800">Kuhesabu</span>
                  <p class="text-xl text-blue-600 mt-3 text-center font-bold">Kuhesabu Namba na Maumbo</p>
                  <div class="absolute -top-2 -right-2 text-yellow-400 text-3xl animate-bounce">✨</div>
                </button>
              </div>
            </div>
            
            <div class="flex justify-center">
              <button 
                @click="currentStep++"
                class="px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-110 shadow-2xl text-2xl font-black"
              >
                Endelea →
              </button>
            </div>
          </div>

          <!-- Step 2: Interests -->
          <div v-if="currentStep === 2" class="space-y-10">
            <div class="text-center">
              <div class="text-8xl mb-6 animate-pulse">🎯</div>
              <h2 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
                Unapenda nini?
              </h2>
              <p class="text-2xl text-green-700 font-bold mb-8">Chagua mambo 2 unayopenda</p>
            </div>
            
            <div class="flex flex-wrap justify-center gap-6">
              <button
                v-for="(tag, index) in interestTags"
                :key="tag"
                @click="toggleInterest(tag)"
                class="px-8 py-6 rounded-full border-4 transition-all transform hover:scale-110 flex items-center text-2xl font-black relative"
                :class="{
                  'border-green-500 bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-2xl': selectedInterests.includes(tag),
                  'border-gray-300 hover:border-green-400 bg-white text-gray-700 hover:text-green-700': !selectedInterests.includes(tag)
                }"
                :style="{ 'animation-delay': index * 0.1 + 's' }"
              >
                <span class="mr-3">{{ getInterestEmoji(tag) }}</span>
                <span class="mr-3">{{ getSwahiliInterest(tag) }}</span>
                <span v-if="selectedInterests.includes(tag)" class="text-yellow-300 text-3xl animate-bounce">✓</span>
              </button>
            </div>
            
            <div class="flex justify-between mt-12">
              <button 
                @click="currentStep--"
                class="px-8 py-4 text-gray-600 hover:text-gray-800 flex items-center text-2xl font-bold bg-white/50 rounded-2xl hover:bg-white/80 transition-all"
              >
                ← Rudi
              </button>
              <button 
                @click="currentStep++"
                :disabled="selectedInterests.length === 0"
                class="px-12 py-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-110 shadow-2xl text-2xl font-black disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
              >
                Endelea →
              </button>
            </div>
          </div>

          <!-- Step 3: Sign Language Preference -->
          <!-- <div v-if="currentStep === 3" class="space-y-10">
            <div class="text-center">
              <div class="text-8xl mb-6 animate-wave">👋</div>
              <h2 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-4">
                Lugha ya Alama
              </h2>
              <p class="text-2xl text-orange-700 font-bold mb-8">Unatumia lugha gani ya alama?</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                v-for="(lang, index) in signLanguages"
                :key="lang"
                @click="selectSignLanguage(lang)"
                class="p-8 border-4 rounded-3xl hover:border-orange-500 transition-all transform hover:scale-105 relative overflow-hidden"
                :class="{ 'border-orange-500 bg-gradient-to-br from-orange-100 to-red-100 shadow-2xl': userStore.profile.signLanguage === lang }"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <span class="text-4xl mr-4">{{ getSignLanguageEmoji(lang) }}</span>
                    <span class="text-2xl font-black text-orange-800">{{ getSwahiliSignLanguage(lang) }}</span>
                  </div>
                  <span v-if="userStore.profile.signLanguage === lang" class="text-green-600 text-4xl animate-bounce">✓</span>
                </div>
                <div class="absolute -top-2 -right-2 text-yellow-400 text-2xl animate-pulse">🌟</div>
              </button>
            </div>
            
            <div class="flex justify-between mt-12">
              <button 
                @click="currentStep--"
                class="px-8 py-4 text-gray-600 hover:text-gray-800 flex items-center text-2xl font-bold bg-white/50 rounded-2xl hover:bg-white/80 transition-all"
              >
                ← Rudi
              </button>
              <button 
                @click="currentStep++"
                class="px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-110 shadow-2xl text-2xl font-black"
              >
                Endelea →
              </button>
            </div>
          </div> -->

          <!-- Step 3: Difficulty Level -->
          <div v-if="currentStep === 3" class="space-y-10">
            <div class="text-center">
              <div class="text-8xl mb-6 animate-bounce">🎯</div>
              <h2 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 mb-4">
                Upo wapi?
              </h2>
              <p class="text-2xl text-teal-700 font-bold mb-8">Tusaidie kuchagua ugumu sahihi</p>
            </div>
            
            <div class="space-y-6">
              <div 
                v-for="(level, index) in difficultyLevels"
                :key="level.value"
                @click="selectDifficulty(level.value)"
                class="p-8 border-4 rounded-3xl cursor-pointer transition-all transform hover:scale-105 relative overflow-hidden"
                :class="{
                  'border-teal-500 bg-gradient-to-br from-teal-100 to-green-100 shadow-2xl': userStore.profile.difficultyPreference === level.value,
                  'border-gray-300 hover:border-teal-400 bg-white': userStore.profile.difficultyPreference !== level.value
                }"
              >
                <div class="flex items-center">
                  <div class="w-16 h-16 mr-6 flex items-center justify-center bg-gradient-to-br from-teal-400 to-green-400 rounded-full">
                    <span class="text-3xl">{{ getDifficultyEmoji(level.value) }}</span>
                  </div>
                  <div>
                    <h3 class="font-black text-3xl text-teal-800">{{ getSwahiliDifficulty(level.label) }}</h3>
                    <p class="text-teal-600 mt-2 text-xl font-bold">{{ getSwahiliDescription(level.description) }}</p>
                    <div v-if="level.value !== 'beginner'" class="mt-3 text-lg text-blue-600 font-bold">
                      <span class="mr-2">ℹ️</span>
                      Unahitaji kupita mtihani mfupi
                    </div>
                  </div>
                </div>
                <div class="absolute -top-2 -right-2 text-yellow-400 text-3xl animate-spin">⭐</div>
              </div>
            </div>
            
            <div class="flex justify-between mt-12">
              <button @click="currentStep--" class="px-8 py-4 text-gray-600 hover:text-gray-800 flex items-center text-2xl font-bold bg-white/50 rounded-2xl hover:bg-white/80 transition-all">
                ← Rudi
              </button>
              <button 
                @click="currentStep++"
                class="px-12 py-6 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-2xl hover:from-teal-600 hover:to-green-600 transition-all transform hover:scale-110 shadow-2xl text-2xl font-black"
              >
                Endelea →
              </button>
            </div>
          </div>

          <!-- Step 4: Avatar Selection -->
          <div v-if="currentStep === 4" class="space-y-10">
            <div class="text-center">
              <div class="text-8xl mb-6 animate-bounce">🦸</div>
              <h2 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-4">
                Chagua Mhusika Wako
              </h2>
              <p class="text-2xl text-pink-700 font-bold mb-8">Chagua mhusika atakayekuwakilisha</p>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div 
                v-for="(avatar, index) in avatars"
                :key="avatar.id"
                @click="selectAvatar(avatar.id)"
                class="p-6 border-4 rounded-3xl cursor-pointer transition-all transform hover:scale-110 flex flex-col items-center relative overflow-hidden"
                :class="{
                  'border-pink-500 bg-gradient-to-br from-pink-100 to-purple-100 shadow-2xl': userStore.profile.avatar === avatar.id,
                  'border-gray-300 hover:border-pink-400 bg-white': userStore.profile.avatar !== avatar.id
                }"
                :style="{ 'animation-delay': index * 0.2 + 's' }"
              >
                <div class="w-20 h-20 mb-4 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-4xl">
                  {{ getAvatarEmoji(avatar.id) }}
                </div>
                <span class="text-2xl font-black text-pink-800">{{ avatar.name }}</span>
                <div class="absolute -top-2 -right-2 text-yellow-400 text-2xl animate-pulse">✨</div>
              </div>
            </div>
            
            <div class="flex justify-between mt-12">
              <button 
                @click="currentStep--"
                class="px-8 py-4 text-gray-600 hover:text-gray-800 flex items-center text-2xl font-bold bg-white/50 rounded-2xl hover:bg-white/80 transition-all"
              >
                ← Rudi
              </button>
              <button 
                @click="completeOnboarding"
                :disabled="isLoading"
                class="px-12 py-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-110 shadow-2xl text-2xl font-black flex items-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span v-if="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inamalizia...
                </span>
                <span v-else class="flex items-center">
                  Maliza Mpangilio
                  <span class="ml-3 text-3xl">🎉</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const currentStep = ref(1)
const selectedInterests = ref([])
const isLoading = ref(false)
const error = ref(null)

// Onboarding step data
const interestTags = ['kuona picha', 'kutazama video']
const signLanguages = ['Tanzanian Sign Language', 'Other']
const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting to learn' },
  { value: 'intermediate', label: 'Intermediate', description: 'Know some basics' },
  { value: 'advanced', label: 'Advanced', description: 'Ready for challenges' }
]

// ✅ Avatars now use emoji icons instead of image paths
const avatars = [
  { id: 1, name: 'Alex', emoji: '👦' },
  { id: 2, name: 'Sam', emoji: '👧' },
  { id: 3, name: 'Taylor', emoji: '🧒' },
  { id: 4, name: 'Jordan', emoji: '👶' }
]

// Translation + Emoji helpers
const getSwahiliInterest = (interest) => ({
  'Visual image': 'Kuona Picha',
  'video motion ': 'kutazama video',
 
})[interest] || interest

const getInterestEmoji = (interest) => ({
  'kuona picha': '🖼️',
  'kutazama video': '🎥',
})[interest] || '📝'

const getSwahiliSignLanguage = (lang) => ({
  'Tanzanian Sign Language': 'Lugha ya Alama ya Kitanzania',
  'Other': 'Nyingine'
})[lang] || lang

const getSignLanguageEmoji = (lang) => ({
  'Tanzanian Sign Language': '🇹🇿',
  'Other': '🌍'
})[lang] || '👋'

const getSwahiliDifficulty = (level) => ({
  'Beginner': 'Mwanzo',
  'Intermediate': 'Wastani',
  'Advanced': 'Juu'
})[level] || level

const getSwahiliDescription = (desc) => ({
  'Just starting to learn': 'Nimeanza tu kujifunza',
  'Know some basics': 'Najua misingi fulani',
  'Ready for challenges': 'Niko tayari kwa changamoto'
})[desc] || desc

const getDifficultyEmoji = (level) => ({
  'beginner': '🌱',
  'intermediate': '🌿',
  'advanced': '🌳'
})[level] || '🎯'

const getAvatarEmoji = (id) => ({
  1: '👦',
  2: '👧',
  3: '🧒',
  4: '👶'
})[id] || '😊'

// Select handlers
const selectStyle = (style) => userStore.profile.learningStyle = style

const toggleInterest = (tag) => {
  const index = selectedInterests.value.indexOf(tag)
  if (index > -1) selectedInterests.value.splice(index, 1)
  else selectedInterests.value.push(tag)
}

const selectSignLanguage = (lang) => userStore.profile.signLanguage = lang
const selectDifficulty = (level) => userStore.profile.difficultyPreference = level
const selectAvatar = (avatarId) => userStore.profile.avatar = avatarId

// Complete onboarding and handle enrollment/assessment
const completeOnboarding = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const personalizationData = {
      learningStyle: userStore.profile.learningStyle,
      interests: selectedInterests.value,
      difficultyPreference: userStore.profile.difficultyPreference,
      avatar: userStore.profile.avatar
    };

    // Logic split based on difficulty preference
    if (userStore.profile.difficultyPreference === 'beginner') {
      // For beginners: Use /student/personalize to save prefs AND enroll in one go
      console.log('Completing onboarding for beginner (auto-enroll)...');
      const response = await api.post('/student/personalize', personalizationData);
      
      // Update auth store with returned data
      if (response.data.data && response.data.data.student) {
        authStore.setUser(response.data.data.student);
      }
      
      userStore.profile.onboardingComplete = true;
      router.push('/courses');

    } else {
      // For intermediate/advanced: Just save prefs, do NOT enroll yet (must pass assessment)
      console.log('Completing onboarding for advanced level (assessment required)...');
      await api.post('/profile/onboarding', personalizationData);

      userStore.profile.onboardingComplete = true;

      // Redirect to appropriate assessment
      if (userStore.profile.difficultyPreference === 'intermediate') {
        router.push('/level-assessment/intermediate');
      } else {
        router.push('/level-assessment/advanced');
      }
    }

  } catch (err) {
    console.error('Onboarding completion error:', err);
    error.value = err.response?.data?.message || err.message || 'Something went wrong';
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
/* Custom animations for floating elements */
.floating-star {
  position: absolute;
  animation: float 6s ease-in-out infinite;
  z-index: 1;
}

.floating-cloud {
  position: absolute;
  animation: drift 8s ease-in-out infinite;
  z-index: 1;
}

.floating-balloon {
  position: absolute;
  animation: bounce 4s ease-in-out infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes drift {
  0%, 100% { transform: translateX(0px); }
  50% { transform: translateX(30px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-15px) scale(1.1); }
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-20deg); }
}

.animate-wave {
  animation: wave 2s ease-in-out infinite;
}

/* Focus styles for accessibility */
button:focus, [tabindex="0"]:focus {
  @apply outline-none ring-4 ring-yellow-400 ring-offset-2;
}

/* Gradient text animation */
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-clip-text {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>
