import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useAuth } from './useAuth'

interface CollaborationUser {
  id: string
  name: string
  color: string
  avatar?: string
}

/**
 * Composable pour obtenir l'utilisateur actuel formaté pour la collaboration
 */
export function useCollaborationUser(): { user: ComputedRef<CollaborationUser> } {
  const { getCurrentUser, isAuthenticated } = useAuth()

  const user = computed<CollaborationUser>(() => {
    const currentUser = getCurrentUser()
    
    if (isAuthenticated() && currentUser) {
      return {
        id: currentUser.sub || currentUser.email,
        name: currentUser.name,
        color: generateUserColor(currentUser.email),
        avatar: currentUser.picture
      }
    }
    
    // Fallback pour utilisateur de développement/test
    return {
      id: `dev-user-${Date.now()}`,
      name: 'Utilisateur de développement',
      color: '#3b82f6',
      avatar: undefined
    }
  })

  return { user }
}

/**
 * Génère une couleur consistante basée sur l'email de l'utilisateur
 */
function generateUserColor(email: string): string {
  if (!email) return '#3b82f6'
  
  // Créer un hash simple de l'email
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Convertir en couleur hex
  const colors = [
    '#ef4444', // rouge
    '#f97316', // orange  
    '#eab308', // jaune
    '#22c55e', // vert
    '#06b6d4', // cyan
    '#3b82f6', // bleu
    '#8b5cf6', // violet
    '#d946ef', // magenta
    '#ec4899', // rose
    '#10b981', // emeraude
  ]
  
  return colors[Math.abs(hash) % colors.length]
}
