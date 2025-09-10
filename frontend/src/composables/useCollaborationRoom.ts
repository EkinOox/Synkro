import { ref, computed } from 'vue'

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
  isPrivate: boolean
  ownerId: string
  locked: boolean
  users: RoomUser[]
  bannedUserIds: string[]
  password?: string | null
  createdAt: Date
}

const randomColor = () => `#${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}`
const randomId = () => crypto.randomUUID()

export function useCollaborationRoom() {
  const room = ref<RoomState | null>(null)
  const rooms = ref<RoomState[]>([])
  const currentUserId = ref<string>('')
  const loading = ref(false)

  function initRoom(name: string, isPrivate: boolean, password?: string) {
    loading.value = true
    // Simu création room
    const uid = randomId()
    currentUserId.value = uid
    const r: RoomState = {
      id: randomId(),
      name,
      isPrivate: !!isPrivate || !!password,
      ownerId: uid,
      locked: false,
      users: [ { id: uid, name: `Owner-${name}`, color: randomColor(), role: 'owner', active: true } ],
      bannedUserIds: [],
      password: password || null,
      createdAt: new Date()
    }
    room.value = r
    rooms.value.push(r)
    setTimeout(()=> loading.value=false, 400)
  }

  function joinRoom(existing: RoomState, providedPassword?: string) {
    if (!existing) return
    if (!currentUserId.value) currentUserId.value = randomId()
    const uid = currentUserId.value
    if (existing.bannedUserIds.includes(uid)) return
    if (existing.password && existing.password !== providedPassword) return
    if (!existing.users.find(u=>u.id===uid)) {
      existing.users.push({ id: uid, name: `User-${existing.users.length+1}`, color: randomColor(), role: 'writer', active: true })
    }
    room.value = existing
  }

  function toggleWrite(userId: string) {
    if (!room.value) return
    const user = room.value.users.find(u=>u.id===userId)
    if (!user) return
    if (user.role === 'owner') return
    user.role = user.role === 'writer' ? 'read' : 'writer'
  }

  function banUser(userId: string) {
    if (!room.value) return
    if (room.value.ownerId !== currentUserId.value) return
    if (userId === room.value.ownerId) return
    room.value.bannedUserIds.push(userId)
    room.value.users = room.value.users.filter(u=>u.id!==userId)
  }

  function unbanUser(userId: string) {
    if (!room.value) return
    room.value.bannedUserIds = room.value.bannedUserIds.filter(id=>id!==userId)
  }

  // Filtres / tris
  const sortMode = ref<'alpha'|'recent'>('recent')
  const showMine = ref<boolean | null>(null) // null = tous, true = mes rooms, false = autres
  const showPrivacy = ref<'all'|'public'|'private'>('all')

  const filteredRooms = computed(()=> {
    let list = [...rooms.value]
    if (showMine.value !== null) {
      list = list.filter(r => (r.ownerId === currentUserId.value) === showMine.value)
    }
    if (showPrivacy.value === 'public') list = list.filter(r => !r.password)
    else if (showPrivacy.value === 'private') list = list.filter(r => !!r.password)
    if (sortMode.value === 'alpha') list.sort((a,b)=> a.name.localeCompare(b.name))
    else list.sort((a,b)=> b.createdAt.getTime() - a.createdAt.getTime())
    return list
  })

  return {
    room,
    rooms,
    filteredRooms,
    sortMode,
    showMine,
    showPrivacy,
    currentUserId,
    loading,
    initRoom,
    joinRoom,
    toggleWrite,
    banUser,
    unbanUser
  }
}
