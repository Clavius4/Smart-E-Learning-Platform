<template>
    <div v-if="isLoading" class="app-loader-overlay">
      <div class="app-loader-content">
        <!-- Floating bubbles -->
        <div class="bubbles">
          <div class="bubble bubble-1"></div>
          <div class="bubble bubble-2"></div>
          <div class="bubble bubble-3"></div>
          <div class="bubble bubble-4"></div>
          <div class="bubble bubble-5"></div>
          <div class="bubble bubble-6"></div>
        </div>

        <!-- Main hamster wheel with sparkles -->
        <div class="wheel-container">
          <div aria-label="Colorful hamster running in a sparkling wheel" role="img" class="wheel-and-hamster">
            <div class="wheel"></div>
            <div class="hamster">
              <div class="hamster__body">
                <div class="hamster__head">
                  <div class="hamster__ear"></div>
                  <div class="hamster__eye"></div>
                  <div class="hamster__nose"></div>
                </div>
                <div class="hamster__limb hamster__limb--fr"></div>
                <div class="hamster__limb hamster__limb--fl"></div>
                <div class="hamster__limb hamster__limb--br"></div>
                <div class="hamster__limb hamster__limb--bl"></div>
                <div class="hamster__tail"></div>
              </div>
            </div>
            <div class="spoke"></div>
          </div>
          
          <!-- Sparkles around wheel -->
          <div class="sparkles">
            <div class="sparkle sparkle-1">✨</div>
            <div class="sparkle sparkle-2">⭐</div>
            <div class="sparkle sparkle-3">✨</div>
            <div class="sparkle sparkle-4">🌟</div>
            <div class="sparkle sparkle-5">✨</div>
            <div class="sparkle sparkle-6">⭐</div>
            <div class="sparkle sparkle-7">✨</div>
            <div class="sparkle sparkle-8">🌟</div>
          </div>
        </div>

        <!-- Enhanced loading text -->
        <div class="loading-text-wrapper">
          <p class="loading-text">
            <span class="bounce-letter">L</span>
            <span class="bounce-letter">o</span>
            <span class="bounce-letter">a</span>
            <span class="bounce-letter">d</span>
            <span class="bounce-letter">i</span>
            <span class="bounce-letter">n</span>
            <span class="bounce-letter">g</span>
            <span class="bounce-letter">&nbsp;</span>
            <span class="bounce-letter">e</span>
            <span class="bounce-letter">-</span>
            <span class="bounce-letter">S</span>
            <span class="bounce-letter">m</span>
            <span class="bounce-letter">a</span>
            <span class="bounce-letter">r</span>
            <span class="bounce-letter">t</span>
            <span class="bounce-letter">&nbsp;</span>
            <span class="bounce-letter">L</span>
            <span class="bounce-letter">e</span>
            <span class="bounce-letter">a</span>
            <span class="bounce-letter">r</span>
            <span class="bounce-letter">n</span>
            <span class="bounce-letter">i</span>
            <span class="bounce-letter">n</span>
            <span class="bounce-letter">g</span>
            <span class="bounce-letter">.</span>
            <span class="bounce-letter">.</span>
            <span class="bounce-letter">.</span>
          </p>
          
          <!-- Progress dots -->
          <div class="progress-dots">
            <div class="dot dot-1"></div>
            <div class="dot dot-2"></div>
            <div class="dot dot-3"></div>
          </div>
        </div>

        <!-- Fun message -->
        <div class="fun-message">
          <p class="message"> Ka tayari kwa ajili ya kujifunza! </p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AppLoader',
    props: {
      isLoading: {
        type: Boolean,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .app-loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    overflow: hidden;
  }
  
  .app-loader-content {
    text-align: center;
    position: relative;
  }

  /* Floating bubbles */
  .bubbles {
    position: absolute;
    top: -200px;
    left: -200px;
    right: -200px;
    bottom: -200px;
    pointer-events: none;
  }

  .bubble {
    position: absolute;
    border-radius: 50%;
    opacity: 0.7;
    animation: float 6s ease-in-out infinite;
  }

  .bubble-1 {
    width: 60px;
    height: 60px;
    background: #ff6b6b;
    top: 10%;
    left: 15%;
    animation-delay: 0s;
  }

  .bubble-2 {
    width: 80px;
    height: 80px;
    background: #4ecdc4;
    top: 20%;
    right: 10%;
    animation-delay: 1s;
  }

  .bubble-3 {
    width: 45px;
    height: 45px;
    background: #45b7d1;
    top: 70%;
    left: 10%;
    animation-delay: 2s;
  }

  .bubble-4 {
    width: 70px;
    height: 70px;
    background: #f9ca24;
    bottom: 15%;
    right: 20%;
    animation-delay: 3s;
  }

  .bubble-5 {
    width: 55px;
    height: 55px;
    background: #f0932b;
    top: 40%;
    left: 80%;
    animation-delay: 4s;
  }

  .bubble-6 {
    width: 40px;
    height: 40px;
    background: #eb4d4b;
    bottom: 30%;
    left: 70%;
    animation-delay: 5s;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-30px) rotate(120deg);
    }
    66% {
      transform: translateY(15px) rotate(240deg);
    }
  }

  /* Wheel container */
  .wheel-container {
    position: relative;
    margin: 40px 0;
  }

  /* Sparkles around wheel */
  .sparkles {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    pointer-events: none;
  }

  .sparkle {
    position: absolute;
    font-size: 24px;
    animation: sparkle 2s ease-in-out infinite;
  }

  .sparkle-1 { top: 0%; left: 50%; animation-delay: 0s; }
  .sparkle-2 { top: 20%; right: 10%; animation-delay: 0.3s; }
  .sparkle-3 { top: 50%; right: 0%; animation-delay: 0.6s; }
  .sparkle-4 { bottom: 20%; right: 10%; animation-delay: 0.9s; }
  .sparkle-5 { bottom: 0%; left: 50%; animation-delay: 1.2s; }
  .sparkle-6 { bottom: 20%; left: 10%; animation-delay: 1.5s; }
  .sparkle-7 { top: 50%; left: 0%; animation-delay: 1.8s; }
  .sparkle-8 { top: 20%; left: 10%; animation-delay: 2.1s; }

  @keyframes sparkle {
    0%, 100% {
      opacity: 0;
      transform: scale(0.5) rotate(0deg);
    }
    50% {
      opacity: 1;
      transform: scale(1.2) rotate(180deg);
    }
  }

  /* Enhanced loading text */
  .loading-text-wrapper {
    margin-top: 30px;
  }

  .loading-text {
    margin-top: 20px;
    font-size: 2rem;
    color: #fff;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    font-family: 'Comic Sans MS', cursive, sans-serif;
    margin-bottom: 20px;
  }

  .bounce-letter {
    display: inline-block;
    animation: bounce 1.5s ease-in-out infinite;
  }

  .bounce-letter:nth-child(1) { animation-delay: 0.1s; }
  .bounce-letter:nth-child(2) { animation-delay: 0.2s; }
  .bounce-letter:nth-child(3) { animation-delay: 0.3s; }
  .bounce-letter:nth-child(4) { animation-delay: 0.4s; }
  .bounce-letter:nth-child(5) { animation-delay: 0.5s; }
  .bounce-letter:nth-child(6) { animation-delay: 0.6s; }
  .bounce-letter:nth-child(7) { animation-delay: 0.7s; }
  .bounce-letter:nth-child(8) { animation-delay: 0.8s; }
  .bounce-letter:nth-child(9) { animation-delay: 0.9s; }
  .bounce-letter:nth-child(10) { animation-delay: 1.0s; }
  .bounce-letter:nth-child(11) { animation-delay: 1.1s; }
  .bounce-letter:nth-child(12) { animation-delay: 1.2s; }
  .bounce-letter:nth-child(13) { animation-delay: 1.3s; }
  .bounce-letter:nth-child(14) { animation-delay: 1.4s; }
  .bounce-letter:nth-child(15) { animation-delay: 1.5s; }
  .bounce-letter:nth-child(16) { animation-delay: 1.6s; }
  .bounce-letter:nth-child(17) { animation-delay: 1.7s; }
  .bounce-letter:nth-child(18) { animation-delay: 1.8s; }
  .bounce-letter:nth-child(19) { animation-delay: 1.9s; }
  .bounce-letter:nth-child(20) { animation-delay: 2.0s; }
  .bounce-letter:nth-child(21) { animation-delay: 2.1s; }
  .bounce-letter:nth-child(22) { animation-delay: 2.2s; }
  .bounce-letter:nth-child(23) { animation-delay: 2.3s; }
  .bounce-letter:nth-child(24) { animation-delay: 2.4s; }
  .bounce-letter:nth-child(25) { animation-delay: 2.5s; }
  .bounce-letter:nth-child(26) { animation-delay: 2.6s; }
  .bounce-letter:nth-child(27) { animation-delay: 2.7s; }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  /* Progress dots */
  .progress-dots {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 25px;
  }

  .dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    animation: dot-pulse 1.5s ease-in-out infinite;
  }

  .dot-1 {
    background: #ff6b6b;
    animation-delay: 0s;
  }

  .dot-2 {
    background: #4ecdc4;
    animation-delay: 0.5s;
  }

  .dot-3 {
    background: #45b7d1;
    animation-delay: 1s;
  }

  @keyframes dot-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.4);
      opacity: 1;
    }
  }

  /* Fun message */
  .fun-message {
    margin-top: 25px;
  }

  .message {
    font-size: 1.3rem;
    color: #fff;
    font-weight: 600;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    font-family: 'Comic Sans MS', cursive, sans-serif;
    animation: message-glow 2s ease-in-out infinite alternate;
  }

  @keyframes message-glow {
    from {
      text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    }
    to {
      text-shadow: 1px 1px 15px rgba(255,255,255,0.6);
    }
  }
  
  /* Enhanced hamster wheel styles */
  .wheel-and-hamster {
    --dur: 1s;
    position: relative;
    width: 12em;
    height: 12em;
    font-size: 16px;
    margin: 0 auto;
  }
  
  .wheel,
  .hamster,
  .hamster div,
  .spoke {
    position: absolute;
  }
  
  .wheel,
  .spoke {
    border-radius: 50%;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  .wheel {
    background: radial-gradient(100% 100% at center,hsla(0,0%,60%,0) 47.8%,#ff6b6b 48%);
    z-index: 2;
    box-shadow: 0 0 25px rgba(255, 107, 107, 0.6);
  }
  
  .hamster {
    animation: hamster var(--dur) ease-in-out infinite;
    top: 50%;
    left: calc(50% - 3.5em);
    width: 7em;
    height: 3.75em;
    transform: rotate(4deg) translate(-0.8em,1.85em);
    transform-origin: 50% 0;
    z-index: 1;
  }
  
  .hamster__head {
    animation: hamsterHead var(--dur) ease-in-out infinite;
    background: linear-gradient(45deg, #ffeaa7, #fdcb6e);
    border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
    box-shadow: 0 -0.25em 0 #fff3cd inset,
      0.75em -1.55em 0 #fff8dc inset;
    top: 0;
    left: -2em;
    width: 2.75em;
    height: 2.5em;
    transform-origin: 100% 50%;
  }
  
  .hamster__ear {
    animation: hamsterEar var(--dur) ease-in-out infinite;
    background: #ff7675;
    border-radius: 50%;
    box-shadow: -0.25em 0 #fdcb6e inset;
    top: -0.25em;
    right: -0.25em;
    width: 0.75em;
    height: 0.75em;
    transform-origin: 50% 75%;
  }
  
  .hamster__eye {
    animation: hamsterEye var(--dur) linear infinite;
    background-color: #2d3436;
    border-radius: 50%;
    top: 0.375em;
    left: 1.25em;
    width: 0.5em;
    height: 0.5em;
    box-shadow: 0 0 3px rgba(45, 52, 54, 0.8);
  }
  
  .hamster__nose {
    background: #ff7675;
    border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
    top: 0.75em;
    left: 0;
    width: 0.2em;
    height: 0.25em;
  }
  
  .hamster__body {
    animation: hamsterBody var(--dur) ease-in-out infinite;
    background: linear-gradient(135deg, #fff8dc, #ffeaa7);
    border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
    box-shadow: 0.1em 0.75em 0 #fdcb6e inset,
      0.15em -0.5em 0 #fff3cd inset;
    top: 0.25em;
    left: 2em;
    width: 4.5em;
    height: 3em;
    transform-origin: 17% 50%;
    transform-style: preserve-3d;
  }
  
  .hamster__limb--fr,
  .hamster__limb--fl {
    clip-path: polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);
    top: 2em;
    left: 0.5em;
    width: 1em;
    height: 1.5em;
    transform-origin: 50% 0;
  }
  
  .hamster__limb--fr {
    animation: hamsterFRLimb var(--dur) linear infinite;
    background: linear-gradient(#fff3cd 80%,#ff7675 80%);
    transform: rotate(15deg) translateZ(-1px);
  }
  
  .hamster__limb--fl {
    animation: hamsterFLLimb var(--dur) linear infinite;
    background: linear-gradient(#fff8dc 80%,#ffb3b3 80%);
    transform: rotate(15deg);
  }
  
  .hamster__limb--br,
  .hamster__limb--bl {
    border-radius: 0.75em 0.75em 0 0;
    clip-path: polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);
    top: 1em;
    left: 2.8em;
    width: 1.5em;
    height: 2.5em;
    transform-origin: 50% 30%;
  }
  
  .hamster__limb--br {
    animation: hamsterBRLimb var(--dur) linear infinite;
    background: linear-gradient(#fff3cd 90%,#ff7675 90%);
    transform: rotate(-25deg) translateZ(-1px);
  }
  
  .hamster__limb--bl {
    animation: hamsterBLLimb var(--dur) linear infinite;
    background: linear-gradient(#fff8dc 90%,#ffb3b3 90%);
    transform: rotate(-25deg);
  }
  
  .hamster__tail {
    animation: hamsterTail var(--dur) linear infinite;
    background: #ffb3b3;
    border-radius: 0.25em 50% 50% 0.25em;
    box-shadow: 0 -0.2em 0 #ff7675 inset;
    top: 1.5em;
    right: -0.5em;
    width: 1em;
    height: 0.5em;
    transform: rotate(30deg) translateZ(-1px);
    transform-origin: 0.25em 0.25em;
  }
  
  .spoke {
    animation: spoke var(--dur) linear infinite;
    background: radial-gradient(100% 100% at center,#4ecdc4 4.8%,hsla(0,0%,60%,0) 5%),
      linear-gradient(hsla(0,0%,55%,0) 46.9%,#45b7d1 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50% / 99% 99% no-repeat;
  }
  
  /* Original hamster animations */
  @keyframes hamster {
    from, to {
      transform: rotate(4deg) translate(-0.8em,1.85em);
    }
  
    50% {
      transform: rotate(0) translate(-0.8em,1.85em);
    }
  }
  
  @keyframes hamsterHead {
    from, 25%, 50%, 75%, to {
      transform: rotate(0);
    }
  
    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(8deg);
    }
  }
  
  @keyframes hamsterEye {
    from, 90%, to {
      transform: scaleY(1);
    }
  
    95% {
      transform: scaleY(0);
    }
  }

  @keyframes hamsterEar {
    from, 25%, 50%, 75%, to {
      transform: rotate(0);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(12deg);
    }
  }

  @keyframes hamsterBody {
    from, 25%, 50%, 75%, to {
      transform: rotate(0);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(-2deg);
    }
  }

  @keyframes hamsterFRLimb {
    from, 25%, 50%, 75%, to {
      transform: rotate(50deg) translateZ(-1px);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(-30deg) translateZ(-1px);
    }
  }
  
  @keyframes hamsterFLLimb {
    from, 25%, 50%, 75%, to {
      transform: rotate(-30deg);
    }
  
    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(50deg);
    }
  }
  
  @keyframes hamsterBRLimb {
    from, 25%, 50%, 75%, to {
      transform: rotate(-60deg) translateZ(-1px);
    }
  
    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(20deg) translateZ(-1px);
    }
  }
  
  @keyframes hamsterBLLimb {
    from, 25%, 50%, 75%, to {
      transform: rotate(20deg);
    }
  
    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(-60deg);
    }
  }
  
  @keyframes hamsterTail {
    from, 25%, 50%, 75%, to {
      transform: rotate(30deg) translateZ(-1px);
    }
  
    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(10deg) translateZ(-1px);
    }
  }
  
  @keyframes spoke {
    from {
      transform: rotate(0);
    }
  
    to {
      transform: rotate(-1turn);
    }
  }
  </style>