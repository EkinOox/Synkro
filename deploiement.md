# 📘 Déploiment – Synkro

## 🔹 Contexte
L’application **Synkro** est composée de plusieurs services :
- **Backend** (API Symfony, port 8000)
- **Frontend** (Vue.js, port 5173)
- **WebSocket** (Yjs, port 3001)

Afin d’automatiser le déploiement et de faciliter la mise en production, nous avons mis en place :
- **Docker Hub** pour héberger les images Docker
- **GitHub Actions** pour construire et pousser les images
- **CI/CD** pour déployer automatiquement sur le serveur
- **Nginx** comme reverse proxy pour unifier l’accès aux services

---

## 🐳 Docker Hub
Un compte Docker Hub a été créé avec **un repository** et des **tag** sont créer pour chaque partit :
- `moignon/synkro-backend`
- `moignon/synkro-frontend`
- `moignon/synkro-websocket`

Chaque image est publiée avec le tag `latest` lors des pushs sur la branche `main`.

Cela permet au serveur de récupérer automatiquement les dernières versions lors du `docker-compose pull`.

---

## 🔧 GitHub & CI/CD
Un workflow GitHub Actions (`.github/workflows/deploy.yml`) a été mis en place.

Il comporte deux étapes principales :
1. **Build & Push**
   - Chaque service est construit en image Docker à partir de son `Dockerfile`
   - L’image est taguée et envoyée sur Docker Hub
2. **Deploy**
   - Connexion SSH au serveur
   - Mise à jour des images (`docker-compose pull`)
   - Redémarrage des conteneurs (`docker-compose up -d`)

Les secrets GitHub (`DOCKER_USERNAME`, `DOCKER_PASSWORD`, `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`) assurent la sécurité des accès.

---

## 📂 Docker Compose
Sur le serveur, un fichier `docker-compose.yml` définit les services :

- **backend** : basé sur `moignon/synkro-backend:latest`
- **frontend** : basé sur `moignon/synkro-frontend:latest`
- **websocket** : basé sur `moignon/synkro-websocket:latest`

Ce fichier est stocké dans `/home/student/synkro`.

---

## 🌐 Nginx
Nginx agit comme **reverse proxy** afin de rendre l’application accessible via une seule IP/domaine, sans exposer les ports internes.

Configuration principale (`/etc/nginx/sites-available/default`) :

- `/` → redirige vers le frontend (port 5173)
- `/api/` → redirige vers le backend Symfony (port 8000)
- `/yjs/` → redirige vers le serveur WebSocket (port 3001) avec gestion du protocole `Upgrade`

Cela permet aux utilisateurs d’accéder à l’application via :
- `http://<ip_du_serveur>/` (frontend)
- `http://<ip_du_serveur>/api/...` (backend)
- `ws://<ip_du_serveur>/yjs/...` (WebSocket)

---

## 🔐 Sécurité
- **UFW** autorise uniquement `22/tcp` (SSH) et `80/tcp` (HTTP).
- Les déploiements sont faits par **CI/CD** via SSH avec clés sécurisées.
- Les services Docker ne sont pas exposés directement, uniquement via **Nginx**.

---

## ✅ Résumé
- **Docker Hub** centralise les images → un repository par service.  
- **GitHub Actions** gère le pipeline (build → push → deploy).  
- **Docker Compose** orchestre les services sur le serveur.  
- **Nginx** fait office de reverse proxy et unifie les points d’entrée.  

Ainsi, tout push sur `main` déploie automatiquement la dernière version en production.

## ❌ Problèmes rencontrés

L’application ne disposait initialement que d’un seul environnement : **le mode développement**.  
Cela posait problème lors du passage en production, car le code faisait référence à des URLs locales (`localhost:8000`, `localhost:5173`, `localhost:3001`) au lieu de l’URL du serveur.  

Pour rendre l’application pleinement fonctionnelle en production, il est nécessaire de mettre en place **deux environnements distincts** :
- **Développement** : basé sur les `localhost` pour tester en local
- **Production** : basé sur l’URL publique du serveur

Cela implique d’adapter :
- les fichiers **Dockerfile** (pour définir les builds spécifiques à chaque environnement),
- les fichiers **.env** (pour différencier les variables selon le contexte).
