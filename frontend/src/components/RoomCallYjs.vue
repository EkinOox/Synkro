<template>
  <div class="flex flex-col gap-4">
    <!-- état de connexion -->
    <div v-if="!isConnected" class="flex items-center justify-center py-4 text-white/60">
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/60 mr-2"></div>
      <span class="text-sm">{{ isConnecting ? 'Connexion au système d\'appel...' : 'Système d\'appel déconnecté' }}</span>
    </div>

    <!-- Contrôles d'appel (quand pas en appel) -->
    <div v-else-if="!inCall" class="glass-panel p-4">
      <div class="flex gap-3 items-center justify-center">
        <button @click="startAudioCall" class="btn-glass-success flex-1">
          <i class="pi pi-phone mr-2"></i>
          Appel audio
        </button>
        <button @click="startVideoCall" class="btn-glass-primary flex-1">
          <i class="pi pi-video mr-2"></i>
          Appel vidéo
        </button>
      </div>
      
      <!-- Participants en attente -->
      <div v-if="participants.length > 0" class="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {{ participants.length }} participant(s) en appel:
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="participant in participants"
            :key="participant.id"
            class="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
          >
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            {{ participant.name }}
            <i v-if="!participant.audioEnabled" class="pi pi-microphone-slash text-red-500 text-xs"></i>
            <i v-if="!participant.videoEnabled && isVideoCall" class="pi pi-eye-slash text-red-500 text-xs"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Interface d'appel actif -->
    <div v-else class="glass-panel p-4">
      <!-- Vidéo locale (aperçu) -->
      <div v-if="localStream" class="mb-4">
        <div class="relative w-48 h-36 mx-auto rounded-lg overflow-hidden bg-gray-800">
          <video
            ref="localVideoRef"
            :srcObject="localStream"
            autoplay
            muted
            class="w-full h-full object-cover"
          ></video>
          <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            Vous ({{ user.name }})
          </div>
          <div v-if="!audioEnabled" class="absolute top-2 right-2">
            <i class="pi pi-microphone-slash text-red-500"></i>
          </div>
          <div v-if="!videoEnabled && isVideoCall" class="absolute top-2 right-8">
            <i class="pi pi-eye-slash text-red-500"></i>
          </div>
        </div>
      </div>

      <!-- Vidéos des participants -->
      <div v-if="participants.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div v-for="participant in participants" :key="participant.id" class="relative">
          <div class="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center text-white">
            <!-- Ici on afficherait la vraie vidéo du participant -->
            <div class="text-center">
              <div class="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-xl font-bold mb-2 mx-auto">
                {{ participant.name.charAt(0).toUpperCase() }}
              </div>
              <div class="text-sm">{{ participant.name }}</div>
            </div>
          </div>
          <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {{ participant.name }}
          </div>
          <div class="absolute top-2 right-2 flex gap-1">
            <div v-if="!participant.audioEnabled" class="bg-red-500 rounded-full p-1">
              <i class="pi pi-microphone-slash text-white text-xs"></i>
            </div>
            <div v-if="!participant.videoEnabled && isVideoCall" class="bg-red-500 rounded-full p-1">
              <i class="pi pi-eye-slash text-white text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si pas de participants -->
      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        <i class="pi pi-users text-3xl mb-2"></i>
        <p>En attente d'autres participants...</p>
      </div>

      <!-- Contrôles pendant l'appel -->
      <div class="flex justify-center gap-3">
        <button 
          @click="toggleAudio"
          :class="audioEnabled ? 'btn-glass-success' : 'btn-glass-danger'"
          :title="audioEnabled ? 'Couper le micro' : 'Activer le micro'"
        >
          <i :class="audioEnabled ? 'pi pi-microphone' : 'pi pi-microphone-slash'"></i>
        </button>
        
        <button 
          v-if="isVideoCall"
          @click="toggleVideo"
          :class="videoEnabled ? 'btn-glass-success' : 'btn-glass-danger'"
          :title="videoEnabled ? 'Couper la caméra' : 'Activer la caméra'"
        >
          <i :class="videoEnabled ? 'pi pi-video' : 'pi pi-eye-slash'"></i>
        </button>

        <button 
          @click="endCall"
          class="btn-glass-danger"
          title="Raccrocher"
        >
          <i class="pi pi-phone-slash"></i>
        </button>
      </div>

      <!-- Informations de l'appel -->
      <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center justify-center gap-4">
          <span>{{ isVideoCall ? 'Appel vidéo' : 'Appel audio' }}</span>
          <span>•</span>
          <span>{{ participants.length + 1 }} participant(s)</span>
          <span>•</span>
          <span>{{ callDuration }}</span>
        </div>
      </div>
    </div>

    <!-- Erreur de connexion -->
    <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div class="text-red-400 text-sm flex items-center gap-2">
        <i class="pi pi-exclamation-triangle"></i>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useYjsCall } from '../composables/useYjsCall'
import { useRoomStatus } from '../composables/useRoomStatus'

interface Props {
  roomId: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  participants?: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

const props = defineProps<Props>()

// Références DOM
const localVideoRef = ref<HTMLVideoElement>()

// état local
const callStartTime = ref<number | null>(null)
const callDurationInterval = ref<number | null>(null)

// Appel collaboratif Yjs
const {
  isConnected,
  isConnecting,
  error,
  inCall,
  isVideoCall,
  participants,
  localStream,
  audioEnabled,
  videoEnabled,
  initializeCall,
  startCall,
  endCall,
  toggleAudio,
  toggleVideo
} = useYjsCall(props.roomId, {
  id: props.user.id,
  name: props.user.name,
  avatar: props.user.avatar
})

// Statut de collaboration
const { updateCallStatus } = useRoomStatus()

// Watcher pour mettre à jour le statut
watch([isConnected, isConnecting, error, participants], () => {
  updateCallStatus(
    isConnected.value,
    isConnecting.value,
    error.value,
    participants.value.length
  )
}, { immediate: true })

// Initialiser le système d'appel au montage
onMounted(async () => {
  await initializeCall()
})

// Mettre à jour la vidéo locale quand le stream change
watch(localStream, (newStream) => {
  if (localVideoRef.value && newStream) {
    localVideoRef.value.srcObject = newStream
  }
})

// Gérer la durée de l'appel
watch(inCall, (isInCall) => {
  if (isInCall) {
    callStartTime.value = Date.now()
    callDurationInterval.value = setInterval(() => {
      // Force la réactivité pour mettre à jour la durée
    }, 1000)
  } else {
    callStartTime.value = null
    if (callDurationInterval.value) {
      clearInterval(callDurationInterval.value)
      callDurationInterval.value = null
    }
  }
})

// Nettoyer l'interval à la destruction
onUnmounted(() => {
  if (callDurationInterval.value) {
    clearInterval(callDurationInterval.value)
  }
})

// Calculer la durée de l'appel
const callDuration = computed(() => {
  if (!callStartTime.value) return '00:00'
  
  const elapsed = Date.now() - callStartTime.value
  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Actions d'appel
const startAudioCall = () => {
  startCall(false)
}

const startVideoCall = () => {
  startCall(true)
}
</script>

<style scoped>
/* Styles pour les boutons d'appel */
.btn-glass-success {
  padding: 0.5rem 1rem;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: rgb(74, 222, 128);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.btn-glass-success:hover {
  background: rgba(34, 197, 94, 0.3);
}

.btn-glass-primary {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: rgb(96, 165, 250);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.btn-glass-primary:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-glass-danger {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgb(248, 113, 113);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.btn-glass-danger:hover {
  background: rgba(239, 68, 68, 0.3);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass-panel {
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.2);
}

/* Animation pour les participants */
.grid > div {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Couleurs brand */
.bg-brand-500 {
  background-color: #3b82f6;
}

.text-brand-500 {
  color: #3b82f6;
}

/* Responsive design */
@media (max-width: 768px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .flex.gap-3 {
    flex-direction: column;
  }
  
  .flex-1 {
    width: 100%;
  }
}
</style>
