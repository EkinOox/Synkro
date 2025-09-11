<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Test d'Authentification</h1>
      
      <!-- Statut d'authentification -->
      <div class="glass-panel p-6 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">Statut d'authentification</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white/10 rounded-lg p-4">
            <h3 class="font-medium text-white mb-2">�tat de connexion</h3>
            <div class="flex items-center gap-2">
              <div :class="[
                'w-3 h-3 rounded-full',
                isAuthenticated ? 'bg-green-400' : 'bg-red-400'
              ]"></div>
              <span class="text-white">
                {{ isAuthenticated ? 'Connect�' : 'Non connect�' }}
              </span>
            </div>
          </div>
          
          <div class="bg-white/10 rounded-lg p-4">
            <h3 class="font-medium text-white mb-2">Token JWT</h3>
            <p class="text-white text-xs font-mono break-all">
              {{ token ? token.substring(0, 50) + '...' : 'Aucun token' }}
            </p>
          </div>
          
          <div class="bg-white/10 rounded-lg p-4" v-if="user">
            <h3 class="font-medium text-white mb-2">Utilisateur</h3>
            <p class="text-white">{{ user.name || user.email }}</p>
            <p class="text-white/70 text-sm">{{ user.email }}</p>
          </div>
          
          <div class="bg-white/10 rounded-lg p-4">
            <h3 class="font-medium text-white mb-2">API Service</h3>
            <div class="flex items-center gap-2">
              <div :class="[
                'w-3 h-3 rounded-full',
                apiAuthenticated ? 'bg-green-400' : 'bg-red-400'
              ]"></div>
              <span class="text-white">
                {{ apiAuthenticated ? 'Token configur�' : 'Token manquant' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions de test -->
      <div class="glass-panel p-6 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">Actions de test</h2>
        
        <div class="flex flex-wrap gap-3">
          <button
            @click="testApiConnection"
            :disabled="loading"
            class="btn-glass-primary"
          >
            <i v-if="loading" class="pi pi-spinner pi-spin mr-2"></i>
            Tester l'API
          </button>
          
          <button
            @click="testAdminDirectly"
            :disabled="loading"
            class="btn-glass-warning"
          >
            Test Admin Direct
          </button>
          
          <button
            @click="refreshToken"
            :disabled="loading"
            class="btn-glass-secondary"
          >
            Actualiser le token
          </button>
          
          <button
            @click="loginDemo"
            :disabled="loading"
            class="btn-glass-success"
          >
            Connexion d�mo
          </button>
          
          <button
            @click="loginReal"
            :disabled="loading"
            class="btn-glass-primary"
          >
            Connexion EkinOox
          </button>
          
          <button
            @click="logout"
            :disabled="loading"
            class="btn-glass-danger"
          >
            D�connexion
          </button>
        </div>
      </div>

      <!-- R�sultats des tests -->
      <div class="glass-panel p-6" v-if="testResults.length > 0">
        <h2 class="text-xl font-semibold text-white mb-4">R�sultats des tests</h2>
        
        <div class="space-y-2">
          <div
            v-for="(result, index) in testResults"
            :key="index"
            :class="[
              'p-3 rounded-lg flex items-start gap-3',
              result.success ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'
            ]"
          >
            <i :class="[
              'pi text-sm mt-1',
              result.success ? 'pi-check text-green-400' : 'pi-times text-red-400'
            ]"></i>
            <div class="flex-1">
              <p class="text-white font-medium">{{ result.title }}</p>
              <p class="text-white/70 text-sm">{{ result.message }}</p>
              <p class="text-white/50 text-xs">{{ result.timestamp }}</p>
            </div>
          </div>
        </div>
        
        <button
          @click="testResults = []"
          class="btn-glass-secondary mt-4"
        >
          Effacer les r�sultats
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useCollaborationRoom } from '../composables/useCollaborationRoom'
import { apiService } from '../services/api'

interface TestResult {
  title: string
  message: string
  success: boolean
  timestamp: string
}

const loading = ref(false)
const testResults = ref<TestResult[]>([])

// Utiliser les composables
const auth = useAuth()
const { refreshAfterAuth } = useCollaborationRoom()

// �tats computed
const isAuthenticated = computed(() => auth.isAuthenticated())
const user = computed(() => auth.getCurrentUser())
const token = computed(() => auth.getToken())
const apiAuthenticated = computed(() => apiService.isAuthenticated())

// Ajouter un r�sultat de test
const addTestResult = (title: string, message: string, success: boolean) => {
  testResults.value.unshift({
    title,
    message,
    success,
    timestamp: new Date().toLocaleTimeString()
  })
}

// Tester la connexion API
const testApiConnection = async () => {
  loading.value = true
  
  try {
    // S'assurer que le token est configur� avant le test
    const currentToken = auth.getToken()
    if (currentToken) {
      apiService.setAuthToken(currentToken)
      console.log('?? Token configur� pour les tests:', currentToken.substring(0, 30) + '...')
    } else {
      console.warn('?? Aucun token disponible pour les tests')
    }
    
    // Tester les rooms publiques
    const rooms = await apiService.getRooms()
    addTestResult(
      'Test API - Rooms publiques',
      `${rooms.member?.length || 0} rooms trouv�es`,
      true
    )
    
    // Tester les rooms admin si connect�
    if (isAuthenticated.value) {
      try {
        const adminRooms = await apiService.getRoomsAdmin()
        addTestResult(
          'Test API - Rooms admin',
          `${adminRooms.member?.length || 0} rooms admin trouv�es`,
          true
        )
      } catch (adminError) {
        addTestResult(
          'Test API - Rooms admin',
          `Erreur: ${adminError}`,
          false
        )
      }
    }
    
  } catch (error) {
    addTestResult(
      'Test API',
      `Erreur: ${error}`,
      false
    )
  } finally {
    loading.value = false
  }
}

// Test direct de l'API Admin avec debug
const testAdminDirectly = async () => {
  loading.value = true
  
  try {
    console.log('🔍 Debug - Token actuel dans auth:', auth.getToken()?.substring(0, 50) + '...')
    console.log('🔍 Debug - Token actuel dans localStorage:', localStorage.getItem('auth_token')?.substring(0, 50) + '...')
    
    // Forcer la configuration du token
    const currentToken = auth.getToken()
    if (currentToken) {
      apiService.setAuthToken(currentToken)
    }
    
    // Test direct
    const response = await fetch('http://localhost:8000/api/doc_list_admins', {
      headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json',
        'Authorization': `Bearer ${currentToken}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      addTestResult(
        'Test Admin Direct - Fetch',
        `✅ Succès: ${data.member?.length || 0} rooms trouvées`,
        true
      )
      
      // Maintenant tester via apiService
      try {
        const serviceResult = await apiService.getRoomsAdmin()
        addTestResult(
          'Test Admin Direct - ApiService',
          `✅ Succès: ${serviceResult.member?.length || 0} rooms trouvées`,
          true
        )
      } catch (serviceError) {
        addTestResult(
          'Test Admin Direct - ApiService',
          `❌ Erreur: ${serviceError}`,
          false
        )
      }
      
    } else {
      const errorData = await response.json()
      addTestResult(
        'Test Admin Direct - Fetch',
        `❌ Erreur ${response.status}: ${errorData.message || errorData.detail}`,
        false
      )
    }
    
  } catch (error) {
    addTestResult(
      'Test Admin Direct',
      `❌ Erreur: ${error}`,
      false
    )
  } finally {
    loading.value = false
  }
}

// Actualiser le token
const refreshToken = async () => {
  loading.value = true
  
  try {
    auth.initAuth()
    await refreshAfterAuth()
    addTestResult(
      'Actualisation du token',
      'Token et rooms recharg�s avec succ�s',
      true
    )
  } catch (error) {
    addTestResult(
      'Actualisation du token',
      `Erreur: ${error}`,
      false
    )
  } finally {
    loading.value = false
  }
}

// Connexion r�elle avec les identifiants de la base
const loginReal = async () => {
  loading.value = true
  
  try {
    // Utiliser les identifiants de la base de donn�es
    await auth.loginWithCredentials('kyllian.diochon.kd@gmail.com', '18*1999*')
    
    // S'assurer que le token est imm�diatement configur� dans apiService
    const newToken = auth.getToken()
    if (newToken) {
      apiService.setAuthToken(newToken)
      console.log('?? Token imm�diatement configur� apr�s connexion:', newToken.substring(0, 30) + '...')
    }
    
    await refreshAfterAuth()
    addTestResult(
      'Connexion r�elle',
      'Connect� avec les identifiants de la base de donn�es',
      true
    )
  } catch (error) {
    addTestResult(
      'Connexion r�elle',
      `Erreur: ${error}`,
      false
    )
  } finally {
    loading.value = false
  }
}

// Connexion d�mo
const loginDemo = async () => {
  loading.value = true
  
  try {
    await auth.loginWithGoogleSimple()
    await refreshAfterAuth()
    addTestResult(
      'Connexion d�mo',
      'Connect� avec le compte d�mo',
      true
    )
  } catch (error) {
    addTestResult(
      'Connexion d�mo',
      `Erreur: ${error}`,
      false
    )
  } finally {
    loading.value = false
  }
}

// D�connexion
const logout = () => {
  auth.logout()
  addTestResult(
    'D�connexion',
    'D�connect� avec succ�s',
    true
  )
}

// Initialisation
onMounted(() => {
  auth.initAuth()
})
</script>

<style scoped>
.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
}

.btn-glass-primary {
  background: rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-glass-primary:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}

.btn-glass-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-glass-secondary {
  background: rgba(107, 114, 128, 0.3);
  border: 1px solid rgba(107, 114, 128, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-glass-secondary:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.5);
  transform: translateY(-1px);
}

.btn-glass-success {
  background: rgba(34, 197, 94, 0.3);
  border: 1px solid rgba(34, 197, 94, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-glass-success:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.5);
  transform: translateY(-1px);
}

.btn-glass-warning {
  background: rgba(245, 158, 11, 0.3);
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-glass-warning:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.5);
  transform: translateY(-1px);
}

.btn-glass-danger {
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-glass-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.5);
  transform: translateY(-1px);
}
</style>
