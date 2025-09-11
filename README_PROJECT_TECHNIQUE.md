# ?? Synkro � Plateforme Collaborative en Temps R�el
_Documentation technique compl�te du projet d�velopp� avec GitHub Copilot_

Synkro est une **plateforme collaborative avanc�e** qui combine **�dition de texte collaborative, whiteboard partag�, syst�me de commentaires et visioconf�rence**. Ce projet met l'accent sur la **collaboration temps r�el**, l'**exp�rience utilisateur moderne** avec un design **glassmorphism** et l'architecture **microservices**.

---

## ??? Architecture Technique Compl�te

### Stack Technologique
- **Frontend** : Vue 3 (Composition API) + TypeScript + TailwindCSS + PrimeVue
- **Backend API** : Symfony 7 + API Platform + Doctrine ORM  
- **Collaboration Server** : Node.js + Yjs + WebSocket  
- **Base de donn�es** : PostgreSQL 16
- **Containerisation** : Docker + Docker Compose  
- **Collaboration** : Yjs (CRDT) + WebSocket Provider

### Architecture Microservices

```mermaid
graph TB
    subgraph "Frontend (Vue 3 + TypeScript)"
        A1[Vue 3 Composition API]
        A2[TipTap Editor + Yjs]
        A3[Canvas Whiteboard]
        A4[Comment System]
        A5[WebRTC Video Chat]
        A6[Glassmorphism UI]
    end

    subgraph "Backend API (Symfony)"
        B1[Authentication JWT + Google OAuth]
        B2[Room Management API]
        B3[User Management]
        B4[Document Storage]
        B5[API Platform REST/GraphQL]
    end

    subgraph "Collaboration Server (Node.js)"
        C1[Yjs WebSocket Server]
        C2[Whiteboard WebSocket]
        C3[Awareness Management]
        C4[Real-time Sync Engine]
    end

    subgraph "Database Layer"
        D1[PostgreSQL 16]
        D2[User Data]
        D3[Room Configurations]
        D4[Document Snapshots]
    end

    A1 --> B5
    A2 --> C1
    A3 --> C2
    A4 --> C1
    A5 --> C2
    B5 --> D1
    C1 --> D1
    C2 --> D1
```

---

## ?? �volution du Projet : It�rations Techniques

### Phase 1 : Correction d'Encodage et Harmonisation Design
**Probl�me identifi�** : Caract�res corrompus (�) dans les composants Vue
**Solution technique** :
- **Diagnostic** : Corruption UTF-8 dans les fichiers Vue
- **R�solution** : R��criture compl�te des composants avec encodage UTF-8 strict
- **Harmonisation** : Impl�mentation d'un syst�me de design glassmorphism coh�rent

**Composants concern�s** :
- `WhiteboardCanvas.vue` - Correction encodage + design glassmorphism
- `RoomCall.vue` - R��criture compl�te avec WebRTC
- `TipTapEditor.vue` - Refonte avec ic�nes SVG personnalis�es
- `CommentBoard.vue` - Nouveau design modal glassmorphism
- `RoomChat.vue` - Interface chat temps r�el

### Phase 2 : Syst�me de Design Glassmorphism
**Impl�mentation CSS avanc�e** :
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.btn-glass-primary {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Classes de design cr��es** :
- `.glass-panel` - Panneaux principaux avec effet verre
- `.btn-glass-*` - Boutons avec variants (primary, secondary, success, warning, danger)
- `.badge-glass-*` - Badges avec transparence
- `.glass-input` - Champs de saisie avec effet verre

### Phase 3 : Architecture Collaborative avec Yjs
**Choix technique Yjs** :
- **CRDT (Conflict-free Replicated Data Types)** pour la r�solution automatique des conflits
- **WebSocket Provider** pour la synchronisation temps r�el
- **Awareness API** pour la pr�sence utilisateur (curseurs, s�lections)

**Serveur Unifi�** (`unified-server.js`) :
```javascript
// Serveur Yjs pour la collaboration texte/commentaires
const yjsWss = new WebSocketServer({ server, path: '/yjs' });

// Serveur WebSocket pour le whiteboard
const whiteboardWss = new WebSocketServer({ server, path: '/whiteboard' });

// Gestion des documents Yjs par room
const documents = new Map();
const awarenesses = new Map();

function getDocument(roomname) {
  if (!documents.has(roomname)) {
    const doc = new Y.Doc();
    documents.set(roomname, doc);
    const awareness = new awarenessProtocol.Awareness(doc);
    awarenesses.set(roomname, awareness);
  }
  return documents.get(roomname);
}
```

### Phase 4 : Composables Vue 3 pour la Collaboration
**Architecture Composable** :

#### `useYjsCollaboration.ts` - Base collaborative
```typescript
export function useYjsCollaboration(roomId: string, user: CollaborationUser) {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(wsUrl, roomId, ydoc, {
    connect: true,
    awareness: { user }
  });
  
  // Gestion des �v�nements de connexion
  provider.on('status', (event) => {
    isConnected.value = event.status === 'connected';
  });
  
  return { ydoc, provider, isConnected, collaborators, ... };
}
```

#### `useYjsTipTap.ts` - �diteur collaboratif
```typescript
export function useYjsTipTap(roomId: string, user: TipTapUser) {
  const editor = new Editor({
    extensions: [
      StarterKit.configure({ history: false }), // Historique g�r� par Yjs
      Collaboration.configure({
        document: ydoc,
        field: 'tiptap-content',
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: { name: user.name, color: user.color },
      }),
    ],
  });
}
```

#### `useYjsComments.ts` - Syst�me de commentaires
```typescript
export function useYjsComments(roomId: string, user: CommentUser) {
  const yComments = ydoc.getArray('comments');
  
  const addComment = (content: string, type: 'comment' | 'suggestion' | 'question') => {
    const newComment = {
      id: generateId(),
      author: user,
      content,
      timestamp: Date.now(),
      type,
      resolved: false
    };
    yComments.push([newComment]);
  };
}
```

### Phase 5 : Composants Vue Collaboratifs

#### `TipTapEditorYjs.vue` - �diteur avec collaboration
**Fonctionnalit�s** :
- �dition collaborative temps r�el avec Yjs
- Curseurs collaboratifs avec couleurs utilisateur
- Barre d'outils avec ic�nes SVG personnalis�es
- Indicateur de connexion et liste des collaborateurs
- Formatage : gras, italique, soulign�, titres, listes, alignement
- Actions : annuler/r�tablir, effacer tout

#### `CommentBoardYjs.vue` - Syst�me de commentaires collaboratif
**Fonctionnalit�s** :
- Commentaires synchronis�s en temps r�el
- Types : commentaires, suggestions, questions
- Syst�me de r�solution/non-r�solu
- Filtres avanc�s (statut, type, utilisateur)
- R�ponses aux commentaires (threading)
- Interface modal glassmorphism

### Phase 6 : Configuration Docker et D�ploiement

#### Dockerfile Serveur Unifi�
```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "unified-server.js"]
```

#### Docker Compose Configuration
```yaml
services:
  websocket:
    build: ./server
    container_name: websocket_server
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    networks:
      - synkronet
```

### Phase 7 : Variables d'Environnement et Configuration
```env
# Frontend (.env)
VITE_WS_URL=ws://localhost:3001
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=...

# Production (.env.production)
VITE_WS_URL=ws://localhost:3001
VITE_API_URL=http://localhost:8000
```

---

## ?? Fonctionnalit�s Techniques Avanc�es

### 1. **Collaboration Temps R�el (Yjs)**
- **CRDT** : R�solution automatique des conflits d'�dition
- **Awareness** : Pr�sence utilisateur avec curseurs color�s
- **Synchronisation** : �tat partag� entre tous les clients connect�s
- **Persistance** : Sauvegarde automatique des documents

### 2. **Architecture WebSocket Duale**
- **Port 3001/yjs** : Collaboration texte et commentaires
- **Port 3001/whiteboard** : Dessin collaboratif et curseurs
- **Gestion des salles** : Isolation par `roomId`
- **Nettoyage automatique** : Suppression des salles vides

### 3. **Interface Utilisateur Glassmorphism**
- **Backdrop-filter** : Effet de flou sur les panneaux
- **Transparence** : Utilisation d'alpha channels (rgba)
- **Gradients** : D�grad�s subtils pour les boutons
- **Animations** : Transitions fluides sur les interactions

### 4. **Syst�me de Commentaires Avanc�**
- **Types diff�renci�s** : Commentaires, suggestions, questions
- **�tats** : R�solu/non-r�solu avec filtrage
- **Threading** : R�ponses aux commentaires
- **Temps r�el** : Synchronisation instantan�e via Yjs

### 5. **�diteur Collaboratif (TipTap + Yjs)**
- **Extensions** : StarterKit, Underline, TextAlign, Collaboration
- **Curseurs collaboratifs** : Affichage des positions des autres utilisateurs
- **Historique distribu�** : Undo/Redo synchronis�
- **Formatage riche** : Titres, listes, alignement, styles

---

## ?? D�ploiement et Tests

### Configuration Docker
La plateforme est enti�rement containeris�e avec Docker Compose :

**Services d�ploy�s** :
- `websocket_server` : Serveur Node.js unifi� (Yjs + Whiteboard)
- `vue_frontend` : Application Vue 3 avec Vite
- `symfony_app` : API Symfony avec API Platform
- `postgres_db` : Base de donn�es PostgreSQL 16

### Page de Test Collaboration
`TestCollaboration.vue` - Interface compl�te de test :
- **Tests de connexion** : V�rification WebSocket Yjs et Whiteboard
- **Monitoring temps r�el** : �tat des connexions et collaborateurs
- **Simulation** : Tests automatis�s de collaboration
- **Interface utilisateur** : Design glassmorphism coh�rent

### Commandes de D�ploiement
```bash
# Construction et d�marrage des conteneurs
docker compose up --build -d

# V�rification des logs
docker logs websocket_server

# Tests de connectivit�
curl -I http://localhost:5173  # Frontend
curl -I http://localhost:8000  # Backend API
lsof -i :3001                  # WebSocket Server
```

---

## ?? Performances et Optimisations

### Optimisations Yjs
- **Compression** : Utilisation de binary encoding pour les messages
- **Batching** : Regroupement des mises � jour pour r�duire le trafic r�seau
- **Garbage Collection** : Nettoyage automatique des �tats obsol�tes
- **Persistence** : Sauvegarde p�riodique des documents

### Optimisations Frontend
- **Lazy Loading** : Chargement � la demande des composants
- **Virtual Scrolling** : Pour les listes de commentaires importantes
- **Debouncing** : Limitation des appels API sur les interactions utilisateur
- **Caching** : Mise en cache des donn�es utilisateur et configuration

### Optimisations WebSocket
- **Connection Pooling** : R�utilisation des connexions
- **Heartbeat** : Ping/Pong pour maintenir les connexions actives
- **Reconnection** : Reconnexion automatique en cas de perte de connexion
- **Room Cleanup** : Suppression automatique des salles vides

---

## ?? S�curit� et Authentification

### Authentification
- **JWT** : Tokens s�curis�s pour l'API REST
- **Google OAuth2** : Authentification via Google
- **Session Management** : Gestion des sessions utilisateur
- **CORS** : Configuration s�curis�e des origines autoris�es

### Validation des Donn�es
- **Input Sanitization** : Nettoyage des donn�es utilisateur
- **Rate Limiting** : Limitation des requ�tes par utilisateur
- **Schema Validation** : Validation stricte des donn�es API
- **XSS Protection** : Protection contre les attaques XSS

---

## ?? M�triques et Monitoring

### Monitoring Temps R�el
- **Connexions actives** : Nombre d'utilisateurs par salle
- **Latence WebSocket** : Temps de r�ponse des messages
- **Taux d'erreur** : Surveillance des erreurs de connexion
- **Usage des ressources** : CPU, m�moire, bande passante

### Analytics Collaboration
- **Sessions collaboratives** : Dur�e et nombre de participants
- **Actions utilisateur** : �ditions, commentaires, dessins
- **Performance r�seau** : Temps de synchronisation
- **Adoption des fonctionnalit�s** : Usage des diff�rents outils

---

## ?? Roadmap et Am�liorations Futures

### Fonctionnalit�s Planifi�es
1. **Persistence avanc�e** : Sauvegarde automatique en base de donn�es
2. **Permissions granulaires** : Gestion fine des droits par utilisateur
3. **Export/Import** : PDF, Word, Markdown
4. **Templates** : Mod�les de documents pr�configur�s
5. **Notifications** : Syst�me de notifications push
6. **Mobile** : Application mobile React Native
7. **Plugins** : Architecture extensible pour plugins tiers
8. **Analytics** : Tableau de bord d'usage et statistiques

### Optimisations Techniques
1. **CDN** : Distribution de contenu via CDN
2. **Caching Redis** : Cache distribu� pour les sessions
3. **Load Balancing** : R�partition de charge pour les WebSockets
4. **Monitoring** : Int�gration Prometheus + Grafana
5. **CI/CD** : Pipeline de d�ploiement automatis�
6. **Testing** : Tests end-to-end automatis�s

---

## ?? Documentation D�veloppeur

### Structure du Projet
```
synkro/
??? frontend/           # Vue 3 + TypeScript
?   ??? src/
?   ?   ??? components/     # Composants r�utilisables
?   ?   ??? composables/    # Logique m�tier Vue 3
?   ?   ??? views/          # Pages de l'application
?   ?   ??? router/         # Configuration des routes
??? backend/            # Symfony + API Platform
?   ??? src/
?   ?   ??? Entity/         # Entit�s Doctrine
?   ?   ??? Repository/     # Requ�tes base de donn�es
?   ?   ??? ApiResource/    # Ressources API Platform
??? server/             # Node.js Collaboration Server
?   ??? unified-server.js   # Serveur Yjs + Whiteboard
?   ??? package.json        # D�pendances Node.js
?   ??? Dockerfile          # Container WebSocket
??? docker-compose.yaml # Orchestration des services
```

### APIs et Endpoints

#### API REST Symfony
- `GET /api/users` - Liste des utilisateurs
- `GET /api/rooms` - Liste des salles
- `POST /api/rooms` - Cr�ation d'une salle
- `PUT /api/rooms/{id}` - Modification d'une salle
- `DELETE /api/rooms/{id}` - Suppression d'une salle

#### WebSocket APIs
- `ws://localhost:3001/yjs/{roomId}` - Collaboration Yjs
- `ws://localhost:3001/whiteboard` - Whiteboard collaboratif

### Contribution et D�veloppement
```bash
# Installation des d�pendances
cd frontend && npm install
cd backend && composer install
cd server && npm install

# D�veloppement local
docker compose up -d postgres_db
cd frontend && npm run dev
cd backend && symfony serve
cd server && npm run dev

# Tests
cd frontend && npm run test
cd backend && php bin/phpunit
cd server && npm test
```

---

Cette documentation technique retrace l'ensemble du d�veloppement de Synkro, depuis la correction des probl�mes d'encodage jusqu'� l'implementation compl�te d'une plateforme collaborative moderne avec Yjs et une architecture microservices robuste.
