<template>
  <div class="login-page min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Connexion</h1>
        <p class="text-gray-600 dark:text-gray-300">Accédez à votre espace Synkro</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            placeholder="votre@email.com"
            class="w-full"
            :class="{ 'p-invalid': errors.email }"
            required
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe
          </label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Votre mot de passe"
            class="w-full"
            :class="{ 'p-invalid': errors.password }"
            :feedback="false"
            toggleMask
            required
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <Checkbox
              id="remember"
              v-model="form.remember"
              binary
            />
            <label for="remember" class="ml-2 text-sm text-gray-600 dark:text-gray-300">
              Se souvenir de moi
            </label>
          </div>
          <router-link
            to="/forgot-password"
            class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Mot de passe oublié ?
          </router-link>
        </div>

        <Button
          type="submit"
          :loading="loading"
          class="w-full !py-3"
          label="Se connecter"
        />
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600 dark:text-gray-300">
          Pas encore de compte ?
          <router-link
            to="/register"
            class="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            S'inscrire
          </router-link>
        </p>
      </div>

      <!-- Connexion via réseaux sociaux (optionnel) -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <p class="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ou continuer avec
        </p>
        <div class="grid grid-cols-2 gap-3">
          <Button
            @click="loginWithGoogle"
            severity="secondary"
            outlined
            class="!p-3"
          >
            <i class="pi pi-google mr-2"></i>
            Google
          </Button>
          <Button
            @click="loginWithGithub"
            severity="secondary"
            outlined
            class="!p-3"
          >
            <i class="pi pi-github mr-2"></i>
            GitHub
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errors = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  // Reset des erreurs
  errors.email = ''
  errors.password = ''

  // Validation basique
  if (!form.email) {
    errors.email = 'L\'email est requis'
    return
  }
  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    return
  }

  loading.value = true

  try {
    // Simuler une requête d'authentification
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Stocker le token (simulation)
    localStorage.setItem('auth_token', 'fake-jwt-token')
    localStorage.setItem('user_data', JSON.stringify({
      email: form.email,
      name: form.email.split('@')[0]
    }))

    // Rediriger vers la page demandée ou l'accueil
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  } catch (error) {
    console.error('Erreur de connexion:', error)
    errors.email = 'Email ou mot de passe incorrect'
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = () => {
  console.log('Connexion avec Google...')
  // Implémentation OAuth Google
}

const loginWithGithub = () => {
  console.log('Connexion avec GitHub...')
  // Implémentation OAuth GitHub
}
</script>

<style scoped>
/* Styles personnalis�s si n�cessaire */
</style>
