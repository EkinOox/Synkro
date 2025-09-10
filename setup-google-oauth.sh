#!/bin/bash

# Script d'aide pour configurer Google OAuth

echo "?? Configuration Google OAuth pour Synkro"
echo "========================================="
echo ""
echo "Projet Google Cloud: adroit-lock-471613-a7"
echo ""

# Vérifier si gcloud est installé
if ! command -v gcloud &> /dev/null; then
    echo "??  Google Cloud CLI n'est pas installé."
    echo "   Installer depuis: https://cloud.google.com/sdk/docs/install"
    echo ""
    echo "?? Suivre les instructions manuelles dans GOOGLE_OAUTH_SETUP.md"
    exit 1
fi

echo "? Google Cloud CLI détecté"

# Se connecter au projet
echo ""
echo "?? Connexion au projet adroit-lock-471613-a7..."
gcloud config set project adroit-lock-471613-a7

# Vérifier le projet actuel
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
echo "?? Projet actuel: $CURRENT_PROJECT"

if [ "$CURRENT_PROJECT" != "adroit-lock-471613-a7" ]; then
    echo "? Erreur: Impossible de se connecter au projet"
    echo "   Vérifier que vous avez accès au projet adroit-lock-471613-a7"
    exit 1
fi

echo ""
echo "?? Prochaines étapes à faire manuellement :"
echo "1. Aller sur https://console.cloud.google.com/apis/credentials?project=adroit-lock-471613-a7"
echo "2. Cliquer sur '+ CREATE CREDENTIALS' > 'OAuth 2.0 Client ID'"
echo "3. Configurer l'écran de consentement si demandé"
echo "4. Type d'application: 'Web application'"
echo "5. Ajouter ces origines JavaScript autorisées:"
echo "   - http://localhost:5173"
echo "   - http://localhost:3000" 
echo "6. Copier le Client ID généré"
echo "7. Modifier le fichier .env et décommenter/modifier:"
echo "   VITE_GOOGLE_CLIENT_ID=votre-client-id-ici"
echo ""
echo "?? Une fois configuré, lancer: npm run dev"
