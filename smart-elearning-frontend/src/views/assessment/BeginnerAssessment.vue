<script setup>
import { BookText, Image as ImageIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const interests = ref(['Animals', 'Science', 'Math', 'Art', 'Stories'])

const selectlearningStyle = (style) => {
  userStore.updatelearningStyle(style)
}

const toggleInterest = (interest) => {
  const current = userStore.profile.interests
  if (current.includes(interest)) {
    userStore.profile.interests = current.filter(i => i !== interest)
  } else {
    userStore.profile.interests.push(interest)
  }
}

const savePreferences = () => {
  // Add logic to save and proceed
}
</script>

<template>
  <div class="assessment-container p-4 max-w-xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold">Let's personalize your learning!</h2>

    <div class="assessment-section space-y-2">
      <h3 class="text-lg font-semibold">How do you prefer to learn?</h3>
      <div class="flex gap-4">
        <button
          @click="selectlearningStyle('visual')"
          class="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-100"
        >
          <ImageIcon class="w-5 h-5" />
          Visual (Pictures & Videos)
        </button>

        <button
          @click="selectlearningStyle('text')"
          class="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-100"
        >
          <BookText class="w-5 h-5" />
          Text (Reading & Writing)
        </button>
      </div>
    </div>

    <div class="assessment-section space-y-2">
      <h3 class="text-lg font-semibold">What are you interested in?</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="interest in interests"
          :key="interest"
          @click="toggleInterest(interest)"
          :class="[
            'cursor-pointer px-3 py-1 rounded border',
            userStore.profile.interests.includes(interest)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          ]"
        >
          {{ interest }}
        </span>
      </div>
    </div>

    <button
      @click="savePreferences"
      class="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
    >
      Start Learning!
    </button>
  </div>
</template>
