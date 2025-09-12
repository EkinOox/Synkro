import { ref, readonly } from 'vue'

interface GoogleUser {
  email: string
  name: string
  picture: string
  sub: string
}

interface AuthState {
  user: GoogleUser | null
  token: string | null
  isAuthenticated: boolean
}

// Déclaration des types pour l'API Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (parent: HTMLElement, options: any) => void
        }
      }
    }
  }
}

const authState = ref<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false
})

export const useAuth = (router?: any) => {
  // Initialiser l'état d'authentification depuis le localStorage
  const initAuth = () => {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('auth_user')

    if (token && user) {
      authState.value = {
        token,
        user: JSON.parse(user),
        isAuthenticated: true
      }
    }
  }

  // Initialiser Google OAuth
  const initGoogleAuth = () => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      })
    }
  }

  // Gestionnaire de réponse Google
  const handleCredentialResponse = (response: any) => {
    try {
      if (response.credential) {
        // Décoder le JWT pour obtenir les informations utilisateur
        const userInfo = parseJwt(response.credential)

        if (userInfo) {
          const user: GoogleUser = {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            sub: userInfo.sub
          }

          // Sauvegarder dans l'état et localStorage
          authState.value = {
            user,
            token: response.credential,
            isAuthenticated: true
          }

          localStorage.setItem('auth_token', response.credential)
          localStorage.setItem('auth_user', JSON.stringify(user))

          // Rediriger vers l'accueil
          window.location.href = '/'
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la réponse Google:', error)
    }
  }

  // Connexion avec Google OAuth
  const loginWithGoogle = () => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (typeof window !== 'undefined' && window.google) {
          // Déclencher la popup de connexion Google
          window.google.accounts.id.prompt()
          resolve()
        } else {
          reject(new Error('Google API non disponible'))
        }
      } catch (error) {
        console.error('Erreur de connexion Google:', error)
        reject(error)
      }
    })
  }

  // Connexion avec credentials email/password
  const loginWithCredentials = async (email: string, password: string) => {
    try {
      // Simuler une requête d'authentification à votre backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()

        authState.value = {
          user: data.user,
          token: data.token,
          isAuthenticated: true
        }

        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))

        return true
      } else {
        throw new Error('Identifiants invalides')
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }

  // Déconnexion
  const logout = () => {
    authState.value = {
      user: null,
      token: null,
      isAuthenticated: false
    }

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')

    if (router) {
      router.push('/login')
    } else {
      window.location.href = '/login'
    }
  }

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = () => {
    return authState.value.isAuthenticated
  }

  // Obtenir l'utilisateur actuel
  const getCurrentUser = () => {
    return authState.value.user
  }

  // Obtenir le token
  const getToken = () => {
    return authState.value.token
  }

  // Utilitaire pour décoder un JWT (simplifié)
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Erreur lors du décodage du JWT:', error)
      return null
    }
  }

  // Validation du token avec le backend (optionnel)
  const validateTokenWithBackend = async (token: string) => {
    try {
      const response = await fetch('/api/auth/google/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error('Token invalide')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erreur de validation du token:', error)
      logout()
      throw error
    }
  }

  return {
    // état
    authState: readonly(authState),

    // Méthodes
    initAuth,
    initGoogleAuth,
    loginWithGoogle,
    loginWithCredentials,
    logout,
    isAuthenticated,
    getCurrentUser,
    getToken,
    validateTokenWithBackend
  }
}
