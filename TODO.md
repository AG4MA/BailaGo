# BailaGo - TODO & Stato Avanzamento Lavori

> Ultimo aggiornamento: 2 Febbraio 2026 - Sessione serale (AGGIORNATO)

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

## ✅ FEATURE IMPLEMENTATE STASERA

### 1. Sistema Gruppi ✅ COMPLETATO
- [x] Modello `Group` (id, name, description, members[], createdAt)
- [x] CRUD Gruppi (create, update, delete, list)
- [x] Sistema inviti (admin invita → utente accetta/rifiuta)
- [x] Ruoli: Admin / Member / DJ
- [x] UI: GroupsScreen, CreateGroupScreen, GroupDetailScreen
- [x] Tab Gruppi nella bottom navigation

### 2. Visibilità Eventi ✅ COMPLETATO
- [x] Campo `visibility`: 'public' | 'private' | 'group'
- [x] Campo `groupId` (opzionale, per eventi di gruppo)
- [x] Filtro eventi in base alla visibilità
- [x] Solo admin gruppo possono creare eventi di gruppo
- [x] UI: Selezione visibilità in CreateEventScreen

### 3. Sistema DJ Migliorato ✅ COMPLETATO
- [x] Campo `djMode`: 'open' | 'assigned' | 'none'
  - `open`: Chiunque può candidarsi come DJ
  - `assigned`: DJ pre-assegnato, altri possono chiedere di sostituire  
  - `none`: Nessun DJ previsto (campo nascosto)
- [x] Campo `djRequests`: lista richieste per diventare DJ
- [x] Backend routes per candidatura/approvazione/rifiuto DJ
- [x] UI: Selezione modalità DJ in CreateEventScreen

### 4. Ricerca e Filtri ✅ COMPLETATO
- [x] Ricerca per città (HomeScreen)
- [x] Filtro per tipo di ballo (chip filters)
- [x] Combinazione filtri (città + tipo ballo)

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



da fare
Sei un senior full stack engineer sul progetto “Bailando”. Obiettivo: correggere logica gruppi, lifecycle account, ruolo DJ, visibilità eventi, e creazione evento con selezione luogo semplice e robusta. Regola assoluta: non devi riavviare il server per fare check, debug o verifiche. Il server si riavvia solo se si termina da solo. Le modifiche devono essere applicate e verificabili in live.

Correzioni e nuove regole richieste.

Gruppi, uscita e proprietà
Quando l’utente è dentro un gruppo deve esistere l’azione “Lascia gruppo” solo se l’uscita è consentita senza violare la continuità amministrativa. Se l’utente è il creator del gruppo valgono regole vincolanti: se è l’unico membro, non deve comparire “Lascia gruppo”, deve comparire solo “Elimina gruppo”. Se invece nel gruppo ci sono altri membri, il creator non può lasciare finché non designa un nuovo admin tra i membri. L’UI deve mostrare un pop up obbligatorio “Scegli nuovo admin” e impedire l’uscita se non viene selezionato un erede. Nessun altro, oltre al creator, può eliminare il gruppo.

Eventi, cancellazione e visibilità
Un evento può essere eliminato solo dal creator dell’evento, anche se l’evento è pubblico. Nessun partecipante o admin di gruppo diverso dal creator dell’evento deve poterlo eliminare.

La visibilità non deve perdere l’opzione “gruppo”. Deve esistere una visibilità che consenta di rendere l’evento visibile a un gruppo specifico. Non rimuovere questa modalità. Ripristina e rendi coerente la logica: evento visibile a tutti oppure visibile al gruppo selezionato oppure visibile solo ai partecipanti, se questa terza modalità esiste già nel modello. L’importante è che “gruppo” ci sia e funzioni.

Ricerca utenti quando inviti nel gruppo
Quando si aggiunge una persona a un gruppo, la ricerca deve essere immediata e basata sul nickname, non sulla mail. Implementa una query veloce su tutti gli utenti dell’app filtrando per nickname. L’UI deve proporre risultati mentre si digita.

Account inattivi: disattivazione e cancellazione
Se un profilo non effettua login per più di 3 mesi, l’account deve essere disattivato automaticamente. Dopo 3 mesi dalla disattivazione, l’account deve essere eliminato, ma non i dati storici associati. Interpreta “non i suoi dati” come: i dati restano in forma preservata per audit o storico, ma l’identità account non è più utilizzabile.

Se un account disattivato prova a collegarsi, il sistema deve inviare una mail di riattivazione. Se l’utente non ha più accesso a quell’indirizzo email, deve esistere un flusso “Cambia email” che consenta di inserire un nuovo indirizzo e ricevere lì la mail di attivazione, completando il cambio email e la riattivazione.

Ruolo DJ
Deve essere possibile aggiungersi come DJ. L’interfaccia e il modello devono prevedere l’opzione e la sua persistenza, con una logica minimale: un utente può proporsi come DJ per un evento, e tale informazione deve essere visibile nell’evento.

Creazione evento: bug e selezione luogo
Attualmente non è ancora possibile creare un evento e il terminale mostra errori. Priorità: rendere la creazione evento funzionante, eliminando gli errori e stabilizzando la flow end to end.

Nella sezione “Luogo” del form evento deve esserci solo una barra di ricerca. Questa barra in futuro userà API Google per autocompletamento, ma già ora deve essere predisposta come singolo input. Sotto la barra deve esserci una mappa. La scelta luogo deve funzionare anche manualmente: il cursore è fisso al centro della mappa e spostando la mappa si imposta la posizione. Il valore finale deve essere salvato come coordinate più eventuale label testuale dell’input.

Filtri “Prossimi eventi”: sottofamiglie balli
Sotto “Prossimi eventi” i filtri per famiglie di ballo vanno bene, ma quando selezioni una famiglia deve comparire una sotto-barra con tutti i relativi sotto-balli selezionabili. Nella sotto-barra deve esistere anche l’opzione “Tutti” per includere l’intera famiglia senza restringere ai sotto-balli.

Vincolo operativo di sviluppo
Non riavviare il server per applicare modifiche o fare controlli. Lavora con hot reload e verifica in live. Se ti serve una validazione, falla senza restart.

Output atteso
Implementa le modifiche sopra con priorità su: creazione evento funzionante, luogo con input più mappa, logica gruppo creator, ricerca nickname, ripristino visibilità gruppo, filtri con sotto-balli, ruolo DJ, policy inattività account con flussi email.

e manca ancora il fatto di poter togliersi dalla partecipazione di un evnto