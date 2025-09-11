<template>
  <div class="participants-realtime glass-panel p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <i class="pi pi-users text-brand-500"></i>
        Participants en temps réel
        <span class="text-sm bg-brand-500/20 px-2 py-1 rounded-full">
          {{ totalParticipants }}
        </span>
      </h3>
      <button
        @click="collapsed = !collapsed"
        class="text-white/60 hover:text-white transition-colors"
      >
        <i :class="collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"></i>
      </button>
    </div>

    <!-- Contenu (collapsible) -->
    <div v-if="!collapsed" class="space-y-4">
      <!-- Résumé global -->
      <div class="bg-white/5 rounded-lg p-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-white/70">Total actifs</span>
          <span class="text-brand-400 font-medium">{{ totalParticipants }} participant(s)</span>
        </div>
        <div class="flex items-center justify-between text-sm mt-1">
          <span class="text-white/70">Composants connectés</span>
          <span class="text-green-400 font-medium">{{ connectedComponents }}/5</span>
        </div>
      </div>

      <!-- Participants par composant -->
      <div class="space-y-3">
        <!-- TipTap Editor -->
        <ParticipantComponent
          icon="pi-pencil"
          name="Éditeur collaboratif"
          :participants="editorParticipants"
          :status="editorStatus"
          color="blue"
        />

        <!-- Chat -->
        <ParticipantComponent
          icon="pi-comments"
          name="Chat"
          :participants="chatParticipants"
          :status="chatStatus"
          color="green"
        />

        <!-- Whiteboard -->
        <ParticipantComponent
          icon="pi-palette"
          name="Tableau blanc"
          :participants="whiteboardParticipants"
          :status="whiteboardStatus"
          color="purple"
        />

        <!-- Call -->
        <ParticipantComponent
          icon="pi-video"
          name="Appel vidéo"
          :participants="callParticipants"
          :status="callStatus"
          color="red"
        />

        <!-- Comments -->
        <ParticipantComponent
          icon="pi-comment"
          name="Commentaires"
          :participants="commentsParticipants"
          :status="commentsStatus"
          color="yellow"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-2 border-t border-white/10">
        <button
          @click="refreshParticipants"
          class="btn-glass-secondary flex-1 text-sm"
        >
          <i class="pi pi-refresh mr-1"></i>
          Actualiser
        </button>
        <button
          @click="showDetails = !showDetails"
          class="btn-glass-secondary text-sm"
        >
          <i :class="showDetails ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
        </button>
      </div>

      <!-- Détails avancés -->
      <div v-if="showDetails" class="bg-black/20 rounded-lg p-3 text-xs space-y-2">
        <div class="text-white/50">Informations techniques :</div>
        <div class="text-white/70">
          • WebSocket : {{ wsConnected ? '?? Connecté' : '?? Déconnecté' }}
        </div>
        <div class="text-white/70">
          • Dernière mise à jour : {{ lastUpdate }}
        </div>
        <div class="text-white/70">
          • Latence moyenne : {{ averageLatency }}ms
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ParticipantComponent from './ParticipantComponent.vue'
import { useRoomStatus } from '../composables/useRoomStatus'

interface Participant {
  id: string
  name: string
  color: string
  avatar?: string
  lastSeen: number
  activity: string
}

const collapsed = ref(false)
const showDetails = ref(false)
const wsConnected = ref(true)
const lastUpdate = ref('il y a quelques secondes')
const averageLatency = ref(45)

// Utiliser le statut global de la room
const { roomStatus } = useRoomStatus()

// Simuler des participants (en attendant d'avoir les vraies données)
const editorParticipants = ref<Participant[]>([
  {
    id: 'user1',
    name: 'Alice Martin',
    color: '#3b82f6',
    avatar: '/avatars/alice.png',
    lastSeen: Date.now() - 5000,
    activity: 'Écrit dans le paragraphe 3'
  }
])

const chatParticipants = ref<Participant[]>([
  {
    id: 'user2',
    name: 'Bob Dupont',
    color: '#10b981',
    avatar: '/avatars/bob.png',
    lastSeen: Date.now() - 2000,
    activity: 'En train de taper...'
  }
])

const whiteboardParticipants = ref<Participant[]>([
  {
    id: 'user3',
    name: 'Claire Dubois',
    color: '#8b5cf6',
    avatar: '/avatars/claire.png',
    lastSeen: Date.now() - 1000,
    activity: 'Dessine un rectangle'
  }
])

const callParticipants = ref<Participant[]>([])

const commentsParticipants = ref<Participant[]>([
  {
    id: 'user4',
    name: 'David Kim',
    color: '#f59e0b',
    avatar: '/avatars/david.png',
    lastSeen: Date.now() - 3000,
    activity: 'A ajouté un commentaire'
  }
])

// Statuts des composants (basés sur useRoomStatus)
const editorStatus = computed(() => roomStatus.value.editor)
const chatStatus = computed(() => roomStatus.value.chat)
const whiteboardStatus = computed(() => roomStatus.value.whiteboard)
const callStatus = computed(() => roomStatus.value.call)
const commentsStatus = computed(() => roomStatus.value.comments)

// Statistiques globales
const totalParticipants = computed(() => {
  const allParticipants = new Set([
    ...editorParticipants.value.map(p => p.id),
    ...chatParticipants.value.map(p => p.id),
    ...whiteboardParticipants.value.map(p => p.id),
    ...callParticipants.value.map(p => p.id),
    ...commentsParticipants.value.map(p => p.id)
  ])
  return allParticipants.size
})

const connectedComponents = computed(() => {
  const components = [editorStatus.value, chatStatus.value, whiteboardStatus.value, callStatus.value, commentsStatus.value]
  return components.filter(comp => comp.connected).length
})

// Simulation de mise à jour en temps réel
let updateInterval: number | null = null

onMounted(() => {
  // Simuler des mises à jour en temps réel
  updateInterval = setInterval(() => {
    // Simuler l'activité des participants
    updateParticipantActivity()
    updateLastUpdate()
    updateLatency()
  }, 3000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

function updateParticipantActivity() {
  // Simuler l'activité de l'éditeur
  if (editorParticipants.value.length > 0) {
    const activities = [
      'Écrit dans le titre',
      'Modifie le paragraphe 2',
      'Sélectionne du texte',
      'Ajoute une liste à puces',
      'Formate en gras'
    ]
    editorParticipants.value[0].activity = activities[Math.floor(Math.random() * activities.length)]
    editorParticipants.value[0].lastSeen = Date.now()
  }

  // Simuler l'activité du chat
  if (chatParticipants.value.length > 0) {
    const activities = [
      'En train de taper...',
      'Vient d\'envoyer un message',
      'Lit les messages',
      'A réagi avec ??'
    ]
    chatParticipants.value[0].activity = activities[Math.floor(Math.random() * activities.length)]
    chatParticipants.value[0].lastSeen = Date.now()
  }

  // Simuler l'activité du whiteboard
  if (whiteboardParticipants.value.length > 0) {
    const activities = [
      'Dessine un cercle',
      'Efface des éléments',
      'Change la couleur',
      'Trace une ligne',
      'Sélectionne l\'outil texte'
    ]
    whiteboardParticipants.value[0].activity = activities[Math.floor(Math.random() * activities.length)]
    whiteboardParticipants.value[0].lastSeen = Date.now()
  }
}

function updateLastUpdate() {
  const now = new Date()
  lastUpdate.value = now.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

function updateLatency() {
  averageLatency.value = Math.floor(Math.random() * 50) + 30 // 30-80ms
}

function refreshParticipants() {
  console.log('?? Actualisation des participants...')
  updateParticipantActivity()
  
  // Simuler une petite latence
  setTimeout(() => {
    console.log('? Participants actualisés')
  }, 500)
}
</script>

<style scoped>
.participants-realtime {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.glass-panel {
  transition: all 0.3s ease;
}

.glass-panel:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.btn-glass-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.btn-glass-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.text-brand-500 {
  color: #3b82f6;
}

.text-brand-400 {
  color: #60a5fa;
}

/* Animation pour les mises à jour */
.space-y-3 > * {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .participants-realtime {
    margin: 0 -1rem;
  }
  
  .flex.gap-2 {
    flex-direction: column;
  }
}
</style>
