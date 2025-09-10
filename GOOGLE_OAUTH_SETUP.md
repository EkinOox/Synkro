# Configuration Google OAuth pour le projet adroit-lock-471613-a7

## �tapes � suivre dans Google Cloud Console

### 1. Acc�der � la console
- Aller sur https://console.cloud.google.com/
- S�lectionner le projet `adroit-lock-471613-a7`

### 2. Activer les APIs n�cessaires
```bash
# APIs � activer :
- Google Identity Services API
- Google+ API (si n�cessaire)
```

### 3. Configurer l'�cran de consentement OAuth
- Aller dans "APIs & Services" > "OAuth consent screen"
- Choisir "External" pour les tests
- Remplir les champs obligatoires :
  - App name: "Synkro"
  - User support email: votre email
  - Developer contact: votre email

### 4. Cr�er les identifiants OAuth 2.0
- Aller dans "APIs & Services" > "Credentials"
- Cliquer sur "Create Credentials" > "OAuth 2.0 Client ID"
- Type d'application : "Web application"
- Nom : "Synkro Web Client"
- Origines JavaScript autoris�es :
  - http://localhost:5173
  - http://localhost:3000
  - https://votre-domaine-production.com (quand vous d�ployez)
- URI de redirection autoris�s :
  - http://localhost:5173
  - http://localhost:3000

### 5. R�cup�rer le Client ID
Une fois cr��, copier le "Client ID" qui ressemble � :
`123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`

### 6. Configuration dans l'application
Remplacer dans le fichier .env :
```dotenv
VITE_GOOGLE_CLIENT_ID=VOTRE_VRAI_CLIENT_ID_ICI
```

## Commandes pour tester
```bash
# D�marrer l'application
cd frontend
npm run dev

# L'application sera disponible sur http://localhost:5173
```

## Troubleshooting

### Si vous voyez "Error 400: redirect_uri_mismatch"
- V�rifier que l'URL exacte est dans les "URI de redirection autoris�s"
- L'URL doit �tre exactement http://localhost:5173 (sans slash final)

### Si vous voyez "This app isn't verified"
- Normal en d�veloppement
- Cliquer sur "Advanced" puis "Go to Synkro (unsafe)" pour continuer

### Si l'authentification ne fonctionne pas
- V�rifier que les APIs sont bien activ�es
- V�rifier que le domaine est dans les "Origines JavaScript autoris�es"
- Essayer en navigation priv�e pour �viter les cookies en conflit
