# Configuration Google OAuth pour le projet adroit-lock-471613-a7

## Étapes à suivre dans Google Cloud Console

### 1. Accéder à la console
- Aller sur https://console.cloud.google.com/
- Sélectionner le projet `adroit-lock-471613-a7`

### 2. Activer les APIs nécessaires
```bash
# APIs à activer :
- Google Identity Services API
- Google+ API (si nécessaire)
```

### 3. Configurer l'écran de consentement OAuth
- Aller dans "APIs & Services" > "OAuth consent screen"
- Choisir "External" pour les tests
- Remplir les champs obligatoires :
  - App name: "Synkro"
  - User support email: votre email
  - Developer contact: votre email

### 4. Créer les identifiants OAuth 2.0
- Aller dans "APIs & Services" > "Credentials"
- Cliquer sur "Create Credentials" > "OAuth 2.0 Client ID"
- Type d'application : "Web application"
- Nom : "Synkro Web Client"
- Origines JavaScript autorisées :
  - http://localhost:5173
  - http://localhost:3000
  - https://votre-domaine-production.com (quand vous déployez)
- URI de redirection autorisés :
  - http://localhost:5173
  - http://localhost:3000

### 5. Récupérer le Client ID
Une fois créé, copier le "Client ID" qui ressemble à :
`123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`

### 6. Configuration dans l'application
Remplacer dans le fichier .env :
```dotenv
VITE_GOOGLE_CLIENT_ID=VOTRE_VRAI_CLIENT_ID_ICI
```

## Commandes pour tester
```bash
# Démarrer l'application
cd frontend
npm run dev

# L'application sera disponible sur http://localhost:5173
```

## Troubleshooting

### Si vous voyez "Error 400: redirect_uri_mismatch"
- Vérifier que l'URL exacte est dans les "URI de redirection autorisés"
- L'URL doit être exactement http://localhost:5173 (sans slash final)

### Si vous voyez "This app isn't verified"
- Normal en développement
- Cliquer sur "Advanced" puis "Go to Synkro (unsafe)" pour continuer

### Si l'authentification ne fonctionne pas
- Vérifier que les APIs sont bien activées
- Vérifier que le domaine est dans les "Origines JavaScript autorisées"
- Essayer en navigation privée pour éviter les cookies en conflit
