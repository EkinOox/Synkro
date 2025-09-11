<template>
  <div class="collaboration-test min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-8 text-center">
        ?? Test de Collaboration Yjs
      </h1>

      <!-- Informations de connexion -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="glass-panel p-4 rounded-xl">
          <h3 class="text-white font-semibold mb-2">État du serveur</h3>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded-full', serverStatus === 'connected' ? 'bg-green-400' : serverStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400']"></div>
              <span class="text-white/80 text-sm">{{ serverStatus }}</span>
            </div>
            <div class="text-white/60 text-xs">
              ws://localhost:3001/yjs/test-room
            </div>
          </div>
        </div>

        <div class="glass-panel p-4 rounded-xl">
          <h3 class="text-white font-semibold mb-2">Utilisateur</h3>
          <div class="flex items-center gap-2">
            <div 
              class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium"
            >
              {{ testUser.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="text-white text-sm">{{ testUser.name }}</div>
              <div class="text-white/60 text-xs">{{ testUser.id }}</div>
            </div>
          </div>
        </div>

        <div class="glass-panel p-4 rounded-xl">
          <h3 class="text-white font-semibold mb-2">Collaborateurs</h3>
          <div class="flex items-center gap-2">
            <div class="flex -space-x-2">
              <div 
                v-for="collaborator in collaborators" 
                :key="collaborator.id"
                :style="{ backgroundColor: collaborator.color }"
                class="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-medium text-white"
                :title="collaborator.name"
              >
                {{ collaborator.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <span class="text-white/80 text-sm ml-2">
              {{ collaborators.length }} connecté{{ collaborators.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Grille de tests -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Éditeur TipTap collaboratif -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-white">?? Éditeur TipTap</h2>
          <TipTapEditorYjs 
            :room-id="'test-room'" 
            :user="testUser"
            ref="tiptapEditor"
          />
          <div class="text-sm text-white/60">
            Testez la collaboration en temps réel avec plusieurs onglets
          </div>
        </div>

        <!-- Commentaires collaboratifs -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-white">?? Commentaires</h2>
          <CommentBoardYjs 
            :room-id="'test-room'" 
            :user="testUser"
            ref="commentBoard"
          />
        </div>
      </div>

      <!-- Tests de connexion -->
      <div class="mt-8 glass-panel p-6 rounded-xl">
        <h3 class="text-xl font-semibold text-white mb-4">?? Tests de connexion</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            @click="testYjsConnection"
            class="btn-glass-primary"
            :disabled="testing"
          >
            {{ testing ? 'Test en cours...' : 'Test Yjs' }}
          </button>
          
          <button
            @click="testWhiteboardConnection"
            class="btn-glass-secondary"
            :disabled="testing"
          >
            Test Whiteboard
          </button>
          
          <button
            @click="simulateCollaboration"
            class="btn-glass-success"
            :disabled="testing"
          >
            Simuler collab
          </button>
          
          <button
            @click="clearAllData"
            class="btn-glass-danger"
            :disabled="testing"
          >
            Vider données
          </button>
        </div>

        <!-- Résultats des tests -->
        <div v-if="testResults.length > 0" class="mt-6 space-y-2">
          <h4 class="text-white font-semibold">Résultats des tests :</h4>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="(result, index) in testResults"
              :key="index"
              :class="['text-sm px-3 py-2 rounded-lg', result.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300']"
            >
              <span class="font-medium">{{ result.test }}:</span> {{ result.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-8 glass-panel p-6 rounded-xl">
        <h3 class="text-xl font-semibold text-white mb-4">?? Instructions de test</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
          <div>
            <h4 class="font-semibold text-white mb-2">Test de l'éditeur :</h4>
            <ol class="list-decimal list-inside space-y-1 text-sm">
              <li>Ouvrez plusieurs onglets sur cette page</li>
              <li>Tapez du texte dans l'éditeur</li>
              <li>Utilisez les outils de formatage</li>
              <li>Vérifiez la synchronisation en temps réel</li>
            </ol>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-2">Test des commentaires :</h4>
            <ol class="list-decimal list-inside space-y-1 text-sm">
              <li>Ajoutez des commentaires de différents types</li>
              <li>Marquez-les comme résolus</li>
              <li>Testez les filtres</li>
              <li>Vérifiez la synchronisation entre onglets</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TipTapEditorYjs from '@/components/TipTapEditorYjs.vue'
import CommentBoardYjs from '@/components/CommentBoardYjs.vue'
import { useCollaborationUser } from '@/composables/useCollaborationUser'

// Utilisateur pour la collaboration (utilise l'auth ou fallback)
const { user: testUser } = useCollaborationUser()

// État global
const serverStatus = ref<'connected' | 'connecting' | 'disconnected'>('disconnected')
const collaborators = ref<any[]>([])
const testing = ref(false)
const testResults = ref<Array<{test: string, success: boolean, message: string}>>([])

// Références aux composants
const tiptapEditor = ref()
const commentBoard = ref()

// Test de connexion Yjs
const testYjsConnection = async () => {
  testing.value = true
  
  try {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    const ws = new WebSocket(`${wsUrl}/yjs/test-connection`)
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('Timeout de connexion'))
      }, 5000)
      
      ws.onopen = () => {
        clearTimeout(timeout)
        testResults.value.unshift({
          test: 'Connexion Yjs',
          success: true,
          message: 'Connexion WebSocket établie avec succès'
        })
        ws.close()
        resolve(true)
      }
      
      ws.onerror = (error) => {
        clearTimeout(timeout)
        reject(error)
      }
    })
    
  } catch (error) {
    testResults.value.unshift({
      test: 'Connexion Yjs',
      success: false,
      message: `Erreur: ${error.message}`
    })
  }
  
  testing.value = false
}

// Test de connexion Whiteboard
const testWhiteboardConnection = async () => {
  testing.value = true
  
  try {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    const ws = new WebSocket(`${wsUrl}/whiteboard`)
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('Timeout de connexion'))
      }, 5000)
      
      ws.onopen = () => {
        clearTimeout(timeout)
        
        // Tester l'envoi d'un message
        ws.send(JSON.stringify({
          type: 'join_room',
          roomId: 'test-room',
          user: testUser.value
        }))
        
        testResults.value.unshift({
          test: 'Connexion Whiteboard',
          success: true,
          message: 'Connexion WebSocket whiteboard établie'
        })
        
        ws.close()
        resolve(true)
      }
      
      ws.onerror = (error) => {
        clearTimeout(timeout)
        reject(error)
      }
    })
    
  } catch (error) {
    testResults.value.unshift({
      test: 'Connexion Whiteboard',
      success: false,
      message: `Erreur: ${error.message}`
    })
  }
  
  testing.value = false
}

// Simulation de collaboration
const simulateCollaboration = () => {
  testing.value = true
  
  // Simuler l'ajout de texte dans l'éditeur
  if (tiptapEditor.value?.editor) {
    const randomText = `Texte ajouté à ${new Date().toLocaleTimeString()}\n`
    tiptapEditor.value.editor.commands.insertContent(randomText)
    
    testResults.value.unshift({
      test: 'Simulation collaboration',
      success: true,
      message: 'Texte ajouté dans l\'éditeur collaboratif'
    })
  }
  
  // Simuler l'ajout d'un commentaire
  setTimeout(() => {
    testing.value = false
  }, 1000)
}

// Vider toutes les données
const clearAllData = () => {
  testing.value = true
  
  if (tiptapEditor.value?.editor) {
    tiptapEditor.value.editor.commands.clearContent()
  }
  
  testResults.value.unshift({
    test: 'Nettoyage',
    success: true,
    message: 'Données de test supprimées'
  })
  
  testing.value = false
}

// Surveiller l'état des composants
const updateStatus = () => {
  if (tiptapEditor.value) {
    serverStatus.value = tiptapEditor.value.isConnected ? 'connected' : 
                        tiptapEditor.value.isConnecting ? 'connecting' : 'disconnected'
    collaborators.value = tiptapEditor.value.collaborators || []
  }
}

onMounted(() => {
  // Mettre à jour le statut régulièrement
  const statusInterval = setInterval(updateStatus, 1000)
  
  onUnmounted(() => {
    clearInterval(statusInterval)
  })
})
</script>

<style scoped>
/* Styles spécifiques pour la page de test */
.collaboration-test {
  min-height: 100vh;
}

/* Améliorer la scrollbar pour les résultats de tests */
.max-h-32::-webkit-scrollbar {
  width: 4px;
}

.max-h-32::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.max-h-32::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.max-h-32::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
