import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

// Cr�er un serveur HTTP
const server = http.createServer();

// Cr�er un serveur WebSocket
const wss = new WebSocketServer({
  server,
  path: '/whiteboard'
});

// Stockage des salles et des utilisateurs
const rooms = new Map();

// Fonction utilitaire pour nettoyer les connexions ferm�es
function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    room.clients = room.clients.filter(client =>
      client.ws.readyState === WebSocket.OPEN
    );

    if (room.clients.length === 0) {
      rooms.delete(roomId);
      console.log(`Salle ${roomId} supprim�e (vide)`);
    }
  }
}

// Fonction pour diffuser un message � tous les clients d'une salle
function broadcastToRoom(roomId, message, excludeClient = null) {
  const room = rooms.get(roomId);
  if (room) {
    room.clients.forEach(client => {
      if (client.ws !== excludeClient && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Erreur envoi message:', error);
        }
      }
    });
  }
}

wss.on('connection', (ws, req) => {
  console.log('Nouvelle connexion WebSocket');

  let currentRoom = null;
  let currentUser = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'join_room':
          currentRoom = message.roomId;
          currentUser = message.user;

          // Cr�er la salle si elle n'existe pas
          if (!rooms.has(currentRoom)) {
            rooms.set(currentRoom, {
              id: currentRoom,
              clients: [],
              elements: [] // Historique des dessins
            });
            console.log(`Salle ${currentRoom} cr��e`);
          }

          const room = rooms.get(currentRoom);

          // Ajouter le client � la salle
          const clientInfo = { ws, user: currentUser };
          room.clients.push(clientInfo);

          console.log(`Utilisateur ${currentUser.name} rejoint la salle ${currentRoom}`);

          // Envoyer la liste des collaborateurs � tous
          const collaborators = room.clients.map(c => c.user);
          broadcastToRoom(currentRoom, {
            type: 'collaborators_list',
            collaborators
          });

          // Envoyer l'historique des dessins au nouveau client
          if (room.elements.length > 0) {
            ws.send(JSON.stringify({
              type: 'canvas_sync',
              elements: room.elements
            }));
          }

          // Notifier les autres de l'arriv�e
          broadcastToRoom(currentRoom, {
            type: 'user_joined',
            user: currentUser
          }, ws);

          break;

        case 'user_joined':
          if (currentRoom) {
            broadcastToRoom(currentRoom, message, ws);
          }
          break;

        case 'drawing_update':
          if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
              // Sauvegarder l'�l�ment dans l'historique de la salle
              room.elements.push(message.data.element);

              // Diffuser � tous les autres clients
              broadcastToRoom(currentRoom, message, ws);
            }
          }
          break;

        case 'cursor_move':
          if (currentRoom) {
            // Diffuser la position du curseur (sans sauvegarder)
            broadcastToRoom(currentRoom, message, ws);
          }
          break;

        case 'canvas_cleared':
          if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
              // Vider l'historique
              room.elements = [];

              // Diffuser l'action
              broadcastToRoom(currentRoom, message, ws);
            }
          }
          break;

        default:
          console.log('Message non g�r�:', message.type);
      }
    } catch (error) {
      console.error('Erreur traitement message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Connexion ferm�e');

    if (currentRoom && currentUser) {
      const room = rooms.get(currentRoom);
      if (room) {
        // Retirer le client de la salle
        room.clients = room.clients.filter(c => c.ws !== ws);

        // Notifier les autres du d�part
        broadcastToRoom(currentRoom, {
          type: 'user_left',
          userId: currentUser.id
        });

        // Mettre � jour la liste des collaborateurs
        const collaborators = room.clients.map(c => c.user);
        broadcastToRoom(currentRoom, {
          type: 'collaborators_list',
          collaborators
        });

        // Nettoyer la salle si vide
        cleanupRoom(currentRoom);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('Erreur WebSocket:', error);
  });

  // Ping pour maintenir la connexion
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);
});

// D�marrer le serveur
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Serveur WebSocket d�marr� sur le port ${PORT}`);
  console.log(`URL: ws://localhost:${PORT}/whiteboard`);
});

// Gestion de l'arr�t propre
process.on('SIGTERM', () => {
  console.log('Arr�t du serveur...');
  wss.close(() => {
    server.close();
  });
});
