<template>
  <div class="min-h-screen bg-gray-50">
    <MainNav />
    
    <div class="container mx-auto px-4 py-8 max-w-4xl mt-20">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">Edit Profile</h1>
        </div>

        <div class="p-6">
          <form @submit.prevent="updateProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  v-model="form.firstName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  v-model="form.lastName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <input 
                  type="file"
                  @change="handleImageUpload"
                  accept="image/*"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <div v-if="imagePreview" class="mt-2">
                  <img :src="imagePreview" class="h-24 w-24 rounded-full object-cover">
                </div>
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
                <span v-if="!loading">Save Changes</span>
                <span v-else>Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MainNav from '@/components/navigation/MainNav.vue'

const authStore = useAuthStore()
const loading = ref(false)
const imagePreview = ref(null)
const form = ref({
  firstName: '',
  lastName: '',
  image: null
})

onMounted(() => {
  if (authStore.user) {
    form.value.firstName = authStore.user.firstName
    form.value.lastName = authStore.user.lastName
    imagePreview.value = authStore.user.image
  }
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updateProfile = async () => {
  try {
    loading.value = true
    
    const formData = new FormData()
    formData.append('firstName', form.value.firstName)
    formData.append('lastName', form.value.lastName)
    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    await authStore.updateProfile(formData)
    alert('Profile updated successfully')
  } catch (error) {
    alert(error.message || 'Failed to update profile')
  } finally {
    loading.value = false
  }
}
</script>