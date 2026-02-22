<!-- components/ActivityTracker.vue -->
<script setup>
import { useUserStore } from '@/stores/userStore'
import { watch } from 'vue'

const userStore = useUserStore()

watch(
  () => userStore.profile.completedActivities,
  (newVal) => {
    console.log('Updated recommendations based on new activities')
    // Add your recommendation logic here
  },
  { deep: true }
)
</script>

<template></template>