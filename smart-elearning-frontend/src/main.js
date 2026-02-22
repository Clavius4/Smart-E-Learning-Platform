import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles/tailwind.css'
import './assets/styles/main.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import router from './router'
import App from './App.vue'

// ---- FontAwesome Setup ----
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMedal, faArrowRight, faTrophy, faStar } from '@fortawesome/free-solid-svg-icons'

// add the icons you plan to use
library.add(faMedal, faArrowRight, faTrophy, faStar)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(Toast)
app.use(router)

// register the font-awesome-icon component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')

