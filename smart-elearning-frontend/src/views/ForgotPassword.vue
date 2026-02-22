<template>
  <div class="auth-page bg-gradient-to-b from-orange-50 to-red-50">
    <MainNav />
    <div class="container mx-auto px-4 py-8 max-w-md mt-20">
      <div class="flex flex-col items-center mb-8">
        <h1 class="text-3xl font-bold text-center text-orange-800 mb-2">FORGOT PASSWORD</h1>
        <p class="text-center text-gray-600">Enter your email to receive a reset link</p>
      </div>

      <div class="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
        <form @submit.prevent="sendResetLink">
          <div class="mb-6">
            <label class="block text-gray-700 mb-2">Email Address</label>
            <input 
              v-model="email"
              type="email" 
              class="w-full px-4 py-3 border-2 border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              required
            >
          </div>

          <button 
            type="submit"
            class="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all mb-6"
            :disabled="loading"
          >
            <span v-if="!loading">SEND RESET LINK</span>
            <span v-else>Sending...</span>
          </button>
        </form>

        <div class="text-center">
          <router-link to="/login" class="text-orange-600 hover:underline font-medium">
            Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainNav from '@/components/navigation/MainNav.vue'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const loading = ref(false)

const sendResetLink = async () => {
  try {
    loading.value = true;
    const response = await authStore.forgotPassword(email.value);
    
    if (response.success) {
      alert('Reset link sent successfully');
      router.push('/login');
    } else {
      alert(response.message || 'Failed to send reset link');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  } finally {
    loading.value = false;
  }
}
</script>