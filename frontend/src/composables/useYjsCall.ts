import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface CallUser {
  id: string
  name: string
  avatar?: string
}

interface CallParticipant extends CallUser {
  audioEnabled: boolean
  videoEnabled: boolean
  stream?: MediaStream
  peerConnection?: RTCPeerConnection
}

interface SignalingMessage {
  id: string
  fromUserId: string
  toUserId: string
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left' | 'toggle-audio' | 'toggle-video'
  data: any
  timestamp: number
}

// Fonction utilitaire pour vérifier la compatibilité des appels
const checkMediaDevicesSupport = (): { supported: boolean; error?: string } => {
  if (!navigator.mediaDevices) {
    return {
      supported: false,
      error: 'L\'API MediaDevices n\'est pas supportée par ce navigateur.'
    }
  }

  if (!navigator.mediaDevices.getUserMedia) {
    return {
      supported: false,
      error: 'getUserMedia n\'est pas disponible. Assurez-vous d\'utiliser HTTPS ou localhost.'
    }
  }

  if (!window.RTCPeerConnection) {
    return {
      supported: false,
      error: 'WebRTC n\'est pas supporté par ce navigateur.'
    }
  }

  return { supported: true }
}

export function useYjsCall(roomId: string, user: CallUser) {
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const inCall = ref(false)
  const isVideoCall = ref(false)
  const participants = ref<CallParticipant[]>([])
  const error = ref<string | null>(null)

  // Local media state
  const localStream = ref<MediaStream | null>(null)
  const audioEnabled = ref(true)
  const videoEnabled = ref(true)

  // Yjs objects
  let ydoc: Y.Doc | null = null
  let provider: WebsocketProvider | null = null
  let ySignaling: Y.Array<SignalingMessage> | null = null

  // Stocker les callbacks
  let signalingObserver: (() => void) | null = null
  let awarenessChangeCallback: (() => void) | null = null

  const initializeCall = async () => {
    try {
      console.log('?? Initialisation de l\'appel collaboratif avec Yjs')
      isConnecting.value = true
      error.value = null
      
      // Créer le document Yjs
      ydoc = new Y.Doc()
      
      // URL du serveur WebSocket
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
      const url = `${wsUrl}/yjs`
      
      console.log(`?? Connexion Call: ${url}/${roomId}`)

      // Créer le provider WebSocket
      provider = new WebsocketProvider(url, `call-${roomId}`, ydoc)

      // Créer la structure partagée pour le signaling
      ySignaling = ydoc.getArray<SignalingMessage>('call-signaling')

      // Configurer l'awareness
      if (provider.awareness) {
        provider.awareness.setLocalStateField('user', {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          inCall: false,
          audioEnabled: false,
          videoEnabled: false
        })
      }

      // Gestionnaires d'évènements du provider
      provider.on('status', (event: any) => {
        console.log('Statut Call WebSocket:', event.status)
        isConnected.value = event.status === 'connected'
        isConnecting.value = event.status === 'connecting'

        if (event.status === 'disconnected') {
          error.value = 'Connexion perdue'
        } else if (event.status === 'connected') {
          error.value = null
        }
      })

      provider.on('connection-error', (event: any) => {
        console.error('? Erreur de connexion Call:', event)
        error.value = 'Impossible de se connecter'
        isConnecting.value = false
      })

      // Observer les messages de signaling
      signalingObserver = () => {
        if (ySignaling) {
          const messages = ySignaling.toArray()
          // Traiter les nouveaux messages de signaling
          const relevantMessages = messages.filter(msg => 
            msg.toUserId === user.id && msg.timestamp > Date.now() - 5000
          )
          
          relevantMessages.forEach(handleSignalingMessage)
        }
      }
      
      if (ySignaling) {
        ySignaling.observe(signalingObserver)
      }

      // Suivre les participants via awareness
      if (provider.awareness) {
        awarenessChangeCallback = () => {
          if (!provider || !provider.awareness) return
          
          const states = provider.awareness.getStates()
          const callParticipants: CallParticipant[] = []
          
          states.forEach((state: any) => {
            if (state.user && state.user.id !== user.id && state.user.inCall) {
              callParticipants.push({
                id: state.user.id,
                name: state.user.name,
                avatar: state.user.avatar,
                audioEnabled: state.user.audioEnabled || false,
                videoEnabled: state.user.videoEnabled || false
              })
            }
          })
          
          participants.value = callParticipants
          console.log('?? Participants appel:', callParticipants.length)
        }
        
        provider.awareness.on('change', awarenessChangeCallback)
      }

      isConnecting.value = false
      console.log('Système d\'appel initialisé')

    } catch (err) {
      console.error('? Erreur d\'initialisation Call:', err)
      error.value = 'Erreur d\'initialisation'
      isConnecting.value = false
    }
  }

  const startCall = async (withVideo: boolean = false) => {
    try {
      console.log(`Démarrage appel ${withVideo ? 'vidéo' : 'audio'}`)

      // Vérifier la compatibilité du navigateur
      const compatibility = checkMediaDevicesSupport()
      if (!compatibility.supported) {
        throw new Error(compatibility.error)
      }

      // Demander l'accès aux médias
      const constraints = {
        audio: true,
        video: withVideo
      }

      localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
      
      inCall.value = true
      isVideoCall.value = withVideo
      audioEnabled.value = true
      videoEnabled.value = withVideo

      // Mettre à jour l'awareness
      if (provider && provider.awareness) {
        provider.awareness.setLocalStateField('user', {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          inCall: true,
          audioEnabled: audioEnabled.value,
          videoEnabled: videoEnabled.value
        })
      }

      // Envoyer un signal que l'utilisateur a rejoint l'appel
      sendSignalingMessage('user-joined', { withVideo })

      console.log('? Appel démarré')

    } catch (err) {
      console.error('? Erreur démarrage appel:', err)
      error.value = 'Impossible d\'accéder aux médias'
    }
  }

  const endCall = () => {
    console.log('?? Fin d\'appel')

    // Arréter le stream local
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }

    // Fermer toutes les connexions peer
    participants.value.forEach(participant => {
      if (participant.peerConnection) {
        participant.peerConnection.close()
      }
    })

    inCall.value = false
    isVideoCall.value = false
    audioEnabled.value = true
    videoEnabled.value = true
    participants.value = []

    // Mettre à jour l'awareness
    if (provider && provider.awareness) {
      provider.awareness.setLocalStateField('user', {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        inCall: false,
        audioEnabled: false,
        videoEnabled: false
      })
    }

    // Envoyer un signal de départ
    sendSignalingMessage('user-left', {})
  }

  const toggleAudio = () => {
    if (localStream.value) {
      const audioTrack = localStream.value.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        audioEnabled.value = audioTrack.enabled
        
        // Mettre à jour l'awareness
        updateUserStatus()
        
        // Notifier les autres participants
        sendSignalingMessage('toggle-audio', { enabled: audioEnabled.value })
      }
    }
  }

  const toggleVideo = () => {
    if (localStream.value && isVideoCall.value) {
      const videoTrack = localStream.value.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        videoEnabled.value = videoTrack.enabled
        
        // Mettre à jour l'awareness
        updateUserStatus()
        
        // Notifier les autres participants
        sendSignalingMessage('toggle-video', { enabled: videoEnabled.value })
      }
    }
  }

  const updateUserStatus = () => {
    if (provider && provider.awareness) {
      provider.awareness.setLocalStateField('user', {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        inCall: inCall.value,
        audioEnabled: audioEnabled.value,
        videoEnabled: videoEnabled.value
      })
    }
  }

  const sendSignalingMessage = (type: SignalingMessage['type'], data: any, toUserId?: string) => {
    if (!ySignaling) return

    const message: SignalingMessage = {
      id: Date.now().toString() + Math.random(),
      fromUserId: user.id,
      toUserId: toUserId || 'all',
      type,
      data,
      timestamp: Date.now()
    }

    ySignaling.push([message])
    console.log('Message signaling envoyé:', type)
  }

  const handleSignalingMessage = (message: SignalingMessage) => {
    console.log('Message signaling reçu:', message.type, 'de', message.fromUserId)
    
    switch (message.type) {
      case 'user-joined':
        // Un nouvel utilisateur a rejoint l'appel
        handleUserJoined(message.fromUserId, message.data)
        break
      case 'user-left':
        // Un utilisateur a quitté l'appel
        handleUserLeft(message.fromUserId)
        break
      case 'offer':
        // Recevoir une offre WebRTC
        handleOffer(message.fromUserId, message.data)
        break
      case 'answer':
        // Recevoir une réponse WebRTC
        handleAnswer(message.fromUserId, message.data)
        break
      case 'ice-candidate':
        // Recevoir un candidat ICE
        handleIceCandidate(message.fromUserId, message.data)
        break
      case 'toggle-audio':
      case 'toggle-video':
        // Mise à jour du statut média d'un participant
        updateParticipantStatus(message.fromUserId, message.type, message.data.enabled)
        break
    }
  }

  const handleUserJoined = (userId: string, _data: any) => {
    console.log('Utilisateur rejoint appel:', userId)
    // Ici on initierait une connexion WebRTC avec le nouvel utilisateur
    // Pour la simplicité, on simule juste l'ajout à la liste
  }

  const handleUserLeft = (userId: string) => {
    console.log('Utilisateur quitté appel:', userId)
    // Nettoyer la connexion WebRTC avec cet utilisateur
    const participantIndex = participants.value.findIndex(p => p.id === userId)
    if (participantIndex !== -1) {
      const participant = participants.value[participantIndex]
      if (participant.peerConnection) {
        participant.peerConnection.close()
      }
      participants.value.splice(participantIndex, 1)
    }
  }

  const handleOffer = (userId: string, _offer: RTCSessionDescriptionInit) => {
    // Traiter une offre WebRTC (implémentation WebRTC complète nécessaire)
    console.log('Offre reçue de:', userId)
  }

  const handleAnswer = (userId: string, _answer: RTCSessionDescriptionInit) => {
    // Traiter une réponse WebRTC
    console.log('Réponse reçue de:', userId)
  }

  const handleIceCandidate = (userId: string, _candidate: RTCIceCandidateInit) => {
    // Traiter un candidat ICE
    console.log('Candidat ICE reçu de:', userId)
  }

  const updateParticipantStatus = (userId: string, type: string, enabled: boolean) => {
    const participant = participants.value.find(p => p.id === userId)
    if (participant) {
      if (type === 'toggle-audio') {
        participant.audioEnabled = enabled
      } else if (type === 'toggle-video') {
        participant.videoEnabled = enabled
      }
    }
  }

  const destroyCall = () => {
    console.log('??? Destruction du système d\'appel')

    // Terminer l'appel s'il est en cours
    if (inCall.value) {
      endCall()
    }
    
    if (provider) {
      // Nettoyer les événements avant la destruction
      if (provider.awareness && awarenessChangeCallback) {
        try {
          provider.awareness.off('change', awarenessChangeCallback)
          awarenessChangeCallback = null
        } catch (e) {
          console.warn('Erreur lors du nettoyage des évènements awareness:', e)
        }
      }
      
      try {
        provider.destroy()
      } catch (e) {
        console.warn('Erreur lors de la destruction du provider:', e)
      }
      provider = null
    }

    // Nettoyer l'observer
    if (ySignaling && signalingObserver) {
      try {
        ySignaling.unobserve(signalingObserver)
        signalingObserver = null
      } catch (e) {
        console.warn('?? Erreur lors du nettoyage observer signaling:', e)
      }
    }
    
    if (ydoc) {
      try {
        ydoc.destroy()
      } catch (e) {
        console.warn('?? Erreur lors de la destruction du document:', e)
      }
      ydoc = null
    }
    
    ySignaling = null
    isConnected.value = false
    isConnecting.value = false
    participants.value = []
    error.value = null
  }

  // Fonction pour vérifier la compatibilité
  const isCallSupported = () => {
    return checkMediaDevicesSupport().supported
  }

  // Fonction pour obtenir l'erreur de compatibilité
  const getCompatibilityError = () => {
    const result = checkMediaDevicesSupport()
    return result.supported ? null : result.error
  }

  // Hook de nettoyage
  onUnmounted(() => {
    destroyCall()
  })

  return {
    // état de la collaboration
    isConnected,
    isConnecting,
    error,
    
    // état de l'appel
    inCall,
    isVideoCall,
    participants,
    localStream,
    audioEnabled,
    videoEnabled,
    
    // Vérification de compatibilité
    isCallSupported,
    getCompatibilityError,
    
    // Actions
    initializeCall,
    destroyCall,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo
  }
}
