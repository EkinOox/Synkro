import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './input.css'
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
import './primevue-theme.css'
import 'primeicons/primeicons.css'

// Composants PrimeVue
import Button from 'primevue/button'
import Card from 'primevue/card'
import Menubar from 'primevue/menubar'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'

const app = createApp(App)

// Configuration PrimeVue
app.use(PrimeVue, {
  ripple: true
})

// Configuration du routeur
app.use(router)

// Enregistrer les composants globalement
app.component('Button', Button)
app.component('Card', Card)
app.component('Menubar', Menubar)
app.component('Badge', Badge)
app.component('Avatar', Avatar)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Checkbox', Checkbox)

// Directives
app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)

// Montage final de l'application
app.mount('#app')
