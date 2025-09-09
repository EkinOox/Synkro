import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';

const messageSync = 0;
const messageAwareness = 1;
const messageQueryAwareness = 3;

// Store pour les documents et awareness par room
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

function getAwareness(roomname) {
  getDocument(roomname); // S'assurer que l'awareness existe
  return awarenesses.get(roomname);
}

function handleConnection(ws, request) {
  const url = new URL(request.url, 'http://localhost');
  const roomname = url.pathname.slice(1); // Retirer le '/' du début

  console.log(`🔗 Nouvelle connexion pour la room: ${roomname}`);

  const doc = getDocument(roomname);
  const awareness = getAwareness(roomname);

  ws.roomname = roomname;
  ws.doc = doc;
  ws.awareness = awareness;

  // Gérer les erreurs WebSocket
  ws.on('error', (error) => {
    console.error(`❌ Erreur WebSocket pour la room ${roomname}:`, error);
  });

  // Gestionnaire de messages
  ws.on('message', (data) => {
    try {
      console.log(`📨 Message reçu de la room ${roomname}, taille: ${data.length} bytes`);
      const uint8Array = new Uint8Array(data);
      const decoder = decoding.createDecoder(uint8Array);
      const encoder = encoding.createEncoder();

      const messageType = decoding.readVarUint(decoder);
      console.log(`🔍 Type de message: ${messageType}`);

      switch (messageType) {
        case messageSync:
          console.log(`🔄 Message SYNC pour la room ${roomname}`);
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc, ws);
          break;

        case messageAwareness:
          console.log(`👁️ Message AWARENESS pour la room ${roomname}`);
          awarenessProtocol.applyAwarenessUpdate(
            awareness,
            decoding.readVarUint8Array(decoder),
            ws
          );
          break;

        case messageQueryAwareness:
          console.log(`❓ Message QUERY_AWARENESS pour la room ${roomname}`);
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
          console.log(`⚠️ Type de message inconnu: ${messageType}`);
      }

      // Envoyer la réponse si elle existe
      if (encoding.length(encoder) > 1) {
        console.log(`📤 Envoi de réponse, taille: ${encoding.length(encoder)} bytes`);
        ws.send(encoding.toUint8Array(encoder));
      }
    } catch (error) {
      console.error(`❌ Erreur lors du traitement du message pour la room ${roomname}:`, error);
      // Ne pas fermer la connexion en cas d'erreur, juste logger
    }
  });

  // Gestionnaire de mise à jour du document
  const updateHandler = (update, origin) => {
    if (origin !== ws) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);

      // Diffuser aux autres clients de la même room
      broadcastToRoom(roomname, message, ws);
    }
  };

  // Gestionnaire de mise à jour d'awareness
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

      // Diffuser aux autres clients de la même room
      broadcastToRoom(roomname, message, ws);
    }
  };

  doc.on('update', updateHandler);
  awareness.on('update', awarenessUpdateHandler);

  // Envoyer l'état initial du document
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  console.log(`📡 Envoi de l'état initial à la room ${roomname}`);
  ws.send(encoding.toUint8Array(encoder));

  // Nettoyage à la déconnexion
  ws.on('close', (code, reason) => {
    console.log(`🔌 Déconnexion de la room: ${roomname} (code: ${code})`);
    doc.off('update', updateHandler);
    awareness.off('update', awarenessUpdateHandler);

    // Supprimer l'awareness de ce client
    awarenessProtocol.removeAwarenessStates(
      awareness,
      [doc.clientID],
      'client disconnected'
    );
  });
}

function broadcastToRoom(roomname, message, sender) {
  wss.clients.forEach(client => {
    if (client.roomname === roomname && client !== sender && client.readyState === 1) {
      client.send(message);
    }
  });
}

const server = createServer();
const wss = new WebSocketServer({ server });

// Ajouter une gestion d'erreur pour le serveur WebSocket
wss.on('error', (error) => {
  console.error('❌ Erreur du serveur WebSocket:', error);
});

wss.on('connection', handleConnection);

const PORT = 1234;
server.listen(PORT, () => {
  console.log(`🚀 Serveur WebSocket YJS démarré sur le port ${PORT}`);
});
