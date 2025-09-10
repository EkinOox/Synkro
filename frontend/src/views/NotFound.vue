<template>
  <div class="not-found-page min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
    <div class="text-center max-w-md mx-auto">
      <!-- Illustration 404 -->
      <div class="mb-8">
        <div class="relative">
          <div class="text-8xl font-bold text-blue-200 dark:text-blue-800 select-none">404</div>
          <div class="absolute inset-0 flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-4xl text-blue-500"></i>
          </div>
        </div>
      </div>

      <!-- Titre et message -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page non trouvée
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-4">
        <Button
          @click="goHome"
          class="w-full !py-3"
          icon="pi pi-home"
          label="Retour à l'accueil"
        />

        <Button
          @click="goBack"
          severity="secondary"
          outlined
          class="w-full !py-3"
          icon="pi pi-arrow-left"
          label="Retour en arrière"
        />
      </div>

      <!-- Liens utiles -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Liens utiles :
        </p>
        <div class="flex flex-wrap justify-center gap-4 text-sm">
          <router-link
            to="/"
            class="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Accueil
          </router-link>
          <router-link
            to="/whiteboard"
            class="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Tableau Blanc
          </router-link>
          <router-link
            to="/room"
            class="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Salles
          </router-link>
          <router-link
            to="/compte"
            class="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Mon Compte
          </router-link>
        </div>
      </div>

      <!-- Code d'erreur technique (optionnel) -->
      <div class="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <details class="text-left">
          <summary class="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            Informations techniques
          </summary>
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
            <div>URL demandée : {{ requestedUrl }}</div>
            <div>Code d'erreur : 404</div>
            <div>Timestamp : {{ new Date().toISOString() }}</div>
            <div>User Agent : {{ userAgent }}</div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()

const requestedUrl = computed(() => route.fullPath)
const userAgent = computed(() => window.navigator.userAgent.substring(0, 50) + '...')

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  // Si possible, revenir à la page précédente, sinon aller à l'accueil
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// Optionnel : Logger l'erreur 404 pour analytics
console.warn(`404 Error: Page not found - ${requestedUrl.value}`)

// Optionnel : Envoyer l'erreur à un service de monitoring
// sendErrorToMonitoring('404', requestedUrl.value)
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
.not-found-page {
  background-attachment: fixed;
}

/* Animation pour l'icône */
.pi-exclamation-triangle {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
