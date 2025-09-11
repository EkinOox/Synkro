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

  // Initialiser Google Auth avec configuration pour éviter FedCM
  const initGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    // Vérifier si un client ID valide est configuré
    if (!clientId || clientId === 'your-google-client-id' || clientId === 'your-google-client-id-here') {
      console.warn('Client ID Google non configuré - Authentification Google désactivée')
      return
    }

    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          // Configuration pour éviter les erreurs COOP
          use_fedcm_for_prompt: false,
          auto_select: false,
          cancel_on_tap_outside: false,
          // Désactiver l'iframe pour éviter les problèmes COOP
          itp_support: true,
          ux_mode: 'popup'
        })
      } catch (error) {
        console.warn('Erreur lors de l\'initialisation de Google Auth (probablement COOP):', error)
        // En cas d'erreur COOP, utiliser la méthode alternative
        if (error instanceof Error && error.message.includes('Cross-Origin-Opener-Policy')) {
          console.info('Basculement vers la méthode OAuth alternative...')
        }
      }
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

  // Connexion avec Google OAuth - Alternative sans FedCM qui évite COOP
  const loginWithGoogle = () => {
    return new Promise<void>((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

      // Vérifier si un client ID valide est configuré
      if (!clientId || clientId === 'your-google-client-id' || clientId === 'your-google-client-id-here') {
        console.warn('Client ID Google non configuré - Utilisation du mode démo')
        // Utiliser directement la méthode simple si pas de client ID
        return loginWithGoogleSimple()
      }

      try {
        // Créer un bouton temporaire invisible pour déclencher l'auth
        const tempDiv = document.createElement('div')
        tempDiv.style.display = 'none'
        document.body.appendChild(tempDiv)

        if (window.google) {
          window.google.accounts.id.renderButton(tempDiv, {
            theme: 'outline',
            size: 'large',
            width: '300'
          })

          // Simuler un clic sur le bouton
          const button = tempDiv.querySelector('div[role="button"]') as HTMLElement
          if (button) {
            button.click()
            resolve()
          } else {
            // Fallback: redirection vers Google OAuth
            const redirectUri = encodeURIComponent(window.location.origin + '/auth/google/callback')
            const scope = encodeURIComponent('openid email profile')
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=login`

            console.info('Redirection vers Google OAuth pour éviter les erreurs COOP...')
            window.location.href = authUrl
            resolve()
          }

          // Nettoyer le DOM
          setTimeout(() => {
            if (tempDiv.parentNode) {
              tempDiv.parentNode.removeChild(tempDiv)
            }
          }, 100)
        } else {
          reject(new Error('Google API non chargée'))
        }
      } catch (error) {
        console.error('Erreur lors de la connexion Google:', error)

        // Si erreur COOP, basculer vers le mode démo
        if (error instanceof Error && error.message.includes('Cross-Origin-Opener-Policy')) {
          console.warn('Erreur COOP détectée, basculement vers le mode démo')
          return loginWithGoogleSimple()
        }

        reject(error)
      }
    })
  }

  // Connexion avec credentials email/password
  const loginWithCredentials = async (email: string, password: string) => {
    try {
      // Simuler une requête d'authentification à votre backend
      const response = await fetch('http://localhost:8000/api/user_logins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()

        // V�rifier que la r�ponse contient un token
        if (data.success && data.token) {
          // Cr�er un objet utilisateur bas� sur l'email
          const user = {
            email: email,
            name: email.split('@')[0], // Utiliser la partie avant @ comme nom
            picture: 'https://via.placeholder.com/100',
            sub: `user-${email}`
          }

          authState.value = {
            user,
            token: data.token,
            isAuthenticated: true
          }

          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('auth_user', JSON.stringify(user))

          console.log('? Connexion r�ussie avec token JWT r�el:', data.token.substring(0, 30) + '...')
          return true
        } else {
          throw new Error(data.message || 'Token non re�u du serveur')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.detail || 'Identifiants invalides')
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

  // Alternative: Connexion Google simplifiée (pour éviter FedCM)
  const loginWithGoogleSimple = () => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Méthode de démo simple
        const mockUser = {
          email: 'demo@gmail.com',
          name: 'Utilisateur Demo',
          picture: 'https://via.placeholder.com/100',
          sub: 'google-demo-user'
        }

        authState.value = {
          user: mockUser,
          token: 'google-demo-token',
          isAuthenticated: true
        }

        localStorage.setItem('auth_token', 'google-demo-token')
        localStorage.setItem('auth_user', JSON.stringify(mockUser))

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  return {
    // État
    authState: readonly(authState),

    // Méthodes
    initAuth,
    initGoogleAuth,
    loginWithGoogle,
    loginWithGoogleSimple,
    loginWithCredentials,
    logout,
    isAuthenticated,
    getCurrentUser,
    getToken,
    validateTokenWithBackend
  }
}
