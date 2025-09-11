<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Test API Synkro
      </h1>

      <!-- Test de création de room -->
      <div class="bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg p-6 backdrop-blur-sm mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Créer une Room
        </h2>
        <div class="flex gap-4 mb-4">
          <input 
            v-model="testRoomName" 
            type="text" 
            placeholder="Nom de la room"
            class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50"
          />
          <input 
            v-model="testRoomPassword" 
            type="password" 
            placeholder="Mot de passe (optionnel)"
            class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50"
          />
          <Button 
            @click="testCreateRoom" 
            :loading="loading"
            label="Créer" 
            severity="success"
          />
        </div>
        <div v-if="createResult" class="mt-4 p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
          <pre>{{ JSON.stringify(createResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Test de liste des rooms -->
      <div class="bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg p-6 backdrop-blur-sm mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Liste des Rooms
        </h2>
        <div class="flex gap-4 mb-4">
          <Button 
            @click="testGetRooms" 
            :loading="loading"
            label="Charger Rooms Publiques" 
            severity="info"
          />
          <Button 
            @click="testGetRoomsAdmin" 
            :loading="loading"
            label="Charger Rooms Admin" 
            severity="warning"
          />
        </div>
        <div v-if="roomsList" class="mt-4 p-4 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <h3 class="font-semibold mb-2">Résultat API:</h3>
          <pre>{{ JSON.stringify(roomsList, null, 2) }}</pre>
        </div>
      </div>

      <!-- Test d'authentification -->
      <div class="bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Authentification (useAuth)
        </h2>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Token useAuth:</strong> {{ getToken() ? 'Présent' : 'Aucun' }}</p>
          <p><strong>Authentifié:</strong> {{ isAuthenticated() ? 'Oui' : 'Non' }}</p>
          <p><strong>Token API Service:</strong> {{ apiService.getToken() ? 'Configuré' : 'Non configuré' }}</p>
        </div>
        <div class="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-sm">
          <p><strong>Info:</strong> Le service API utilise maintenant automatiquement le token de useAuth.</p>
        </div>
      </div>

      <!-- Erreurs -->
      <div v-if="error" class="mt-8 p-4 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300">
        <h3 class="font-semibold mb-2">Erreur:</h3>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import { apiService } from '../services/api'
import { useAuth } from '../composables/useAuth'

const { getToken, isAuthenticated } = useAuth()

const loading = ref(false)
const error = ref('')
const createResult = ref(null)
const roomsList = ref(null)

const testRoomName = ref('Room Test API')
const testRoomPassword = ref('')

// Initialiser le service API avec le token d'auth
onMounted(() => {
  const token = getToken()
  if (token) {
    apiService.setAuthToken(token)
  }
})

async function testCreateRoom() {
  try {
    loading.value = true
    error.value = ''
    createResult.value = null

    const result = await apiService.createRoom({
      name: testRoomName.value,
      text: 'Description de test',
      password: testRoomPassword.value
    })

    createResult.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function testGetRooms() {
  try {
    loading.value = true
    error.value = ''
    roomsList.value = null

    const result = await apiService.getRooms()
    roomsList.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function testGetRoomsAdmin() {
  try {
    loading.value = true
    error.value = ''
    roomsList.value = null

    const result = await apiService.getRoomsAdmin()
    roomsList.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

function setTestToken() {
  if (testToken.value.trim()) {
    apiService.setToken(testToken.value.trim())
  }
}

function clearTestToken() {
  apiService.removeToken()
  testToken.value = ''
}
</script>

<style scoped>
pre {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}
</style>
