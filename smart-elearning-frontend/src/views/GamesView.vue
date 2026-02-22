<template>
    <div class="games-view min-h-screen w-full bg-bg-primary">
      <MainNav />
      
      <main class="pt-16 pb-12">
        <!-- Page Header -->
        <section class="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-8">
          <div class="container mx-auto px-4 text-center">
            <h1 class="text-3xl md:text-4xl font-bold">Our Fun Learning Games</h1>
            <p class="text-lg mt-4 max-w-2xl mx-auto">
              Specially designed for hearing-impaired children in Standards 1-2
            </p>
          </div>
        </section>
  
        <!-- Game Categories -->
        <section class="container mx-auto px-4 mt-12">
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-2xl font-bold text-center mb-8">Browse by Category</h2>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <CategoryCard 
                v-for="category in categories"
                :key="category.id"
                :category="category"
              />
            </div>
          </div>
        </section>
  
        <!-- All Games Grid -->
        <section class="container mx-auto px-4 mt-12">
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-2xl font-bold text-center mb-8">All Games</h2>
          
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <GameCard 
                v-for="game in games"
                :key="game.id"
                :game="game"
              />
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
  import CategoryCard from '@/components/navigation/CategoryCard.vue'
  
  export default {
    name: 'GamesView',
    components: { MainNav, Footer, GameCard, CategoryCard },
    data() {
      return {
        categories: [
          { id: 1, name: 'Math', icon: '🧮', color: 'bg-secondary-400' },
          { id: 2, name: 'Language', icon: '🔤', color: 'bg-success' },
          { id: 3, name: 'Science', icon: '🔬', color: 'bg-alert' },
          { id: 4, name: 'Life Skills', icon: '🌟', color: 'bg-purple-400' },
          { id: 5, name: 'Sign Language', icon: '👐', color: 'bg-teal-400' }
        ],
        games: [
          { id: 1, title: 'Number Adventure', grade: '1', subject: 'Math' },
          { id: 2, title: 'Word Builder', grade: '1', subject: 'Language' },
          { id: 3, title: 'Nature Explorer', grade: '2', subject: 'Science' },
          { id: 4, title: 'Daily Routines', grade: '2', subject: 'Life Skills' },
          { id: 5, title: 'Alphabet Signs', grade: '1', subject: 'Sign Language' },
          { id: 6, title: 'Counting Signs', grade: '2', subject: 'Sign Language' },
          { id: 7, title: 'Shape Safari', grade: '1', subject: 'Math' },
          { id: 8, title: 'Story Time', grade: '2', subject: 'Language' }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .games-view {
    background-color: #F8FAFC;
    background-image: 
      radial-gradient(#D1D5DB 0.5px, transparent 0.5px);
    background-size: 10px 10px;
    font-family: 'Nunito', sans-serif;
  }
  
  /* Custom gradient for header */
  .bg-gradient-to-r.from-primary-500.to-primary-600 {
    background: linear-gradient(
      to right,
      #3B82F6,
      #2563EB
    );
  }
  
  /* Card hover effect */
  .bg-white {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .bg-white:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  /* Accessibility focus styles */
  :deep(.game-card:focus),
  :deep(.category-card:focus) {
    outline: 3px solid #FBBF24;
    outline-offset: 2px;
  }
  </style>