<!-- components/VideoPlayer.vue -->
<template>
<div class="bg-black rounded-lg overflow-hidden mb-6 aspect-video">
  <video
    v-if="currentLesson.videoUrl"
    controls
    class="w-full h-full"
    crossorigin="anonymous" 
  >
    <source :src="currentLesson.videoUrl" type="video/mp4">
    <source :src="currentLesson.videoUrl" type="video/webm">
    <source :src="currentLesson.videoUrl" type="video/x-matroska"> <!-- For MKV -->
    Your browser does not support the video tag.
  </video>
  <div v-else class="flex items-center justify-center h-full text-white">
    Video content not available
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  videoUrl: String,
  autoplay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['play', 'ended', 'timeupdate'])
const videoElement = ref(null)

const onPlay = () => {
  emit('play')
}

const onEnded = () => {
  emit('ended')
}

const onTimeUpdate = () => {
  emit('timeupdate', videoElement.value.currentTime)
}

onMounted(() => {
  const video = videoElement.value
  if (video) {
    video.addEventListener('timeupdate', onTimeUpdate)
    if (props.autoplay) {
      video.play().catch(e => console.log('Autoplay prevented:', e))
    }
  }
})

onBeforeUnmount(() => {
  const video = videoElement.value
  if (video) {
    video.removeEventListener('timeupdate', onTimeUpdate)
    video.pause()
    video.currentTime = 0
  }
})

watch(() => props.videoUrl, (newUrl) => {
  if (newUrl && videoElement.value) {
    videoElement.value.load()
  }
})
</script>

<style scoped>
.video-player-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #000;
}

.video-player-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>