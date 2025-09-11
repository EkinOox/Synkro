import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';

// Types de messages Yjs
const messageSync = 0;
const messageAwareness = 1;
const messageQueryAwareness = 3;

// Store pour les documents Yjs et awareness par room
const documents = new Map();
const awarenesses = new Map();

// Store pour les salles whiteboard
const whiteboardRooms = new Map();

function getDocument(roomId) {
  if (!documents.has(roomId)) {
    console.log(`📄 Création du document Yjs pour la room ID: ${roomId}`);
    const doc = new Y.Doc();
    documents.set(roomId, doc);
    const awareness = new awarenessProtocol.Awareness(doc);
    awarenesses.set(roomId, awareness);
  }
  return documents.get(roomId);
}

function getAwareness(roomId) {
  getDocument(roomId); // S'assurer que l'awareness existe
  return awarenesses.get(roomId);
}

// Fonction pour diffuser aux clients Yjs de la même room
function broadcastToYjsRoom(roomId, message, sender) {
  wss.clients.forEach(client => {
    if (client.roomId === roomId && client !== sender && client.readyState === 1) {
      client.send(message);
    }
  });
}

// Fonction pour diffuser aux clients whiteboard de la même room
function broadcastToWhiteboardRoom(roomId, message, excludeClient = null) {
  const room = whiteboardRooms.get(roomId);
  if (room) {
    room.clients.forEach(client => {
      if (client.ws !== excludeClient && client.ws.readyState === 1) {
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('❌ Erreur envoi message whiteboard:', error);
        }
      }
    });
  }
}

// Gestionnaire de connexions Yjs
function handleYjsConnection(ws, request) {
  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;
  
  // Extraire l'ID de la room depuis l'URL /yjs/room-id
  let roomId = '';
  if (pathname.startsWith('/yjs/')) {
    roomId = pathname.slice(5); // Retirer '/yjs/' du début
  } else if (pathname === '/yjs') {
    roomId = 'default'; // Room par défaut si pas spécifiée
  }
  
  console.log(`🔗 Connexion Yjs - URL complète: ${request.url}`);
  console.log(`🔗 Pathname: ${pathname}, Room ID extraite: ${roomId}`);

  const doc = getDocument(roomId);
  const awareness = getAwareness(roomId);

  ws.roomId = roomId;
  ws.doc = doc;
  ws.awareness = awareness;

  ws.on('error', (error) => {
    console.error(`❌ Erreur WebSocket Yjs pour la room ID ${roomId}:`, error);
  });

  ws.on('message', (data) => {
    try {
      const uint8Array = new Uint8Array(data);
      const decoder = decoding.createDecoder(uint8Array);
      const encoder = encoding.createEncoder();

      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync:
          console.log(`🔄 Message SYNC pour la room ID ${roomId}`);
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc, ws);
          break;

        case messageAwareness:
          console.log(`👁️ Message AWARENESS pour la room ID ${roomId}`);
          awarenessProtocol.applyAwarenessUpdate(
            awareness,
            decoding.readVarUint8Array(decoder),
            ws
          );
          break;

        case messageQueryAwareness:
          console.log(`❓ Message QUERY_AWARENESS pour la room ID ${roomId}`);
          encoding.writeVarUint(encoder, messageAwareness);
          encoding.writeVarUint8Array(
            encoder,
            awarenessProtocol.encodeAwarenessUpdate(
              awareness,
              Array.from(awareness.getStates().keys())
            )
          );
          break;

        default:
          console.log(`⚠️ Type de message Yjs inconnu: ${messageType}`);
      }

      if (encoding.length(encoder) > 1) {
        ws.send(encoding.toUint8Array(encoder));
      }
    } catch (error) {
      console.error(`❌ Erreur traitement message Yjs pour la room ID ${roomId}:`, error);
    }
  });

  // Gestionnaires de mise à jour
  const updateHandler = (update, origin) => {
    if (origin !== ws) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      broadcastToYjsRoom(roomId, message, ws);
    }
  };

  const awarenessUpdateHandler = ({ added, updated, removed }, origin) => {
    if (origin !== ws) {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);
      broadcastToYjsRoom(roomId, message, ws);
    }
  };

  doc.on('update', updateHandler);
  awareness.on('update', awarenessUpdateHandler);

  // Envoyer l'état initial
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  ws.send(encoding.toUint8Array(encoder));

  // Nettoyage à la déconnexion
  ws.on('close', (code, reason) => {
    console.log(`🔌 Déconnexion Yjs de la room ID: ${roomId} (code: ${code})`);
    doc.off('update', updateHandler);
    awareness.off('update', awarenessUpdateHandler);
    awarenessProtocol.removeAwarenessStates(
      awareness,
      [doc.clientID],
      'client disconnected'
    );
  });
}

// Gestionnaire de connexions whiteboard
function handleWhiteboardConnection(ws, request) {
  console.log('🎨 Nouvelle connexion whiteboard');

  let currentRoom = null;
  let currentUser = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'join_room':
          currentRoom = message.roomId;
          currentUser = message.user;

          if (!whiteboardRooms.has(currentRoom)) {
            whiteboardRooms.set(currentRoom, {
              id: currentRoom,
              clients: [],
              elements: []
            });
            console.log(`🏠 Salle whiteboard ${currentRoom} créée`);
          }

          const room = whiteboardRooms.get(currentRoom);
          const clientInfo = { ws, user: currentUser };
          room.clients.push(clientInfo);

          console.log(`👤 ${currentUser.name} rejoint la salle whiteboard ${currentRoom}`);

          // Envoyer la liste des collaborateurs
          const collaborators = room.clients.map(c => c.user);
          broadcastToWhiteboardRoom(currentRoom, {
            type: 'collaborators_list',
            collaborators
          });

          // Envoyer l'historique
          if (room.elements.length > 0) {
            ws.send(JSON.stringify({
              type: 'canvas_sync',
              elements: room.elements
            }));
          }

          broadcastToWhiteboardRoom(currentRoom, {
            type: 'user_joined',
            user: currentUser
          }, ws);
          break;

        case 'drawing_update':
          if (currentRoom) {
            const room = whiteboardRooms.get(currentRoom);
            if (room) {
              room.elements.push(message.data.element);
              broadcastToWhiteboardRoom(currentRoom, message, ws);
            }
          }
          break;

        case 'cursor_move':
          if (currentRoom) {
            broadcastToWhiteboardRoom(currentRoom, message, ws);
          }
          break;

        case 'canvas_cleared':
          if (currentRoom) {
            const room = whiteboardRooms.get(currentRoom);
            if (room) {
              room.elements = [];
              broadcastToWhiteboardRoom(currentRoom, message, ws);
            }
          }
          break;

        default:
          console.log(`⚠️ Message whiteboard non géré: ${message.type}`);
      }
    } catch (error) {
      console.error('❌ Erreur traitement message whiteboard:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Connexion whiteboard fermée');
    if (currentRoom && currentUser) {
      const room = whiteboardRooms.get(currentRoom);
      if (room) {
        room.clients = room.clients.filter(c => c.ws !== ws);
        
        broadcastToWhiteboardRoom(currentRoom, {
          type: 'user_left',
          userId: currentUser.id
        });

        const collaborators = room.clients.map(c => c.user);
        broadcastToWhiteboardRoom(currentRoom, {
          type: 'collaborators_list',
          collaborators
        });

        if (room.clients.length === 0) {
          whiteboardRooms.delete(currentRoom);
          console.log(`🗑️ Salle whiteboard ${currentRoom} supprimée (vide)`);
        }
      }
    }
  });

  ws.on('error', (error) => {
    console.error('❌ Erreur WebSocket whiteboard:', error);
  });
}

// Créer le serveur HTTP
const server = createServer();

// Serveur WebSocket principal
const wss = new WebSocketServer({ server });

// Gestionnaire global des connexions WebSocket
wss.on('connection', (ws, request) => {
  console.log(`🔌 Nouvelle connexion WebSocket - URL: ${request.url}`);
  
  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;
  
  if (pathname.startsWith('/yjs/') || pathname === '/yjs') {
    console.log(`📝 Routage vers gestionnaire Yjs`);
    handleYjsConnection(ws, request);
  } else if (pathname.startsWith('/whiteboard') || pathname === '/whiteboard') {
    console.log(`🎨 Routage vers gestionnaire Whiteboard`);
    handleWhiteboardConnection(ws, request);
  } else {
    console.log(`❌ Chemin WebSocket non reconnu: ${pathname}`);
    ws.close(1000, 'Chemin non supporté');
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`�� Serveur unifié Synkro démarré sur ${HOST}:${PORT}`);
  console.log(`📝 Collaboration Yjs: ws://localhost:${PORT}/yjs/ROOM_ID`);
  console.log(`🎨 Whiteboard: ws://localhost:${PORT}/whiteboard`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  yjsWss.close();
  whiteboardWss.close();
  server.close();
});
