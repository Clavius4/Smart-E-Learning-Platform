<template>
  <div class="min-h-screen bg-gradient-to-tr from-blue-200 to-blue-400 overflow-hidden relative font-sans">
    <MainNav />

    <!-- Floating Background Items -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <!-- <img src="/assets/cloud1.svg" class="floating-cloud top-10 left-10 w-32 opacity-50" />
      <img src="/assets/balloon.svg" class="floating-balloon bottom-10 right-10 w-24 opacity-70" /> -->
    </div>

    <!-- Main Container -->
    <div class="container mx-auto px-6 py-12 max-w-4xl relative z-10">
      <div class="bg-white bg-opacity-90 rounded-3xl shadow-xl overflow-hidden border-4 border-blue-300">
        
     
       <!-- Profile Header -->
<div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white rounded-t-3xl flex flex-wrap items-center justify-between gap-6">
  
  <!-- Profile Info -->
  <div class="flex items-center space-x-6">
    <div class="w-28 h-28 rounded-full border-4 border-white overflow-hidden">
      <img 
        :src="user?.image || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.firstName" 
        alt="Picha ya Mtumiaji"
        class="w-full h-full object-cover"
      >
    </div>
    <div>
      <h1 class="text-3xl font-extrabold">{{ user?.firstName }} {{ user?.lastName }}</h1>
      <p class="text-blue-100 text-lg">{{ user?.email }}</p>
      <p class="text-blue-100 text-lg italic" v-if="user?.role">{{ user.role }}</p>
    </div>
  </div>

  <!-- Onboarding Button -->
  <router-link 
    to="/onboarding"
    class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow-md transition transform hover:scale-105 text-center w-full sm:w-auto"
  >
    Endelea na Onboarding
  </router-link>

</div>

        <!-- Profile Content -->
        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

            <!-- Personal Info -->
            <div class="bg-blue-50 p-6 rounded-2xl border border-blue-200">
              <h2 class="text-2xl font-bold mb-4 text-blue-800">Taarifa Binafsi</h2>
              <div class="space-y-3 text-lg">
                <div>
                  <label class="block text-blue-600 font-medium">Jina la Kwanza</label>
                  <p class="mt-1 text-blue-900 font-bold">{{ user?.firstName }}</p>
                </div>
                <div>
                  <label class="block text-blue-600 font-medium">Jina la Mwisho</label>
                  <p class="mt-1 text-blue-900 font-bold">{{ user?.lastName }}</p>
                </div>
                <div>
                  <label class="block text-blue-600 font-medium">Barua Pepe</label>
                  <p class="mt-1 text-blue-900 font-bold">{{ user?.email }}</p>
                </div>
              </div>
              <router-link 
                to="/profile/edit"
                class="mt-4 inline-block text-pink-600 hover:text-pink-800 font-semibold"
              >
                Hariri Taarifa
              </router-link>
            </div>

            <!-- Account Settings -->
            <div class="bg-pink-50 p-6 rounded-2xl border border-pink-200">
              <h2 class="text-2xl font-bold mb-4 text-pink-800">Mipangilio ya Akaunti</h2>
              <div class="space-y-4">
                <router-link 
                  to="/change-password"
                  class="block p-4 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:scale-105"
                >
                  Badilisha Nenosiri
                </router-link>
                <router-link 
                  to="/enrolled-courses"
                  class="block p-4 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:scale-105"
                >
                  Masomo Yangu
                </router-link>
                <button 
                  @click="logout"
                  class="w-full text-left p-4 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"
                >
                  Toka
                </button>
              </div>
            </div>

            <!-- Generate Report Button -->
<div class="text-center mt-4">
  <button
    @click="generateReport"
    class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition"
  >
    Pakua Ripoti (Generate Report)
  </button>
</div>


            <!-- Achievements Section -->
            <div class="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 md:col-span-2">
              <h2 class="text-2xl font-bold mb-4 text-yellow-800 flex items-center">
                <span class="mr-2">🏆</span> Mapatio na Tuzo
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Stars -->
                <div class="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4">
                  <div class="p-3 bg-yellow-100 rounded-full text-4xl">⭐</div>
                  <div>
                    <div class="text-gray-500 font-medium">Jumla ya Nyota</div>
                    <div class="text-3xl font-bold text-yellow-600">{{ user?.stars || 0 }}</div>
                  </div>
                </div>

                <!-- Badges -->
                <div class="bg-white p-4 rounded-xl shadow-sm">
                  <div class="text-gray-500 font-medium mb-3">Tuzo Zilizopatikana</div>
                  <div v-if="user?.badges && user.badges.length > 0" class="flex flex-wrap gap-3">
                    <div 
                      v-for="(badge, index) in user.badges" 
                      :key="index"
                      class="flex flex-col items-center p-2 bg-gray-50 rounded-lg border border-gray-100 w-24 text-center tooltip-container"
                      :title="badge.description"
                    >
                      <span class="text-3xl mb-1">{{ badge.icon || '🏅' }}</span>
                      <span class="text-xs font-bold text-gray-700 truncate w-full">{{ badge.name }}</span>
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-400 italic">
                    Bado hujapata tuzo. Kamilisha kozi ili uanze kushinda!
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>



<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import api from '@/utils/axios' 

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const router = useRouter()
const logout = async () => {
  await authStore.logout()
}


const generateReport = async () => {
  try {
    if (!user.value?._id) {
      alert('Mtumiaji hajapatikana');
      return;
    }

    const childId = user.value._id; // assuming _id is childId
    const response = await api.get(`/profile/report/${childId}`, {
      responseType: 'blob',
       validateStatus: status => true 
    });
     // Check if the response is actually a PDF
    const contentType = response.headers['content-type'];
    if (!contentType.includes('application/pdf')) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const error = JSON.parse(reader.result);
          alert('Error: ' + (error.message || 'Ripoti haijapatikana'));
        } catch {
          alert('Hitilafu isiyotarajiwa ilitokea.');
        }
      };
      reader.readAsText(response.data);
      return;
    }


    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ripoti.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Failed to generate report:', err);
  }
};

const goToOnboarding = () => {
  // Example: Only navigate if user has no onboardingComplete flag
  if (!user.value?.onboardingComplete) {
    router.push({ path: '/onboarding', query: { from: 'profile' } })
  } else {
    alert('Umeshakamilisha onboarding!')
  }
}
</script>

<style>

/* Add to your styles */
.floating-cloud {
  animation: floatCloud 20s linear infinite;
}
.floating-balloon {
  animation: floatBalloon 8s ease-in-out infinite alternate;
}

@keyframes floatCloud {
  0% { transform: translateX(0); }
  100% { transform: translateX(100vw); }
}

@keyframes floatBalloon {
  0% { transform: translateY(0); }
  100% { transform: translateY(-30px); }
}
</style>