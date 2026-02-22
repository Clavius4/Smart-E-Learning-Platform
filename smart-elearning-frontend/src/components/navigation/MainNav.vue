<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-2xl font-kid">
    <div class="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
      <!-- Logo -->
      <router-link to="/" class="text-3xl md:text-4xl font-black tracking-wide transform hover:scale-105 transition-transform duration-300 text-yellow-300 drop-shadow-lg">
        🎓 e-Smart Kids
      </router-link>

      <!-- Hamburger for mobile -->
      <button
        @click="mobileOpen = !mobileOpen"
        class="md:hidden text-yellow-300 text-3xl focus:outline-none"
      >
        <span v-if="!mobileOpen">☰</span>
        <span v-else>✖</span>
      </button>

      <!-- Desktop Nav Links -->
      <div class="hidden md:flex space-x-6 xl:space-x-8 items-center text-base xl:text-xl">
        <router-link to="/dashboard" class="nav-link">📊 Dashibodi</router-link>
        <router-link to="/courses" class="nav-link">📚 Kozi za Kujifunza</router-link>
        <router-link to="/games" class="nav-link">🎮 Michezo Yote</router-link>
        <router-link to="/help" class="nav-link">🆘 Msaada</router-link>

        <!-- Level Badge -->
        <LevelBadge v-if="isAuthenticated" />

        <!-- Learning Style Switcher -->
        <LearningStyleSwitcher v-if="isAuthenticated" />

        <div class="relative" v-if="isAuthenticated" ref="dropdownRef">
          <!-- Profile Button -->
          <button @click="toggleDropdown" class="flex items-center space-x-2 profile-btn">
            <div class="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img 
                :src="user?.image || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.firstName" 
                alt="Profile"
                class="w-full h-full object-cover"
              >
            </div>
            <span class="font-black text-lg xl:text-xl text-yellow-300 drop-shadow-md">{{ user?.firstName }}</span>
            <div class="text-yellow-300 transition-transform duration-300" :class="{ 'rotate-180': dropdownOpen }">
              ⬇️
            </div>
          </button>

          <!-- Dropdown -->
          <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl py-3 z-50 text-sm xl:text-base text-gray-800 font-kid border-4 border-blue-200">
            <router-link to="/profile" class="dropdown-item" @click="dropdownOpen = false">
              👤 Wasifu Wangu
            </router-link>
            <button @click="logout" class="dropdown-item text-red-600 hover:bg-red-100">
              🚪 Toka
            </button>
          </div>
        </div>

        <!-- Login button -->
        <router-link
          v-else
          to="/login"
          class="login-btn"
        >
          🔑 Ingia
        </router-link>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileOpen" class="md:hidden bg-blue-600 text-white px-4 py-4 space-y-4 text-lg font-bold">
      <router-link to="/dashboard" class="block nav-link" @click="mobileOpen = false">📊 Dashibodi</router-link>
      <router-link to="/courses" class="block nav-link" @click="mobileOpen = false">📚 Kozi za Kujifunza</router-link>
      <router-link to="/games" class="block nav-link" @click="mobileOpen = false">🎮 Michezo Yote</router-link>
      <router-link to="/help" class="block nav-link" @click="mobileOpen = false">🆘 Msaada</router-link>
      
      <div v-if="isAuthenticated" class="space-y-2">
        <router-link to="/profile" class="block dropdown-item" @click="mobileOpen = false">👤 Wasifu Wangu</router-link>
        <button @click="logout" class="block w-full text-left dropdown-item text-red-600 hover:bg-red-100">
          🚪 Toka
        </button>
      </div>
      <router-link v-else to="/login" class="block login-btn" @click="mobileOpen = false">🔑 Ingia</router-link>
    </div>
  </nav>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { onClickOutside } from '@vueuse/core'
import LevelBadge from '@/components/LevelBadge.vue'
import LearningStyleSwitcher from '@/components/LearningStyleSwitcher.vue'

const authStore = useAuthStore()
const dropdownOpen = ref(false)
const mobileOpen = ref(false)
const dropdownRef = ref(null)

const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  dropdownOpen.value = false
})

const logout = async () => {
  await authStore.logout()
  dropdownOpen.value = false
  mobileOpen.value = false
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Nunito:wght@700;800;900&display=swap');

.font-kid {
  font-family: 'Nunito', 'Comic Neue', cursive;
  font-weight: 800;
}

/* Enhanced Premium Button - Blue theme with bouncy animation */
.premium-btn {
  position: relative;
  width: 200px;
  height: 56px;
  border-radius: 9999px;
  border: none;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  color: #1e3a8a;
  font-weight: 900;
  font-size: 16px;
  font-family: 'Nunito', cursive;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2),
              inset 0 -4px 0 #d97706,
              0 0 0 4px rgba(59, 130, 246, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.premium-btn:hover {
  animation: bounce-jello 0.8s both;
  background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3),
              inset 0 -4px 0 #d97706,
              0 0 0 6px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

/* Navigation links with playful hover effects */
.nav-link {
  position: relative;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 2px;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 100%;
}

/* Profile button styling */
.profile-btn {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Dropdown items with enhanced styling */
.dropdown-item {
  border-radius: 12px;
  margin: 2px 8px;
  text-shadow: none;
}

.dropdown-item:hover {
  transform: translateX(4px);
}

/* Login button styling */
.login-btn {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 2px solid transparent;
}

.login-btn:hover {
  border-color: #fbbf24;
}

/* Enhanced bounce animation */
@keyframes bounce-jello {
  0% { 
    transform: scale3d(1, 1, 1) translateY(0); 
  }
  20% { 
    transform: scale3d(1.1, 0.9, 1) translateY(-8px); 
  }
  40% { 
    transform: scale3d(0.9, 1.1, 1) translateY(-4px); 
  }
  60% { 
    transform: scale3d(1.05, 0.95, 1) translateY(-2px); 
  }
  80% { 
    transform: scale3d(0.98, 1.02, 1) translateY(-1px); 
  }
  100% { 
    transform: scale3d(1, 1, 1) translateY(0); 
  }
}

/* Add some floating animation for extra playfulness */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.premium-btn {
  animation: float 3s ease-in-out infinite;
}
</style>