# BailaGo 💃🕺

App multiplatform per organizzare eventi di ballo in piazze e luoghi pubblici.

## 🏗️ Architettura

```
bailago/
├── frontend/          # React Native (Expo) - Mobile + Web
├── backend/           # Node.js + Express API
├── nginx/             # Reverse proxy configuration
├── scripts/           # Deploy e setup scripts
├── .github/workflows/ # CI/CD GitHub Actions
└── docker-compose.yml # Orchestrazione container
```

## 🚀 Quick Start (Development)

### Prerequisiti
- Node.js 20+
- Docker e Docker Compose
- Expo CLI (`npm install -g expo-cli`)

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend (Mobile)
```bash
cd frontend
npm install
npx expo start
```

### Docker (tutto insieme)
```bash
docker compose -f docker-compose.dev.yml up --build
```

## 🐳 Docker Production

### Build locale
```bash
docker compose build
```

### Run locale
```bash
docker compose up -d
```

L'app sarà disponibile su `http://localhost`

## 📦 CI/CD Pipeline

Il workflow GitHub Actions:

1. **Test** - Verifica build di backend e frontend
2. **Build** - Crea immagini Docker multi-arch (amd64/arm64)
3. **Push** - Carica immagini su GitHub Container Registry (GHCR)
4. **Deploy** - SSH sul server e pull delle nuove immagini

### Secrets GitHub necessari

| Secret | Descrizione |
|--------|-------------|
| `SERVER_HOST` | IP o hostname del server |
| `SERVER_USER` | Username SSH |
| `SERVER_SSH_KEY` | Chiave privata SSH |

### Variabili d'ambiente produzione

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-key
FRONTEND_URL=https://yourdomain.com
GITHUB_REPOSITORY=your-username/bailago
GITHUB_TOKEN=ghp_xxxxx
```

## 🖥️ Setup Server Produzione

### 1. Requisiti server
- Ubuntu 22.04+ / Debian 12+
- Docker e Docker Compose
- 1GB RAM minimo

### 2. Setup iniziale
```bash
# Sul server
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clona e configura
git clone https://github.com/your-username/bailago.git
cd bailago
./scripts/server-setup.sh your-username/bailago
```

### 3. Configura .env
```bash
nano /opt/bailago/.env
```

### 4. Deploy
```bash
cd /opt/bailago
./deploy.sh latest
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Registrazione (email, password, nickname, nome, cognome)
- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/oauth/google` - Login con Google OAuth
- `POST /api/auth/oauth/instagram` - Login con Instagram OAuth
- `POST /api/auth/verify-email` - Verifica email con token
- `POST /api/auth/resend-verification` - Rinvia email di verifica
- `POST /api/auth/forgot-password` - Richiedi reset password
- `POST /api/auth/reset-password` - Reset password con token
- `GET /api/auth/me` - Profilo utente
- `PUT /api/auth/profile` - Aggiorna profilo
- `POST /api/auth/update-push-token` - Aggiorna token push notifications

### Events
- `GET /api/events` - Lista eventi (filtri: danceType, city)
- `GET /api/events/:id` - Dettaglio evento
- `POST /api/events` - Crea evento (auth)
- `PUT /api/events/:id` - Modifica evento (solo creatore)
- `DELETE /api/events/:id` - Elimina evento (solo creatore)
- `POST /api/events/:id/join` - Partecipa (auth)
- `DELETE /api/events/:id/leave` - Lascia evento (auth)

## 🔐 Autenticazione

### Flusso Registrazione
1. Utente inserisce: email, password, nickname, nome, cognome
2. Backend crea account e genera token verifica email (24h)
3. Email inviata con link di verifica
4. Utente può usare l'app ma con funzionalità limitate
5. Click sul link → email verificata → accesso completo

### OAuth (Google / Instagram)
- Login con un click se account Google già presente
- Instagram per utenti senza email Google
- Account creato automaticamente al primo login
- Email già verificata per OAuth

### Reset Password
1. Utente richiede reset inserendo email
2. Email con link di reset (valido 1h)
3. Click → form nuova password
4. Password cambiata → email di conferma

### Push Notifications
- Nuovo evento nella tua zona
- Reminder 30 min prima dell'evento
- Qualcuno si unisce al tuo evento
- Evento modificato o cancellato
- Messaggio dall'organizzatore

## 📱 Features

- ✅ Selezione tipo di ballo (Salsa, Bachata, Kizomba, etc.)
- ✅ Calendario eventi
- ✅ Creazione evento con luogo, orario, DJ
- ✅ Partecipazione eventi
- ✅ Condivisione su WhatsApp, Telegram, Instagram
- ✅ Profilo utente con balli preferiti
- ✅ Privacy: mostra nomi o solo numero partecipanti

## 🛠️ Tech Stack

### Frontend
- React Native + Expo
- React Navigation
- TypeScript
- Expo Web (per versione browser)

### Backend
- Node.js + Express
- TypeScript
- JWT Authentication
- Express Validator

### Infra
- Docker + Docker Compose
- Nginx (reverse proxy, rate limiting, gzip)
- GitHub Actions (CI/CD)
- GitHub Container Registry (GHCR)

## 📄 Licenza

MIT
