<template>
  <div class="assessment-page">
    <MainNav />
    <div class="container mx-auto px-4 py-8 max-w-5xl mt-20">
      <!-- Loading state with kid-friendly animations -->
      <div v-if="loading" class="text-center py-16">
        <div class="relative mb-6">
          <div class="animate-spin rounded-full h-24 w-24 border-6 border-pink-200 border-t-pink-500 mx-auto"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-4xl animate-bounce">🌟</div>
          </div>
        </div>
        <p class="mt-6 text-2xl text-pink-600 font-bold">Tunaandaa mtihani wako...</p>
        <div class="mt-4 flex justify-center space-x-3">
          <div class="w-4 h-4 bg-pink-400 rounded-full animate-bounce"></div>
          <div class="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <div class="mt-6 flex justify-center space-x-4">
          <div class="text-3xl animate-pulse">🎈</div>
          <div class="text-3xl animate-pulse" style="animation-delay: 0.5s">🎊</div>
          <div class="text-3xl animate-pulse" style="animation-delay: 1s">🎉</div>
        </div>
      </div>
      
      <!-- Error state with friendly message -->
      <div v-else-if="error" class="bg-gradient-to-r from-red-100 to-pink-100 border-4 border-red-300 rounded-3xl p-8 mb-8 shadow-2xl">
        <div class="flex items-center justify-center">
          <div class="flex-shrink-0">
            <div class="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mr-6">
              <div class="text-4xl">😔</div>
            </div>
          </div>
          <div class="text-center">
            <p class="text-xl text-red-700 font-bold mb-4">Oops! Kuna tatizo kidogo...</p>
            <p class="text-red-600 mb-4">{{ error }}</p>
            <button 
              @click="loadAssessment"
              class="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg"
            >
              🔄 Jaribu Tena
            </button>
          </div>
        </div>
      </div>

      <!-- Already passed message -->
      <div v-else-if="alreadyPassed" class="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-green-300 rounded-3xl p-8 mb-8 shadow-2xl text-center">
        <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
          <span class="text-5xl">🏆</span>
        </div>
        <h1 class="text-4xl font-bold mb-4 text-green-800">Vizuri Sana!</h1>
        <p class="text-2xl text-green-700 font-semibold mb-6">Tayari umeshapita mtihani huu!</p>
        <div class="flex justify-center space-x-6">
          <div class="text-4xl animate-pulse">🎉</div>
          <div class="text-4xl animate-pulse" style="animation-delay: 0.3s">⭐</div>
          <div class="text-4xl animate-pulse" style="animation-delay: 0.6s">🌟</div>
        </div>
        <button
          @click="returnToLevels"
          class="mt-8 px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 text-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-xl"
        >
          🏠 Rudi Nyumbani
        </button>
      </div>
      
      <!-- Assessment content -->
      <div v-else-if="assessment && !assessmentSubmitted" class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl shadow-2xl p-8 border-4 border-purple-300">
        <!-- Assessment header with fun elements -->
        <div class="mb-8">
          <div class="text-center mb-6">
            <div class="flex justify-center space-x-4 mb-4">
              <div class="text-4xl animate-bounce"></div>
              <div class="text-4xl animate-bounce" style="animation-delay: 0.2s">✨</div>
              <div class="text-4xl animate-bounce" style="animation-delay: 0.4s">🎯</div>
            </div>
            <h1 class="text-4xl font-bold mb-4 text-purple-900 tracking-wide">{{ assessment.title || 'Mtihani wa Kiwango' }}</h1>
            <div class="inline-flex items-center bg-white rounded-3xl px-8 py-4 shadow-lg border-4 border-purple-300">
              <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <span class="text-white font-bold text-2xl">{{ currentQuestionIndex + 1 }}</span>
              </div>
              <span class="text-2xl font-bold text-purple-800">
                kati ya {{ assessment.questions.length }} maswali
              </span>
            </div>
          </div>
          
          <!-- Fun progress indicators -->
          <div class="flex justify-between items-center mb-6 px-4">
            <div class="bg-white rounded-3xl px-8 py-4 shadow-lg border-4 border-yellow-300">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mr-3 flex items-center justify-center shadow-md">
                  <span class="text-white font-bold text-lg">🌟</span>
                </div>
                <span class="text-2xl font-bold text-yellow-700">
                  Alama: {{ calculateCurrentScore() }}/{{ assessment.questions.length }}
                </span>
              </div>
            </div>
            
            <div class="bg-white rounded-3xl px-8 py-4 shadow-lg border-4 border-green-300">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3 flex items-center justify-center shadow-md">
                  <span class="text-white font-bold text-lg">%</span>
                </div>
                <span class="text-2xl font-bold text-green-700">
                  {{ Math.round((calculateCurrentScore() / assessment.questions.length) * 100) }}%
                </span>
              </div>
            </div>
          </div>
          
          <!-- Animated progress bar -->
          <div class="w-full bg-white rounded-3xl p-3 shadow-inner border-4 border-purple-200">
            <div 
              class="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-6 rounded-2xl transition-all duration-700 ease-out shadow-lg relative overflow-hidden" 
              :style="{ width: `${((currentQuestionIndex + 1) / assessment.questions.length) * 100}%` }"
            >
              <div class="absolute inset-0 bg-white opacity-40 animate-pulse"></div>
              <div class="absolute right-2 top-1 text-xs font-bold text-white">🚀</div>
            </div>
          </div>
        </div>
        
        <!-- Current question with enhanced child-friendly design -->
        <div class="mb-8">
          <div class="bg-white rounded-3xl p-8 shadow-xl border-4 border-blue-200 mb-6 relative overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute top-4 right-4 text-6xl opacity-10 animate-spin-slow">⭐</div>
            <div class="absolute bottom-4 left-4 text-4xl opacity-20 animate-bounce">🎈</div>
            
            <div class="flex items-start mb-6 relative z-10">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mr-6 shadow-lg transform rotate-6 hover:rotate-12 transition-transform duration-300">
                <span class="text-white font-bold text-3xl">?</span>
              </div>
              <h2 class="text-3xl font-bold text-blue-900 leading-relaxed flex-1 pt-2">{{ currentQuestion.question }}</h2>
            </div>
            
            <!-- Question image with fun frame -->
            <div v-if="currentQuestion.questionImage" class="mb-6 flex justify-center">
              <div class="relative group">
                <div class="absolute -inset-4 bg-gradient-to-r from-pink-400 to-purple-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <img 
                  :src="currentQuestion.questionImage" 
                  class="relative max-w-full rounded-2xl shadow-2xl border-6 border-white transition-transform duration-200 group-hover:scale-105"
                >
              </div>
            </div>
            <div v-else class="mb-6 flex justify-center">
              <div class="w-32 h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-500">
                <div class="text-6xl animate-pulse">🎯</div>
              </div>
            </div>
          </div>
          
          <!-- Answer options -->
          <!-- Drag and Drop Interface for Kids -->
          <div v-if="isDragDrop" class="space-y-8">
            <div class="text-center mb-8">
              <div class="inline-flex items-center bg-gradient-to-r from-purple-200 to-pink-200 rounded-3xl px-8 py-4 shadow-lg border-4 border-purple-300">
                <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <div class="text-2xl">🎮</div>
                </div>
                <p class="text-purple-800 font-bold text-xl">Buruta majibu kwenye maeneo sahihi!</p>
              </div>
            </div>
            
            <!-- Kid-friendly drop zones -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div
                v-for="(pair, pairIndex) in currentQuestion.pairs"
                :key="`pair-${pairIndex}`"
                class="relative group"
                @dragover.prevent="handleDragOver($event, pairIndex)"
                @dragenter.prevent="handleDragEnter($event, pairIndex)"
                @dragleave="handleDragLeave($event, pairIndex)"
                @drop="handleDrop(pairIndex, $event)"
              >
                <div 
                  class="min-h-[140px] p-8 rounded-3xl transition-all duration-300 border-4 shadow-xl relative overflow-hidden"
                  :class="{
                    'border-dashed border-blue-400 bg-gradient-to-br from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200': !getDropAnswer(pairIndex),
                    'border-solid border-green-500 bg-gradient-to-br from-green-100 to-blue-100 shadow-2xl': getDropAnswer(pairIndex),
                    'border-purple-500 bg-gradient-to-br from-purple-200 to-pink-200 transform scale-105': dragOverZone === pairIndex
                  }"
                >
                  <!-- Decorative background -->
                  <div class="absolute inset-0 opacity-10">
                    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25px 25px, #8b5cf6 3px, transparent 3px); background-size: 50px 50px;"></div>
                  </div>
                  
                  <div class="relative z-10 flex flex-col h-full justify-center items-center text-center">
                    <!-- Zone label with emoji -->
                    <div class="flex items-center mb-4">
                      <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                        <span class="text-white font-bold">{{ pairIndex + 1 }}</span>
                      </div>
                      <span class="font-bold text-purple-900 text-xl">{{ pair.drop }}</span>
                    </div>
                    
                    <!-- Dropped answer display -->
                    <div v-if="getDropAnswer(pairIndex)" class="flex items-center justify-between w-full bg-white rounded-3xl p-4 shadow-lg border-3 border-gray-200">
                      <div class="flex items-center flex-1">
                        <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 shadow-md">
                          <div class="text-xl">✓</div>
                        </div>
                        <span class="text-lg font-bold text-gray-800">{{ getDropAnswer(pairIndex) }}</span>
                      </div>
                      <button 
                        @click.stop="removeAnswer(pairIndex)"
                        class="ml-3 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md"
                      >
                        <div class="text-white text-xl">✕</div>
                      </button>
                    </div>
                    
                    <!-- Empty state with fun design -->
                    <div v-else class="flex flex-col items-center">
                      <div class="w-20 h-20 border-4 border-dashed border-purple-400 rounded-3xl flex items-center justify-center mb-4 group-hover:border-purple-600 transition-all duration-200">
                        <div class="text-4xl animate-bounce">🎯</div>
                      </div>
                      <span class="text-purple-600 italic font-semibold text-lg">Buruta jibu hapa!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Draggable options with kid-friendly design -->
            <div class="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-8 border-4 border-yellow-300 shadow-2xl">
              <div class="text-center mb-6">
                <h3 class="text-2xl font-bold text-orange-800 mb-3">Chagua kutoka hapa! 🎈</h3>
                <div class="w-24 h-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mx-auto"></div>
              </div>
              
              <div class="flex flex-wrap gap-6 justify-center">
                <div
                  v-for="(option, optIndex) in availableDragOptions"
                  :key="`drag-option-${optIndex}`"
                  class="group relative"
                  draggable="true"
                  :draggable="!isOptionUsed(option)"
                  @dragstart="handleDragStart(option, $event)"
                  @dragend="handleDragEnd"
                >
                  <div 
                    class="px-8 py-4 rounded-3xl shadow-lg cursor-move transition-all duration-300 transform select-none border-4"
                    :class="{
                      'bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:from-pink-500 hover:to-purple-600 hover:scale-110 hover:shadow-2xl border-pink-300': !isOptionUsed(option),
                      'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-60': isOptionUsed(option),
                      'animate-wiggle': draggingOption && draggingOption === option
                    }"
                  >
                    <div class="flex items-center">
                      <div class="w-8 h-8 mr-3 flex items-center justify-center">
                        <div class="text-2xl">
                          {{ !isOptionUsed(option) ? '🎈' : '💤' }}
                        </div>
                      </div>
                      <span class="font-bold text-lg">{{ option }}</span>
                    </div>
                    
                    <!-- Fun drag indicator -->
                    <div v-if="!isOptionUsed(option)" class="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <div class="text-lg">✨</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Fun help text -->
              <div class="mt-6 text-center">
                <p class="text-orange-700 text-lg font-semibold">
                  🎯 Bonyeza na buruta majibu kwenda kwenye maeneo yanayolingana!
                </p>
              </div>
            </div>
          </div>

          <!-- Multiple Choice Interface for Kids -->
          <div v-else class="space-y-6">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="`mcq-${index}`"
              @click="selectAnswer(currentQuestion._id, index)"
              class="group p-8 border-4 rounded-3xl cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-2xl relative overflow-hidden"
              :class="{
                'bg-gradient-to-r from-green-200 to-blue-200 border-green-400 shadow-xl': selectedAnswers[currentQuestion._id] === index,
                'bg-white border-purple-300 hover:bg-purple-50 hover:border-purple-400 shadow-lg': selectedAnswers[currentQuestion._id] !== index
              }"
            >
              <!-- Decorative elements -->
              <div v-if="selectedAnswers[currentQuestion._id] === index" class="absolute top-4 right-4 text-4xl animate-bounce">🌟</div>
              <div v-else class="absolute top-4 right-4 text-4xl opacity-30 group-hover:opacity-60 transition-opacity">✨</div>
              
              <div class="flex items-center relative z-10">
                <div class="w-16 h-16 rounded-3xl border-4 flex items-center justify-center mr-8 font-bold text-2xl transition-all duration-200 transform group-hover:scale-110 shadow-lg"
                  :class="{
                    'bg-gradient-to-br from-green-500 to-blue-600 border-green-400 text-white': selectedAnswers[currentQuestion._id] === index,
                    'bg-white border-purple-400 text-purple-700': selectedAnswers[currentQuestion._id] !== index
                  }">
                  {{ String.fromCharCode(65 + index) }}
                </div>
                <div class="flex-1">
                  <p class="font-bold text-2xl text-purple-900 leading-relaxed">{{ option.text || option }}</p>
                  <div v-if="option.image" class="mt-4">
                    <img 
                      :src="option.image" 
                      class="max-w-full rounded-2xl shadow-lg border-4 border-purple-200 transition-transform duration-200 group-hover:scale-105"
                    >
                  </div>
                  <div v-else class="mt-4 flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mr-4 transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                      <div class="text-2xl">{{ selectedAnswers[currentQuestion._id] === index ? '🎯' : '🎈' }}</div>
                    </div>
                    <span class="text-purple-700 font-semibold text-lg">{{ selectedAnswers[currentQuestion._id] === index ? 'Umechagua hili!' : 'Bonyeza kuchagua' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Fun navigation buttons -->
        <div class="flex justify-between items-center mt-12">
          <button
            @click="navigateQuestion('prev')"
            :disabled="currentQuestionIndex === 0"
            class="px-10 py-5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-3xl hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-bold text-xl shadow-xl border-4 border-gray-300"
          >
            <div class="flex items-center">
              <div class="text-2xl mr-3">🔙</div>
              <span>Swali Lilopita</span>
            </div>
          </button>
          
          <div class="flex items-center space-x-6">
            <div class="bg-white rounded-3xl px-8 py-4 shadow-lg border-4 border-blue-200">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 animate-pulse shadow-md">
                  <div class="flex items-center justify-center h-full text-white font-bold">{{ currentQuestionIndex + 1 }}</div>
                </div>
                <span class="text-blue-800 font-bold text-xl">Swali {{ currentQuestionIndex + 1 }}</span>
              </div>
            </div>
          </div>
          
          <button
            v-if="!isLastQuestion"
            @click="navigateQuestion('next')"
            :disabled="!isQuestionAnswered"
            class="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-bold text-xl shadow-xl border-4 border-blue-300"
          >
            <div class="flex items-center">
              <span>Swali Linalofuata</span>
              <div class="text-2xl ml-3">🔜</div>
            </div>
          </button>
          
          <button
            v-else
            @click="submitAssessment"
            :disabled="!isQuestionAnswered || submitting"
            class="px-10 py-5 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-3xl hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-bold text-xl shadow-xl border-4 border-green-300"
          >
            <div class="flex items-center">
              <div class="text-2xl mr-3">{{ submitting ? '⏳' : '🏁' }}</div>
              <span>{{ submitting ? 'Inawasilisha...' : 'Maliza Mtihani' }}</span>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Assessment results with celebration -->
      <div v-else-if="assessmentSubmitted" class="bg-gradient-to-br from-yellow-100 to-green-100 rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 text-center relative overflow-hidden">
        <!-- Celebration animations -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-10 left-10 text-4xl animate-bounce" style="animation-delay: 0s">🎉</div>
          <div class="absolute top-10 right-10 text-4xl animate-bounce" style="animation-delay: 0.5s">🎊</div>
          <div class="absolute bottom-10 left-20 text-4xl animate-bounce" style="animation-delay: 1s">⭐</div>
          <div class="absolute bottom-10 right-20 text-4xl animate-bounce" style="animation-delay: 1.5s">🌟</div>
        </div>
        
        <div class="mb-8 relative z-10">
          <div class="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <span class="text-6xl">{{ results.passed ? '🏆' : '💪' }}</span>
          </div>
          <h1 class="text-5xl font-bold mb-4 text-green-800">
            {{ results.passed ? 'Umeshinda!' : 'Vizuri!' }}
          </h1>
          <p class="text-2xl text-green-700 font-semibold">
            {{ results.passed ? 'Umepita mtihani!' : 'Umemaliza mtihani!' }}
          </p>
        </div>
        
        <!-- Score display with fun elements -->
        <div class="mb-8 relative z-10">
          <div class="bg-white rounded-3xl p-8 shadow-xl border-4 border-yellow-300 mb-6">
            <div class="text-7xl font-bold mb-4" 
              :class="{
                'text-green-600': results.percentage >= 60,
                'text-yellow-500': results.percentage >= 40 && results.percentage < 60,
                'text-red-600': results.percentage < 40
              }">
              {{ results.score }} / {{ results.total }}
            </div>
            <div class="text-4xl mb-6 font-bold text-purple-800">
              Umepata {{ results.percentage }}%
            </div>
            
            <!-- Fun animated progress circle -->
            <div class="relative w-40 h-40 mx-auto mb-6">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" stroke="#e5e7eb" stroke-width="6" fill="none"/>
                <circle 
                  cx="50" cy="50" r="35" 
                  :stroke="results.percentage >= 60 ? '#10b981' : results.percentage >= 40 ? '#f59e0b' : '#ef4444'"
                  stroke-width="6" 
                  fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="219.8"
                  :stroke-dashoffset="219.8 - (219.8 * results.percentage / 100)"
                  class="transition-all duration-2000 ease-out"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-3xl font-bold text-purple-800">{{ results.percentage }}%</span>
              </div>
            </div>
          </div>
          
          <!-- Encouraging message -->
          <div v-if="results.passed" class="bg-gradient-to-r from-green-200 to-blue-200 p-8 rounded-3xl mb-6 border-4 border-green-300 shadow-lg">
            <div class="flex items-center justify-center mb-4">
              <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <span class="text-4xl">🌟</span>
              </div>
            </div>
            <p class="text-green-800 font-bold text-2xl">
              Vizuri sana! Umepita mtihani. Sasa unaweza kuenda kiwango kipya!
            </p>
          </div>
          <div v-else class="bg-gradient-to-r from-yellow-200 to-orange-200 p-8 rounded-3xl mb-6 border-4 border-yellow-300 shadow-lg">
            <div class="flex items-center justify-center mb-4">
              <div class="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <span class="text-4xl">💪</span>
              </div>
            </div>
            <p class="text-yellow-800 font-bold text-2xl">
              Jaribu tena! Unahitaji kupata angalau 60% ili upite mtihani.
            </p>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="flex justify-center space-x-6 relative z-10">
          <button
            @click="retryAssessment"
            class="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl hover:from-blue-600 hover:to-purple-700 text-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-xl border-4 border-blue-300"
          >
            <div class="flex items-center">
              <div class="text-2xl mr-3">🔄</div>
              <span>Jaribu Tena</span>
            </div>
          </button>
          
          <button
            @click="returnToLevels"
            class="px-10 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-3xl hover:from-green-600 hover:to-blue-700 text-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-xl border-4 border-green-300"
          >
            <div class="flex items-center">
              <div class="text-2xl mr-3">🏠</div>
              <span>Rudi Nyumbani</span>
            </div>
          </button>
          
          <button
            v-if="results.passed"
            @click="goToNextLevel"
            class="px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-3xl hover:from-yellow-600 hover:to-orange-700 text-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-xl border-4 border-yellow-300"
          >
            <div class="flex items-center">
              <div class="text-2xl mr-3">🚀</div>
              <span>Kiwango Kipya</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainNav from '@/components/navigation/MainNav.vue'
import { useAssessmentStore } from '@/stores/assessmentStore' 

const route = useRoute()
const router = useRouter()
const assessmentStore = useAssessmentStore()

// State
const loading = ref(false)
const error = ref(null)
const assessment = ref(null)
const alreadyPassed = ref(false)
const currentQuestionIndex = ref(0)
const selectedAnswers = ref({})
const assessmentSubmitted = ref(false)
const results = ref({})
const draggingOption = ref(null)
const dragDropAnswers = ref({})
const dragOverZone = ref(null)
const submitting = ref(false)

// Computed
const currentQuestion = computed(() => {
  return assessment.value?.questions?.[currentQuestionIndex.value] || {}
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === assessment.value?.questions?.length - 1
})

const isDragDrop = computed(() => {
  const type = currentQuestion.value?.type?.toLowerCase()
  return type === 'dragdrop' || type === 'drag_drop'
})

const availableDragOptions = computed(() => {
  if (!isDragDrop.value) return []
  return currentQuestion.value?.pairs?.map(pair => pair.drag) || []
})

const isQuestionAnswered = computed(() => {
  const questionId = currentQuestion.value._id
  if (isDragDrop.value) {
    const answers = dragDropAnswers.value[questionId]
    return answers && currentQuestion.value.pairs?.every((_, index) => answers[index])
  } else {
    return selectedAnswers.value[questionId] !== undefined
  }
})

// Watch for store state changes
watch(
  () => assessmentStore.currentAssessment,
  (newAssessment) => {
    assessment.value = newAssessment
  }
)

watch(
  () => assessmentStore.loading,
  (newLoading) => {
    loading.value = newLoading
  }
)

watch(
  () => assessmentStore.error,
  (newError) => {
    error.value = newError
  }
)

watch(
  () => assessmentStore.alreadyPassed,
  (newAlreadyPassed) => {
    alreadyPassed.value = newAlreadyPassed
  }
)

watch(
  () => assessmentStore.submitting,
  (newSubmitting) => {
    submitting.value = newSubmitting
  }
)

// Drag and Drop Methods
const handleDragStart = (option, event) => {
  if (isOptionUsed(option)) {
    event.preventDefault()
    return
  }
  draggingOption.value = option
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', option)
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
    if (dragDropAnswers.value[questionId][key] === draggingOption.value) {
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

const getDropAnswer = (zoneIndex) => {
  const questionId = currentQuestion.value._id
  return dragDropAnswers.value[questionId]?.[zoneIndex]
}

const isOptionUsed = (option) => {
  const questionId = currentQuestion.value._id
  const answers = dragDropAnswers.value[questionId]
  if (!answers) return false
  
  return Object.values(answers).some(answer => answer === option)
}

// Load assessment data
const loadAssessment = async () => {
  try {
    const level = route.params.level
    await assessmentStore.accessAssessmentByLevel(level)
    
    // Initialize answers after loading
    if (assessment.value) {
      assessment.value.questions.forEach(question => {
        selectedAnswers.value[question._id] = undefined
        dragDropAnswers.value[question._id] = {}
      })
    }
  } catch (err) {
    console.error('Assessment loading error:', err)
  }
}

// Calculate current score
const calculateCurrentScore = () => {
  if (!assessment.value) return 0
  
  return assessment.value.questions.reduce((total, question) => {
    if (isDragDropQuestion(question)) {
      const answers = dragDropAnswers.value[question._id]
      if (!answers) return total
      
      const isCorrect = question.pairs?.every((pair, index) => {
        return answers[index] === pair.drag
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

const isDragDropQuestion = (question) => {
  const type = question?.type?.toLowerCase()
  return type === 'dragdrop' || type === 'drag_drop'
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

// Submit assessment
const submitAssessment = async () => {
  try {
    // Prepare answers for submission
    const answersForSubmission = []
    
    assessment.value.questions.forEach((question) => {
      if (isDragDropQuestion(question)) {
        const selectedPairs = []
        const answers = dragDropAnswers.value[question._id] || {}
        
        question.pairs.forEach((_, index) => {
          const dragAnswer = answers[index]
          if (dragAnswer) {
            selectedPairs.push({
              drag: dragAnswer,
              drop: question.pairs[index].drop
            })
          }
        })
        
        answersForSubmission.push({ selectedPairs })
      } else {
        answersForSubmission.push({ selected: selectedAnswers.value[question._id] })
      }
    })
    
    // Submit using assessment store
    const result = await assessmentStore.submitAssessment(assessment.value._id, answersForSubmission)
    
    if (result) {
      results.value = {
        score: result.score,
        total: result.total,
        percentage: result.percentage,
        passed: result.passed,
        results: result.results
      }
      assessmentSubmitted.value = true
    }
  } catch (err) {
    console.error('Assessment submission error:', err)
    error.value = err.message || 'Imeshindikana kuwasilisha mtihani'
  }
}

// Retry assessment
const retryAssessment = () => {
  assessmentSubmitted.value = false
  currentQuestionIndex.value = 0
  selectedAnswers.value = {}
  dragDropAnswers.value = {}
  results.value = {}
  
  // Reinitialize answers
  if (assessment.value) {
    assessment.value.questions.forEach(question => {
      selectedAnswers.value[question._id] = undefined
      dragDropAnswers.value[question._id] = {}
    })
  }
  
  assessmentStore.clearAssessment()
  loadAssessment()
}

// Return to levels
const returnToLevels = () => {
  router.push('/courses')
}

// Go to next level
const goToNextLevel = () => {
  // Implement navigation to next level based on your app structure

  const currentLevel = route.params.level
  const levels = ['beginner', 'intermediate', 'advanced']
  const currentIndex = levels.indexOf(currentLevel)
  
  if (currentIndex !== -1 && currentIndex < levels.length - 1) {
    const nextLevel = levels[currentIndex + 1]
    //router.push(`/level/${nextLevel}`)  
    router.push('/courses')
  } else {
    router.push('/levels')
  }
}

onMounted(() => {
  loadAssessment()
})
</script>

<style scoped>
.assessment-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
}

/* Enhanced kid-friendly animations */
@keyframes wiggle {
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 10s linear infinite;
}

.hover\:scale-102:hover {
  transform: scale(1.02);
}

/* Fun hover effects for kid-friendly elements */
.group:hover .transform {
  animation: float 2s ease-in-out infinite;
}

/* Enhanced shadows for depth */
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

/* Custom scrollbar for kids */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: linear-gradient(45deg, #f1f5f9, #e2e8f0);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #8b5cf6, #3b82f6);
  border-radius: 10px;
  border: 2px solid #f1f5f9;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #7c3aed, #2563eb);
}

/* Button press effects */
button:active {
  transform: scale(0.95);
}

/* Glassmorphism effects */
.bg-white {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
}

/* Fun border animations */
@keyframes border-dance {
  0%, 100% { border-color: #8b5cf6; }
  25% { border-color: #3b82f6; }
  50% { border-color: #06b6d4; }
  75% { border-color: #10b981; }
}

.border-dance {
  animation: border-dance 3s ease-in-out infinite;
}
</style>