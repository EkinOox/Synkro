<template>
  <div class="forgot-password-page min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 flex items-center justify-center p-4">
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="mb-4">
          <i class="pi pi-lock text-4xl text-blue-500"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mot de passe oublié</h1>
        <p class="text-gray-600 dark:text-gray-300">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <form v-if="!emailSent" @submit.prevent="handleForgotPassword" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adresse email
          </label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            class="w-full"
            :class="{ 'p-invalid': error }"
            required
          />
          <small v-if="error" class="p-error">{{ error }}</small>
        </div>

        <Button
          type="submit"
          :loading="loading"
          class="w-full !py-3"
          label="Envoyer le lien de réinitialisation"
        />
      </form>

      <!-- Message de succès -->
      <div v-else class="text-center space-y-6">
        <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <i class="pi pi-check-circle text-2xl text-green-500 mb-2"></i>
          <h3 class="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
            Email envoyé !
          </h3>
          <p class="text-green-600 dark:text-green-400 text-sm">
            Nous avons envoyé un lien de réinitialisation à <strong>{{ email }}</strong>.
            Vérifiez votre boîte de réception et vos spams.
          </p>
        </div>

        <div class="space-y-3">
          <Button
            @click="resendEmail"
            :loading="resending"
            severity="secondary"
            outlined
            class="w-full !py-2"
            label="Renvoyer l'email"
          />

          <p class="text-sm text-gray-500 dark:text-gray-400">
            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou
            <button
              @click="resetForm"
              class="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline"
            >
              essayez une autre adresse
            </button>
          </p>
        </div>
      </div>

      <!-- Retour à la connexion -->
      <div class="mt-6 text-center">
        <router-link
          to="/login"
          class="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium flex items-center justify-center gap-2"
        >
          <i class="pi pi-arrow-left"></i>
          Retour à la connexion
        </router-link>
      </div>

      <!-- Aide supplémentaire -->
      <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Besoin d'aide ?
          </p>
          <div class="space-y-2 text-sm">
            <a
              href="mailto:support@synkro.com"
              class="block text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <i class="pi pi-envelope mr-2"></i>
              Contacter le support
            </a>
            <a
              href="/faq"
              class="block text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <i class="pi pi-question-circle mr-2"></i>
              FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const email = ref('')
const loading = ref(false)
const resending = ref(false)
const emailSent = ref(false)
const error = ref('')

const handleForgotPassword = async () => {
  error.value = ''

  if (!email.value) {
    error.value = 'L\'email est requis'
    return
  }

  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Veuillez entrer un email valide'
    return
  }

  loading.value = true

  try {
    // Simuler l'envoi d'email
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulation de la réponse de l'API
    console.log(`Envoi d'email de réinitialisation à: ${email.value}`)

    emailSent.value = true
  } catch (err) {
    console.error('Erreur lors de l\'envoi:', err)
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

const resendEmail = async () => {
  resending.value = true

  try {
    // Simuler le renvoi d'email
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Renvoi d'email à: ${email.value}`)
  } catch (err) {
    console.error('Erreur lors du renvoi:', err)
  } finally {
    resending.value = false
  }
}

const resetForm = () => {
  emailSent.value = false
  email.value = ''
  error.value = ''
}
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
