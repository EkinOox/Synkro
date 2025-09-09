<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Configuration du menu
const menuItems = ref([
  {
    label: 'Accueil',
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Rooms',
    icon: 'pi pi-users',
    items: [
      {
        label: 'CrÃ©er une Room',
        icon: 'pi pi-plus',
        command: () => console.log('CrÃ©er room')
      },
      {
        label: 'Mes Rooms',
        icon: 'pi pi-list',
        command: () => console.log('Mes rooms')
      },
      {
        separator: true
      },
      {
        label: 'Rejoindre',
        icon: 'pi pi-sign-in',
        command: () => console.log('Rejoindre')
      }
    ]
  },
  {
    label: 'Outils',
    icon: 'pi pi-cog',
    items: [
      {
        label: 'Ã‰diteur',
        icon: 'pi pi-file-edit'
      },
      {
        label: 'Whiteboard',
        icon: 'pi pi-palette'
      },
      {
        label: 'Chat',
        icon: 'pi pi-comments'
      }
    ]
  }
])

// Configuration terminÃ©e
</script>

<template>
  <div id="app">
    <header class="app-header">
      <Menubar :model="menuItems" class="custom-menubar">
        <template #start>
          <router-link to="/" class="logo-link">
            <i class="pi pi-bolt"></i>
            <span class="logo-text">Synkro</span>
          </router-link>
        </template>

        <template #end>
          <div class="header-actions">
            <Button
              icon="pi pi-bell"
              severity="secondary"
              text
              rounded
              v-tooltip="'Notifications'"
              class="notification-btn"
            />
            <Avatar
              icon="pi pi-user"
              class="user-avatar"
              shape="circle"
              v-tooltip="'Mon compte'"
            />
          </div>
        </template>
      </Menubar>
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid var(--surface-border);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* Logo personnalisÃ© */
.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.logo-link:hover {
  background: var(--primary-50);
  transform: scale(1.02);
}

.logo-link .pi {
  font-size: 1.75rem;
}

.logo-text {
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Actions de l'en-tÃªte */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-btn {
  position: relative;
}

.notification-btn::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
}

.user-avatar {
  background: linear-gradient(135deg, var(--primary-color), #10b981);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Contenu principal */
.main-content {
  flex: 1;
  width: 100%;
  min-height: 0;
  background: var(--surface-ground);
}

/* Styles personnalisÃ©s pour la Menubar */
:deep(.custom-menubar) {
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 0.75rem 1.5rem;
}

:deep(.p-menubar-root-list .p-menuitem-link) {
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

:deep(.p-menubar-root-list .p-menuitem-link:hover) {
  background: var(--primary-50);
  color: var(--primary-color);
}

:deep(.p-menubar-root-list .p-menuitem-active .p-menuitem-link) {
  background: var(--primary-100);
  color: var(--primary-color);
}

/* Responsive */
@media (max-width: 768px) {
  :deep(.custom-menubar) {
    padding: 0.5rem 1rem;
  }

  .logo-link {
    font-size: 1.25rem;
  }

  .logo-link .pi {
    font-size: 1.5rem;
  }

  .header-actions {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  :deep(.custom-menubar) {
    padding: 0.5rem 0.75rem;
  }

  .logo-text {
    display: none;
  }

  .header-actions .notification-btn {
    display: none;
  }
}
</style>
