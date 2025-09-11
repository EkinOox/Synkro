import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './input.css'
import router from './router'
import { useAuth } from './composables/useAuth'

// PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import './primevue-theme.css'
import 'primeicons/primeicons.css'

// Composants PrimeVue
import Button from 'primevue/button'
import Card from 'primevue/card'
import Menubar from 'primevue/menubar'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'

const app = createApp(App)

app.use(PrimeVue, {
  ripple: true
})

app.use(ToastService)

app.use(router)

// Enregistrer les composants globalement
app.component('Button', Button)
app.component('Card', Card)
app.component('Menubar', Menubar)
app.component('Badge', Badge)
app.component('Avatar', Avatar)
app.component('Toast', Toast)

// Directives
app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)

// Initialiser l'authentification
const auth = useAuth()
auth.initAuth()

// Configuration d'authentification de développement uniquement si pas d'auth existante
if (!auth.isAuthenticated()) {
  const devToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MjYwNTU4ODMsImV4cCI6MTc1NzU5MTg4Mywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoia3lsbGlhbi5kaW9jaG9uLmtkQGdtYWlsLmNvbSJ9.example_new_token'
  const devUser = {
    email: 'kyllian.diochon.kd@gmail.com',
    name: 'Kyllian Diochon', 
    picture: 'https://via.placeholder.com/100',
    sub: 'jwt-user'
  }

  console.log('?? Utilisation du token de développement - pas d\'authentification trouvée')
  
  // Configurer l'authentification pour le développement uniquement
  localStorage.setItem('auth_token', devToken)
  localStorage.setItem('auth_user', JSON.stringify(devUser))
  
  // Réinitialiser après avoir ajouté le token de dev
  auth.initAuth()
} else {
  console.log('? Authentification existante trouvée:', auth.getCurrentUser()?.name)
}

app.mount('#app')
