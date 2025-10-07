import { ref, computed, onMounted } from 'vue'
import { apiService, type DocListItem } from '../services/api'
import { useAuth } from './useAuth'

export interface RoomUser {
  id: string
  name: string
  color: string
  role: 'owner' | 'writer' | 'read' | 'banned'
  active: boolean
}

export interface RoomState {
  id: string
  name: string
  ownerId: string
  ownerName?: string
  locked: boolean
  users: RoomUser[]
  bannedUserIds: string[]
  password?: string | null
  createdAt: Date
}

const randomColor = () => `#${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}`

export function useCollaborationRoom() {
  const room = ref<RoomState | null>(null)
  const rooms = ref<RoomState[]>([])
  const currentUserId = ref<string>('user-' + Date.now()) // Temporaire
  const loading = ref(false)
  const error = ref<string>('')

  // Utiliser le token d'authentification existant
  const auth = useAuth()

  // Configurer le service API avec le token
  const initializeApiService = () => {
    try {
      // Initialiser l'authentification si pas déjà fait
      auth.initAuth()

      const token = auth.getToken()
      if (token && token !== 'google-demo-token') { // Éviter les tokens de démo
        apiService.setAuthToken(token)
        console.log('? Token JWT réel configuré pour l\'API:', token.substring(0, 20) + '...')
        return true
      } else {
        console.log('?? Aucun token JWT réel disponible - mode déconnecté')
        apiService.setAuthToken(null) // S'assurer qu'il n'y a pas de token obsolète
        return false
      }
    } catch (err) {
      console.warn('? Erreur lors de la récupération du token:', err)
      return false
    }
  }

  // Vérifier l'authentification de manière sûre
  const checkAuthentication = () => {
    try {
      return auth.isAuthenticated()
    } catch (err) {
      console.warn('Erreur lors de la vérification d\'authentification:', err)
      return false
    }
  }

  // Charger les rooms au montage
  onMounted(async () => {
    initializeApiService()
    await loadRooms()
  })

  async function loadRooms() {
    try {
      loading.value = true
      error.value = ''

      // Reconfigurer le token avant chaque appel
      const hasValidToken = initializeApiService()

      let response

      // Si pas d'authentification JWT réelle, utiliser les données de test
      if (!hasValidToken) {
        console.log('?? Pas de token JWT réel, utilisation des données de test')
        createDemoRooms()
        return
      }

      // Essayer d'abord les rooms publiques (qui montrent toutes les rooms)
      try {
        console.log(' Tentative d\'accès aux rooms publiques...')
        response = await apiService.getRooms()
        console.log('? Rooms publiques chargées avec succès')
      } catch (publicError) {
        console.warn('?? Erreur rooms publiques, fallback sur rooms admin:', publicError)
        try {
          response = await apiService.getRoomsAdmin()
          console.log('? Rooms admin chargées avec succès')
        } catch (adminError) {
          console.error('? Erreur aussi sur rooms admin:', adminError)
          createDemoRooms()
          return
        }
      }

      // Vérifier que la réponse est valide
      if (!response) {
        console.warn('Aucune réponse de l\'API')
        createDemoRooms()
        return
      }

      // Gérer la structure Hydra/JSON-LD : soit response.member soit response directement
      let memberArray = []
      if (response.member && Array.isArray(response.member)) {
        memberArray = response.member
      } else if (Array.isArray(response)) {
        memberArray = response
      } else {
        console.warn('Structure de réponse inattendue:', response)
        createDemoRooms()
        return
      }

      // Convertir les données API en format local
      rooms.value = memberArray.map((item: DocListItem) => {
        const ownerId = item.adminId ? item.adminId.toString() : currentUserId.value
        return {
          id: item.id.toString(),
          name: item.name,
          ownerId,
          ownerName: item.adminId === 1 ? 'Kyllian Diochon' : 'Utilisateur inconnu',
          locked: false,
          users: [
            {
              id: ownerId,
              name: item.adminId === 1 ? 'Kyllian Diochon' : 'Utilisateur',
              color: randomColor(),
              role: 'owner' as const,
              active: true
            }
          ],
          bannedUserIds: [],
          password: item.password || null,
          createdAt: new Date() // Temporaire - l'API devrait fournir cette info
        }
      })

      console.log(`${rooms.value.length} rooms chargées avec succès`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des rooms'
      error.value = errorMessage
      console.error('Erreur chargement rooms:', err)

      // En cas d'erreur totale, créer quelques rooms de démonstration
      console.log('Création de rooms de démonstration suite à une erreur...')
      createDemoRooms()
    } finally {
      loading.value = false
    }
  }

  function createDemoRooms() {
    rooms.value = [
      {
        id: '1',
        name: 'Room de démonstration',
        ownerId: currentUserId.value,
        ownerName: 'Vous',
        locked: false,
        users: [
          {
            id: currentUserId.value,
            name: 'Vous',
            color: randomColor(),
            role: 'owner',
            active: true
          }
        ],
        bannedUserIds: [],
        password: null,
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Réunion Équipe',
        ownerId: 'other-user',
        ownerName: 'Collègue',
        locked: false,
        users: [
          {
            id: 'other-user',
            name: 'Collègue',
            color: randomColor(),
            role: 'owner',
            active: true
          }
        ],
        bannedUserIds: [],
        password: 'secret123',
        createdAt: new Date(Date.now() - 3600000)
      }
    ]
  }

  async function initRoom(name: string, password?: string) {
    try {
      loading.value = true
      error.value = ''

      // Vérifier l'authentification
      if (!checkAuthentication()) {
        console.warn('Pas d\'authentification, création de room locale uniquement')

        // Créer une room locale temporaire
        const localRoom: RoomState = {
          id: 'local-' + Date.now(),
          name: name.trim(),
          ownerId: currentUserId.value,
          ownerName: 'Vous',
          locked: false,
          users: [
            {
              id: currentUserId.value,
              name: 'Vous',
              color: randomColor(),
              role: 'owner',
              active: true
            }
          ],
          bannedUserIds: [],
          password: password?.trim() || null,
          createdAt: new Date()
        }

        rooms.value.unshift(localRoom)
        room.value = localRoom

        error.value = 'Room créée en local. Connectez-vous pour la sauvegarder sur le serveur.'
        return
      }

      // Tenter la création via l'API
      const response = await apiService.createRoom({
        name: name.trim(),
        text: 'Nouvelle room collaborative', // Description par défaut
        password: password?.trim() || ''
      })

      if (response.success) {
        // Créer l'objet room local
        const newRoom: RoomState = {
          id: response.docId.toString(),
          name,
          ownerId: currentUserId.value,
          ownerName: 'Kyllian Diochon',
          locked: false,
          users: [
            {
              id: currentUserId.value,
              name: 'Kyllian Diochon',
              color: randomColor(),
              role: 'owner',
              active: true
            }
          ],
          bannedUserIds: [],
          password: password?.trim() || null,
          createdAt: new Date()
        }

        rooms.value.unshift(newRoom)
        room.value = newRoom

        console.log('Room créée sur le serveur:', response.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la room'
      error.value = errorMessage
      console.error('Erreur création room:', err)

      // Si erreur d'authentification, proposer de créer localement
      if (errorMessage.includes('JWT') || errorMessage.includes('401')) {
        error.value = 'Authentification requise. Connectez-vous pour créer des rooms sur le serveur.'
      }
    } finally {
      loading.value = false
    }
  }

  function joinRoom(existing: RoomState, providedPassword?: string) {
    if (!existing) return

    const uid = currentUserId.value
    if (existing.bannedUserIds.includes(uid)) {
      error.value = 'Vous êtes banni de cette room'
      return
    }

    if (existing.password && existing.password !== providedPassword) {
      error.value = 'Mot de passe incorrect'
      return
    }

    if (!existing.users.find(u => u.id === uid)) {
      existing.users.push({
        id: uid,
        name: `Utilisateur-${existing.users.length + 1}`,
        color: randomColor(),
        role: 'writer',
        active: true
      })
    }

    room.value = existing
    error.value = ''
  }

  function toggleWrite(userId: string) {
    if (!room.value) return
    const user = room.value.users.find(u => u.id === userId)
    if (!user) return
    if (user.role === 'owner') return
    user.role = user.role === 'writer' ? 'read' : 'writer'
  }

  function banUser(userId: string) {
    if (!room.value) return
    if (room.value.ownerId !== currentUserId.value) return
    if (userId === room.value.ownerId) return
    room.value.bannedUserIds.push(userId)
    room.value.users = room.value.users.filter(u => u.id !== userId)
  }

  function unbanUser(userId: string) {
    if (!room.value) return
    room.value.bannedUserIds = room.value.bannedUserIds.filter(id => id !== userId)
  }

  // Charger une room spécifique par ID
  async function loadRoomById(roomId: string) {
    try {
      loading.value = true
      error.value = ''

      // D'abord chercher dans les rooms déjà chargées
      const existingRoom = rooms.value.find(r => r.id === roomId)
      if (existingRoom) {
        room.value = existingRoom
        console.log('Room trouvée dans le cache local:', existingRoom.name)
        return
      }

      // Si pas trouvée localement, charger toutes les rooms puis chercher
      await loadRooms()

      const foundRoom = rooms.value.find(r => r.id === roomId)
      if (foundRoom) {
        room.value = foundRoom
        console.log('Room trouvée après rechargement:', foundRoom.name)
      } else {
        throw new Error(`Room avec l'ID ${roomId} non trouvée`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de la room'
      error.value = errorMessage
      console.error('Erreur chargement room:', err)
      room.value = null
    } finally {
      loading.value = false
    }
  }

  // Filtres / tris
  const sortMode = ref<'alpha'|'recent'>('recent')
  const showMine = ref<boolean | null>(null) // null = tous, true = mes rooms, false = autres
  const showPrivacy = ref<'all'|'public'|'private'>('all')

  const filteredRooms = computed(() => {
    let list = [...rooms.value]
    if (showMine.value !== null) {
      list = list.filter(r => (r.ownerId === currentUserId.value) === showMine.value)
    }
    if (showPrivacy.value === 'public') list = list.filter(r => !r.password)
    else if (showPrivacy.value === 'private') list = list.filter(r => !!r.password)
    if (sortMode.value === 'alpha') list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return list
  })

  // Recharger les rooms après connexion
  const refreshAfterAuth = async () => {
    console.log('?? Rechargement des rooms après authentification...')
    initializeApiService()
    await loadRooms()
  }

  return {
    room,
    rooms,
    filteredRooms,
    sortMode,
    showMine,
    showPrivacy,
    currentUserId,
    loading,
    error,
    loadRooms,
    loadRoomById,
    initRoom,
    joinRoom,
    toggleWrite,
    banUser,
    unbanUser,
    refreshAfterAuth,
    initializeApiService
  }
}
