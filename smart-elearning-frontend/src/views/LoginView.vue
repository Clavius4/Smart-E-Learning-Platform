<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form fields
const email = ref('123456')
const password = ref('')

// Error message
const errorMessage = ref('')

// Loading state
const loading = ref(false)

// Password visibility toggle
const showPassword = ref(false)

async function submitLogin() {
  errorMessage.value = '';
  loading.value = true;

  console.log('Login form data:', {
    email: email.value,
    password: '***' // Mask password in logs
  });

  try {
    const response = await authStore.login({
      email: email.value.trim(),
      password: password.value
    });

    if (response.success) {
      // Check if user has completed onboarding
      const user = response.data.user;
      if (user && !user.onboardingComplete) {
        console.log('User has not completed onboarding, redirecting...');
        router.push('/onboarding');
      } else {
        router.push('/courses');
      }
    } else {
      errorMessage.value = response.message;
    }
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    loading.value = false;
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <div class="auth-page min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="container mx-auto px-6 py-12 max-w-lg">
      <!-- Header Section -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div class="text-white text-3xl font-bold">L</div>
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-3 tracking-tight">
          fikia akaunti yako mtoto
        </h1>
        <p class="text-lg text-gray-600 font-medium">Salama kuingia kwa watumiaji wote</p>
      </div>

      <!-- Main Login Card -->
      <div class="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
        <div class="p-10">
          <!-- Email Input Section -->
          <div class="mb-8">
            <label class="block text-gray-700 mb-3 font-semibold text-lg flex items-center">
              <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                <div class="text-white text-sm">@</div>
              </div>
              barua pepe
            </label>
            <div class="relative group">
              <input 
                v-model="email"
                type="text" 
                class="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
                placeholder="Ingiza barua pepe yako"
              >
              <div class="absolute right-4 top-4 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors duration-200" title="Enter your registered email">
                <div class="text-blue-600 text-sm font-bold">?</div>
              </div>
            </div>
          </div>

          <!-- Password Input Section -->
          <div class="mb-8">
            <label class="block text-gray-700 mb-3 font-semibold text-lg flex items-center">
              <div class="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
                <div class="text-white text-sm">🔒</div>
              </div>
              nenosiri
            </label>
            <div class="relative group">
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
                placeholder="Ingiza nenosiri lako"
              >
              <button 
                @click="togglePasswordVisibility"
                type="button"
                class="absolute right-4 top-4 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-200"
              >
                <div class="text-gray-600 text-sm">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</div>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl">
            <p class="text-red-700 font-medium text-center">{{ errorMessage }}</p>
          </div>

          <!-- Login Button -->
          <button 
            @click="submitLogin" 
            :disabled="loading || !email || !password"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8 flex items-center justify-center transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <div class="w-6 h-6 bg-white/20 rounded-full mr-3 flex items-center justify-center">
              <div v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <div v-else class="text-white text-sm">→</div>
            </div>
            <span v-if="loading">Kuingia...</span>
            <span v-else> KUINGIA</span>
          </button>

          <!-- Forgot Password Link -->
          <div class="text-center mb-8">
            <router-link 
              to="/forgot-password" 
              class="text-blue-600 hover:text-blue-800 font-semibold text-lg flex items-center justify-center group transition-colors duration-200"
            >
              <div class="w-5 h-5 bg-blue-100 rounded-full mr-2 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <div class="text-blue-600 text-xs">?</div>
              </div>
              Umesahau nenosiri lako?
            </router-link>
          </div>

          <!-- Divider -->
          <div class="flex items-center mb-8">
            <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span class="px-6 text-gray-500 font-medium bg-white">au</span>
            <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          <!-- Sign Up Section -->
          <div class="text-center">
            <p class="mb-6 text-gray-600 text-lg">Mpya kwa jukwaa letu?</p>
            <router-link 
              to="/register" 
              class="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div class="w-6 h-6 bg-white/20 rounded-full mr-3 flex items-center justify-center">
                <div class="text-white text-sm">+</div>
              </div>
              TENGENEZA AKAUNTI
            </router-link>
          </div>
        </div>
      </div>

      <!-- Premium Benefits Card -->
      <!-- <div class="mt-12 bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
        <div class="p-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mb-4 shadow-md">
              <div class="text-white text-xl">★</div>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Premium Benefits</h2>
            <p class="text-gray-600">Unlock the full learning experience</p>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
              <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mr-4 flex items-center justify-center flex-shrink-0">
                <div class="text-white text-sm">✓</div>
              </div>
              <router-link to="/premium" class="text-blue-700 hover:text-blue-900 font-semibold text-lg flex-1">
                Access to all educational content
              </router-link>
            </div>
            
            <div class="flex items-center p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl mr-4 flex items-center justify-center flex-shrink-0">
                <div class="text-white text-sm">✓</div>
              </div>
              <router-link to="/premium" class="text-blue-700 hover:text-blue-900 font-semibold text-lg flex-1">
                Ad-free learning environment
              </router-link>
            </div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
/* Enhanced focus states for accessibility */
input:focus {
  transform: translateY(-1px);
}

button:focus {
  outline: 3px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s ease;
}

/* Custom animation for loading spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Enhanced hover effects for cards */
.auth-page .bg-white:hover {
  transform: translateY(-2px);
}

/* Gradient text effect for headings */
h1 {
  background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #1e40af, #1e3a8a);
}

/* Input field enhancements */
input::placeholder {
  color: #9ca3af;
  opacity: 1;
}

input:hover {
  border-color: #93c5fd;
}

/* Button ripple effect simulation */
button:active {
  transform: scale(0.98);
}

/* Enhanced shadow effects */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.hover\:shadow-2xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .p-10 {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>
