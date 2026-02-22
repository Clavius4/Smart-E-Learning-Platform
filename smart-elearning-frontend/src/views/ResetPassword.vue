<template>
  <div class="auth-page bg-gradient-to-b from-orange-50 to-red-50">
    <MainNav />
    <div class="container mx-auto px-4 py-8 max-w-md mt-20">
      <div class="flex flex-col items-center mb-8">
        <h1 class="text-3xl font-bold text-center text-orange-800 mb-2">RESET PASSWORD</h1>
        <p class="text-center text-gray-600">Enter your new password below</p>
      </div>

      <div class="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
        <form @submit.prevent="resetPassword">
          <div class="mb-6">
            <label class="block text-gray-700 mb-2">New Password</label>
            <input 
              v-model="password"
              type="password" 
              class="w-full px-4 py-3 border-2 border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              required
            >
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 mb-2">Confirm New Password</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              class="w-full px-4 py-3 border-2 border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              required
            >
          </div>

          <button 
            type="submit"
            class="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all mb-6"
            :disabled="loading"
          >
            <span v-if="!loading">RESET PASSWORD</span>
            <span v-else>Processing...</span>
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
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainNav from '@/components/navigation/MainNav.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const token = ref(route.query.token || '')

const resetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match');
    return;
  }

  try {
    loading.value = true;
    const response = await authStore.resetPassword({
      token: token.value,
      newPassword: password.value,
      confirmPassword: confirmPassword.value
    });

    if (response.success) {
      alert('Password reset successfully');
      router.push('/login');
    } else {
      alert(response.message || 'Password reset failed');
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  } finally {
    loading.value = false;
  }
}
</script>