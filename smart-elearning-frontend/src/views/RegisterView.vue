<template>
  <div class="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Floating Clouds -->
      <div
        v-for="(cloud, index) in cloudPositions"
        :key="'cloud-' + index"
        class="absolute text-6xl animate-bounce"
        :style="{
          left: cloud.x + '%',
          top: cloud.y + '%',
          animationDelay: (index * 0.5) + 's',
          animationDuration: '3s'
        }"
      >
        ☁️
      </div>
      
      <!-- Rainbow -->
    
      <!-- Stars -->
      <div class="absolute top-20 left-20 text-4xl animate-spin" style="animation-duration: 4s;">
        ⭐
      </div>
      <div class="absolute bottom-20 right-20 text-5xl animate-spin" style="animation-duration: 6s;">
        ✨
      </div>
      <div class="absolute top-1/2 left-10 text-4xl animate-bounce" style="animation-delay: 1s;">
        🌟
      </div>
      
      <!-- Sun -->
      <div class="absolute top-5 left-1/2 text-7xl animate-spin" style="animation-duration: 8s;">
        ☀️
      </div>
      
      <!-- Balloons -->
      <div class="absolute bottom-10 left-10 text-6xl animate-bounce" style="animation-delay: 0.5s;">
        🎈
      </div>
      <div class="absolute bottom-32 right-32 text-5xl animate-bounce" style="animation-delay: 1.5s;">
        🎈
      </div>
      
      <!-- Butterflies -->
      <div class="absolute top-1/3 right-1/4 text-5xl animate-pulse">
        🦋
      </div>
      <div class="absolute bottom-1/3 left-1/3 text-4xl animate-pulse" style="animation-delay: 2s;">
        🦋
      </div>
    </div>

    <!-- Toast Message -->
    <div 
      v-if="toast.show" 
      :class="toastClass" 
      class="fixed top-6 right-6 px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center transition-all duration-300 text-xl font-bold"
    >
      <span class="text-2xl mr-3">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
      <span>{{ toast.message }}</span>
    </div>

    <div class="container mx-auto px-6 py-8 max-w-2xl relative z-10">
      <!-- Header -->
      <div class="flex flex-col items-center mb-12">
        <div class="text-9xl mb-6 animate-bounce">
          🏫
        </div>
        <h1 class="text-6xl font-black text-center text-white mb-4 drop-shadow-lg" style="text-shadow: 4px 4px 8px rgba(0,0,0,0.3);">
          Unda Akaunti
        </h1>
        <div class="flex space-x-4 text-5xl">
          <span class="animate-bounce" style="animation-delay: 0s;">🎨</span>
          <span class="animate-bounce" style="animation-delay: 0.2s;">📚</span>
          <span class="animate-bounce" style="animation-delay: 0.4s;">🖍️</span>
          <span class="animate-bounce" style="animation-delay: 0.6s;">✏️</span>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border-8 border-yellow-300">
        <div @submit.prevent="handleRegister">
          <div class="mb-8">
            <label class="block text-purple-800 mb-4 font-black text-2xl flex items-center">
              <span class="text-4xl mr-4">👤</span> Jina la Kwanza
            </label>
            <input 
              v-model="form.firstName"
              type="text" 
              class="w-full px-6 py-5 border-4 border-blue-300 rounded-2xl text-2xl font-bold focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all" 
              placeholder="Jina lako la kwanza" 
              required
            />
          </div>

          <div class="mb-8">
            <label class="block text-purple-800 mb-4 font-black text-2xl flex items-center">
              <span class="text-4xl mr-4">👤</span> Jina la Mwisho
            </label>
            <input 
              v-model="form.lastName"
              type="text" 
              class="w-full px-6 py-5 border-4 border-blue-300 rounded-2xl text-2xl font-bold focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all" 
              placeholder="Jina lako la mwisho" 
              required
            />
          </div>

          <div class="mb-8">
            <label class="block text-purple-800 mb-4 font-black text-2xl flex items-center">
              <span class="text-4xl mr-4">📧</span> Barua Pepe
            </label>
            <input 
              v-model="form.email"
              type="email" 
              class="w-full px-6 py-5 border-4 border-blue-300 rounded-2xl text-2xl font-bold focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all" 
              placeholder="barua@pepe.com" 
              required
            />
          </div>

          <div class="mb-8">
            <label class="block text-purple-800 mb-4 font-black text-2xl flex items-center">
              <span class="text-4xl mr-4">🔐</span> Unda Nywila
            </label>
            <input 
              v-model="form.password"
              type="password" 
              class="w-full px-6 py-5 border-4 border-blue-300 rounded-2xl text-2xl font-bold focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all" 
              placeholder="••••••••" 
              required
            />
          </div>

          <div class="mb-10">
            <label class="block text-purple-800 mb-4 font-black text-2xl flex items-center">
              <span class="text-4xl mr-4">🔐</span> Hakikisha Nywila
            </label>
            <input 
              v-model="form.confirmPassword"
              type="password" 
              class="w-full px-6 py-5 border-4 border-blue-300 rounded-2xl text-2xl font-bold focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all" 
              placeholder="••••••••" 
              required
            />
          </div>

          <div class="mb-10">
            <label class="block text-purple-800 mb-4 font-black text-2xl flex items-center">
              <span class="text-4xl mr-4">📚</span> Kiwango cha Kujifunza
            </label>
            <select 
              v-model="form.desiredLevel"
              class="w-full px-6 py-5 border-4 border-blue-300 rounded-2xl text-2xl font-bold focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all bg-white" 
              required
            >
              <option value="">Chagua kiwango...</option>
              <option value="beginner">🌱 Mwanzo (Beginner)</option>
              <option value="intermediate">🌿 Kati (Intermediate)</option>
              <option value="advanced">🌳 Kaskazi (Advanced)</option>
            </select>
          </div>

          <button
            type="submit"
            @click="handleRegister"
            class="w-full bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 text-white py-6 rounded-2xl font-black text-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex justify-center items-center transform hover:scale-105 border-4 border-white"
            :disabled="loading"
          >
            <span v-if="!loading" class="flex items-center">
              <span class="text-4xl mr-4">🎉</span>
              UNDA AKAUNTI
              <span class="text-4xl ml-4">🎉</span>
            </span>
            <span v-else class="flex items-center space-x-4">
              <div class="animate-spin text-4xl">⭐</div>
              <span class="text-2xl">Inaunda...</span>
              <div class="animate-spin text-4xl">⭐</div>
            </span>
          </button>
        </div>

        <div 
          v-if="errorMessage" 
          class="text-red-600 text-xl font-bold mt-6 p-4 bg-red-100 rounded-2xl border-4 border-red-300 flex items-center"
        >
          <span class="text-3xl mr-4">⚠️</span>
          {{ errorMessage }}
        </div>
      </div>

      <div class="text-center mt-8">
        <p class="text-white text-2xl font-black mb-3 drop-shadow-lg">Una akaunti tayari?</p>
        <router-link 
          to="/login" 
          class="text-yellow-300 hover:text-yellow-100 font-black text-2xl underline transform hover:scale-110 transition-all duration-200 drop-shadow-lg"
        >
          <span class="text-3xl mr-2">👈</span>
          Ingia hapa
          <span class="text-3xl ml-2">🚪</span>
        </router-link>
      </div>
    </div>

    <!-- Bottom decorative elements -->
    <div class="absolute bottom-0 left-0 right-0 flex justify-center space-x-8 pb-4">
      <div class="text-6xl animate-bounce" style="animation-delay: 0s;">🌺</div>
      <div class="text-6xl animate-bounce" style="animation-delay: 0.3s;">🌻</div>
      <div class="text-6xl animate-bounce" style="animation-delay: 0.6s;">🌷</div>
      <div class="text-6xl animate-bounce" style="animation-delay: 0.9s;">🌹</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  desiredLevel: 'beginner'
})

const loading = ref(false)
const errorMessage = ref('')

// Toast state
const toast = reactive({
  show: false,
  message: '',
  type: '' // 'success' | 'error'
})

// Floating animation states
const cloudPositions = ref([
  { x: 10, y: 20, speed: 0.5 },
  { x: 70, y: 10, speed: 0.3 },
  { x: 40, y: 80, speed: 0.4 }
])

let animationInterval = null

const toastClass = computed(() => {
  return toast.type === 'success'
    ? 'bg-green-200 text-green-800 border-4 border-green-400'
    : 'bg-red-200 text-red-800 border-4 border-red-400'
})

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const handleRegister = async () => {
  errorMessage.value = '';
  
  console.log('Registration form data:', {
    ...form,
    password: '***',
    confirmPassword: '***'
  });

  // Client-side validation
  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Nywila hazifanani.';
    return;
  }

  if (form.password.length < 8) {
    errorMessage.value = 'Nywila lazima iwe na angalau herufi 8.';
    return;
  }

  loading.value = true;

  try {
    const response = await authStore.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      desiredLevel: form.desiredLevel
    });

    if (response.success) {
      showToast(response.message || 'Akaunti imeundwa kwa mafanikio!', 'success');
      // Redirect with email as query parameter
      router.push({
        path: '/verify-otp',
        query: { email: form.email }
      });
    } else {
      errorMessage.value = response.message;
      showToast(response.message, 'error');
    }
  } catch (err) {
    errorMessage.value = err.message || 'Kuna hitilafu imetokea';
    showToast(errorMessage.value, 'error');
  } finally {
    loading.value = false;
  }
}

// Animate floating elements
onMounted(() => {
  animationInterval = setInterval(() => {
    cloudPositions.value = cloudPositions.value.map(cloud => ({
      ...cloud,
      x: (cloud.x + cloud.speed) % 100
    }));
  }, 100);
});

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval);
  }
});
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding-top: 2rem;
}
</style>