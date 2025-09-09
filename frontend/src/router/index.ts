import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import des vues principales
import Home from '../views/Home.vue'

// Chargement paresseux des autres vues
const Whiteboard = () => import('../views/Whiteboard.vue')
const Room = () => import('../views/Room.vue')
const Compte = () => import('../views/Compte.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Synkro - Accueil',
      description: 'Plateforme de collaboration en temps r�el'
    }
  },
  {
    path: '/whiteboard',
    name: 'Whiteboard',
    component: Whiteboard,
    meta: {
      title: 'Synkro - Tableau Blanc',
      description: 'Tableau blanc collaboratif en temps r�el',
      requiresAuth: false // Changez � true si authentification requise
    }
  },
  {
    path: '/whiteboard/:roomId',
    name: 'WhiteboardRoom',
    component: Whiteboard,
    props: true,
    meta: {
      title: 'Synkro - Tableau Blanc Partag�',
      description: 'Tableau blanc collaboratif partag�',
      requiresAuth: false
    }
  },
  {
    path: '/room',
    name: 'Room',
    component: Room,
    meta: {
      title: 'Synkro - Salle',
      description: 'Gestion des salles de collaboration',
      requiresAuth: true
    }
  },
  {
    path: '/room/:id',
    name: 'RoomDetail',
    component: Room,
    props: true,
    meta: {
      title: 'Synkro - Salle',
      description: 'D�tails de la salle de collaboration',
      requiresAuth: true
    }
  },
  {
    path: '/compte',
    name: 'Compte',
    component: Compte,
    meta: {
      title: 'Synkro - Mon Compte',
      description: 'Gestion du compte utilisateur',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: 'Synkro - Connexion',
      description: 'Connexion � votre compte Synkro',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: 'Synkro - Inscription',
      description: 'Cr�er un nouveau compte Synkro',
      requiresGuest: true
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
    meta: {
      title: 'Synkro - Mot de passe oubli�',
      description: 'R�initialiser votre mot de passe',
      requiresGuest: true
    }
  },
  // Route de fallback pour les pages non trouv�es
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'Synkro - Page non trouv�e',
      description: 'La page demand�e n\'existe pas'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Configuration du scroll
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// Guards de navigation
router.beforeEach((to, _from, next) => {
  // Mise � jour du titre de la page
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }

  // V�rification de l'authentification
  const isAuthenticated = checkAuthStatus() // � impl�menter selon votre syst�me d'auth

  if (to.meta?.requiresAuth && !isAuthenticated) {
    // Rediriger vers la page de connexion si auth requise
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (to.meta?.requiresGuest && isAuthenticated) {
    // Rediriger vers l'accueil si d�j� connect�
    next({ name: 'Home' })
  } else {
    next()
  }
})

// Fonction helper pour v�rifier le statut d'authentification
function checkAuthStatus(): boolean {
  // Impl�mentez votre logique d'authentification ici
  // Par exemple, v�rifier un token dans le localStorage
  const token = localStorage.getItem('auth_token')
  return !!token
}

// Guard apr�s navigation pour analytics, logs, etc.
router.afterEach((to, from) => {
  // Analytics ou logging si n�cessaire
  console.log(`Navigation: ${String(from.name)} ? ${String(to.name)}`)
})

export default router
