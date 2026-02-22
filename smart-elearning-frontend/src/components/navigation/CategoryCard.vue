<template>
  <div 
    class="category-card rounded-[2rem] shadow-2xl transform hover:scale-105 transition-all duration-500 overflow-hidden border-4 border-blue-300 hover:border-blue-400"
  >
    <div 
      class="h-48 flex flex-col items-center justify-center p-6 text-white font-cursive relative"
      style="background: linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)"
    >
      <!-- Interactive Animated Element instead of emoji -->
      <div class="interactive-icon mb-4 hover:scale-110 transition-transform duration-300 cursor-pointer">
        <div 
          class="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-slow"
          :class="getInteractiveIconClass(category.name)"
          @click="playInteraction"
        >
          <div class="text-4xl font-bold">{{ getInteractiveSymbol(category.name) }}</div>
        </div>
      </div>
      
      <h3 class="text-3xl font-bold text-center drop-shadow-lg tracking-wide">
        {{ getSwahiliLabel(category.name) }}
      </h3>
      
      <!-- Interactive Badge -->
      <div class="interactive-badge mt-2 px-4 py-1 bg-blue-200 bg-opacity-30 rounded-full backdrop-blur-sm">
        <span class="text-sm font-semibold">{{ getInteractiveBadge(category.name) }}</span>
      </div>
    </div>
    
    <div class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 font-cursive relative">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="w-full h-full" style="background-image: radial-gradient(circle at 20% 50%, #3b82f6 2px, transparent 2px), radial-gradient(circle at 80% 50%, #60a5fa 2px, transparent 2px); background-size: 30px 30px;"></div>
      </div>
      
      <p class="text-lg text-blue-800 mb-6 font-bold relative z-10 leading-relaxed">
        {{ getSwahiliDescription(category.name) }}
      </p>
      
      <router-link 
        :to="`/games?category=${category.name.toLowerCase()}`"
        class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 relative z-10"
      >
        Tuanze Kucheza!
        <div class="ml-3 w-6 h-6 rounded-full bg-blue-200 bg-opacity-30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    category: {
      type: Object,
      required: true,
      validator: (value) => {
        return ['id', 'name', 'icon', 'color'].every(key => key in value)
      }
    }
  },
  methods: {
    getSwahiliLabel(name) {
      const swahiliLabels = {
        'Math': 'Hesabu',
        'Language': 'Lugha',
        'Science': 'Sayansi',
        'Life Skills': 'Ujuzi wa Maisha',
        'Sign Language': 'Lugha ya Alama'
      }
      return swahiliLabels[name] || name
    },
    
    getSwahiliDescription(name) {
      const descriptions = {
        'Math': 'Kujifunza hesabu kwa furaha na michezo',
        'Language': 'Kujenga ujuzi wa kusoma na kuandika',
        'Science': 'Kugundua ulimwengu unaotuzunguka',
        'Life Skills': 'Kujifunza shughuli za kila siku',
        'Sign Language': 'Mazoezi ya mazungumzo kwa alama'
      }
      return descriptions[name] || 'Chunguza michezo ya kujifunza'
    },
    
    getInteractiveSymbol(name) {
      const symbols = {
        'Math': '∑',
        'Language': 'Aa',
        'Science': '⚡',
        'Life Skills': '⚙',
        'Sign Language': '✋'
      }
      return symbols[name] || '★'
    },
    
    getInteractiveIconClass(name) {
      const classes = {
        'Math': 'bg-blue-400 hover:bg-blue-300',
        'Language': 'bg-blue-500 hover:bg-blue-400',
        'Science': 'bg-blue-600 hover:bg-blue-500',
        'Life Skills': 'bg-blue-700 hover:bg-blue-600',
        'Sign Language': 'bg-blue-800 hover:bg-blue-700'
      }
      return classes[name] || 'bg-blue-500 hover:bg-blue-400'
    },
    
    getInteractiveBadge(name) {
      const badges = {
        'Math': 'Hesabu Rahisi',
        'Language': 'Lugha Nzuri',
        'Science': 'Utafiti Mzuri',
        'Life Skills': 'Maisha Bora',
        'Sign Language': 'Alama Nzuri'
      }
      return badges[name] || 'Mchezo Mzuri'
    },
    
    playInteraction() {
      // Add interactive feedback
      this.$emit('category-interaction', this.category.name)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Caveat:wght@600;700&display=swap');

.font-cursive {
  font-family: 'Caveat', 'Kalam', cursive;
  font-weight: 700;
}

.category-card {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.category-card:hover {
  box-shadow: 0 25px 50px rgba(59, 130, 246, 0.3);
}

.interactive-icon {
  position: relative;
}

.interactive-icon::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.interactive-icon:hover::after {
  opacity: 1;
}

.interactive-badge {
  transition: all 0.3s ease;
}

.interactive-badge:hover {
  background-color: rgba(219, 234, 254, 0.5);
  transform: scale(1.05);
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
}

/* Hover animation for the entire card */
.category-card:hover .interactive-icon {
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
</style>