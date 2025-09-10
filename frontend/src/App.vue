<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import router from './router'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menubar from 'primevue/menubar'

const route = computed(() => router.currentRoute.value)

// État d'authentification (à adapter selon votre système d'auth)
const isAuthenticated = ref(!!localStorage.getItem('auth_token'))

// État réactif pour le nom de la route courante
const currentRouteName = ref<string>('')

// Watcher pour mettre à jour le nom de la route avec protection
watch(() => route.value?.name || '', (newName) => {
  currentRouteName.value = String(newName)
}, { immediate: true })

onMounted(() => {
  currentRouteName.value = route.value?.name ? String(route.value.name) : ''
})

// Fonction de déconnexion
const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user') // suppression de l'utilisateur stocké
  isAuthenticated.value = false
  router.push('/login')
}

// Configuration du menu principal
const menuItems = computed(() => [
  {
    label: 'Accueil',
    icon: 'pi pi-home',
    command: () => router.push('/'),
    class: (currentRouteName.value === 'Home') ? 'active-route' : ''
  },
  {
    label: 'Whiteboard',
    icon: 'pi pi-palette',
    command: () => router.push('/whiteboard'),
    class: (currentRouteName.value.toLowerCase().includes('whiteboard')) ? 'active-route' : ''
  },
  ...(isAuthenticated.value ? [
    {
      label: 'Salles',
      icon: 'pi pi-users',
      items: [
        {
          label: 'Créer une Salle',
          icon: 'pi pi-plus',
          command: () => router.push('/room')
        },
        {
          label: 'Mes Salles',
          icon: 'pi pi-list',
          command: () => router.push('/room')
        },
        {
          separator: true
        },
        {
          label: 'Rejoindre une Salle',
          icon: 'pi pi-sign-in',
          command: () => router.push('/room')
        }
      ]
    }
  ] : [])
])

// Écouter les changements d'authentification
const checkAuthStatus = () => {
  isAuthenticated.value = !!localStorage.getItem('auth_token')
}

// Écouter les événements de storage pour synchroniser l'état d'authentification
window.addEventListener('storage', checkAuthStatus)

// Configuration terminée
</script>

<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 relative overflow-hidden flex flex-col">
  <Toast position="top-right" />
    <!-- Background glassmorphism elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/2 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-400/8 to-teal-400/8 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <header class="sticky top-0 z-40 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-b-2 border-white/20 dark:border-gray-700/30 shadow-2xl">
      <div class="max-w-7xl mx-auto">
        <Menubar :model="menuItems" class="!border-0 !bg-transparent !rounded-none px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-5 lg:py-6 flex items-center justify-between min-h-[70px]" style="--menu-margin-left: 30px;">
          <template #start>
            <router-link to="/" class="flex items-center gap-3 text-decoration-none text-blue-600 dark:text-blue-400 font-bold text-xl px-6 py-3 rounded-xl transition-all duration-300 hover:bg-white/25 dark:hover:bg-gray-800/40 hover:scale-105 backdrop-blur-sm border border-white/30 dark:border-gray-700/40 shadow-xl hover:shadow-2xl bg-white/15 dark:bg-gray-800/20">
              <i class="pi pi-bolt text-3xl drop-shadow-lg"></i>
              <span class="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent font-bold hidden sm:inline">Synkro</span>
            </router-link>
          </template>

          <template #end>
            <div class="flex items-center gap-4">

              <!-- Avatar utilisateur ou boutons de connexion -->
              <Avatar
                v-if="isAuthenticated"
                icon="pi pi-user"
                class="!bg-gradient-to-r !from-blue-600 !to-emerald-600 cursor-pointer !w-14 !h-14 !shadow-xl hover:!shadow-2xl transform hover:scale-110 transition-all duration-300 !border-2 !border-white/40 dark:!border-gray-700/40"
                shape="circle"
                size="large"
                v-tooltip="'Mon compte'"
                @click="router.push('/compte')"
              />
                  <Button v-if="isAuthenticated" label="Déconnexion" icon="pi pi-sign-out" size="small" severity="secondary" @click="logout" />

              <!-- Boutons pour les utilisateurs non connectés -->
              <div v-else class="flex items-center gap-3">
                <!-- Bouton Connexion - 100% Tailwind -->
                <Button
                  label="Connexion"
                  icon="pi pi-sign-in"
                  severity="secondary"
                  outlined
                  rounded
                  size="large"
                  class="group relative overflow-hidden !px-6 !py-3 !min-h-[48px] !backdrop-blur-xl !bg-white/25 dark:!bg-gray-800/25 hover:!bg-white/40 dark:hover:!bg-gray-700/40 !border-2 !border-white/50 dark:!border-gray-600/50 hover:!border-blue-400/60 !shadow-xl hover:!shadow-blue-500/25 transform hover:scale-110 hover:-translate-y-1 transition-all duration-500 !text-gray-700 dark:!text-gray-200 hover:!text-blue-600 dark:hover:!text-blue-400 !font-semibold before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-blue-400/30 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
                  @click="router.push('/login')"
                />

                <!-- Bouton Inscription - 100% Tailwind + animations CSS -->
                <Button
                  label="Inscription"
                  icon="pi pi-user-plus"
                  severity="info"
                  rounded
                  size="large"
                  class="group relative overflow-hidden !px-6 !py-3 !min-h-[48px] !bg-gradient-to-r !from-blue-600 !via-purple-600 !to-emerald-600 hover:!from-blue-700 hover:!via-purple-700 hover:!to-emerald-700 !shadow-xl hover:!shadow-purple-500/40 !border-2 !border-white/30 hover:!border-white/50 transform hover:scale-110 hover:-translate-y-1 transition-all duration-500 !text-white !font-semibold animate-gradient-x before:absolute before:inset-0 before:bg-gradient-to-45 before:from-white/20 before:via-transparent before:to-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 after:absolute after:inset-0 after:bg-radial-gradient after:from-white/20 after:to-transparent after:scale-0 hover:after:scale-100 after:transition-transform after:duration-600"
                  @click="router.push('/register')"
                />
              </div>
            </div>
          </template>
        </Menubar>
      </div>
    </header>

    <main class="relative z-10 flex-1 w-full">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* App layout moved to Tailwind classes */

/* Notification badge personnalisé - CSS requis pour ::after */
.pi-bell::after {
  content: '';
  position: absolute;
  top: 6px;
  right: 6px;
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

/*
  IMPORTANT: Les styles CSS ci-dessous sont OBLIGATOIRES car ils utilisent :deep()
  pour cibler les composants PrimeVue internes. Tailwind ne peut pas les remplacer.
*/

/* Styles personnalisés pour la Menubar avec glassmorphism */
:deep(.p-menubar-root-list) {
  display: flex !important;
  align-items: center !important;
  gap: 1.5rem !important;
  margin: 0 !important;
  margin-left: 30px !important;
  padding: 0 !important;
}

/* Fallback styles pour s'assurer que les sous-menus sont visibles */
:deep(.p-submenu-list) {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
  padding: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  min-width: 200px !important;
}

:deep(.p-submenu-list .p-menuitem-link) {
  padding: 8px 12px !important;
  border-radius: 4px !important;
  color: #374151 !important;
  background: transparent !important;
  transition: all 0.2s ease !important;
}

:deep(.p-submenu-list .p-menuitem-link:hover) {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #1e40af !important;
}

:deep(.p-menubar-root-list .p-menuitem-link) {
  border-radius: 1rem !important;
  transition: all 0.3s ease !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  padding: 1rem 1.75rem !important;
  margin: 0 !important;
  backdrop-filter: blur(12px) !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  white-space: nowrap !important;
  min-height: 52px !important;
  min-width: 120px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.p-menubar-root-list .p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.35) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-3px) scale(1.05) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18) !important;
  color: #1e40af !important;
}

:deep(.p-menubar-root-list .p-menuitem-active .p-menuitem-link),
:deep(.p-menubar-root-list .active-route .p-menuitem-link) {
  background: rgba(30, 64, 175, 0.25) !important;
  border-color: rgba(30, 64, 175, 0.45) !important;
  color: #1e40af !important;
  box-shadow: 0 12px 40px rgba(30, 64, 175, 0.25) !important;
  transform: translateY(-2px) !important;
}

:deep(.p-menubar-root-list .p-menuitem-icon) {
  margin-right: 0.875rem !important;
  font-size: 1.25rem !important;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15)) !important;
  min-width: 20px !important;
}

/* Styles pour le sous-menu avec design glassmorphism premium - Force override */
:deep(.p-menubar .p-submenu-list) {
  backdrop-filter: blur(32px) !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%) !important;
  border: 2px solid rgba(255, 255, 255, 0.6) !important;
  border-radius: 1.5rem !important;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.25),
    0 16px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  padding: 1.25rem !important;
  min-width: 280px !important;
  margin-top: 1rem !important;
  position: relative !important;
  overflow: hidden !important;
  animation: slideInSubmenu 0.3s ease-out !important;
  z-index: 9999 !important;
}

:deep(.p-menubar .p-submenu-list::before) {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%) !important;
  pointer-events: none !important;
  z-index: 1 !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem) {
  margin: 0.5rem 0 !important;
  position: relative !important;
  z-index: 2 !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem .p-menuitem-link) {
  border-radius: 1rem !important;
  margin: 0 !important;
  padding: 1.125rem 1.75rem !important;
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(8px) !important;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-height: 52px !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
  display: flex !important;
  align-items: center !important;
  position: relative !important;
  overflow: hidden !important;
  color: #374151 !important;
  text-decoration: none !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem .p-menuitem-link::before) {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent) !important;
  transition: left 0.6s ease !important;
  z-index: 1 !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem .p-menuitem-link:hover::before) {
  left: 100% !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem .p-menuitem-link:hover) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%) !important;
  border-color: rgba(59, 130, 246, 0.6) !important;
  transform: translateX(8px) scale(1.02) !important;
  box-shadow:
    0 12px 32px rgba(59, 130, 246, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.15) !important;
  color: #1e40af !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem .p-menuitem-link .p-menuitem-icon) {
  margin-right: 1rem !important;
  font-size: 1.125rem !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)) !important;
  transition: all 0.3s ease !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem .p-menuitem-link:hover .p-menuitem-icon) {
  transform: scale(1.1) !important;
  color: #3b82f6 !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem-separator) {
  margin: 0.75rem 0 !important;
  height: 1px !important;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.15), transparent) !important;
  border-radius: 1px !important;
  position: relative !important;
}

:deep(.p-menubar .p-submenu-list .p-menuitem-separator::after) {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 4px !important;
  height: 4px !important;
  background: rgba(59, 130, 246, 0.4) !important;
  border-radius: 50% !important;
}

/* Mode sombre amélioré */
:deep(.dark .p-menubar-root-list .p-menuitem-link) {
  background: rgba(31, 41, 55, 0.4) !important;
  border-color: rgba(107, 114, 128, 0.3) !important;
  color: #e5e7eb !important;
}

:deep(.dark .p-menubar-root-list .p-menuitem-link:hover) {
  background: rgba(31, 41, 55, 0.6) !important;
  border-color: rgba(107, 114, 128, 0.5) !important;
  color: #3b82f6 !important;
}

:deep(.dark .p-menubar .p-submenu-list) {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%) !important;
  border-color: rgba(107, 114, 128, 0.5) !important;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.4),
    0 16px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(107, 114, 128, 0.3) !important;
}

:deep(.dark .p-menubar .p-submenu-list::before) {
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%) !important;
}

:deep(.dark .p-menubar .p-submenu-list .p-menuitem .p-menuitem-link) {
  background: rgba(55, 65, 81, 0.4) !important;
  border-color: rgba(107, 114, 128, 0.5) !important;
  color: #d1d5db !important;
}

:deep(.dark .p-menubar .p-submenu-list .p-menuitem .p-menuitem-link:hover) {
  background: linear-gradient(135deg, rgba(55, 65, 81, 0.8) 0%, rgba(31, 41, 55, 0.7) 100%) !important;
  border-color: rgba(59, 130, 246, 0.6) !important;
  color: #60a5fa !important;
  box-shadow:
    0 12px 32px rgba(59, 130, 246, 0.25),
    0 4px 16px rgba(0, 0, 0, 0.4) !important;
}

:deep(.dark .p-menubar .p-submenu-list .p-menuitem .p-menuitem-link:hover .p-menuitem-icon) {
  color: #60a5fa !important;
}

:deep(.dark .p-menubar .p-submenu-list .p-menuitem-separator) {
  background: linear-gradient(90deg, transparent, rgba(107, 114, 128, 0.3), transparent) !important;
}

:deep(.dark .p-menubar .p-submenu-list .p-menuitem-separator::after) {
  background: rgba(59, 130, 246, 0.6) !important;
}

/* Responsive Design Avancé */

/* Tablettes (768px - 1024px) */
@media (max-width: 1024px) {
  :deep(.p-menubar-root-list) {
    gap: 1rem !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-link) {
    padding: 0.875rem 1.5rem !important;
    font-size: 0.95rem !important;
    min-height: 48px !important;
    min-width: 100px !important;
  }

  :deep(.p-submenu-list) {
    min-width: 260px !important;
    padding: 1rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-link) {
    padding: 1rem 1.5rem !important;
    min-height: 48px !important;
    font-size: 0.95rem !important;
  }
}

/* Tablettes portrait (768px) */
@media (max-width: 768px) {
  :deep(.p-menubar) {
    min-height: 64px !important;
  }

  :deep(.p-menubar-root-list) {
    gap: 0.75rem !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-link) {
    padding: 0.75rem 1.25rem !important;
    font-size: 0.9rem !important;
    min-height: 44px !important;
    min-width: 90px !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-icon) {
    margin-right: 0.75rem !important;
    font-size: 1.125rem !important;
  }

  :deep(.p-submenu-list) {
    min-width: 240px !important;
    padding: 1rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-link) {
    padding: 1rem 1.375rem !important;
    min-height: 46px !important;
    font-size: 0.9rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-icon) {
    margin-right: 0.875rem !important;
    font-size: 1rem !important;
  }
}

/* Mobile large (640px) */
@media (max-width: 640px) {
  :deep(.p-menubar-root-list) {
    gap: 0.5rem !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-link) {
    padding: 0.625rem 1rem !important;
    font-size: 0.875rem !important;
    min-height: 40px !important;
    min-width: 80px !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-text) {
    font-size: 0.875rem !important;
  }
}

/* Mobile standard (480px) */
@media (max-width: 480px) {
  /* Masquer le texte du logo sur mobile */
  .pi-bolt + span {
    display: none !important;
  }

  :deep(.p-menubar) {
    min-height: 60px !important;
  }

  :deep(.p-menubar-root-list) {
    gap: 0.375rem !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-link) {
    padding: 0.625rem 0.875rem !important;
    font-size: 0.8rem !important;
    min-height: 40px !important;
    min-width: 70px !important;
    border-radius: 0.75rem !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-icon) {
    margin-right: 0.5rem !important;
    font-size: 1rem !important;
  }

  :deep(.p-submenu-list) {
    min-width: 220px !important;
    padding: 0.875rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-link) {
    padding: 0.875rem 1.125rem !important;
    min-height: 42px !important;
    font-size: 0.875rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-icon) {
    margin-right: 0.75rem !important;
    font-size: 1rem !important;
  }
}

/* Mobile petit (375px) */
@media (max-width: 375px) {
  :deep(.p-menubar-root-list .p-menuitem-link) {
    padding: 0.375rem !important;
    font-size: 0.75rem !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-text) {
    display: none !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-icon) {
    margin-right: 0 !important;
    font-size: 1.1rem !important;
  }

  :deep(.p-submenu-list) {
    min-width: 180px !important;
    padding: 0.75rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-link) {
    padding: 0.75rem 1rem !important;
    min-height: 38px !important;
    font-size: 0.8rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-icon) {
    margin-right: 0.5rem !important;
    font-size: 0.9rem !important;
  }
}

/* Support pour les écrans très larges */
@media (min-width: 1440px) {
  :deep(.p-menubar-root-list) {
    gap: 2rem !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-link) {
    padding: 1.125rem 2rem !important;
    font-size: 1.075rem !important;
    min-height: 56px !important;
    min-width: 140px !important;
  }

  :deep(.p-menubar-root-list .p-menuitem-icon) {
    margin-right: 1rem !important;
    font-size: 1.375rem !important;
  }

  :deep(.p-submenu-list) {
    min-width: 320px !important;
    padding: 1.5rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-link) {
    padding: 1.25rem 2rem !important;
    min-height: 56px !important;
    font-size: 1.05rem !important;
  }

  :deep(.p-submenu-list .p-menuitem-icon) {
    margin-right: 1.125rem !important;
    font-size: 1.25rem !important;
  }
}

/* Animations - CSS requis pour :deep() et keyframes */
:deep(.p-menubar) {
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInSubmenu {
  from {
    opacity: 0;
    transform: translateY(-15px) scale(0.95);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* Animation du dégradé pour le bouton inscription - Seul CSS nécessaire */
@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient-x {
  background-size: 200% 200% !important;
  animation: gradient-x 3s ease infinite !important;
}
</style>
