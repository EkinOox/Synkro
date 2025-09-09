<template>
  <div class="register-page min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center p-4">
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Inscription</h1>
        <p class="text-gray-600 dark:text-gray-300">Créez votre compte Synkro</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom complet
          </label>
          <InputText
            id="name"
            v-model="form.name"
            placeholder="Votre nom complet"
            class="w-full"
            :class="{ 'p-invalid': errors.name }"
            required
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

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
            toggleMask
            :feedback="true"
            required
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirmer le mot de passe
          </label>
          <Password
            id="confirmPassword"
            v-model="form.confirmPassword"
            placeholder="Confirmez votre mot de passe"
            class="w-full"
            :class="{ 'p-invalid': errors.confirmPassword }"
            :feedback="false"
            toggleMask
            required
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>

        <div class="flex items-center">
          <Checkbox
            id="terms"
            v-model="form.acceptTerms"
            binary
            :class="{ 'p-invalid': errors.acceptTerms }"
          />
          <label for="terms" class="ml-2 text-sm text-gray-600 dark:text-gray-300">
            J'accepte les
            <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              conditions d'utilisation
            </a>
            et la
            <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              politique de confidentialité
            </a>
          </label>
        </div>
        <small v-if="errors.acceptTerms" class="p-error">{{ errors.acceptTerms }}</small>

        <Button
          type="submit"
          :loading="loading"
          class="w-full !py-3"
          label="Créer mon compte"
        />
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600 dark:text-gray-300">
          Déjà un compte ?
          <router-link
            to="/login"
            class="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            Se connecter
          </router-link>
        </p>
      </div>

      <!-- Inscription via réseaux sociaux (optionnel) -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <p class="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ou s'inscrire avec
        </p>
        <div class="grid grid-cols-2 gap-3">
          <Button
            @click="registerWithGoogle"
            severity="secondary"
            outlined
            class="!p-3"
          >
            <i class="pi pi-google mr-2"></i>
            Google
          </Button>
          <Button
            @click="registerWithGithub"
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

const handleRegister = async () => {
  // Reset des erreurs
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // Validation
  let hasErrors = false

  if (!form.name.trim()) {
    errors.name = 'Le nom est requis'
    hasErrors = true
  }

  if (!form.email) {
    errors.email = 'L\'email est requis'
    hasErrors = true
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    hasErrors = true
  } else if (form.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    hasErrors = true
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'La confirmation est requise'
    hasErrors = true
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    hasErrors = true
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
    hasErrors = true
  }

  if (hasErrors) return

  loading.value = true

  try {
    // Simuler une requête d'inscription
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Stocker le token (simulation)
    localStorage.setItem('auth_token', 'fake-jwt-token')
    localStorage.setItem('user_data', JSON.stringify({
      email: form.email,
      name: form.name
    }))

    // Rediriger vers l'accueil
    router.push('/')
  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    errors.email = 'Une erreur est survenue lors de l\'inscription'
  } finally {
    loading.value = false
  }
}

const registerWithGoogle = () => {
  console.log('Inscription avec Google...')
  // Implémentation OAuth Google
}

const registerWithGithub = () => {
  console.log('Inscription avec GitHub...')
  // Implémentation OAuth GitHub
}
</script>

<style scoped>
/* Styles personnalis�s si n�cessaire */
</style>
