# BailaGo - TODO & Stato Avanzamento Lavori

> Ultimo aggiornamento: 2 Febbraio 2026 - Sessione serale

## 🚀 Quick Start (Development)

```bash
# Terminale 1 - Backend (porta 3000)
cd backend && npm run dev

# Terminale 2 - Frontend Expo (porta 8081/8082)
cd frontend && npx expo start --tunnel
```

**Expo Go:** Scansiona il QR code dal terminale con l'app Expo Go

**Account Test:** `test@test.com` / `test`

---

## 🎯 PROSSIME FEATURE DA IMPLEMENTARE

### 1. Sistema Gruppi 🆕
- [ ] Modello `Group` (id, name, description, admins[], members[], createdAt)
- [ ] CRUD Gruppi (create, update, delete, list)
- [ ] Sistema inviti (admin invita → utente accetta/rifiuta)
- [ ] Ruoli: Admin (può invitare, creare eventi privati, nominare altri admin) / Membro
- [ ] UI: Lista gruppi, Dettaglio gruppo, Gestione membri

### 2. Visibilità Eventi 🆕
- [ ] Campo `visibility`: 'public' | 'private' | 'group'
- [ ] Campo `groupId` (opzionale, per eventi di gruppo)
- [ ] Filtro eventi in base alla visibilità
- [ ] Eventi privati condivisibili solo da admin gruppo
- [ ] UI: Selezione visibilità in CreateEventScreen

### 3. Sistema DJ Migliorato 🆕
- [ ] Campo `djMode`: 'open' | 'assigned' | 'none'
  - `open`: Chiunque può candidarsi come DJ
  - `assigned`: DJ pre-assegnato, altri possono chiedere di sostituire
  - `none`: Nessun DJ previsto (campo nascosto)
- [ ] Campo `djRequests`: lista richieste per diventare DJ
- [ ] UI: Pulsante "Candidati come DJ" / "Richiedi ruolo DJ"
- [ ] Notifica al creatore per approvare richieste DJ

### 4. Ricerca e Filtri 🆕
- [ ] Ricerca per città
- [ ] Filtro per tipo di ballo
- [ ] Calendario generale (tutti gli eventi visibili)
- [ ] Combinazione filtri (città + tipo ballo + data)
- [ ] UI: Barra ricerca, Filtri dropdown

---

## 📊 Panoramica Progetto

| Area | Stato | Completamento |
|------|-------|---------------|
| Frontend Base | ✅ Completo | 100% |
| Backend Base | ✅ Completo | 100% |
| Primo Test Expo Go | ✅ Completo | 100% |
| Docker/Nginx | ✅ Completo | 100% |
| CI/CD GitHub Actions | ✅ Completo | 100% |
| Autenticazione | 🔶 Parziale | 70% |
| Email Service | 🔶 Da configurare | 30% |
| Push Notifications | 🔶 Da configurare | 30% |
| OAuth (Google/IG) | 🔶 Da configurare | 20% |
| App Store Deploy | ❌ Da fare | 0% |
| Database Produzione | ❌ Da fare | 0% |

---

## ✅ COMPLETATO

### Frontend (React Native + Expo)
- [x] Setup progetto Expo con TypeScript
- [x] Struttura cartelle (components, screens, contexts, hooks, theme)
- [x] Tipi TypeScript (DanceType, User, Event, Location)
- [x] Theme (colori, tipografia, spacing)
- [x] Componenti comuni (Button, Input, EventCard, DanceTypeCard)
- [x] Schermate principali:
  - [x] HomeScreen - Lista eventi e tipi di ballo
  - [x] DanceTypeSelectionScreen - Selezione tipo ballo
  - [x] EventCalendarScreen - Calendario con eventi
  - [x] CreateEventScreen - Creazione nuovo evento
  - [x] EventDetailScreen - Dettaglio evento
  - [x] MyEventsScreen - Eventi creati/partecipati
  - [x] ProfileScreen - Profilo utente
- [x] Schermate autenticazione:
  - [x] LoginScreen - Login email/password + OAuth buttons
  - [x] RegisterScreen - Registrazione 2 step
  - [x] ForgotPasswordScreen - Richiesta reset password
  - [x] ResetPasswordScreen - Form nuova password
  - [x] VerifyEmailScreen - Verifica email
- [x] Navigazione (Stack + Tab navigator)
- [x] AuthContext con metodi API
- [x] EventsContext per gestione eventi
- [x] Hook usePushNotifications (struttura)

### Backend (Node.js + Express)
- [x] Setup progetto TypeScript
- [x] Struttura cartelle (routes, middleware, services, db)
- [x] Tipi TypeScript completi
- [x] Middleware autenticazione JWT
- [x] Routes Auth:
  - [x] POST /register
  - [x] POST /login
  - [x] POST /oauth/google
  - [x] POST /oauth/instagram
  - [x] POST /verify-email
  - [x] POST /resend-verification
  - [x] POST /forgot-password
  - [x] POST /reset-password
  - [x] GET /me
  - [x] PUT /profile
  - [x] POST /update-push-token
- [x] Routes Events (CRUD + join/leave)
- [x] Email service (struttura con nodemailer)
- [x] Push service (struttura con expo-server-sdk)
- [x] Database in-memory (per development)

### Infrastruttura
- [x] Docker setup (Dockerfile per backend, frontend, nginx)
- [x] docker-compose.yml (produzione)
- [x] docker-compose.dev.yml (development)
- [x] Nginx configurazione (reverse proxy, gzip, rate limiting)
- [x] GitHub Actions workflow (build → GHCR → deploy SSH)
- [x] Script deploy.sh
- [x] Script server-setup.sh
- [x] README.md documentazione

---

## 🔶 IN CORSO / DA CONFIGURARE

### 1. Servizio Email (SMTP)
**File:** `backend/src/services/email.ts`

**Da fare:**
- [ ] Scegliere provider SMTP (Resend, SendGrid, AWS SES, Mailgun)
- [ ] Creare account e ottenere credenziali
- [ ] Configurare variabili ambiente:
  ```env
  SMTP_HOST=smtp.resend.com
  SMTP_PORT=587
  SMTP_USER=resend
  SMTP_PASS=re_xxxxxxxxxxxx
  SMTP_FROM=noreply@bailago.app
  ```
- [ ] Verificare dominio per email (DNS records)
- [ ] Testare invio email verifica
- [ ] Testare invio email reset password

**Provider consigliati:**
| Provider | Free Tier | Prezzo |
|----------|-----------|--------|
| Resend | 3000/mese | $20/10k |
| SendGrid | 100/giorno | $15/mese |
| AWS SES | 62k/mese (EC2) | $0.10/1k |
| Mailgun | 5000/mese x 3 mesi | $35/mese |

---

### 2. OAuth Google
**File:** `backend/src/routes/auth.ts`, `frontend/src/contexts/AuthContext.tsx`

**Da fare:**
- [ ] Creare progetto su Google Cloud Console
- [ ] Abilitare Google Sign-In API
- [ ] Configurare OAuth consent screen
- [ ] Creare credenziali OAuth 2.0:
  - [ ] Web client ID (per backend)
  - [ ] iOS client ID
  - [ ] Android client ID
- [ ] Configurare variabili ambiente backend:
  ```env
  GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
  ```
- [ ] Configurare variabili ambiente frontend:
  ```env
  EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxx.apps.googleusercontent.com
  ```
- [ ] Testare login Google su web
- [ ] Testare login Google su iOS
- [ ] Testare login Google su Android

**Link:** https://console.cloud.google.com/apis/credentials

---

### 3. OAuth Instagram
**File:** `backend/src/routes/auth.ts`

**Da fare:**
- [ ] Creare app su Meta for Developers
- [ ] Configurare Instagram Basic Display API
- [ ] Ottenere App ID e App Secret
- [ ] Configurare redirect URI
- [ ] Configurare variabili ambiente:
  ```env
  INSTAGRAM_CLIENT_ID=xxxx
  INSTAGRAM_CLIENT_SECRET=xxxx
  INSTAGRAM_REDIRECT_URI=https://bailago.app/auth/instagram/callback
  ```
- [ ] Implementare flow OAuth completo (frontend web redirect)
- [ ] Testare login Instagram

**Nota:** Instagram non fornisce email, gli utenti dovranno aggiungerla manualmente.

**Link:** https://developers.facebook.com/apps/

---

### 4. Push Notifications (Expo)
**File:** `backend/src/services/push.ts`, `frontend/src/hooks/usePushNotifications.ts`

**Da fare:**
- [ ] Creare account Expo (expo.dev)
- [ ] Creare progetto Expo
- [ ] Ottenere Expo Access Token
- [ ] Configurare variabile ambiente:
  ```env
  EXPO_ACCESS_TOKEN=xxxx
  ```
- [ ] Configurare app.json con projectId:
  ```json
  "extra": {
    "eas": {
      "projectId": "xxxx-xxxx-xxxx"
    }
  }
  ```
- [ ] Configurare variabile frontend:
  ```env
  EXPO_PUBLIC_PROJECT_ID=xxxx-xxxx-xxxx
  ```
- [ ] Testare push su dispositivo fisico (non funziona su emulatore)
- [ ] Implementare invio push da backend quando:
  - [ ] Nuovo evento creato nella zona
  - [ ] Qualcuno si unisce al tuo evento
  - [ ] Reminder 30 min prima evento
  - [ ] Evento modificato/cancellato

**Link:** https://expo.dev/accounts/[username]/projects

---

## ❌ DA FARE

### 5. EAS Build & App Store
**File:** `frontend/eas.json`, `frontend/app.json`

**Da fare:**
- [ ] Installare EAS CLI: `npm install -g eas-cli`
- [ ] Login Expo: `eas login`
- [ ] Configurare eas.json (già creato)
- [ ] Configurare app.json con:
  - [ ] Bundle identifier iOS
  - [ ] Package name Android
  - [ ] Versione e buildNumber
  - [ ] Icona e splash screen
  - [ ] Permessi necessari

**iOS App Store:**
- [ ] Creare Apple Developer Account ($99/anno)
- [ ] Creare App ID su App Store Connect
- [ ] Creare certificati e provisioning profiles
- [ ] Configurare eas.json con credenziali Apple
- [ ] Build: `eas build --platform ios`
- [ ] Submit: `eas submit --platform ios`

**Android Play Store:**
- [ ] Creare Google Play Developer Account ($25 una tantum)
- [ ] Creare app su Play Console
- [ ] Generare keystore per signing
- [ ] Configurare eas.json con credenziali Android
- [ ] Build: `eas build --platform android`
- [ ] Submit: `eas submit --platform android`

---

### 6. Database Produzione
**Attualmente:** Database in-memory (si resetta ad ogni restart)

**Da fare:**
- [ ] Scegliere database (PostgreSQL consigliato)
- [ ] Setup database (locale o cloud: Supabase, Neon, Railway)
- [ ] Installare dipendenze (pg, drizzle-orm o prisma)
- [ ] Creare schema/migrazioni
- [ ] Aggiornare db/index.ts per usare PostgreSQL
- [ ] Testare tutte le operazioni CRUD

---

### 7. Test su Dispositivo (Prima del deploy)

**Prerequisiti:**
- [ ] Expo Go installato su telefono
- [ ] Backend in esecuzione (locale o server)

**Testare:**
- [ ] Registrazione nuovo utente
- [ ] Login email/password
- [ ] Verifica email (se SMTP configurato)
- [ ] Login Google (se OAuth configurato)
- [ ] Creazione evento
- [ ] Partecipazione evento
- [ ] Modifica profilo
- [ ] Push notifications (se configurato)

**Comando test:**
```bash
cd frontend
npx expo start --tunnel
# Scansiona QR code con Expo Go
```

---

## 🔧 Configurazione Richiesta

### File da configurare:

1. **`backend/.env`** (crea da .env.example)
```env
# Server
PORT=3000
NODE_ENV=development
JWT_SECRET=genera-una-stringa-sicura-qui

# Frontend URL (per link email)
FRONTEND_URL=http://localhost:19006

# SMTP (scegli un provider)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@bailago.app

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Instagram OAuth
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=

# Expo Push
EXPO_ACCESS_TOKEN=
```

2. **`frontend/.env`** (crea da .env.example)
```env
# API Backend
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=

# Expo Project
EXPO_PUBLIC_PROJECT_ID=
```

---

## 📅 Roadmap Suggerita

### Fase 1: Test Base ✅ COMPLETATA (2 Febbraio 2026)
1. ✅ Installato dipendenze backend e frontend
2. ✅ Avviato backend: `cd backend && npm run dev` (porta 3000)
3. ✅ Avviato frontend: `cd frontend && npx expo start` (porta 8082)
4. ✅ Expo Go pronto per test (scansiona QR code)
5. ⏳ Test app su dispositivo fisico

### Fase 2: Servizi Esterni (2-3 giorni)
1. Configurare Resend/SendGrid per email
2. Configurare Google OAuth
3. Configurare Expo project per push
4. Testare tutto su dispositivo

### Fase 3: Produzione (3-5 giorni)
1. Setup database PostgreSQL
2. Deploy backend su server
3. Configurare dominio
4. Build con EAS

### Fase 4: App Store (1-2 settimane)
1. Creare account developer Apple/Google
2. Preparare assets (icone, screenshot)
3. Submit e review

---

## 📝 Note

- **Per testare senza email:** L'utente può continuare senza verificare, funzionalità limitate
- **Per testare senza OAuth:** Usa solo login email/password
- **Per testare senza push:** Le notifiche semplicemente non arriveranno
- **Database in-memory:** OK per test, i dati si perdono al restart del server

---

*Questo file viene aggiornato manualmente. Controlla i commit per lo storico delle modifiche.*
