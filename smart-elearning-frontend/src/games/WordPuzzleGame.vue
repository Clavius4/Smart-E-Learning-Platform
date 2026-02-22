<template>
    <div class="game-container">
      <canvas ref="gameCanvas" width="800" height="600"></canvas>
      <div class="game-controls">
        <button @click="checkAnswer">Check</button>
        <button @click="hint">Hint</button>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from 'vue'
  
  export default {
    setup() {
      const gameCanvas = ref(null)
      const ctx = ref(null)
      
      // Game state
      const words = ['elephant', 'giraffe', 'lion', 'zebra']
      const currentWord = ref('')
      const scrambledWord = ref('')
      const selectedLetters = ref([])
      
      onMounted(() => {
        ctx.value = gameCanvas.value.getContext('2d')
        startNewGame()
      })
      
      const startNewGame = () => {
        currentWord.value = words[Math.floor(Math.random() * words.length)]
        scrambledWord.value = scrambleWord(currentWord.value)
        drawGame()
      }
      
      const scrambleWord = (word) => {
        return word.split('').sort(() => 0.5 - Math.random()).join('')
      }
      
      const drawGame = () => {
        // Draw game elements on canvas
      }
      
      const checkAnswer = () => {
        // Validate answer
      }
      
      const hint = () => {
        // Show hint
      }
      
      return { gameCanvas, startNewGame, checkAnswer, hint }
    }
  }
  </script>