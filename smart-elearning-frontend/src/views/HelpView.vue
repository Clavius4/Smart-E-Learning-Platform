<template>
    <div class="help-view">
      <!-- Use the MainNav component instead of local nav -->
      <MainNav />
      
      <!-- Help Content -->
      <div class="container mx-auto px-4 py-8 max-w-6xl mt-20"> <!-- Added mt-20 to account for fixed nav -->
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Left Sidebar -->
          <div class="w-full md:w-1/4">
            <h2 class="text-2xl font-bold mb-6">HELP/FAQs</h2>
            
            <div class="mb-6">
              <div class="relative">
                <input 
                  type="text" 
                  placeholder="Search FAQs"
                  class="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <svg class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
  
            <div class="space-y-4">
              <h3 class="font-bold text-lg">GENERAL</h3>
              <h3 class="font-bold text-lg">SUBSCRIPTION</h3>
              <h3 class="font-bold text-lg">TECHNICAL</h3>
              <h3 class="font-bold text-lg">TOOLS</h3>
              <h3 class="font-bold text-lg">APPS</h3>
            </div>
          </div>
  
          <!-- Main Content -->
          <div class="w-full md:w-3/4">
            <h3 class="text-xl font-bold mb-4">General</h3>
            <div class="space-y-4">
              <div class="faq-item">
                <h4 class="font-semibold">What is ABCya?</h4>
              </div>
              <div class="faq-item">
                <h4 class="font-semibold">How do you pronounce ABCya?</h4>
              </div>
              <div class="faq-item">
                <h4 class="font-semibold">Having trouble accessing your account?</h4>
              </div>
              <div class="faq-item">
                <h4 class="font-semibold">Which ABCya games are available on the ABCya Games app?</h4>
              </div>
              <div class="faq-item">
                <h4 class="font-semibold">What if I forget my password?</h4>
              </div>
              <div class="faq-item">
                <h4 class="font-semibold">How do I advertise on ABCya?</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import MainNav from '@/components/navigation/MainNav.vue'; // Adjust the import path as needed
  
  export default {
    name: 'HelpView',
    components: {
      MainNav
    }
  }
  </script>
  
  <style scoped>
  .help-view {
    min-height: 100vh;
    background-color: #f8fafc;
  }
  
  .faq-item {
    padding: 1rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
  }
  
  .faq-item:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }
  </style>