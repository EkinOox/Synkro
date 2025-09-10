<template>
  <div class="register-page min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center p-4">
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Inscription</h1>
        <p class="text-gray-600 dark:text-gray-300">Créez votre compte Synkro</p>
      </div>

  <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label for="pseudo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pseudo
          </label>
          <InputText
            id="pseudo"
            v-model="form.pseudo"
            placeholder="Votre pseudo"
            class="w-full"
            :class="{ 'p-invalid': errors.pseudo }"
            required
            autocomplete="username"
          />
          <small v-if="errors.pseudo" class="p-error">{{ errors.pseudo }}</small>
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
            autocomplete="new-password"
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
            autocomplete="new-password"
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>

        <div class="flex items-start space-x-3">
          <input
            id="terms"
            type="checkbox"
            v-model="form.acceptTerms"
            :aria-invalid="!!errors.acceptTerms"
            class="h-5 w-5 mt-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer transition
              disabled:opacity-50 disabled:cursor-not-allowed
              peer
              "
            :class="{ 'ring-1 ring-red-500 border-red-500': errors.acceptTerms }"
          />
          <label for="terms" class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed select-none">
            J'accepte les
            <a href="#" class="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 underline decoration-transparent hover:decoration-purple-500 transition">
              conditions d'utilisation
            </a>
            et la
            <a href="#" class="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 underline decoration-transparent hover:decoration-purple-500 transition">
              politique de confidentialité
            </a>
          </label>
        </div>
        <small v-if="errors.acceptTerms" class="p-error">{{ errors.acceptTerms }}</small>

        <Button
          type="submit"
          :loading="loading"
          class="w-full !py-3"
          :label="loading ? 'Création…' : 'Créer mon compte'"
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
        <div class="grid grid-cols gap-3">
          <Button
            @click="registerWithGoogle"
            severity="secondary"
            outlined
            class="!p-3"
          >
            <i class="pi pi-google mr-2"></i>
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
// Import direct de l'instance du routeur
import router from '../router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

// router déjà importé
const loading = ref(false)
const toast = useToast()

// Formulaire aligné avec l'API: pseudo, email, password
const form = reactive({
  pseudo: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  pseudo: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface ApiErrorResponse {
  'hydra:description'?: string
  'violations'?: { propertyPath: string; message: string }[]
}

const handleRegister = async () => {
  // Reset des erreurs
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // Validation
  let hasErrors = false

  if (!form.pseudo.trim()) {
    errors.pseudo = 'Le pseudo est requis'
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
    const response = await fetch(`${apiBaseUrl}/api/user_registers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      },
      body: JSON.stringify({
        pseudo: form.pseudo.trim(),
        email: form.email.trim(),
        password: form.password
      })
    })

    if (!response.ok) {
      let data: ApiErrorResponse | null = null
      try { data = await response.json() } catch {}

      if (data?.violations) {
        data.violations.forEach(v => {
          const key = v.propertyPath as keyof typeof errors
          if (errors[key] !== undefined) {
            errors[key] = v.message
          }
        })
      } else if (data?.['hydra:description']) {
        errors.email = data['hydra:description']
      } else {
        errors.email = 'Échec de l\'inscription'
      }
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: Object.values(errors).filter(Boolean)[0] || 'Impossible de créer le compte',
        life: 6000
      })
      return
    }

    // Succès
    const created = await response.json()
    // Stockage minimal (optionnel selon logique future JWT)
    localStorage.setItem('user_pseudo', created.pseudo || form.pseudo)
    localStorage.setItem('user_email', created.email || form.email)

    // Toast succès
    toast.add({
      severity: 'success',
      summary: 'Inscription réussie',
      detail: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
      life: 5000
    })

    // Reset formulaire
    form.pseudo = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''
    form.acceptTerms = false

    // Redirection différée vers login
    setTimeout(() => router.push('/login'), 800)
  } catch (e) {
    console.error('Erreur réseau inscription:', e)
    errors.email = 'Erreur réseau – réessayez'
    toast.add({
      severity: 'error',
      summary: 'Réseau',
      detail: 'Erreur réseau – réessayez',
      life: 6000
    })
  } finally {
    loading.value = false
  }
}

const registerWithGoogle = () => {
  console.log('Inscription avec Google...')
  // Implémentation OAuth Google
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

/* Styles spécifiques pour le feedback du mot de passe */
:deep(.p-password .p-password-panel) {
  margin-top: 0.5rem;
}
</style>
