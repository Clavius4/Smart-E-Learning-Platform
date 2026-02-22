<template>
  <div class="min-h-screen w-full relative overflow-hidden">
    <!-- Beautiful Blue Gradient Background -->
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-800">
      <!-- Animated background elements -->
      <div class="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float-slow"></div>
      <div class="absolute top-1/3 right-20 w-16 h-16 bg-white/20 rounded-full animate-float-medium"></div>
      <div class="absolute bottom-20 left-1/4 w-24 h-24 bg-white/15 rounded-full animate-float-fast"></div>
      <div class="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
    </div>
    
    <MainNav />
    <main class="pt-16">
      <!-- Hero Section -->
      <section class="bg-gradient-to-r from-blue-600/95 to-indigo-700/95 text-white py-24 backdrop-blur-sm relative overflow-hidden">
        <!-- Decorative elements -->
        <div class="absolute top-0 left-0 w-full h-full">
          <div class="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full animate-spin-slow"></div>
          <div class="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-bounce-slow"></div>
        </div>
        
        <div class="container mx-auto px-6 text-center relative z-10">
          <!-- Interactive welcome icon -->
          <div class="mb-8 flex justify-center">
            <div class="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-wide">
            <span class="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Kujifunza ni Furaha!
            </span>
          </h1>
          <p class="text-2xl mb-10 max-w-4xl mx-auto leading-relaxed font-semibold">
            Michezo ya kielimu yenye mwingiliano iliyoundwa kwa watoto wenye matatizo ya kusikia katika Daraja la 1-2
          </p>
          
          <!-- Interactive CTA Button -->
          <div class="flex justify-center space-x-6">
            <router-link 
              to="/courses" 
              class="group relative px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-blue-900 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span>Angalia masomo</span>
              </div>
            </router-link>
          </div>
          
          <!-- Interactive badges -->
          <div class="mt-12 flex justify-center space-x-6">
            <div class="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-bold">✓</span>
                </div>
                <span class="font-semibold">Bure Kabisa</span>
              </div>
            </div>
            <div class="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center animate-pulse">
                  <span class="text-white text-sm font-bold">★</span>
                </div>
                <span class="font-semibold">Kwa Watoto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Games Section -->
      <section class="py-16 container mx-auto px-6">
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-blue-200">
          <!-- Section header -->
          <div class="text-center mb-12">
            <div class="flex justify-center mb-6">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-6 hover:rotate-12 transition-transform duration-300">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <h2 class="text-4xl font-bold mb-4 text-blue-900">Kozi Maarufu</h2>
            <p class="text-xl text-blue-700 font-semibold">Chagua kozi unayoipenda na uanze safari yako ya kujifunza</p>
          </div>
          
          <!-- Games grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            <div 
              v-for="game in featuredGames" 
              :key="game.id"
              class="group bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-200 hover:border-blue-300 cursor-pointer"
            >
              <!-- Interactive game icon -->
              <div class="flex justify-center mb-6">
                <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-300"
                  :class="getGameIcon(game.subject).rotation">
                  <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20" v-html="getGameIcon(game.subject).icon">
                  </svg>
                </div>
              </div>
              
              <!-- Game info -->
              <div class="text-center">
                <h3 class="text-2xl font-bold mb-3 text-blue-900">{{ game.title }}</h3>
                
                <!-- Interactive badges -->
                <div class="flex justify-center space-x-3 mb-4">
                  <div class="bg-green-200 text-green-800 px-4 py-2 rounded-xl font-bold text-sm shadow-md">
                    <div class="flex items-center space-x-1">
                      <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span>Daraja {{ game.grade }}</span>
                    </div>
                  </div>
                  <div class="bg-purple-200 text-purple-800 px-4 py-2 rounded-xl font-bold text-sm shadow-md">
                    <div class="flex items-center space-x-1">
                      <div class="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span>{{ getSubjectInSwahili(game.subject) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Interactive elements -->
                <div class="mb-6">
                  <div class="flex justify-center space-x-2">
                    <div class="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
                
                <!-- Action button -->
                <button class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform group-hover:scale-105 shadow-lg">
                  <div class="flex items-center justify-center space-x-2">
                    <span>Anza Kujifunza</span>
                    <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Additional interactive section -->
      <section class="py-16 container mx-auto px-6">
        <div class="bg-gradient-to-r from-blue-100 to-indigo-200 rounded-3xl p-10 shadow-xl border-2 border-blue-300">
          <div class="text-center">
            <div class="flex justify-center mb-6">
              <div class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <span class="text-3xl">🎓</span>
              </div>
            </div>
            <h3 class="text-3xl font-bold mb-4 text-blue-900">Tayari Kuanza?</h3>
            <p class="text-xl text-blue-700 mb-8 font-semibold">Jiunge nasi leo na uanze safari yako ya kujifunza!</p>
            
            <!-- Interactive stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white/80 rounded-2xl p-6 shadow-lg">
                <div class="text-3xl font-bold text-blue-600 mb-2">100+</div>
                <div class="text-blue-800 font-semibold">Watoto Wanajifunza</div>
              </div>
              <div class="bg-white/80 rounded-2xl p-6 shadow-lg">
                <div class="text-3xl font-bold text-green-600 mb-2">50+</div>
                <div class="text-blue-800 font-semibold">Kozi za Kujifunza</div>
              </div>
              <div class="bg-white/80 rounded-2xl p-6 shadow-lg">
                <div class="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div class="text-blue-800 font-semibold">Msaada Unapatikana</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script>
import MainNav from '@/components/navigation/MainNav.vue'
import Footer from '@/components/navigation/Footer.vue'
import GameCard from '@/components/navigation/GameCard.vue'

export default {
  components: { MainNav, Footer, GameCard },
  data() {
    return {
      featuredGames: [
        { id: 1, title: 'Kutambua Herufi', grade: '1', subject: 'Language' },
        { id: 2, title: 'Kuhesabu Nambari', grade: '1', subject: 'Math' },
        { id: 3, title: 'Kujenga Maneno', grade: '2', subject: 'Language' },
        { id: 4, title: 'Kujumlisha Msingi', grade: '2', subject: 'Math' }
      ]
    }
  },
  methods: {
    getGameIcon(subject) {
      const icons = {
        Language: {
          icon: '<path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 7a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zM9 11a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zM9 15a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z"/>',
          rotation: 'group-hover:rotate-6'
        },
        Math: {
          icon: '<path d="M9 12a1 1 0 012 0v4a1 1 0 11-2 0v-4zM15 8a1 1 0 10-2 0v8a1 1 0 102 0V8zM7 14a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zM7 10a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"/>',
          rotation: 'group-hover:-rotate-6'
        }
      }
      return icons[subject] || icons.Language
    },
    getSubjectInSwahili(subject) {
      const translations = {
        Language: 'Lugha',
        Math: 'Hisabati'
      }
      return translations[subject] || subject
    }
  }
}
</script>

<style scoped>
/* Custom animations */
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes float-medium {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(90deg); }
}

@keyframes float-fast {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(45deg); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 3s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 2s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 10s linear infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

/* Enhanced hover effects */
.group:hover .transform {
  animation-play-state: paused;
}

/* Glassmorphism effects */
.backdrop-blur-xl {
  backdrop-filter: blur(16px);
}

.backdrop-blur-md {
  backdrop-filter: blur(8px);
}

/* Custom gradient text */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Enhanced shadows */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Button hover effects */
button:active {
  transform: scale(0.98);
}

.group:hover button {
  animation: none;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #1d4ed8, #1e40af);
}
</style>