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
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'

const app = createApp(App)

app.use(PrimeVue, {
  ripple: true
})

app.use(router)

// Enregistrer les composants globalement
app.component('Button', Button)
app.component('Card', Card)
app.component('Menubar', Menubar)
app.component('Badge', Badge)
app.component('Avatar', Avatar)

// Directives
app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)

app.mount('#app')
