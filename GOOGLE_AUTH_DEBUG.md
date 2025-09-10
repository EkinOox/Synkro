# Probl�me d'authentification Google - FedCM

## Probl�me
L'erreur "FedCM was disabled" indique que la nouvelle API Federated Credential Management de Google est d�sactiv�e dans le navigateur.

## Causes possibles
1. **Cookies tiers bloqu�s** : Les navigateurs modernes bloquent les cookies tiers par d�faut
2. **Param�tres de site** : FedCM peut �tre d�sactiv� dans les param�tres du navigateur
3. **Navigation priv�e** : Certaines fonctionnalit�s peuvent �tre limit�es en mode priv�

## Solutions pour l'utilisateur

### Chrome/Edge
1. Cliquez sur l'ic�ne de cadenas/info � gauche de l'URL
2. Allez dans "Param�tres du site"
3. Activez "Cookies tiers"
4. Ou permettez "Connexion par un tiers" pour ce site

### Firefox
1. Allez dans les param�tres (about:preferences)
2. Section "Vie priv�e et s�curit�"
3. Dans "Protection renforc�e contre le pistage", choisissez "Personnalis�e"
4. D�cochez "Cookies" ou ajoutez une exception pour votre site

### Alternative de d�veloppement
Le code inclut maintenant une m�thode de fallback qui simule une connexion Google pour les tests de d�veloppement.

## Configuration pour la production

### 1. Configuration Google Cloud Console
```
1. Aller sur https://console.cloud.google.com/
2. Cr�er/s�lectionner un projet
3. Activer l'API Google+ 
4. Cr�er des identifiants OAuth 2.0
5. Ajouter votre domaine aux origines autoris�es
```

### 2. Variables d'environnement
```bash
# Dans le fichier .env
VITE_GOOGLE_CLIENT_ID=votre-client-id-google
```

### 3. Domaines autoris�s
Ajouter dans Google Cloud Console :
- `http://localhost:3000` (d�veloppement)
- `https://votre-domaine.com` (production)

## Code d'impl�mentation

### M�thode principale (avec FedCM)
```typescript
window.google.accounts.id.initialize({
  client_id: 'votre-client-id',
  callback: handleCredentialResponse
})
```

### M�thode alternative (sans FedCM)
```typescript
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
window.location.href = authUrl
```

## Test en local
Pour tester l'authentification Google en local :
1. Servir l'application sur `https://` (utiliser ngrok ou similar)
2. Configurer le client ID Google avec l'URL HTTPS
3. Ou utiliser la m�thode de fallback incluse dans le code
