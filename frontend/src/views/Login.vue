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

      <!-- Connexion via réseaux sociaux -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <p class="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ou continuer avec
        </p>
        <div class="grid grid-cols gap-3">
          <Button
            @click="handleGoogleLogin"
            :loading="googleLoading"
            severity="secondary"
            outlined
            class="!p-3"
          >
            <i v-if="!googleLoading" class="pi pi-google mr-2"></i>
            Google
          </Button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import router from '../router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { useCollaborationRoom } from '../composables/useCollaborationRoom'
import { useAuth } from '../composables/useAuth'

const loading = ref(false)
const googleLoading = ref(false)
const { refreshAfterAuth } = useCollaborationRoom()
const auth = useAuth()
const toast = useToast()

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
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // Validation basique
  let hasErrors = false

  if (!form.email.trim()) {
    errors.email = 'L\'email est requis'
    hasErrors = true
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    hasErrors = true
  }

  if (hasErrors) return

  loading.value = true

  try {
    // Utiliser le composable useAuth pour la connexion
    await auth.loginWithCredentials(form.email.trim(), form.password)

    // Toast succès
    toast.add({
      severity: 'success',
      summary: 'Connexion réussie',
      detail: 'Bienvenue !',
      life: 3000
    })

    // Reset formulaire
    form.email = ''
    form.password = ''
    form.remember = false

    // Recharger les rooms avec le nouveau token
    try {
      await refreshAfterAuth()
      console.log('✅ Rooms rechargées avec le nouveau token')
    } catch (refreshError) {
      console.warn('⚠️ Erreur lors du rechargement des rooms:', refreshError)
    }

    // Redirection différée
    setTimeout(() => router.push('/'), 600)

  } catch (error) {
    console.error('❌ Erreur de connexion:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion'
    errors.email = errorMessage
    
    toast.add({
      severity: 'error',
      summary: 'Connexion échouée',
      detail: errorMessage,
      life: 6000
    })
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true

  try {
    // Simulation OAuth Google - remplacer par vraie implémentation
    toast.add({
      severity: 'info',
      summary: 'Google OAuth',
      detail: 'Fonctionnalité en développement',
      life: 4000
    })
  } catch (error) {
    console.error('Erreur de connexion Google:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur Google',
      detail: 'Erreur lors de la connexion avec Google',
      life: 6000
    })
  } finally {
    googleLoading.value = false
  }
}
</script>

<style scoped>
/* Correction du positionnement du toggle du mot de passe */
:deep(.p-password) {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.p-password .p-password-input) {
  width: 100% !important;
  padding-right: 3rem !important;
  box-sizing: border-box !important;
}

:deep(.p-password .p-password-toggle) {
  top: 50% !important;
  right: 12px !important;
  transform: translateY(-50%) !important;
  z-index: 999 !important;
  background: transparent !important;
  border: none !important;
  color: #6b7280 !important;
  cursor: pointer !important;
  padding: 4px !important;
  margin: 0 !important;
  width: 20px !important;
  height: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}

:deep(.p-password .p-password-toggle:hover) {
  color: #374151 !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
  border-radius: 4px !important;
}

:deep(.p-password .p-password-toggle i) {
  font-size: 14px !important;
}

/* Masquer les éléments mal positionnés */
:deep(.p-password .p-input-icon-right) {
  position: relative !important;
}

:deep(.p-password .p-input-icon) {
  position: static !important;
}

/* Mode sombre */
:deep(.dark .p-password .p-password-toggle) {
  color: #9ca3af !important;
}

:deep(.dark .p-password .p-password-toggle:hover) {
  color: #d1d5db !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
