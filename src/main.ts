import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/main.css'
import './styles/shared.css'
import './styles/animations.css'
import './styles/mobile.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')