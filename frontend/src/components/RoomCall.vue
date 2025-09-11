<template>
  <div class="flex flex-col gap-4">
    <!-- Contrôles d'appel -->
    <div v-if="!inCall" class="glass-panel p-4">
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
    </div>

    <!-- Interface d'appel actif -->
    <div v-else class="glass-panel p-4">
      <!-- Vidéos des participants -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div v-for="participant in callParticipants" :key="participant.id" class="relative">
          <video 
            :ref="`video-${participant.id}`"
            :srcObject="participant.stream"
            autoplay
            muted
            class="w-full h-32 bg-gray-800 rounded-lg object-cover"
          ></video>
          <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {{ participant.name }}
          </div>
          <div v-if="!participant.audioEnabled" class="absolute top-2 right-2">
            <i class="pi pi-microphone-slash text-red-500"></i>
          </div>
          <div v-if="!participant.videoEnabled" class="absolute top-2 right-8">
            <i class="pi pi-eye-slash text-red-500"></i>
          </div>
        </div>
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
          :title="videoEnabled ? 'Couper la vidéo' : 'Activer la vidéo'"
        >
          <i :class="videoEnabled ? 'pi pi-video' : 'pi pi-video-slash'"></i>
        </button>
        <button 
          @click="shareScreen" 
          class="btn-glass-secondary" 
          title="Partager l'écran"
        >
          <i class="pi pi-desktop"></i>
        </button>
        <button 
          @click="endCall" 
          class="btn-glass-danger"
          title="Raccrocher"
        >
          <i class="pi pi-phone"></i>
        </button>
      </div>
    </div>

    <!-- Liste des participants connectés -->
    <div class="badge-glass-info">
      <i class="pi pi-users mr-2"></i>
      {{ callParticipants.length }} participant(s) en appel
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  roomId: string
  user: {
    id: string
    name: string
    color: string
    avatar?: string
  }
  participants: Array<{id: number, name: string, avatar: string}>
}

const props = defineProps<Props>()

const inCall = ref(false)
const isVideoCall = ref(false)
const audioEnabled = ref(true)
const videoEnabled = ref(true)
const localStream = ref<MediaStream>()
const peerConnections = ref<Map<number, RTCPeerConnection>>(new Map())
const callParticipants = ref<Array<{
  id: number
  name: string
  stream: MediaStream
  audioEnabled: boolean
  videoEnabled: boolean
}>>([])

let socket: WebSocket

onMounted(() => {
  // Connexion WebSocket pour la signalisation WebRTC
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
  socket = new WebSocket(`${wsUrl}/whiteboard`)
  
  socket.onopen = () => {
    // Rejoindre la room
    socket.send(JSON.stringify({
      type: 'join_room',
      roomId: props.roomId,
      user: props.user
    }))
  }
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleSignalingMessage(data)
  }
})

onUnmounted(() => {
  endCall()
  socket?.close()
})

async function startAudioCall() {
  isVideoCall.value = false
  await initializeCall(false)
}

async function startVideoCall() {
  isVideoCall.value = true
  await initializeCall(true)
}

async function initializeCall(video: boolean) {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: video
    })
    
    inCall.value = true
    
    // Ajouter notre propre stream
    callParticipants.value.push({
      id: parseInt(props.user.id) || 0,
      name: props.user.name,
      stream: localStream.value,
      audioEnabled: true,
      videoEnabled: video
    })
    
    // Signaler aux autres participants
    socket.send(JSON.stringify({
      type: 'call-start',
      roomId: props.roomId,
      video: video
    }))
    
  } catch (error) {
    console.error('Erreur accès média:', error)
  }
}

function toggleAudio() {
  if (localStream.value) {
    const audioTrack = localStream.value.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      audioEnabled.value = audioTrack.enabled
      
      socket.send(JSON.stringify({
        type: 'audio-toggle',
        enabled: audioEnabled.value
      }))
    }
  }
}

function toggleVideo() {
  if (localStream.value) {
    const videoTrack = localStream.value.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      videoEnabled.value = videoTrack.enabled
      
      socket.send(JSON.stringify({
        type: 'video-toggle',
        enabled: videoEnabled.value
      }))
    }
  }
}

async function shareScreen() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
    
    // Remplacer le stream vidéo par le partage d'écran
    if (localStream.value) {
      const videoTrack = screenStream.getVideoTracks()[0]
      const sender = peerConnections.value.values().next().value?.getSenders()
        .find(s => s.track?.kind === 'video')
      
      if (sender) {
        await sender.replaceTrack(videoTrack)
      }
    }
    
  } catch (error) {
    console.error('Erreur partage écran:', error)
  }
}

function endCall() {
  // Fermer toutes les connexions
  peerConnections.value.forEach(pc => pc.close())
  peerConnections.value.clear()
  
  // Arrêter les streams
  localStream.value?.getTracks().forEach(track => track.stop())
  
  // Réinitialiser l'état
  inCall.value = false
  callParticipants.value = []
  audioEnabled.value = true
  videoEnabled.value = true
  
  socket.send(JSON.stringify({
    type: 'call-end',
    roomId: props.roomId
  }))
}

function handleSignalingMessage(data: any) {
  // Gérer les messages de signalisation WebRTC
  switch (data.type) {
    case 'call-join':
      handleCallJoin(data)
      break
    case 'call-leave':
      handleCallLeave(data)
      break
    case 'offer':
      handleOffer(data)
      break
    case 'answer':
      handleAnswer(data)
      break
    case 'ice-candidate':
      handleIceCandidate(data)
      break
  }
}

async function handleCallJoin(data: any) {
  // Créer une connexion peer pour le nouveau participant
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  })
  
  peerConnections.value.set(data.userId, pc)
  
  // Ajouter notre stream local
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => {
      pc.addTrack(track, localStream.value!)
    })
  }
  
  // Créer et envoyer une offre
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  
  socket.send(JSON.stringify({
    type: 'offer',
    target: data.userId,
    offer: offer
  }))
}

function handleCallLeave(data: any) {
  const pc = peerConnections.value.get(data.userId)
  if (pc) {
    pc.close()
    peerConnections.value.delete(data.userId)
  }
  
  // Retirer le participant de la liste
  callParticipants.value = callParticipants.value.filter(p => p.id !== data.userId)
}

async function handleOffer(data: any) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  })
  
  peerConnections.value.set(data.userId, pc)
  
  await pc.setRemoteDescription(data.offer)
  
  // Ajouter notre stream local
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => {
      pc.addTrack(track, localStream.value!)
    })
  }
  
  // Créer et envoyer une réponse
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  
  socket.send(JSON.stringify({
    type: 'answer',
    target: data.userId,
    answer: answer
  }))
}

async function handleAnswer(data: any) {
  const pc = peerConnections.value.get(data.userId)
  if (pc) {
    await pc.setRemoteDescription(data.answer)
  }
}

async function handleIceCandidate(data: any) {
  const pc = peerConnections.value.get(data.userId)
  if (pc) {
    await pc.addIceCandidate(data.candidate)
  }
}
</script>

<style scoped>
video {
  transform: scaleX(-1); /* Effet miroir pour la vidéo locale */
}
</style>
