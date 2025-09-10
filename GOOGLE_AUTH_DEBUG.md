# Problème d'authentification Google - FedCM

## Problème
L'erreur "FedCM was disabled" indique que la nouvelle API Federated Credential Management de Google est désactivée dans le navigateur.

## Causes possibles
1. **Cookies tiers bloqués** : Les navigateurs modernes bloquent les cookies tiers par défaut
2. **Paramètres de site** : FedCM peut être désactivé dans les paramètres du navigateur
3. **Navigation privée** : Certaines fonctionnalités peuvent être limitées en mode privé

## Solutions pour l'utilisateur

### Chrome/Edge
1. Cliquez sur l'icône de cadenas/info à gauche de l'URL
2. Allez dans "Paramètres du site"
3. Activez "Cookies tiers"
4. Ou permettez "Connexion par un tiers" pour ce site

### Firefox
1. Allez dans les paramètres (about:preferences)
2. Section "Vie privée et sécurité"
3. Dans "Protection renforcée contre le pistage", choisissez "Personnalisée"
4. Décochez "Cookies" ou ajoutez une exception pour votre site

### Alternative de développement
Le code inclut maintenant une méthode de fallback qui simule une connexion Google pour les tests de développement.

## Configuration pour la production

### 1. Configuration Google Cloud Console
```
1. Aller sur https://console.cloud.google.com/
2. Créer/sélectionner un projet
3. Activer l'API Google+ 
4. Créer des identifiants OAuth 2.0
5. Ajouter votre domaine aux origines autorisées
```

### 2. Variables d'environnement
```bash
# Dans le fichier .env
VITE_GOOGLE_CLIENT_ID=votre-client-id-google
```

### 3. Domaines autorisés
Ajouter dans Google Cloud Console :
- `http://localhost:3000` (développement)
- `https://votre-domaine.com` (production)

## Code d'implémentation

### Méthode principale (avec FedCM)
```typescript
window.google.accounts.id.initialize({
  client_id: 'votre-client-id',
  callback: handleCredentialResponse
})
```

### Méthode alternative (sans FedCM)
```typescript
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
window.location.href = authUrl
```

## Test en local
Pour tester l'authentification Google en local :
1. Servir l'application sur `https://` (utiliser ngrok ou similar)
2. Configurer le client ID Google avec l'URL HTTPS
3. Ou utiliser la méthode de fallback incluse dans le code
