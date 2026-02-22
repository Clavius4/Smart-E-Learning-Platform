<template>
  <div class="min-h-screen bg-gray-50">
    <MainNav />
    
    <div class="container mx-auto px-4 py-8 max-w-md mt-20">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">Badili nenosiri</h1>
        </div>

        <div class="p-6">
          <form @submit.prevent="changePassword">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Neno siri lililopo</label>
                <input 
                  v-model="form.currentPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Neno siri jipya</label>
                <input 
                  v-model="form.newPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hakiki neno Siri</label>
                <input 
                  v-model="form.confirmPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
              </div>
            </div>

            <div class="mt-8 flex justify-end space-x-4">
              <router-link 
                to="/profile"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </router-link>
              <button 
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="loading"
              >
                <span v-if="!loading">Badili nenosiri</span>
                <span v-else>Changing...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MainNav from '@/components/navigation/MainNav.vue'

const authStore = useAuthStore()
const loading = ref(false)
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const changePassword = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('New passwords do not match')
    return
  }

  try {
    loading.value = true
    await authStore.changePassword({
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    })
    alert('Password changed successfully')
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    alert(error.message || 'Failed to change password')
  } finally {
    loading.value = false
  }
}
</script>