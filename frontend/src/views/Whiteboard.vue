<template>
  <div class="whiteboard-page">
    <WhiteBoard />
  </div>
</template>

<script setup lang="ts">
import WhiteBoard from '../components/WhiteBoard.vue'

// Configuration pour la page whiteboard
document.title = 'Synkro Whiteboard - Tableau Blanc Collaboratif'
</script>

<style scoped>
.whiteboard-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Assurer que le composant prend toute la place */
:deep(.whiteboard-container) {
  width: 100%;
  height: 100vh;
}

/* Scrollbar personnalisée pour les panneaux */
:deep(.collaboration-panel::-webkit-scrollbar),
:deep(.advanced-tools::-webkit-scrollbar) {
  width: 6px;
}

:deep(.collaboration-panel::-webkit-scrollbar-track),
:deep(.advanced-tools::-webkit-scrollbar-track) {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

:deep(.collaboration-panel::-webkit-scrollbar-thumb),
:deep(.advanced-tools::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

:deep(.collaboration-panel::-webkit-scrollbar-thumb:hover),
:deep(.advanced-tools::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 0, 0, 0.5);
}
</style>
