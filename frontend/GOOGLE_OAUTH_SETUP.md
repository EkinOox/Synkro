# Configuration Google OAuth pour Synkro

## 1. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API Google+ dans la bibliothèque d'API

## 2. Configurer OAuth 2.0

1. Aller dans "APIs & Services" > "Credentials"
2. Cliquer sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choisir "Web application"
4. Configurer les URI autorisées :
   - **Origins autorisées** : `http://localhost:5173`, `http://localhost:3000`
   - **URI de redirection** : `http://localhost:5173`, `http://localhost:3000`

## 3. Configurer l'environnement

Copier le Client ID obtenu dans le fichier `.env` :

```bash
# Configuration Google OAuth
VITE_GOOGLE_CLIENT_ID=votre-client-id-ici.googleusercontent.com

# Configuration de l'API
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## 4. Tester la connexion

1. Redémarrer le serveur de développement
2. Aller sur la page de connexion
3. Cliquer sur le bouton "Google"
4. Autoriser l'application dans la popup Google

## 5. Intégration avec le backend

Pour intégrer avec votre backend Symfony, vous devrez :

1. **Côté Frontend** : Envoyer le token Google à votre API
2. **Côté Backend** : Valider le token avec Google et créer/connecter l'utilisateur

### Exemple d'envoi au backend :

```typescript
const validateTokenWithBackend = async (token: string) => {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        access_token: token 
      }),
    })
    
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.error('Erreur de validation:', error)
  }
}
```

### Exemple côté Symfony :

```php
// src/Controller/AuthController.php
#[Route('/api/auth/google', methods: ['POST'])]
public function googleAuth(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    $accessToken = $data['access_token'];
    
    // Valider le token avec Google
    $client = new Google_Client();
    $client->setClientId($this->getParameter('google.client_id'));
    
    try {
        $payload = $client->verifyIdToken($accessToken);
        if ($payload) {
            $email = $payload['email'];
            $name = $payload['name'];
            
            // Créer ou connecter l'utilisateur
            $user = $this->userRepository->findOneBy(['email' => $email]);
            if (!$user) {
                $user = new User();
                $user->setEmail($email);
                $user->setName($name);
                // Sauvegarder en BDD
            }
            
            // Générer un JWT pour votre app
            $token = $this->jwtManager->create($user);
            
            return new JsonResponse([
                'token' => $token,
                'user' => [
                    'email' => $user->getEmail(),
                    'name' => $user->getName()
                ]
            ]);
        }
    } catch (Exception $e) {
        return new JsonResponse(['error' => 'Token invalide'], 400);
    }
}
```

## Sécurité

- **Jamais** exposer le Client Secret côté frontend
- Toujours valider les tokens côté backend
- Utiliser HTTPS en production
- Configurer les domaines autorisés dans Google Cloud Console

## Dépannage

### Erreur "Invalid client"
- Vérifier le Client ID dans le fichier `.env`
- Vérifier que l'origine est autorisée dans Google Cloud Console

### Popup bloquée
- Vérifier les paramètres du navigateur
- Tester avec un autre navigateur

### Token invalide
- Vérifier que l'API Google+ est activée
- Vérifier la configuration OAuth dans Google Cloud Console
