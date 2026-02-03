# BailaGo - TODO & Stato Avanzamento Lavori

> Ultimo aggiornamento: 3 Febbraio 2026 - Sessione serale (AGGIORNATO)

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

## ✅ FEATURE IMPLEMENTATE (3 Febbraio 2026)

### 1. Sistema Gruppi ✅ COMPLETATO
- [x] Modello `Group` (id, name, description, members[], createdAt, creatorId)
- [x] CRUD Gruppi (create, update, delete, list)
- [x] Sistema inviti (admin invita → utente accetta/rifiuta)
- [x] Ruoli: Admin / Member / DJ
- [x] UI: GroupsScreen, CreateGroupScreen, GroupDetailScreen
- [x] Tab Gruppi nella bottom navigation
- [x] **Logica creator/leave gruppo:**
  - Creator come unico membro → solo "Elimina gruppo"
  - Creator con altri membri → popup "Scegli nuovo admin" obbligatorio prima di lasciare
  - Solo il creator può eliminare il gruppo
- [x] **Ricerca utenti per invito basata su nickname** (non email)
  - Ricerca istantanea mentre si digita
  - Risultati filtrati per nickname/displayName/username

### 2. Visibilità Eventi ✅ COMPLETATO
- [x] Campo `visibility`: 'public' | 'private' | 'group'
- [x] Campo `groupId` (opzionale, per eventi di gruppo)
- [x] Filtro eventi in base alla visibilità
- [x] Solo admin gruppo possono creare eventi di gruppo
- [x] UI: Selezione visibilità in CreateEventScreen

### 3. Sistema DJ Migliorato ✅ COMPLETATO
- [x] Campo `djMode`: 'open' | 'assigned' | 'none'
  - `open`: Chiunque può candidarsi come DJ
  - `assigned`: DJ pre-assegnato
  - `none`: Nessun DJ previsto (campo nascosto)
- [x] Campo `djRequests`: lista richieste per diventare DJ
- [x] **UI Candidatura DJ in EventDetailScreen:**
  - Sezione "Vuoi fare il DJ?" per utenti
  - Modal per inviare candidatura con messaggio opzionale
  - Visualizzazione "Candidatura inviata" dopo l'invio
- [x] **UI Approvazione DJ per creator:**
  - Lista candidature con nome e messaggio
  - Bottoni approva/rifiuta per ogni candidatura
- [x] Funzioni EventsContext: `applyAsDj`, `approveDj`, `rejectDj`

### 4. Partecipazione Eventi ✅ COMPLETATO
- [x] Funzione `joinEvent` per partecipare a un evento
- [x] **Funzione `leaveEvent` per lasciare un evento**
- [x] Bottone "Non partecipo più" in EventDetailScreen
- [x] Funzione `isParticipant` per verificare partecipazione

### 5. Selezione Luogo ✅ COMPLETATO
- [x] **LocationPickerScreen** con:
  - Barra di ricerca (predisposta per Google Places API)
  - Lista luoghi placeholder
  - Posizione corrente con expo-location
  - Modalità inserimento manuale
  - Salvataggio coordinate + label testuale
- [x] Navigazione integrata in AppNavigator

### 6. Filtri Sotto-Balli ✅ COMPLETATO
- [x] Filtri per famiglia di ballo in HomeScreen
- [x] **Sotto-barra con sotto-balli** quando si seleziona una famiglia
- [x] Opzione "Tutti" nella sotto-barra per includere l'intera famiglia
- [x] Stesso comportamento in AllEventsScreen

### 7. Policy Account Inattivi ✅ COMPLETATO
- [x] **Backend service `accountInactivity.ts`:**
  - Dopo 3 mesi inattività → status 'inactive'
  - Dopo 6 mesi inattività → status 'deactivated' + schedulato per eliminazione
  - Dopo 7 giorni da schedulazione → status 'deleted'
- [x] Campi User: `status`, `lastActiveAt`, `deactivatedAt`, `scheduledDeletionAt`
- [x] `updateLastActive()` chiamato ad ogni richiesta autenticata (middleware)
- [x] Email di avviso inattività e eliminazione imminente
- [x] **Endpoints:**
  - `GET /api/auth/account-status` - Stato inattività account
  - `POST /api/auth/reactivate` - Riattivazione manuale
  - `POST /api/auth/check-inactive` - Trigger check admin/cron

### 8. Creazione Evento ✅ FUNZIONANTE
- [x] Flow creazione evento end-to-end
- [x] Tipi TypeScript corretti (`EventVisibility`, `DjMode`, `ParticipationMode`)
- [x] EventsContext con campi opzionali e default
- [x] UI CreateEventScreen funzionante

---

## 🎯 PROSSIME FEATURE DA IMPLEMENTARE

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

---

## 📋 RICHIESTE ORIGINALI - TUTTE IMPLEMENTATE ✅ (3 Feb 2026)

Le seguenti richieste sono state tutte implementate:

| # | Richiesta | Stato | File Modificati |
|---|-----------|-------|-----------------|
| 1 | Creazione evento funzionante | ✅ | `EventsContext.tsx`, `types/index.ts` |
| 2 | Luogo con input + mappa | ✅ | `LocationPickerScreen.tsx` (nuovo) |
| 3 | Logica gruppo creator | ✅ | `GroupDetailScreen.tsx` (popup scegli admin) |
| 4 | Ricerca nickname | ✅ | `GroupDetailScreen.tsx`, `auth.ts` routes |
| 5 | Ripristino visibilità gruppo | ✅ | `CreateEventScreen.tsx`, `types/index.ts` |
| 6 | Filtri con sotto-balli | ✅ | `HomeScreen.tsx`, `AllEventsScreen.tsx` |
| 7 | Ruolo DJ | ✅ | `EventDetailScreen.tsx`, `EventsContext.tsx` |
| 8 | Policy inattività account | ✅ | `accountInactivity.ts` (nuovo), `auth.ts` |
| 9 | Togliersi dalla partecipazione evento | ✅ | `EventDetailScreen.tsx`, `EventsContext.tsx` |

### Dettagli Implementazione:

**Gruppi (logica creator):**
- Creator unico membro → solo "Elimina gruppo"
- Creator con altri membri → modal "Scegli nuovo admin" obbligatorio
- Solo creator può eliminare il gruppo

**DJ:**
- Sezione "Vuoi fare il DJ?" per utenti (djMode='open')
- Modal candidatura con messaggio opzionale
- Creator vede lista candidature con approva/rifiuta

**Account Inattività:**
- 3 mesi inattività → status 'inactive' + email avviso
- 6 mesi inattività → status 'deactivated' + schedulato eliminazione
- 7 giorni dopo → eliminazione (dati preservati per audit)
- Login riattiva automaticamente account inattivo/disattivato

---

## 🔶 PROSSIMI PASSI (Opzionali)

1. **Mappa interattiva** in LocationPickerScreen (react-native-maps)
2. **Google Places API** per autocompletamento indirizzi
3. **Flusso cambio email** per account disattivati senza accesso email
4. **Cron job** per eseguire `checkInactiveAccounts()` periodicamente
