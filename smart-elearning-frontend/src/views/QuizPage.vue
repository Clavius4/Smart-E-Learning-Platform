<template>
  <div class="quiz-page">
    <MainNav />
    <div class="container mx-auto px-4 py-8 max-w-4xl mt-20">
      <!-- Loading state -->
       <div v-if="nextCourse">
  <p>🎉 You’ve unlocked the next course: {{ nextCourse.title }}</p>
  <router-link :to="`/course/${nextCourse._id}`" class="btn btn-primary">
    Start {{ nextCourse.title }}
  </router-link>
</div>
      <div v-if="loading" class="text-center py-16">
        <div class="relative">
          <div class="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p class="mt-6 text-xl text-blue-700 font-semibold">Tunapakia Jaribio...</p>
        <div class="mt-4 flex justify-center space-x-2">
          <div class="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 mb-8 shadow-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="h-7 w-7 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="ml-6">
            <p class="text-lg text-red-800 font-semibold">{{ error }}</p>
            <button 
              @click="loadQuizData"
              class="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg"
            >
              Jaribu Tena
            </button>
          </div>
        </div>
      </div>
      
      <!-- Quiz content -->
      <div v-else-if="quiz && !quizSubmitted" class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-8 border border-blue-200">
        <!-- Quiz header -->
        <div class="mb-8">
          <div class="text-center mb-6">
            <h1 class="text-4xl font-bold mb-4 text-blue-900 tracking-wide">{{ quiz.title || 'Jaribio la Kujifunza' }}</h1>
            <div class="inline-flex items-center bg-white rounded-2xl px-6 py-3 shadow-lg border-2 border-blue-200">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                <span class="text-white font-bold text-lg">{{ currentQuestionIndex + 1 }}</span>
              </div>
              <span class="text-xl font-semibold text-blue-800">
                kati ya {{ quiz.questions.length }} maswali
              </span>
            </div>
          </div>
          
          <div class="flex justify-between items-center mb-6">
            <div class="bg-white rounded-2xl px-6 py-3 shadow-lg border-2 border-blue-200">
              <div class="flex items-center">
                <div class="w-6 h-6 bg-yellow-400 rounded-full mr-3 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">★</span>
                </div>
                <span class="text-lg font-bold text-blue-900">
                  Alama: {{ calculateCurrentScore() }}/{{ quiz.questions.length }}
                </span>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl px-6 py-3 shadow-lg border-2 border-green-200">
              <div class="flex items-center">
                <div class="w-6 h-6 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">%</span>
                </div>
                <span class="text-lg font-bold text-green-700">
                  {{ Math.round((calculateCurrentScore() / quiz.questions.length) * 100) }}%
                </span>
              </div>
            </div>
          </div>
          
          <div class="w-full bg-white rounded-2xl p-2 shadow-inner border-2 border-blue-200">
            <div 
              class="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-xl transition-all duration-500 ease-out shadow-lg relative overflow-hidden" 
              :style="{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }"
            >
              <div class="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <!-- Current question -->
        <div class="mb-8">
          <div class="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-200 mb-6">
            <div class="flex items-start mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg transform rotate-3">
                <span class="text-white font-bold text-xl">?</span>
              </div>
              <h2 class="text-2xl font-bold text-blue-900 leading-relaxed flex-1">{{ currentQuestion.question }}</h2>
            </div>
            
            <!-- Interactive question visual -->
            <div v-if="currentQuestion.questionImage" class="mb-6 flex justify-center">
              <div class="relative group">
                <img 
                  :src="currentQuestion.questionImage" 
                  class="max-w-full rounded-2xl shadow-lg border-4 border-blue-200 transition-transform duration-200 group-hover:scale-105"
                >
                <div class="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-200"></div>
              </div>
            </div>
            <div v-else class="mb-6 flex justify-center">
              <div class="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-xl transform rotate-6 hover:rotate-12 transition-transform duration-300">
                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Answer options -->
          <!-- Drag and Drop Interface -->
          <div v-if="isDragDrop" class="space-y-6">
            <div class="text-center mb-6">
              <div class="inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl px-6 py-3 shadow-lg border-2 border-purple-200">
                <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </div>
                <p class="text-purple-800 font-bold text-lg">Buruta majibu sahihi kwenye maeneo yanayolingana</p>
              </div>
            </div>
            
            <!-- Drop zones with enhanced styling -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div
                v-for="(zone, zoneIndex) in currentQuestion.dropZones"
                :key="`zone-${zoneIndex}`"
                class="relative group"
                @dragover.prevent="handleDragOver($event, zoneIndex)"
                @dragenter.prevent="handleDragEnter($event, zoneIndex)"
                @dragleave="handleDragLeave($event, zoneIndex)"
                @drop="handleDrop(zoneIndex, $event)"
              >
                <div 
                  class="min-h-[120px] p-6 rounded-3xl transition-all duration-300 border-3 shadow-lg relative overflow-hidden"
                  :class="{
                    'border-dashed border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200': !getDropZoneAnswer(zoneIndex),
                    'border-solid border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-xl': getDropZoneAnswer(zoneIndex) && checkDropZoneCorrectness(zoneIndex),
                    'border-solid border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-xl': getDropZoneAnswer(zoneIndex) && !checkDropZoneCorrectness(zoneIndex),
                    'border-purple-400 bg-gradient-to-br from-purple-100 to-purple-200 transform scale-105': dragOverZone === zoneIndex
                  }"
                >
                  <!-- Background pattern -->
                  <div class="absolute inset-0 opacity-10">
                    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 20px 20px, #3b82f6 2px, transparent 2px); background-size: 40px 40px;"></div>
                  </div>
                  
                  <div class="relative z-10 flex flex-col h-full justify-center items-center text-center">
                    <!-- Zone label with icon -->
                    <div class="flex items-center mb-4">
                      <div class="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
                        <span class="text-white font-bold text-sm">{{ zoneIndex + 1 }}</span>
                      </div>
                      <span class="font-bold text-blue-900 text-lg">{{ zone.text || `Eneo ${zoneIndex + 1}` }}</span>
                    </div>
                    
                    <!-- Dropped answer display -->
                    <div v-if="getDropZoneAnswer(zoneIndex)" class="flex items-center justify-between w-full bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200">
                      <div class="flex items-center flex-1">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                        <span class="text-lg font-bold text-gray-800">{{ getDropZoneAnswer(zoneIndex).text }}</span>
                      </div>
                      <button 
                        @click.stop="removeAnswer(zoneIndex)"
                        class="ml-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md"
                      >
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <!-- Empty state -->
                    <div v-else class="flex flex-col items-center">
                      <div class="w-16 h-16 border-4 border-dashed border-blue-400 rounded-2xl flex items-center justify-center mb-3 group-hover:border-blue-600 transition-all duration-200">
                        <svg class="w-8 h-8 text-blue-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                      </div>
                      <span class="text-blue-600 italic font-medium">{{ zone.placeholder || 'Buruta jibu hapa' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Draggable options with enhanced design -->
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 border-2 border-gray-200 shadow-inner">
              <div class="text-center mb-4">
                <h3 class="text-xl font-bold text-gray-800 mb-2">Majibu Yanayopatikana</h3>
                <div class="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
              </div>
              
              <div class="flex flex-wrap gap-4 justify-center">
                <div
                  v-for="(option, optIndex) in availableDragOptions"
                  :key="`option-${optIndex}-${option._id}`"
                  class="group relative"
                  draggable="true"
                  :draggable="!isOptionUsed(option)"
                  @dragstart="handleDragStart(option, $event)"
                  @dragend="handleDragEnd"
                >
                  <div 
                    class="px-8 py-4 rounded-2xl shadow-lg cursor-move transition-all duration-300 transform select-none"
                    :class="{
                      'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-xl border-2 border-blue-400': !isOptionUsed(option),
                      'bg-gray-300 border border-gray-400 text-gray-500 cursor-not-allowed opacity-60': isOptionUsed(option),
                      'animate-pulse': draggingOption && draggingOption._id === option._id
                    }"
                  >
                    <div class="flex items-center">
                      <div class="w-6 h-6 mr-3 flex items-center justify-center">
                        <svg 
                          class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" 
                          :class="!isOptionUsed(option) ? 'text-blue-200' : 'text-gray-400'"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <span class="font-bold text-lg">{{ option.text }}</span>
                    </div>
                    
                    <!-- Drag indicator -->
                    <div v-if="!isOptionUsed(option)" class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <svg class="w-3 h-3 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path d="M10 4a2 2 0 100-4 2 2 0 000 4z"/>
                        <path d="M10 20a2 2 0 100-4 2 2 0 000 4z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Help text -->
              <div class="mt-6 text-center">
                <p class="text-gray-600 text-sm italic">
                  💡 Bonyeza na buruta majibu hadi kwenye maeneo yanayolingana hapo juu
                </p>
              </div>
            </div>
          </div>

          <!-- Multiple Choice Interface (unchanged) -->
          <div v-else class="space-y-4">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="option._id || index"
              @click="selectAnswer(currentQuestion._id, index)"
              class="group p-6 border-3 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-xl"
              :class="{
                'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-400 shadow-lg': selectedAnswers[currentQuestion._id] === index,
                'bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-md': selectedAnswers[currentQuestion._id] !== index
              }"
            >
              <div class="flex items-center">
                <div class="w-14 h-14 rounded-2xl border-3 flex items-center justify-center mr-6 font-bold text-xl transition-all duration-200 transform group-hover:scale-110"
                  :class="{
                    'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white shadow-lg': selectedAnswers[currentQuestion._id] === index,
                    'bg-white border-blue-300 text-blue-700': selectedAnswers[currentQuestion._id] !== index
                  }">
                  {{ String.fromCharCode(65 + index) }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-lg text-blue-900 leading-relaxed">{{ option.text || `Chaguo la ${index + 1}` }}</p>
                  <div v-if="option.image" class="mt-4">
                    <img 
                      :src="option.image" 
                      class="max-w-full rounded-xl shadow-md border-2 border-blue-200 transition-transform duration-200 group-hover:scale-105"
                    >
                  </div>
                  <!-- <div v-else class="mt-3 flex items-center">
                    <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mr-3 transform rotate-12 group-hover:rotate-45 transition-transform duration-300">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <span class="text-blue-600 font-medium">Chagua jibu hili</span>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Navigation buttons -->
        <div class="flex justify-between items-center mt-8">
          <button
            @click="navigateQuestion('prev')"
            :disabled="currentQuestionIndex === 0"
            class="px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-2xl hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold text-lg shadow-lg"
          >
            ← Swali Lilopita
          </button>
          
          <div class="flex items-center space-x-4">
            <div class="bg-white rounded-2xl px-6 py-3 shadow-lg border-2 border-blue-200">
              <div class="flex items-center">
                <div class="w-6 h-6 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                <span class="text-blue-800 font-semibold">Swali {{ currentQuestionIndex + 1 }}</span>
              </div>
            </div>
          </div>
          
          <button
            v-if="!isLastQuestion"
            @click="navigateQuestion('next')"
            :disabled="!isQuestionAnswered"
            class="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold text-lg shadow-lg"
          >
            Swali Linalofuata →
          </button>
          
          <button
            v-else
            @click="submitQuiz"
            :disabled="!isQuestionAnswered"
            class="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold text-lg shadow-lg"
          >
            ✓ Maliza Jaribio
          </button>
        </div>
      </div>
      
      <!-- Quiz results (unchanged) -->
      <div v-else-if="quizSubmitted" class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-8 border border-blue-200 text-center">
        <div class="mb-8">
          <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <span class="text-4xl">🎉</span>
          </div>
          <h1 class="text-4xl font-bold mb-4 text-blue-900">Hongera Sana!</h1>
          <p class="text-xl text-blue-700 font-semibold">Umemaliza Jaribio kwa mafanikio</p>
        </div>
        
        <!-- Score display -->
        <div class="mb-8">
          <div class="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-200 mb-6">
            <div class="text-6xl font-bold mb-4" 
              :class="{
                'text-green-600': percentage >= 80,
                'text-yellow-500': percentage >= 50 && percentage < 80,
                'text-red-600': percentage < 50
              }">
              {{ score }} / {{ quiz.questions.length }}
            </div>
            <div class="text-3xl mb-6 font-bold text-blue-800">
              Umepata {{ percentage }}%
            </div>
            
            <!-- Animated progress circle -->
            <div class="relative w-32 h-32 mx-auto mb-6">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#e5e7eb" stroke-width="8" fill="none"/>
                <circle 
                  cx="50" cy="50" r="40" 
                  :stroke="percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'"
                  stroke-width="8" 
                  fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="251.2"
                  :stroke-dashoffset="251.2 - (251.2 * percentage / 100)"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-blue-800">{{ percentage }}%</span>
              </div>
            </div>
          </div>
          
          <!-- Progress message -->
          <div v-if="percentage >= 80" class="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-2xl mb-6 border-2 border-green-200 shadow-lg">
            <div class="flex items-center justify-center mb-4">
              <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <span class="text-2xl">⭐</span>
              </div>
            </div>
            <p class="text-green-800 font-bold text-lg">
              Vizuri sana! Umefanikiwa kupita mtihani. Sasa unaweza kuanza kiwango kipya cha kujifunza.
            </p>
          </div>
          <div v-else class="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl mb-6 border-2 border-yellow-200 shadow-lg">
            <div class="flex items-center justify-center mb-4">
              <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <span class="text-2xl">💪</span>
              </div>
            </div>
            <p class="text-yellow-800 font-bold text-lg">
              Jaribu tena! Unahitaji kupata angalau 80% ili uendelee kwa kiwango kipya.
            </p>
          </div>
          
          <!-- Level Progression Message -->
          <div v-if="levelChanged && newLevel" class="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl mb-6 border-2 border-purple-300 shadow-lg">
            <div class="flex items-center justify-center mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <span class="text-3xl">🎓</span>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-purple-900 text-center mb-2">Hongera Sana!</h3>
            <p class="text-purple-800 font-bold text-lg text-center">
              Umepita kiwango cha <span class="capitalize">{{ previousLevel }}</span>. 
              Sasa uko kwenye kiwango cha <span class="capitalize text-purple-600">{{ newLevel }}</span>!
            </p>
            <div class="mt-4 flex justify-center items-center space-x-3">
              <div class="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold capitalize">
                {{ previousLevel }}
              </div>
              <span class="text-2xl">→</span>
              <div class="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold capitalize animate-pulse">
                {{ newLevel }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Detailed results -->
        <div class="text-left mb-8">
          <h3 class="font-bold text-2xl mb-6 text-blue-900 text-center">Majibu Yako Yote:</h3>
          <div class="space-y-4">
            <div 
              v-for="(result, index) in results" 
              :key="index" 
              class="p-6 border-2 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl"
              :class="{
                'bg-gradient-to-r from-green-50 to-green-100 border-green-300': result?.isCorrect,
                'bg-gradient-to-r from-red-50 to-pink-100 border-red-300': result && !result.isCorrect
              }"
            >
              <div class="flex items-start">
                <div class="w-10 h-10 rounded-2xl flex items-center justify-center mr-4 font-bold text-white shadow-lg"
                  :class="{
                    'bg-green-500': result?.isCorrect,
                    'bg-red-500': result && !result.isCorrect
                  }">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-bold text-lg mb-2 text-blue-900">{{ result?.question || 'Hakuna swali' }}</p>
                  <p class="text-sm mb-1 font-semibold">
                    <span class="text-blue-700">Ulichagua:</span> 
                    <span class="text-gray-800">{{ result?.selected?.text || 'Hakujachagua' }}</span>
                  </p>
                  <p class="text-sm mb-3 font-semibold">
                    <span class="text-blue-700">Jibu sahihi:</span> 
                    <span class="text-gray-800">{{ result?.correctAnswer?.text || 'Hakuna jibu sahihi' }}</span>
                  </p>
                  <div class="flex items-center">
                    <div 
                      class="px-4 py-2 rounded-xl font-bold text-sm shadow-md"
                      :class="{
                        'bg-green-200 text-green-800': result?.isCorrect,
                        'bg-red-200 text-red-800': result && !result.isCorrect
                      }"
                    >
                      {{ result?.isCorrect ? '✓ Sahihi' : '✗ Si sahihi' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
       <!-- Replace your existing next course section with this debug version -->

<!-- Debug Information (remove this in production) -->
<!-- <div v-if="quizSubmitted" class="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
  <p><strong>Debug Info:</strong></p>
  <p>Passed: {{ passed }}</p>
  <p>NextCourse: {{ nextCourse }}</p>
  <p>NextCourse exists: {{ !!nextCourse }}</p>
  <p>Show next course section: {{ !!(nextCourse && passed) }}</p>
</div> -->

<!-- Next Course Section - Updated with more flexible conditions -->
<div v-if="passed" class="text-center mt-8">
  <div v-if="nextCourse" class="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-2xl border-4 border-green-300 shadow-xl">
    <div class="flex flex-col items-center">
      <!-- Big shiny badge -->
      <font-awesome-icon :icon="['fas', 'medal']" class="text-yellow-500 text-6xl mb-4" />
      
      <!-- Next step arrow -->
      <font-awesome-icon :icon="['fas', 'arrow-right']" 
        @click="goToNextCourse"
        class="cursor-pointer text-blue-600 text-5xl hover:scale-125 transition-transform" 
      />
    </div>
  </div>

  <div v-else class="bg-gradient-to-r from-yellow-100 to-orange-200 p-6 rounded-2xl border-4 border-yellow-300 shadow-xl">
    <div class="flex flex-col items-center">
      <!-- Trophy for finishing all -->
      <font-awesome-icon :icon="['fas', 'trophy']" class="text-yellow-600 text-6xl mb-4" />
      <!-- Maybe a star rain animation here for fun ✨ -->
    </div>
  </div>
</div>



      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import { useQuizStore } from '@/stores/quizStore'
import { useCourseStore } from '@/stores/courseStore'
import { useAuthStore } from '@/stores/auth'


const courseStore = useCourseStore()

const courseData = ref(null)

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()

// State
const loading = ref(true)
const error = ref(null)
const quiz = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswers = ref({})
const quizSubmitted = ref(false)
const score = ref(0)
const percentage = ref(0)
const results = ref([])
const draggingOption = ref(null)
const dragDropAnswers = ref({})
const dragOverZone = ref(null)
const passed = ref(false)
const nextCourse = ref(null)

// Student level progression state
const previousLevel = ref(null)
const newLevel = ref(null)
const levelChanged = ref(false)


// Computed
const currentQuestion = computed(() => {
  return quiz.value?.questions?.[currentQuestionIndex.value] || {}
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === quiz.value?.questions?.length - 1
})

const isDragDrop = computed(() => {
  const type = currentQuestion.value?.type?.toLowerCase()
  return type === 'dragdrop' || type === 'drag_drop'
})

const availableDragOptions = computed(() => {
  return currentQuestion.value?.options || []
})

const isQuestionAnswered = computed(() => {
  const questionId = currentQuestion.value._id
  if (isDragDrop.value) {
    const answers = dragDropAnswers.value[questionId]
    return answers && currentQuestion.value.dropZones?.every((_, index) => answers[index])
  } else {
    return selectedAnswers.value[questionId] !== undefined
  }
})

// Drag and Drop Methods
const handleDragStart = (option, event) => {
  if (isOptionUsed(option)) {
    event.preventDefault()
    return
  }
  draggingOption.value = option
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(option))
}

const handleDragEnd = () => {
  draggingOption.value = null
  dragOverZone.value = null
}

const handleDragOver = (event, zoneIndex) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverZone.value = zoneIndex
}

const handleDragEnter = (event, zoneIndex) => {
  event.preventDefault()
  dragOverZone.value = zoneIndex
}

const handleDragLeave = (event, zoneIndex) => {
  // Only clear if we're actually leaving the zone
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    if (dragOverZone.value === zoneIndex) {
      dragOverZone.value = null
    }
  }
}

const handleDrop = (zoneIndex, event) => {
  event.preventDefault()
  dragOverZone.value = null
  
  if (!draggingOption.value) return
  
  const questionId = currentQuestion.value._id
  if (!dragDropAnswers.value[questionId]) {
    dragDropAnswers.value[questionId] = {}
  }
  
  // Remove the option from any existing zone first
  Object.keys(dragDropAnswers.value[questionId]).forEach(key => {
    if (dragDropAnswers.value[questionId][key]?._id === draggingOption.value._id) {
      delete dragDropAnswers.value[questionId][key]
    }
  })
  
  // Add to new zone
  dragDropAnswers.value[questionId][zoneIndex] = draggingOption.value
  draggingOption.value = null
}

const removeAnswer = (zoneIndex) => {
  const questionId = currentQuestion.value._id
  if (dragDropAnswers.value[questionId]) {
    delete dragDropAnswers.value[questionId][zoneIndex]
  }
}

const getDropZoneAnswer = (zoneIndex) => {
  const questionId = currentQuestion.value._id
  return dragDropAnswers.value[questionId]?.[zoneIndex]
}

const isOptionUsed = (option) => {
  const questionId = currentQuestion.value._id
  const answers = dragDropAnswers.value[questionId]
  if (!answers) return false
  
  return Object.values(answers).some(answer => answer?._id === option._id)
}

const checkDropZoneCorrectness = (zoneIndex) => {
  const questionId = currentQuestion.value._id
  const userAnswer = dragDropAnswers.value[questionId]?.[zoneIndex]
  const correctAnswers = currentQuestion.value.correctAnswers || []
  
  if (!userAnswer || !correctAnswers[zoneIndex]) return false
  
  return userAnswer._id === correctAnswers[zoneIndex]._id
}

// Load quiz data
const loadQuizData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const quizData = await quizStore.fetchQuizByCourseId(route.params.id)
    quiz.value = quizData
    
    // Initialize selected answers
    quiz.value.questions.forEach(question => {
      selectedAnswers.value[question._id] = undefined
      dragDropAnswers.value[question._id] = {}
    })
    
  } catch (err) {
    error.value = err.response?.data?.message || 
                 err.message || 
                 'Failed to load quiz'
    console.error('Quiz loading error:', err)
  } finally {
    loading.value = false
  }
}

// Calculate current score based on answered questions
const calculateCurrentScore = () => {
  if (!quiz.value) return 0
  
  return quiz.value.questions.reduce((total, question) => {
    if (question.type === 'drag_drop' || question.type === 'dragdrop') {
      const answers = dragDropAnswers.value[question._id]
      if (!answers) return total
      
      const isCorrect = question.correctAnswers?.every((correctAnswer, index) => {
        return answers[index]?._id === correctAnswer._id
      })
      
      return isCorrect ? total + 1 : total
    } else {
      const answerIndex = selectedAnswers.value[question._id]
      if (answerIndex !== undefined && answerIndex === question.correctAnswerIndex) {
        return total + 1
      }
    }
    return total
  }, 0)
}

// Handle answer selection
const selectAnswer = (questionId, optionIndex) => {
  selectedAnswers.value[questionId] = optionIndex
}

// Navigate between questions
const navigateQuestion = (direction) => {
  if (direction === 'next' && !isLastQuestion.value) {
    currentQuestionIndex.value++
  } else if (direction === 'prev' && currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// Prepare results with null checks
const prepareResults = () => {
  return quiz.value.questions.map((question) => {
    if (question.type === 'drag_drop' || question.type === 'dragdrop') {
      const userAnswers = dragDropAnswers.value[question._id] || {}
      const correctAnswers = question.correctAnswers || []
      
      const isCorrect = correctAnswers.every((correctAnswer, index) => {
        return userAnswers[index]?._id === correctAnswer._id
      })
      
      const selectedText = Object.values(userAnswers).map(ans => ans?.text).join(', ') || 'Hakujachagua'
      const correctText = correctAnswers.map(ans => ans?.drag || ans?.text).join(', ') || 'Hakuna jibu sahihi'
      
      return {
        question: question.question,
        selected: { text: selectedText },
        correctAnswer: { text: correctText },
        isCorrect
      }
    } else {
      const selected = selectedAnswers.value[question._id]
      const correct = question.correctAnswerIndex
      
      const selectedOption = question.options[selected] || { text: 'Hakujachagua' }
      const correctOption = question.options[correct] || { text: 'Hakuna jibu sahihi' }
      
      return {
        question: question.question,
        selected: selectedOption,
        correctAnswer: correctOption,
        isCorrect: selected === correct
      }
    }
  })
}


// Replace your submitQuiz method with this debug version:

const submitQuiz = async () => {
  try {
    loading.value = true
    error.value = null

    // Merge drag & drop answers into selectedAnswers
    quiz.value.questions.forEach((question) => {
      if (question.type === 'drag_drop' || question.type === 'dragdrop') {
        selectedAnswers.value[question._id] = dragDropAnswers.value[question._id]
      }
    })

    // Calculate score and percentage
    score.value = calculateCurrentScore()
    const totalQuestions = quiz.value.questions.length
    percentage.value = Math.round((score.value / totalQuestions) * 100)
    passed.value = percentage.value >= 80

    // Prepare detailed result array
    results.value = quiz.value.questions.map((question) => {
      if (question.type === 'drag_drop' || question.type === 'dragdrop') {
        const userAnswers = dragDropAnswers.value[question._id] || {}
        const isCorrect = question.correctAnswers?.every((correctAnswer, index) => {
          return userAnswers[index]?._id === correctAnswer._id
        })

        return {
          question: question.question,
          selected: Object.values(userAnswers),
          correctAnswer: question.correctAnswers,
          isCorrect,
          type: question.type
        }
      } else {
        const selectedIndex = selectedAnswers.value[question._id]
        const isCorrect = selectedIndex === question.correctAnswerIndex

        return {
          question: question.question,
          selected: question.options[selectedIndex],
          correctAnswer: question.options[question.correctAnswerIndex],
          isCorrect,
          type: question.type
        }
      }
    })

    // Submit to backend
    const submission = await quizStore.submitQuiz({
      quizId: quiz.value._id,            
      courseId: route.params.id,
      score: score.value,
      total: quiz.value.questions.length,
      percentage: percentage.value,
      passed: passed.value,
      answers: selectedAnswers.value,
      questions: quiz.value.questions,
    })

    console.log('Full submission response:', submission)

    // Handle backend response
    if (submission?.success || submission?.message === 'Quiz submitted successfully') {
      quizSubmitted.value = true
      passed.value = submission.passed || percentage.value >= 80

if (!passed.value) {
  console.log("❌ Quiz failed, unlocking remedial content...")
  setTimeout(async () => {
    await returnToCourse() // fetch course + jump to first remedial
  }, 2000)
}


      
      // Debug: Log next course information
      console.log('Next course from submission:', submission.nextCourse)
      console.log('Next course from data:', submission.data?.nextCourse)
      
      // Set next course data if available (check both locations)
      if (submission.nextCourse) {
        nextCourse.value = submission.nextCourse
        console.log('Set nextCourse from root level:', nextCourse.value)
      } else if (submission.data?.nextCourse) {
        nextCourse.value = submission.data.nextCourse
        console.log('Set nextCourse from data level:', nextCourse.value)
      } else {
        console.log('No next course found in response')
        // For testing: Let's temporarily set a fake next course if passed
        if (passed.value) {
          console.log('Student passed but no next course - this might indicate end of course sequence')
        }
      }
      
      // Handle student level progression data
      if (submission.data?.studentLevel) {
        previousLevel.value = submission.data.studentLevel.previousLevel
        newLevel.value = submission.data.studentLevel.newLevel
        levelChanged.value = submission.data.studentLevel.levelChanged
        
        console.log('📊 Level Progression:', {
          previous: previousLevel.value,
          new: newLevel.value,
          changed: levelChanged.value
        })
        
        // Update auth store user data so level badge updates immediately
        if (levelChanged.value && newLevel.value) {
          const authStore = useAuthStore()
          const updatedUser = { ...authStore.user, difficultyPreference: newLevel.value }
          authStore.setUser(updatedUser)
          console.log('✅ Updated user level in auth store to:', newLevel.value)
        }
      }
      
      console.log('Final nextCourse value:', nextCourse.value)
      console.log('Final passed value:', passed.value)
      console.log('Will show next course section?', !!(nextCourse.value && passed.value))
      
    } else {
      error.value = submission?.message || 'Kosa la kuwasilisha Jaribio'
      console.error('Submission failed:', submission)
    }

  } catch (err) {
    error.value = err.message || 'Hitilafu isiyotarajiwa imetokea'
    console.error('Unexpected error:', err)
  } finally {
    loading.value = false
  }
}

// Update the goToNextCourse method:
const goToNextCourse = () => {
  if (nextCourse.value?._id) {
    router.push(`/course/${nextCourse.value._id}`)
  } else {
    console.warn('No next course available')
  }
}




const returnToCourse = async () => {
  try {
    loading.value = true
    const courseStore = useCourseStore()
    
    // Fetch the course again
    const data = await courseStore.fetchCourseDetails(route.params.id)

    // Filter only remedial content if quiz failed
    if (!passed.value) {
      const remedialIds = quizStore.lastSubmission?.remedialContent?.map(r => r.subSectionId) || []
      data.courseContent = (data.courseContent || []).map(section => {
        const subs = section.subSection || []
        const filteredSubs = subs.filter(sub => remedialIds.includes(sub._id))
        return { ...section, subSection: filteredSubs }
      })
    }

    courseData.value = data

    // Push to CoursePlayer route
    router.push(`/course/${route.params.id}`)

  } catch (err) {
    console.error('Failed to reload course after quiz fail:', err)
  } finally {
    loading.value = false
  }
}



onMounted(() => {
  loadQuizData()
})
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
}

/* Enhanced animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.hover\:scale-102:hover {
  transform: scale(1.02);
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

/* Smooth transitions for question navigation */
.question-enter-active,
.question-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.question-enter-from,
.question-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* Interactive hover effects */
.group:hover .transform {
  animation: float 2s ease-in-out infinite;
}

/* Button press effect */
button:active {
  transform: scale(0.98);
}

/* Glassmorphism effect for cards */
.bg-white {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
}

/* Enhanced shadows */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Drag and drop specific styles */
.cursor-move:active {
  cursor: grabbing !important;
}

/* Drag over animation */
@keyframes dragPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.animate-pulse {
  animation: dragPulse 1s ease-in-out infinite;
}
</style>