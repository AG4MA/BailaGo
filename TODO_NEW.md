# BailaGo - TODO & Stato Avanzamento Lavori

> Ultimo aggiornamento: 3 Febbraio 2026

## 🚀 Quick Start (Development)

```bash
# Terminale 1 - Backend (porta 3000)
cd backend && npm run dev

# Terminale 2 - Frontend Expo (porta 8083)
cd frontend && npx expo start --lan --port 8083
```

**Expo Go:** Scansiona il QR code dal terminale con l'app Expo Go

**Account Test:** `test@test.com` / `test`

**API URL:** `http://192.168.1.31:3000/api`

---

## 🔥 SESSIONE ATTUALE - SAL (Stato Avanzamento Lavori)

> **Data:** 3 Febbraio 2026
> **VINCOLO OPERATIVO:** ⚠️ NON RIAVVIARE MAI IL SERVER. Modifiche in live con hot reload.

### ✅ COMPLETATO NELLE SESSIONI PRECEDENTI

#### 1. Sistema Ricerca Utenti per Gruppi
- ✅ Terminato - Backend: Endpoint GET `/api/auth/search?q=query` (ricerca per nickname/username/displayName, max 20 risultati)
- ✅ Terminato - Backend: Metodo `db.users.findAll()` implementato
- ✅ Terminato - Frontend: `GroupsContext.searchUsers(query)` implementato
- ✅ Terminato - Backend: POST `/api/groups/:id/invite` modificato per accettare `username` invece di `email`
- ✅ Terminato - Frontend: `GroupsContext.inviteMember(groupId, username)` aggiornato

#### 2. Logica Creator Gruppo (Uscita e Eliminazione)
- ✅ Terminato - Backend: Logica POST `/api/groups/:id/leave` con regole creator:
  - Se creator è solo membro → errore `MUST_DELETE`
  - Se creator con altri membri → errore `MUST_DESIGNATE_ADMIN` + lista membri
  - Accetta `newAdminId` per designare nuovo admin
- ✅ Terminato - Backend: DELETE `/api/groups/:id` protetto (solo `group.creatorId` può eliminare)
- ✅ Terminato - Backend: Campo `creatorId` aggiunto a tipo `Group`
- ✅ Terminato - Frontend: Tipi `Group`, `GroupMember`, `GroupRole`, `GroupInvite` con `creatorId`

#### 3. Protezione Eliminazione Eventi
- ✅ Terminato - Backend: DELETE `/api/events/:id` verifica che solo `event.creatorId` può eliminare

#### 4. Sub-Filtri Balli per Famiglia
- ✅ Terminato - Frontend: HomeScreen con sub-filtri sotto famiglia selezionata
- ✅ Terminato - Frontend: Opzione "Tutti" per includere intera famiglia
- ✅ Terminato - Frontend: ~70 tipi di ballo in 12 famiglie implementati

#### 5. Fix Tecnici
- ✅ Terminato - Frontend: Sostituito `uuid` con `generateId()` custom per compatibilità React Native

---

### 🚧 TASK IN CORSO (PRIORITÀ)

#### TASK 1: Fix Creazione Evento (Errori Terminale) 🔴 PRIORITÀ MASSIMA
- 🚧 Iniziato
- **Descrizione:** Risolvere errori che impediscono creazione evento. Controllare stack trace nel terminale, verificare validazione campi, chiamate API, gestione Date/Time.
- **File coinvolti:**
  - `frontend/src/screens/CreateEventScreen.tsx`
  - `frontend/src/contexts/EventsContext.tsx`
  - `backend/src/routes/events.ts`
- **Accettazione:** Form compilato → tap "Crea Evento" → evento salvato senza errori → redirect a lista eventi con nuovo evento visibile.
- **Note:** Priorità assoluta. Senza questo, niente eventi funziona.

#### TASK 2: Location Picker con Input e Mappa
- 🚧 Iniziato
- **Descrizione:** Nella sezione "Luogo" del form evento:
  1. Singolo TextInput (predisposto per Google Places Autocomplete futuro)
  2. Mappa sotto l'input con pin fisso al centro
  3. Spostando la mappa, il pin rimane fisso e la posizione sotto cambia
  4. Salvare coordinate (lat/lng) + label testuale
- **File coinvolti:**
  - `frontend/src/components/common/LocationPicker.tsx` (nuovo)
  - `frontend/src/screens/CreateEventScreen.tsx` (integrazione)
  - Installare: `react-native-maps`, `expo-location`
- **Accettazione:** Utente sposta mappa → coordinate si aggiornano → salvataggio evento con lat/lng corrette.

#### TASK 3: UI Ricerca Utenti per Invito Gruppo
- 🚧 Iniziato
- **Descrizione:** Creare modale/screen con TextInput per cercare utenti in tempo reale (debounce). Usa `GroupsContext.searchUsers()`. Mostrare risultati con nickname/displayName/avatar. Al tap, invitare utente al gruppo.
- **File coinvolti:** 
  - `frontend/src/components/common/UserSearchModal.tsx` (nuovo)
  - `frontend/src/screens/GroupDetailScreen.tsx` (integrazione)
- **Accettazione:** Digitando nel campo ricerca, appaiono risultati filtrati. Tappando un utente, viene inviato invito e modale si chiude.

#### TASK 4: UI Designazione Admin quando Creator Lascia
- 🚧 Iniziato
- **Descrizione:** Quando creator prova a lasciare gruppo con altri membri, il backend restituisce errore `MUST_DESIGNATE_ADMIN` con lista membri. L'UI deve intercettare questo errore, mostrare modale con lista membri (escluso se stesso), permettere selezione, e ritentare chiamata con `newAdminId`.
- **File coinvolti:**
  - `frontend/src/components/common/DesignateAdminModal.tsx` (nuovo)
  - `frontend/src/contexts/GroupsContext.tsx` (gestione errore)
  - `frontend/src/screens/GroupDetailScreen.tsx` (integrazione)
- **Accettazione:** Creator tenta uscita → modale con membri → seleziona nuovo admin → conferma → utente esce e nuovo admin promosso.

#### TASK 5: Ripristino Visibilità "Gruppo" per Eventi
- 🚧 Iniziato
- **Descrizione:** Verificare che il campo `visibility` supporti 'public' | 'private' | 'group'. Se manca 'group', ripristinarlo nel backend type e frontend. Evento con visibility='group' deve mostrare solo ai membri del `groupId` associato.
- **File coinvolti:**
  - `backend/src/types/index.ts` (DanceEvent interface)
  - `frontend/src/types/index.ts` (DanceEvent interface)
  - `backend/src/routes/events.ts` (filtro eventi)
  - `frontend/src/screens/CreateEventScreen.tsx` (UI selezione)
- **Accettazione:** Creazione evento → opzione "Gruppo" selezionabile → evento visibile solo ai membri gruppo.

#### TASK 6: Ruolo DJ (Candidatura e Persistenza)
- 🚧 Iniziato
- **Descrizione:** Utente deve potersi proporre come DJ per un evento. Aggiungere campo `djRequests` a DanceEvent (array di userId). Endpoint backend per aggiungere/rimuovere richiesta DJ. UI per proporsi come DJ e vedere chi si è proposto.
- **File coinvolti:**
  - `backend/src/types/index.ts` (campo djRequests in DanceEvent)
  - `backend/src/routes/events.ts` (POST `/api/events/:id/dj/request`)
  - `frontend/src/types/index.ts` (campo djRequests)
  - `frontend/src/screens/EventDetailScreen.tsx` (pulsante "Proponiti come DJ")
- **Accettazione:** Utente tappa "Proponiti come DJ" → richiesta inviata → creator evento vede lista richieste DJ.

#### TASK 7: Account Lifecycle - Disattivazione e Cancellazione
- 🚧 Iniziato
- **Descrizione:** 
  1. Dopo 3 mesi senza login → account disattivato automaticamente (flag `isActive: false`)
  2. Dopo ulteriori 3 mesi dalla disattivazione → account eliminato (dati storici preservati per audit)
  3. Login su account disattivato → invio email riattivazione
  4. Se email non accessibile → flow "Cambia email" per aggiornare indirizzo e ricevere link riattivazione
- **File coinvolti:**
  - `backend/src/types/index.ts` (campo `isActive`, `lastLoginAt`, `deactivatedAt`)
  - `backend/src/db/index.ts` (metodi deactivate/reactivate)
  - `backend/src/routes/auth.ts` (login check, reactivation endpoint)
  - `backend/src/services/email.ts` (email riattivazione)
  - Nuovo cron job o scheduled task per controllare account inattivi
- **Accettazione:** 
  - Account inattivo 90 giorni → disattivato automaticamente
  - Login su account disattivato → email ricevuta con link riattivazione
  - Riattivazione → account torna attivo

---

### ❌ DA FARE (BACKLOG)

#### TASK 8: Google Places Autocomplete per Location
- ❌ Non iniziato
- **Descrizione:** Integrare Google Places Autocomplete API nell'input location. Quando utente digita, mostrare suggerimenti di luoghi. Tap su suggerimento → coordinate e nome salvati.
- **Prerequisiti:** Task 2 completato
- **File coinvolti:** `frontend/src/components/common/LocationPicker.tsx`
- **Risorse:** Google Places API key, libreria `react-native-google-places-autocomplete`

#### TASK 9: UI "Lascia Gruppo" vs "Elimina Gruppo"
- ❌ Non iniziato
- **Descrizione:** In GroupDetailScreen, mostrare:
  - "Elimina Gruppo" se user è creator E unico membro
  - "Lascia Gruppo" se user NON è creator oppure è creator con designazione admin
  - Nascondere entrambi se non applicabile
- **Prerequisiti:** Task 4 completato
- **File coinvolti:** `frontend/src/screens/GroupDetailScreen.tsx`

---

## 📋 CHECKLIST VERIFICA

Prima di marcare un task come ✅ Terminato, verificare:

- [ ] Codice compila senza errori TypeScript
- [ ] Modifiche visibili su Expo Go senza restart server
- [ ] Funzionalità testata end-to-end su dispositivo
- [ ] Nessun warning critico nel terminale
- [ ] Dati persistono correttamente (dove applicabile)

---

## 🤖 PER AGENTI: ISTRUZIONI OPERATIVE

**BENVENUTO, AGENTE!** Questo progetto è BailaGo, una piattaforma per eventi di ballo sociale.

### ⚠️ REGOLA FONDAMENTALE
**NON RIAVVIARE MAI I SERVER.** Modifiche devono essere applicate in live. Hot reload è attivo. Verifica modifiche su Expo Go senza restart. Il server si riavvia SOLO se crasha da solo.

### 📖 WORKFLOW OBBLIGATORIO

1. **APRI QUESTO FILE (TODO.md)** - È il tuo SAL ufficiale
2. **LEGGI LA SEZIONE "🚧 TASK IN CORSO"** - Contiene task prioritari
3. **SCEGLI UN TASK** - Preferibilmente nell'ordine (Task 1 → 2 → 3...). Task 1 ha PRIORITÀ MASSIMA 🔴
4. **FLAGGA INIZIO** - Se vedi ❌, cambialo in 🚧 Iniziato
5. **IMPLEMENTA** - Leggi file coinvolti, applica modifiche. NO RESTART SERVER.
6. **VERIFICA** - Testa su Expo Go, controlla terminale
7. **FLAGGA FINE** - Cambia 🚧 in ✅ Terminato quando tutto funziona
8. **COMMIT MENTALE** - Descrivi cosa hai fatto nella tua risposta
9. **PROSSIMO TASK** - Ripeti dal punto 3

### 🏷️ CONVENZIONI FLAG

- **❌ Non iniziato** - Task nel backlog, non ancora toccato
- **🚧 Iniziato** - Task in sviluppo, lavoro in corso
- **✅ Terminato** - Task completato, testato, funzionante al 100%

### 🏗️ ARCHITETTURA RAPIDA

**Backend:** Node.js + Express + TypeScript (porta 3000)
- Auth con JWT
- Database in-memory (per dev)
- File principali: `backend/src/routes/*.ts`, `backend/src/db/index.ts`

**Frontend:** React Native + Expo (porta 8083)
- Context API (AuthContext, EventsContext, GroupsContext)
- File principali: `frontend/src/screens/*.tsx`, `frontend/src/contexts/*.tsx`

**URL API:** `http://192.168.1.31:3000/api`

**Test:** Expo Go su dispositivo fisico

### 🛠️ COMANDI UTILI

```bash
# Controllare server backend (già attivo, non riavviare)
cd backend && npm run dev

# Controllare frontend Expo (già attivo, non riavviare)
cd frontend && npx expo start --lan --port 8083

# Installare dipendenze (se necessario)
npm install <package-name>

# TypeScript check (senza eseguire)
npx tsc --noEmit
```

### 🐛 COME DEBUGGARE

1. **Errori Frontend:** Guarda schermo Expo Go (overlay rosso) e terminale Expo
2. **Errori Backend:** Guarda terminale backend (port 3000)
3. **Network:** Usa Chrome DevTools con Remote JS Debugging
4. **Types:** `npx tsc --noEmit` per check TypeScript senza eseguire

### 📂 FILE CRITICI DA CONOSCERE

- `backend/src/types/index.ts` - Tutti i tipi TypeScript backend
- `frontend/src/types/index.ts` - Tutti i tipi TypeScript frontend
- `backend/src/db/index.ts` - Database in-memory (CRUD operations)
- `frontend/src/contexts/*Context.tsx` - State management globale
- `backend/src/routes/*.ts` - API endpoints
- `frontend/src/screens/*Screen.tsx` - UI screens

### 💡 TIPS & TRICKS

**Hot Reload:**
- Salva file → attendi ~2-3 secondi → Expo reloads automaticamente
- Se non si vede nulla, scuoti telefono → "Reload"

**Testing Rapido:**
- Backend: Usa Postman o curl per testare endpoint
- Frontend: Console.log + Chrome DevTools
- Combo: Modifica backend + frontend, salva entrambi, testa

**Errori Comuni:**
- "Cannot find module": Controlla import path
- "undefined is not an object": Null check mancante
- Network error: Controlla che backend sia attivo su 3000

### ❓ DOMANDE FREQUENTI

**Q: Devo riavviare il server per vedere le modifiche?**
A: NO. MAI. Hot reload è sufficiente. Solo se il server crasha puoi riavviarlo.

**Q: Come testo una modifica?**
A: Salva file → attendi hot reload → prova su Expo Go. Nessun restart.

**Q: Se il server crasha?**
A: Solo allora puoi riavviare. Ma evita di farlo crashare.

**Q: Come aggiungo una nuova dipendenza?**
A: `npm install <package>` nella cartella corretta (backend o frontend). Se necessario, riavvia SOLO quel processo.

**Q: Come gestisco i flag nel TODO?**
A: Ogni task ha 2 stati minimi:
   - 🚧 Iniziato - quando inizi a lavorarci
   - ✅ Terminato - quando è finito e testato

**Q: Da dove inizio?**
A: Sempre da Task 1 se non completato. Task 1 (Fix Creazione Evento) è CRITICO 🔴.

**Q: Come aggiorno il TODO?**
A: Modifica questo file cambiando i flag. Mantieni sempre aggiornato lo stato.

---

## 📊 Panoramica Progetto Completa

| Area | Stato | Completamento |
|------|-------|---------------|
| Frontend Base | ✅ Completo | 100% |
| Backend Base | ✅ Completo | 100% |
| Primo Test Expo Go | ✅ Completo | 100% |
| Docker/Nginx | ✅ Completo | 100% |
| CI/CD GitHub Actions | ✅ Completo | 100% |
| Sistema Gruppi | 🔶 Parziale | 80% |
| Sistema Eventi | 🔶 Parziale | 60% |
| Ricerca Utenti | ✅ Completo | 100% |
| Sub-Filtri Balli | ✅ Completo | 100% |
| Autenticazione | 🔶 Parziale | 70% |
| Email Service | 🔶 Da configurare | 30% |
| Push Notifications | 🔶 Da configurare | 30% |
| OAuth (Google/IG) | 🔶 Da configurare | 20% |
| App Store Deploy | ❌ Da fare | 0% |
| Database Produzione | ❌ Da fare | 0% |

---

## 🎯 OBIETTIVI IMMEDIATI

1. 🔴 **Fix creazione evento** (Task 1) - BLOCCANTE
2. 🟡 **Location picker** (Task 2) - Feature core
3. 🟡 **UI ricerca utenti** (Task 3) - UX improvement
4. 🟢 **Designazione admin UI** (Task 4) - Edge case handling
5. 🟢 **Visibilità gruppo** (Task 5) - Feature restore
6. 🟢 **Ruolo DJ** (Task 6) - New feature
7. 🔵 **Account lifecycle** (Task 7) - Long-term maintenance

---

**REMEMBER:** 
- ⚠️ NO SERVER RESTART (hot reload only)
- 📖 Usa questo TODO come SAL
- 🏷️ Flagga sempre: 🚧 Iniziato → ✅ Terminato
- 🔴 Task 1 è PRIORITÀ MASSIMA

**Buon lavoro, agente! 🚀**
