<template>
  <div class="relative" ref="dropdownRef">
    <button @click="toggleDropdown" class="flex items-center space-x-2 focus:outline-none">
      <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
        <img 
          :src="user?.image || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.firstName" 
          alt="Profile"
          class="w-full h-full object-cover"
        >
      </div>
      <span class="font-medium">{{ user?.firstName }}</span>
    </button>
    
    <div 
      v-if="dropdownOpen" 
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
    >
      <slot>
        <router-link 
          to="/profile" 
          class="block px-4 py-2 text-gray-800 hover:bg-blue-50"
          @click="dropdownOpen = false"
        >
          My Profile
        </router-link>
        <router-link 
          to="/settings" 
          class="block px-4 py-2 text-gray-800 hover:bg-blue-50"
          @click="dropdownOpen = false"
        >
          Settings
        </router-link>
        <button 
          @click="logout"
          class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50"
        >
          Logout
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { onClickOutside } from '@vueuse/core'

const authStore = useAuthStore()
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const user = computed(() => authStore.user)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const logout = async () => {
  await authStore.logout()
  dropdownOpen.value = false
}

onClickOutside(dropdownRef, () => {
  dropdownOpen.value = false
})
</script>