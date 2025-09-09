<template>
  <div class="home">
    <div class="hero-section">
      <h1 class="hero-title">
        <i class="pi pi-bolt text-primary"></i>
        Bienvenue sur Synkro
      </h1>
      <p class="hero-subtitle">
        Plateforme collaborative en temps réel pour équipes modernes
      </p>
      
      <div class="hero-actions">
        <Button 
          label="Créer une Room" 
          icon="pi pi-plus" 
          class="p-button-lg"
          v-ripple
        />
        <Button 
          label="Rejoindre une Room" 
          icon="pi pi-sign-in" 
          severity="secondary"
          outlined
          class="p-button-lg"
          v-ripple
        />
      </div>
    </div>

    <div class="features">
      <Card class="feature-card">
        <template #content>
          <div class="feature-content">
            <div class="feature-icon">
              <i class="pi pi-file-edit"></i>
            </div>
            <h3>Éditeur collaboratif</h3>
            <p>Écrivez ensemble en temps réel avec synchronisation instantanée</p>
            <div class="feature-tags">
              <Badge value="TipTap" severity="info" />
              <Badge value="Yjs" severity="success" />
            </div>
          </div>
        </template>
      </Card>

      <Card class="feature-card">
        <template #content>
          <div class="feature-content">
            <div class="feature-icon">
              <i class="pi pi-palette"></i>
            </div>
            <h3>Whiteboard interactif</h3>
            <p>Dessinez, brainstormez et visualisez vos idées ensemble</p>
            <div class="feature-tags">
              <Badge value="Excalidraw" severity="info" />
              <Badge value="Post-its" severity="warning" />
            </div>
          </div>
        </template>
      </Card>

      <Card class="feature-card">
        <template #content>
          <div class="feature-content">
            <div class="feature-icon">
              <i class="pi pi-comments"></i>
            </div>
            <h3>Chat & Visioconférence</h3>
            <p>Communiquez instantanément par chat ou vidéo</p>
            <div class="feature-tags">
              <Badge value="WebRTC" severity="info" />
              <Badge value="Temps réel" severity="success" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <i class="pi pi-users text-primary"></i>
          <h4>Collaboration</h4>
          <p>Illimitée</p>
        </div>
        <div class="stat-item">
          <i class="pi pi-cloud text-primary"></i>
          <h4>Synchronisation</h4>
          <p>Temps réel</p>
        </div>
        <div class="stat-item">
          <i class="pi pi-shield text-primary"></i>
          <h4>Sécurité</h4>
          <p>OAuth2</p>
        </div>
        <div class="stat-item">
          <i class="pi pi-mobile text-primary"></i>
          <h4>Responsive</h4>
          <p>Multi-device</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logique Vue 3 Composition API
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

/* Section héro */
.hero-section {
  text-align: center;
  padding: var(--spacing-xxl) 0;
  margin-bottom: var(--spacing-xxl);
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color), #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-title .pi {
  margin-right: var(--spacing-sm);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto var(--spacing-xxl) auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.text-primary {
  color: var(--primary-color) !important;
}

/* Cartes de fonctionnalités */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xxl);
}

.feature-card {
  transition: all 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

.feature-content {
  text-align: center;
  padding: var(--spacing-lg);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg) auto;
}

.feature-icon .pi {
  font-size: 2rem;
  color: white;
}

.feature-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
}

.feature-content p {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.feature-tags {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  flex-wrap: wrap;
}

/* Section statistiques */
.stats-section {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xxl);
  margin-top: var(--spacing-xxl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
}

.stat-item {
  text-align: center;
}

.stat-item .pi {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.stat-item h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.stat-item p {
  font-size: 1rem;
  color: var(--text-light);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }
  
  .home h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .home p {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .feature-card {
    padding: 1.25rem;
  }
  
  .feature-card h3 {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .home {
    padding: 0.75rem;
  }
  
  .home h1 {
    font-size: 1.75rem;
  }
  
  .features {
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .feature-card {
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
    max-width: 900px;
  }
}
</style>
