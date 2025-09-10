# Configuration Google OAuth pour Synkro

## 1. Cr�er un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cr�er un nouveau projet ou s�lectionner un projet existant
3. Activer l'API Google+ dans la biblioth�que d'API

## 2. Configurer OAuth 2.0

1. Aller dans "APIs & Services" > "Credentials"
2. Cliquer sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choisir "Web application"
4. Configurer les URI autoris�es :
   - **Origins autoris�es** : `http://localhost:5173`, `http://localhost:3000`
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

1. Red�marrer le serveur de d�veloppement
2. Aller sur la page de connexion
3. Cliquer sur le bouton "Google"
4. Autoriser l'application dans la popup Google

## 5. Int�gration avec le backend

Pour int�grer avec votre backend Symfony, vous devrez :

1. **C�t� Frontend** : Envoyer le token Google � votre API
2. **C�t� Backend** : Valider le token avec Google et cr�er/connecter l'utilisateur

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

### Exemple c�t� Symfony :

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
            
            // Cr�er ou connecter l'utilisateur
            $user = $this->userRepository->findOneBy(['email' => $email]);
            if (!$user) {
                $user = new User();
                $user->setEmail($email);
                $user->setName($name);
                // Sauvegarder en BDD
            }
            
            // G�n�rer un JWT pour votre app
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

## S�curit�

- **Jamais** exposer le Client Secret c�t� frontend
- Toujours valider les tokens c�t� backend
- Utiliser HTTPS en production
- Configurer les domaines autoris�s dans Google Cloud Console

## D�pannage

### Erreur "Invalid client"
- V�rifier le Client ID dans le fichier `.env`
- V�rifier que l'origine est autoris�e dans Google Cloud Console

### Popup bloqu�e
- V�rifier les param�tres du navigateur
- Tester avec un autre navigateur

### Token invalide
- V�rifier que l'API Google+ est activ�e
- V�rifier la configuration OAuth dans Google Cloud Console
