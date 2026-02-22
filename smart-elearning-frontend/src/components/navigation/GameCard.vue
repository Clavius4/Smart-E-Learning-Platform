<template>
  <div class="bg-yellow-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 font-[Cursova,sans-serif] border-4 border-pink-200">
    <div class="h-48 bg-pink-100 flex items-center justify-center rounded-t-2xl">
      <span class="text-5xl">🎮</span> <!-- You can swap with game image -->
    </div>
    <div class="p-4 text-purple-800">
      <h3 class="font-bold text-xl mb-2 text-center">{{ game.title }}</h3>
      <div class="flex justify-between text-sm text-purple-700 mb-3 px-2">
        <span>Darasa la {{ game.grade }}</span>
        <span>{{ game.subject }}</span>
      </div>
      <button class="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-full font-bold tracking-wide transition-all duration-300">
        Cheza Sasa
      </button>
    </div>
  </div>
</template>

  
  <script>
  export default {
    props: {
      game: {
        type: Object,
        required: true
      }
    }
  }
  </script>

  