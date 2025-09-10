<template>
  <div class="compte-page min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-emerald-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mon Compte</h1>
        <p class="text-gray-600 dark:text-gray-300">Gérez vos informations personnelles et préférences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-6">
            <!-- Avatar et infos principales -->
            <div class="text-center mb-6">
              <Avatar
                :label="userInitials"
                class="!w-20 !h-20 !text-2xl !bg-gradient-to-r !from-emerald-600 !to-teal-600 !border-4 !border-white/50 mx-auto mb-4"
                shape="circle"
                size="xlarge"
              />
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ userInfo.pseudo || 'Utilisateur' }}</h2>
              <p class="text-gray-600 dark:text-gray-300 text-sm">{{ userInfo.email }}</p>
              <div class="mt-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                  <i class="pi pi-circle-fill text-emerald-500 mr-1 text-xs"></i>
                  Actif
                </span>
              </div>
            </div>

            <!-- Menu navigation -->
            <nav class="space-y-2">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                ]"
              >
                <i :class="[tab.icon, 'mr-3 text-lg']"></i>
                {{ tab.label }}
              </button>
            </nav>

            <!-- Bouton déconnexion -->
            <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <Button
                @click="handleLogout"
                severity="secondary"
                outlined
                class="w-full !py-3"
                icon="pi pi-sign-out"
                label="Déconnexion"
              />
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Profil -->
          <div v-if="activeTab === 'profile'" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">Informations personnelles</h3>
              <Button
                :severity="editMode ? 'success' : 'secondary'"
                :outlined="!editMode"
                :icon="editMode ? 'pi pi-check' : 'pi pi-pencil'"
                :label="editMode ? 'Sauvegarder' : 'Modifier'"
                @click="editMode ? saveProfile() : null"
              />
            </div>

            <form @submit.prevent="saveProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pseudo</label>
                  <InputText
                    v-model="profileForm.pseudo"
                    :disabled="!editMode"
                    class="w-full"
                    :class="{ 'p-invalid': profileErrors.pseudo }"
                  />
                  <small v-if="profileErrors.pseudo" class="p-error">{{ profileErrors.pseudo }}</small>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <InputText
                    v-model="profileForm.email"
                    :disabled="!editMode"
                    type="email"
                    class="w-full"
                    :class="{ 'p-invalid': profileErrors.email }"
                  />
                  <small v-if="profileErrors.email" class="p-error">{{ profileErrors.email }}</small>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prénom</label>
                  <InputText
                    v-model="profileForm.firstName"
                    :disabled="!editMode"
                    class="w-full"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                  <InputText
                    v-model="profileForm.lastName"
                    :disabled="!editMode"
                    class="w-full"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                <Textarea
                  v-model="profileForm.bio"
                  :disabled="!editMode"
                  class="w-full"
                  rows="4"
                  placeholder="Parlez-nous de vous..."
                />
              </div>
            </form>
          </div>

          <!-- Sécurité -->
          <div v-if="activeTab === 'security'" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8">
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Sécurité</h3>

            <div class="space-y-8">
              <!-- Changer mot de passe -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Changer le mot de passe</h4>
                <form @submit.prevent="changePassword" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mot de passe actuel</label>
                    <Password
                      v-model="passwordForm.current"
                      class="w-full"
                      :feedback="false"
                      toggleMask
                      :class="{ 'p-invalid': passwordErrors.current }"
                    />
                    <small v-if="passwordErrors.current" class="p-error">{{ passwordErrors.current }}</small>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
                    <Password
                      v-model="passwordForm.new"
                      class="w-full"
                      toggleMask
                      :class="{ 'p-invalid': passwordErrors.new }"
                    />
                    <small v-if="passwordErrors.new" class="p-error">{{ passwordErrors.new }}</small>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmer le nouveau mot de passe</label>
                    <Password
                      v-model="passwordForm.confirm"
                      class="w-full"
                      :feedback="false"
                      toggleMask
                      :class="{ 'p-invalid': passwordErrors.confirm }"
                    />
                    <small v-if="passwordErrors.confirm" class="p-error">{{ passwordErrors.confirm }}</small>
                  </div>

                  <Button
                    type="submit"
                    :loading="passwordLoading"
                    label="Changer le mot de passe"
                    icon="pi pi-lock"
                    class="!py-3"
                  />
                </form>
              </div>

              <!-- Sessions actives -->
              <div class="pt-6 border-t border-gray-200 dark:border-gray-600">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Sessions actives</h4>
                <div class="space-y-3">
                  <div v-for="session in activeSessions" :key="session.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div class="flex items-center">
                      <i :class="session.deviceIcon" class="text-xl text-gray-500 dark:text-gray-400 mr-3"></i>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ session.device }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ session.location }} • {{ session.lastActive }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span v-if="session.current" class="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 text-xs rounded-full">Actuelle</span>
                      <Button
                        v-else
                        @click="revokeSession(session.id)"
                        severity="danger"
                        text
                        size="small"
                        icon="pi pi-times"
                        v-tooltip="'Révoquer cette session'"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Préférences -->
          <div v-if="activeTab === 'preferences'" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8">
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Préférences</h3>

            <div class="space-y-6">
              <div>
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h4>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-900 dark:text-white">Notifications email</label>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Recevoir des notifications par email</p>
                    </div>
                    <ToggleButton v-model="preferences.emailNotifications" />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-900 dark:text-white">Notifications collaborations</label>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Notifications lors de nouvelles collaborations</p>
                    </div>
                    <ToggleButton v-model="preferences.collaborationNotifications" />
                  </div>
                </div>
              </div>

              <div class="pt-6 border-t border-gray-200 dark:border-gray-600">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Interface</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Langue</label>
                    <Dropdown
                      v-model="preferences.language"
                      :options="languages"
                      optionLabel="name"
                      optionValue="code"
                      class="w-full md:w-48"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fuseau horaire</label>
                    <Dropdown
                      v-model="preferences.timezone"
                      :options="timezones"
                      optionLabel="name"
                      optionValue="value"
                      class="w-full"
                    />
                  </div>
                </div>
              </div>

              <div class="pt-6">
                <Button
                  @click="savePreferences"
                  :loading="preferencesLoading"
                  label="Sauvegarder les préférences"
                  icon="pi pi-save"
                  class="!py-3"
                />
              </div>
            </div>
          </div>

          <!-- Statistiques -->
          <div v-if="activeTab === 'stats'" class="space-y-6">
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8">
              <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Statistiques d'utilisation</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="pi pi-palette text-white text-xl"></i>
                  </div>
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.totalWhiteboards }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Tableaux créés</div>
                </div>

                <div class="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl">
                  <div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="pi pi-users text-white text-xl"></i>
                  </div>
                  <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ stats.totalCollaborations }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Collaborations</div>
                </div>

                <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl">
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="pi pi-clock text-white text-xl"></i>
                  </div>
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.totalHours }}h</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Temps passé</div>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white">Activité récente</h4>
                <div class="space-y-3">
                  <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      <i :class="activity.icon" class="text-sm text-gray-600 dark:text-gray-400"></i>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ activity.action }}</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400">{{ activity.timestamp }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import router from '../router'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import ToggleButton from 'primevue/togglebutton'

const toast = useToast()
const activeTab = ref('profile')
const editMode = ref(false)
const passwordLoading = ref(false)
const preferencesLoading = ref(false)

// Données utilisateur
const userInfo = reactive({
  pseudo: localStorage.getItem('user_pseudo') || '',
  email: localStorage.getItem('user_email') || '',
  firstName: '',
  lastName: '',
  bio: ''
})

const userInitials = computed(() => {
  if (userInfo.firstName && userInfo.lastName) {
    return (userInfo.firstName[0] + userInfo.lastName[0]).toUpperCase()
  }
  return userInfo.pseudo ? userInfo.pseudo.substring(0, 2).toUpperCase() : 'U'
})

// Formulaires
const profileForm = reactive({
  pseudo: userInfo.pseudo,
  email: userInfo.email,
  firstName: userInfo.firstName,
  lastName: userInfo.lastName,
  bio: userInfo.bio
})

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

const preferences = reactive({
  emailNotifications: true,
  collaborationNotifications: true,
  language: 'fr',
  timezone: 'Europe/Paris'
})

// Erreurs
const profileErrors = reactive({
  pseudo: '',
  email: ''
})

const passwordErrors = reactive({
  current: '',
  new: '',
  confirm: ''
})

// Configuration des onglets
const tabs = [
  { id: 'profile', label: 'Profil', icon: 'pi pi-user' },
  { id: 'security', label: 'Sécurité', icon: 'pi pi-shield' },
  { id: 'preferences', label: 'Préférences', icon: 'pi pi-cog' },
  { id: 'stats', label: 'Statistiques', icon: 'pi pi-chart-bar' }
]

// Options
const languages = [
  { name: 'Français', code: 'fr' },
  { name: 'English', code: 'en' },
  { name: 'Español', code: 'es' }
]

const timezones = [
  { name: 'Europe/Paris', value: 'Europe/Paris' },
  { name: 'America/New_York', value: 'America/New_York' },
  { name: 'Asia/Tokyo', value: 'Asia/Tokyo' }
]

// Données de démonstration
const activeSessions = ref([
  {
    id: 1,
    device: 'Chrome sur MacBook Pro',
    location: 'Paris, France',
    lastActive: 'Maintenant',
    current: true,
    deviceIcon: 'pi pi-desktop'
  },
  {
    id: 2,
    device: 'Safari sur iPhone',
    location: 'Paris, France',
    lastActive: 'Il y a 2 heures',
    current: false,
    deviceIcon: 'pi pi-mobile'
  }
])

const stats = reactive({
  totalWhiteboards: 12,
  totalCollaborations: 24,
  totalHours: 48
})

const recentActivity = ref([
  {
    id: 1,
    action: 'Nouveau tableau blanc créé',
    timestamp: 'Il y a 2 heures',
    icon: 'pi pi-plus'
  },
  {
    id: 2,
    action: 'Collaboration avec @user123',
    timestamp: 'Hier',
    icon: 'pi pi-users'
  },
  {
    id: 3,
    action: 'Profil mis à jour',
    timestamp: 'Il y a 3 jours',
    icon: 'pi pi-user-edit'
  }
])

// Méthodes
const saveProfile = async () => {
  if (!editMode.value) {
    editMode.value = true
    return
  }

  // Reset erreurs
  Object.keys(profileErrors).forEach(key => {
    profileErrors[key as keyof typeof profileErrors] = ''
  })

  // Validation
  let hasErrors = false
  if (!profileForm.pseudo.trim()) {
    profileErrors.pseudo = 'Le pseudo est requis'
    hasErrors = true
  }
  if (!profileForm.email.trim()) {
    profileErrors.email = 'L\'email est requis'
    hasErrors = true
  }

  if (hasErrors) return

  try {
    // Simulation API - remplacer par vraie requête
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mise à jour locale
    Object.assign(userInfo, profileForm)
    localStorage.setItem('user_pseudo', profileForm.pseudo)
    localStorage.setItem('user_email', profileForm.email)

    editMode.value = false
    toast.add({
      severity: 'success',
      summary: 'Profil mis à jour',
      detail: 'Vos informations ont été sauvegardées',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de sauvegarder le profil',
      life: 5000
    })
  }
}

const changePassword = async () => {
  // Reset erreurs
  Object.keys(passwordErrors).forEach(key => {
    passwordErrors[key as keyof typeof passwordErrors] = ''
  })

  // Validation
  let hasErrors = false
  if (!passwordForm.current) {
    passwordErrors.current = 'Mot de passe actuel requis'
    hasErrors = true
  }
  if (!passwordForm.new) {
    passwordErrors.new = 'Nouveau mot de passe requis'
    hasErrors = true
  } else if (passwordForm.new.length < 6) {
    passwordErrors.new = 'Minimum 6 caractères'
    hasErrors = true
  }
  if (passwordForm.new !== passwordForm.confirm) {
    passwordErrors.confirm = 'Les mots de passe ne correspondent pas'
    hasErrors = true
  }

  if (hasErrors) return

  passwordLoading.value = true

  try {
    // Simulation API
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Reset formulaire
    Object.keys(passwordForm).forEach(key => {
      passwordForm[key as keyof typeof passwordForm] = ''
    })

    toast.add({
      severity: 'success',
      summary: 'Mot de passe changé',
      detail: 'Votre mot de passe a été mis à jour',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de changer le mot de passe',
      life: 5000
    })
  } finally {
    passwordLoading.value = false
  }
}

const savePreferences = async () => {
  preferencesLoading.value = true

  try {
    // Simulation API
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      severity: 'success',
      summary: 'Préférences sauvegardées',
      detail: 'Vos préférences ont été mises à jour',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de sauvegarder les préférences',
      life: 5000
    })
  } finally {
    preferencesLoading.value = false
  }
}

const revokeSession = async (sessionId: number) => {
  try {
    // Simulation API
    await new Promise(resolve => setTimeout(resolve, 500))

    activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId)

    toast.add({
      severity: 'success',
      summary: 'Session révoquée',
      detail: 'La session a été fermée',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de révoquer la session',
      life: 5000
    })
  }
}

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_pseudo')
  localStorage.removeItem('user_email')

  toast.add({
    severity: 'info',
    summary: 'Déconnexion',
    detail: 'À bientôt !',
    life: 2000
  })

  setTimeout(() => router.push('/'), 800)
}

onMounted(() => {
  // Charger les données utilisateur depuis l'API si nécessaire
})
</script>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
