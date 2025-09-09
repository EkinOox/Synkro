<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 relative overflow-hidden">
    <!-- Background glassmorphism elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-3/4 w-72 h-72 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 relative z-10">
      <div class="text-center py-20 sm:py-24 lg:py-32 mb-20 sm:mb-24 lg:mb-32 relative">
      <div class="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 rounded-3xl p-8 lg:p-12 shadow-2xl border-2 border-white/40 dark:border-gray-700/50">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 lg:mb-12 bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent flex items-center justify-center flex-wrap gap-4 leading-8">
          <i class="pi pi-bolt text-blue-600 dark:text-blue-400 text-4xl sm:text-5xl drop-shadow-2xl"></i>
          Bienvenue sur Synkro
        </h1>
        <p class="text-xl sm:text-2xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto mb-16 sm:mb-20 lg:mb-24 leading-relaxed px-4 drop-shadow-lg font-medium">
          Plateforme collaborative en temps réel pour équipes modernes
        </p>

        <div class="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center items-center max-w-2xl mx-auto">
          <Button
            label="Créer une Room"
            icon="pi pi-plus mr-3"
            size="large"
            severity="primary"
            raised
            class="w-full sm:w-auto !px-10 !py-5 !text-xl !font-bold !shadow-2xl hover:!shadow-3xl !bg-gradient-to-r !from-blue-600 !to-emerald-600 hover:!from-blue-700 hover:!to-emerald-700 !border-0 !backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
            pt:root="border-radius: 2rem;"
            v-ripple
          />
          <Button
            label="Rejoindre une Room"
            icon="pi pi-sign-in mr-3"
            severity="secondary"
            outlined
            size="large"
            class="w-full sm:w-auto !px-10 !py-5 !text-xl !font-bold !shadow-2xl hover:!shadow-3xl !backdrop-blur-lg !bg-white/20 dark:!bg-gray-800/40 hover:!bg-white/30 dark:hover:!bg-gray-700/50 !border-2 !border-white/40 dark:!border-gray-600/50 hover:!border-white/60 dark:hover:!border-gray-500/60 !text-gray-800 dark:!text-gray-100 transform hover:scale-105 transition-all duration-300 rounded-md"
            pt:root="border-radius: 2rem;"
            v-ripple
          />
        </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-20 sm:mb-24 lg:mb-32 px-4 relative">
      <Card class="transition-all duration-500 ease-in-out transform hover:-translate-y-3 hover:shadow-3xl h-full" pt:root="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-white/30 dark:border-gray-700/40 shadow-2xl">
        <template #content>
          <div class="text-center p-8 lg:p-10 relative">
            <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center mx-auto mb-8 lg:mb-10 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm border-2 border-white/30 ring-4 ring-white/10">
              <i class="pi pi-file-edit text-white text-2xl lg:text-3xl drop-shadow-2xl"></i>
            </div>
            <h3 class="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 drop-shadow-lg">Éditeur collaboratif</h3>
            <p class="text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-8 lg:mb-10 drop-shadow-sm font-medium">Écrivez ensemble en temps réel avec synchronisation instantanée</p>
            <div class="flex gap-3 justify-center flex-wrap">
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-code mr-2 text-xs drop-shadow-sm"></i>
                TipTap
              </div>
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-sync mr-2 text-xs drop-shadow-sm"></i>
                Yjs
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="transition-all duration-500 ease-in-out transform hover:-translate-y-3 hover:shadow-3xl h-full" pt:root="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-white/30 dark:border-gray-700/40 shadow-2xl">
        <template #content>
          <div class="text-center p-8 lg:p-10 relative">
            <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-8 lg:mb-10 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm border-2 border-white/30 ring-4 ring-white/10">
              <i class="pi pi-palette text-white text-2xl lg:text-3xl drop-shadow-2xl"></i>
            </div>
            <h3 class="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 drop-shadow-lg">Whiteboard interactif</h3>
            <p class="text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-8 lg:mb-10 drop-shadow-sm font-medium">Dessinez, brainstormez et visualisez vos idées ensemble</p>
            <div class="flex gap-3 justify-center flex-wrap">
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-pencil mr-2 text-xs drop-shadow-sm"></i>
                Excalidraw
              </div>
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-bookmark mr-2 text-xs drop-shadow-sm"></i>
                Post-its
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="transition-all duration-500 ease-in-out transform hover:-translate-y-3 hover:shadow-3xl h-full md:col-span-2 lg:col-span-1" pt:root="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-white/30 dark:border-gray-700/40 shadow-2xl">
        <template #content>
          <div class="text-center p-8 lg:p-10 relative">
            <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center mx-auto mb-8 lg:mb-10 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm border-2 border-white/30 ring-4 ring-white/10">
              <i class="pi pi-comments text-white text-2xl lg:text-3xl drop-shadow-2xl"></i>
            </div>
            <h3 class="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 drop-shadow-lg">Chat & Visioconférence</h3>
            <p class="text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-8 lg:mb-10 drop-shadow-sm font-medium">Communiquez instantanément par chat ou vidéo</p>
            <div class="flex gap-3 justify-center flex-wrap">
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-video mr-2 text-xs drop-shadow-sm"></i>
                WebRTC
              </div>
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-bolt mr-2 text-xs drop-shadow-sm"></i>
                Temps réel
              </div>
            </div>
          </div>
        </template>
      </Card>
      </div>

      <Card class="mx-4 lg:mx-8 relative" pt:root="backdrop-blur-xl bg-gradient-to-br from-white/30 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/30 border border-white/30 dark:border-gray-700/40 shadow-3xl">
      <template #content>
        <div class="p-10 lg:p-16 relative">
          <!-- Background glass effect -->
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-700/20 rounded-2xl"></div>

          <div class="text-center mb-12 relative z-10">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-lg">Pourquoi choisir Synkro ?</h2>
            <p class="text-xl text-gray-700 dark:text-gray-300 drop-shadow-sm">Des fonctionnalités pensées pour la collaboration moderne</p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            <div class="text-center group">
              <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110 backdrop-blur-sm border border-white/30">
                <i class="pi pi-users text-white text-2xl lg:text-3xl drop-shadow-lg"></i>
              </div>
              <h4 class="text-xl lg:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 drop-shadow-sm">Collaboration</h4>
              <div class="inline-flex items-center px-5 py-3 rounded-full text-base font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-infinity mr-2 drop-shadow-sm"></i>
                Illimitée
              </div>
            </div>

            <div class="text-center group">
              <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110 backdrop-blur-sm border border-white/30">
                <i class="pi pi-cloud text-white text-2xl lg:text-3xl drop-shadow-lg"></i>
              </div>
              <h4 class="text-xl lg:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 drop-shadow-sm">Synchronisation</h4>
              <div class="inline-flex items-center px-5 py-3 rounded-full text-base font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-clock mr-2 drop-shadow-sm"></i>
                Temps réel
              </div>
            </div>

            <div class="text-center group">
              <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110 backdrop-blur-sm border border-white/30">
                <i class="pi pi-shield text-white text-2xl lg:text-3xl drop-shadow-lg"></i>
              </div>
              <h4 class="text-xl lg:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 drop-shadow-sm">Sécurité</h4>
              <div class="inline-flex items-center px-5 py-3 rounded-full text-base font-bold bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-lock mr-2 drop-shadow-sm"></i>
                OAuth2
              </div>
            </div>

            <div class="text-center group">
              <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110 backdrop-blur-sm border border-white/30">
                <i class="pi pi-mobile text-white text-2xl lg:text-3xl drop-shadow-lg"></i>
              </div>
              <h4 class="text-xl lg:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 drop-shadow-sm">Responsive</h4>
              <div class="inline-flex items-center px-5 py-3 rounded-full text-base font-bold bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                <i class="pi pi-desktop mr-2 drop-shadow-sm"></i>
                Multi-device
              </div>
            </div>
          </div>
        </div>
      </template>
      </Card>
    </div>
  </div>
</template>
