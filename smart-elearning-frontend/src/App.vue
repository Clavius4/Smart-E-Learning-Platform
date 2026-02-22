<template>
  <div id="app">
    <AppLoader :isLoading="isLoading"/>
    <router-view v-if="!isLoading"/>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLoader from '@/components/common/AppLoader.vue'

const router = useRouter()
const isLoading = ref(true)

// Check if onboarding is needed
onMounted(() => {
  setTimeout(async () => {
    if (!localStorage.getItem('learningProfile')) {
      // await router.push('/onboarding')
    } else if (router.currentRoute.value.path === '/') {
      // Redirect to default route if at root
      await router.push('/')
    }
    isLoading.value = false
  }, 2000)
})
</script>

<style>
html {
  scroll-behavior: smooth;
}

button:focus, a:focus {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}
</style>