// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ToastPlugin from 'vue-toast-notification'

// Vuetify styles and Font Icons
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import 'vue-toast-notification/dist/theme-bootstrap.css'

// Vuetify core components & directives
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Importar alias y set de MDI
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Chart.js (registrar solo una vez)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
)

// Crear instancia de Vuetify con iconset MDI y configuración completa
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',    // Usamos @mdi/font
    aliases,              // Mapeo de alias estándar (incluye 'mdi-send')
    sets: {
      mdi,                // Conjunto de iconos MDI
    },
  },
  theme: {
    defaultTheme: 'light'
  }
})

// Crear y montar la app
const app = createApp(App)

// 🔹 Montar Pinia antes que nada para habilitar los stores
app.use(createPinia())

// 🔹 Montar el router y luego Vuetify, Toast, etc.
app.use(router)
app.use(vuetify)
app.use(ToastPlugin)

app.mount('#app')
