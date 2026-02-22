<template>
  <footer class="footer-container font-cursive">
    <!-- Top Section - Premium CTA -->
    <div class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, #60a5fa 2px, transparent 2px), radial-gradient(circle at 75% 75%, #3b82f6 2px, transparent 2px); background-size: 50px 50px;"></div>
      </div>
      
      <div class="container mx-auto px-6 text-center relative z-10">
        <!-- Interactive Icon -->
        <div class="mb-6 flex justify-center">
          <div class="interactive-star w-16 h-16 bg-blue-300 bg-opacity-30 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer backdrop-blur-sm">
            <div class="text-3xl font-bold animate-pulse-slow">⭐</div>
          </div>
        </div>
        
        <h2 class="text-3xl md:text-4xl font-bold mb-6 tracking-wide">Jiunge Sasa kwa Premium</h2>
        <p class="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
          Kuboresha uzoefu wa kielimu kwa kila mtoto.
        </p>
        
        <!-- Interactive Badge -->
        <div class="inline-flex items-center bg-blue-200 bg-opacity-20 px-6 py-2 rounded-full backdrop-blur-md mb-6">
          <span class="text-blue-200 font-semibold">Elimu Bora Kwa Watoto</span>
        </div>
      </div>
    </div>

    <!-- Main Footer Content -->
    <div class="relative bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white py-16">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="w-full h-full" style="background-image: linear-gradient(30deg, #1e40af 12%, transparent 12.5%, transparent 87%, #1e40af 87.5%, #1e40af), linear-gradient(150deg, #1e40af 12%, transparent 12.5%, transparent 87%, #1e40af 87.5%, #1e40af); background-size: 20px 35px;"></div>
      </div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          <!-- Our Content -->
          <div class="footer-section">
            <div class="section-header mb-6">
              <div class="interactive-icon w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <span class="text-white font-bold">📚</span>
              </div>
              <h3 class="text-xl font-bold text-blue-200">MAZOEZI YETU</h3>
            </div>
            <ul class="space-y-4">
              <li class="footer-link-item">
                <router-link to="/games" class="footer-link">
                  <span class="link-icon">🎮</span>
                  <span>Michezo Yote</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/grade/1" class="footer-link">
                  <span class="link-icon">1️⃣</span>
                  <span>Michezo Darasa la 1</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/grade/2" class="footer-link">
                  <span class="link-icon">2️⃣</span>
                  <span>Michezo Darasa la 2</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/printables" class="footer-link">
                  <span class="link-icon">🖨️</span>
                  <span>Machapisho ya Kujifunza</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Parents & Teachers -->
          <div class="footer-section">
            <div class="section-header mb-6">
              <div class="interactive-icon w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mb-3">
                <span class="text-white font-bold">👨‍👩‍👧‍👦</span>
              </div>
              <h3 class="text-xl font-bold text-blue-200">WAZAZI NA WALIMU</h3>
            </div>
            <ul class="space-y-4">
              <li class="footer-link-item">
                <router-link to="/gift-cards" class="footer-link">
                  <span class="link-icon">🎁</span>
                  <span>Nunua Kadi za Zawadi</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/redeem" class="footer-link">
                  <span class="link-icon">💎</span>
                  <span>Tumia Kadi ya Zawadi</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/blog" class="footer-link">
                  <span class="link-icon">📝</span>
                  <span>Blogu</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/about" class="footer-link">
                  <span class="link-icon">ℹ️</span>
                  <span>Kuhusu e-Smart</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/feedback" class="footer-link">
                  <span class="link-icon">💬</span>
                  <span>Tuambie Maoni Yako</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Help -->
          <div class="footer-section">
            <div class="section-header mb-6">
              <div class="interactive-icon w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center mb-3">
                <span class="text-white font-bold">🆘</span>
              </div>
              <h3 class="text-xl font-bold text-blue-200">MSAADA</h3>
            </div>
            <ul class="space-y-4">
              <li class="footer-link-item">
                <router-link to="/login" class="footer-link">
                  <span class="link-icon">🔑</span>
                  <span>Ingia</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/join" class="footer-link">
                  <span class="link-icon">✨</span>
                  <span>Jisajili Sasa</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/faqs" class="footer-link">
                  <span class="link-icon">❓</span>
                  <span>Maswali ya Mara kwa Mara</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/contact" class="footer-link">
                  <span class="link-icon">📞</span>
                  <span>Wasiliana Nasi</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- About -->
          <div class="footer-section">
            <div class="section-header mb-6">
              <div class="interactive-icon w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                <span class="text-white font-bold">🏢</span>
              </div>
              <h3 class="text-xl font-bold text-blue-200">KUHUSU E-SMART</h3>
            </div>
            <ul class="space-y-4">
              <li class="footer-link-item">
                <router-link to="/story" class="footer-link">
                  <span class="link-icon">📖</span>
                  <span>Hadithi Yetu</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/team" class="footer-link">
                  <span class="link-icon">👥</span>
                  <span>Kutana na Timu</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/testimonials" class="footer-link">
                  <span class="link-icon">💭</span>
                  <span>Ushuhuda</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/privacy" class="footer-link">
                  <span class="link-icon">🔒</span>
                  <span>Sera ya Faragha</span>
                </router-link>
              </li>
              <li class="footer-link-item">
                <router-link to="/terms" class="footer-link">
                  <span class="link-icon">📋</span>
                  <span>Masharti ya Matumizi</span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <!-- Partner Logos -->
        <div class="mt-16 pt-12 border-t border-blue-700">
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-4">
              <div class="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-bold">🤝</span>
              </div>
              <h3 class="text-2xl font-bold text-blue-200">Washirika wa Elimu Tunaoaminika</h3>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="partner-card group">
              <div class="partner-icon">🤟</div>
              <div class="partner-content">
                <h4 class="font-bold text-blue-200">Sign Language Pro</h4>
                <span class="interactive-badge">Lugha ya Alama</span>
              </div>
            </div>
            
            <div class="partner-card group">
              <div class="partner-icon">🔢</div>
              <div class="partner-content">
                <h4 class="font-bold text-blue-200">Visual Math</h4>
                <span class="interactive-badge">Hesabu za Mchoro</span>
              </div>
            </div>
            
            <div class="partner-card group">
              <div class="partner-icon">👂</div>
              <div class="partner-content">
                <h4 class="font-bold text-blue-200">Hearing World</h4>
                <span class="interactive-badge">Ulimwengu wa Kusikia</span>
              </div>
            </div>
            
            <div class="partner-card group">
              <div class="partner-icon">📚</div>
              <div class="partner-content">
                <h4 class="font-bold text-blue-200">Kids Vocabulary</h4>
                <span class="interactive-badge">Msamiati wa Watoto</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="mt-12 pt-8 border-t border-blue-700 text-center">
          <div class="bg-blue-800 bg-opacity-30 rounded-2xl p-6 backdrop-blur-sm">
            <p class="text-blue-200 text-lg font-semibold mb-2">
              © 2025 e-Smart Learning kwa Watoto Wenye Uziwi. Haki Zote Zimehifadhiwa.
            </p>
            <p class="text-blue-300 text-base">
              Sehemu ya Taasisi ya Elimu Jumuishi
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@400;700&display=swap');

.footer-container {
  @apply w-full;
}

.font-cursive {
  font-family: 'Caveat', 'Kalam', cursive;
  font-weight: 700;
}

.footer-section {
  @apply transform transition-all duration-300;
}

.footer-section:hover {
  @apply scale-105;
}

.section-header {
  @apply flex flex-col items-start;
}

.interactive-icon {
  @apply transition-all duration-300 cursor-pointer;
}

.interactive-icon:hover {
  @apply scale-110 shadow-lg;
  animation: float 2s ease-in-out infinite;
}

.footer-link-item {
  @apply transform transition-all duration-300;
}

.footer-link {
  @apply flex items-center gap-3 p-3 rounded-xl bg-blue-800 bg-opacity-20 hover:bg-opacity-40 transition-all duration-300 text-blue-100 hover:text-white backdrop-blur-sm;
}

.footer-link:hover {
  @apply scale-105 shadow-lg;
}

.link-icon {
  @apply text-lg;
}

.partner-card {
  @apply bg-gradient-to-br from-blue-700 to-indigo-800 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer backdrop-blur-sm;
}

.partner-icon {
  @apply text-3xl mb-3 text-center;
}

.partner-content {
  @apply text-center;
}

.interactive-badge {
  @apply inline-block bg-blue-400 bg-opacity-30 text-blue-200 px-3 py-1 rounded-full text-lg font-semibold mt-2 backdrop-blur-sm;
}

.interactive-star {
  position: relative;
}

.interactive-star::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(147, 197, 253, 0.3), rgba(96, 165, 250, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.interactive-star:hover::after {
  opacity: 1;
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .partner-card {
    @apply p-4;
  }
  
  .partner-icon {
    @apply text-2xl mb-2;
  }
  
  .footer-link {
    @apply p-2;
  }
}
</style>