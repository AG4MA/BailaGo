# 📱 Deploy su App Store e Play Store

Questa guida spiega come pubblicare BailaGo sugli store.

## 🔧 Prerequisiti

### Account necessari
1. **Expo Account** - [expo.dev](https://expo.dev) (gratuito)
2. **Apple Developer Account** - [developer.apple.com](https://developer.apple.com) ($99/anno)
3. **Google Play Console** - [play.google.com/console](https://play.google.com/console) ($25 una tantum)

### Tools
```bash
# Installa EAS CLI globalmente
npm install -g eas-cli

# Login Expo
eas login
```

## 🚀 Step 1: Setup Progetto EAS

```bash
cd frontend

# Inizializza progetto EAS (crea projectId)
eas init

# Questo aggiorna app.json con il projectId
```

Dopo `eas init`, aggiorna `app.json`:
```json
"extra": {
  "eas": {
    "projectId": "il-tuo-project-id"
  }
}
```

## 📱 Step 2: Test con Expo Go

Prima di buildare, testa l'app:

```bash
cd frontend
npx expo start
```

- **Android**: Scarica "Expo Go" dal Play Store, scansiona QR
- **iOS**: Scarica "Expo Go" dall'App Store, scansiona QR con la fotocamera

### Limitazioni Expo Go
- Non supporta moduli nativi custom
- Push notifications limitati
- Per test completo, usa Development Build

## 🔨 Step 3: Development Build (opzionale)

Per testare tutte le funzionalità native:

```bash
# Build per simulatore iOS
eas build --profile development --platform ios

# Build APK per Android
eas build --profile development --platform android
```

## 🍎 Step 4: Setup iOS (App Store)

### 4.1 Apple Developer Account
1. Vai su [developer.apple.com](https://developer.apple.com)
2. Iscriviti al Developer Program ($99/anno)
3. Attendi approvazione (24-48h)

### 4.2 App Store Connect
1. Vai su [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Clicca "My Apps" → "+" → "New App"
3. Compila:
   - Platform: iOS
   - Name: BailaGo
   - Primary Language: Italian
   - Bundle ID: com.ag4ma.bailago
   - SKU: bailago-001

### 4.3 Credenziali EAS
```bash
# EAS gestisce automaticamente certificati e provisioning
eas credentials

# Oppure lascia che EAS li crei durante la build
```

### 4.4 Aggiorna eas.json
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "tua-email@icloud.com",
      "ascAppId": "1234567890",  // Da App Store Connect
      "appleTeamId": "ABCD1234"  // Da developer.apple.com
    }
  }
}
```

## 🤖 Step 5: Setup Android (Play Store)

### 5.1 Google Play Console
1. Vai su [play.google.com/console](https://play.google.com/console)
2. Crea account sviluppatore ($25 una tantum)
3. Crea nuova app:
   - Nome: BailaGo
   - Lingua: Italiano
   - App o Gioco: App
   - Gratis o a pagamento: Gratis

### 5.2 Service Account per automazione
1. Google Cloud Console → IAM → Service Accounts
2. Crea service account
3. Scarica JSON key
4. In Play Console: Setup → API access → Link service account
5. Dai permessi "Release manager"

### 5.3 Salva la key
```bash
# Copia il file nella cartella frontend (NON committare!)
cp ~/Downloads/google-play-key.json frontend/google-play-service-account.json

# Aggiungi a .gitignore
echo "google-play-service-account.json" >> frontend/.gitignore
```

## 🏗️ Step 6: Build per Store

### Preview (test interno)
```bash
# Android APK per test
eas build --profile preview --platform android

# iOS per TestFlight
eas build --profile preview --platform ios
```

### Production
```bash
# Build entrambe le piattaforme
eas build --profile production --platform all
```

## 📤 Step 7: Submit agli Store

### Automatico (raccomandato)
```bash
# Submit dopo build completata
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### Manuale
1. Scarica il build da [expo.dev](https://expo.dev)
2. **iOS**: Carica .ipa su App Store Connect via Transporter
3. **Android**: Carica .aab su Play Console

## 📋 Step 8: Informazioni Store

### Screenshot necessari
- iPhone 6.5" (1284x2778)
- iPhone 5.5" (1242x2208)
- iPad 12.9" (2048x2732) - se supporti tablet
- Android: varie risoluzioni

### Testi
- Nome: BailaGo
- Sottotitolo: Organizza eventi di ballo
- Descrizione (4000 char max)
- Keywords (100 char max, iOS)
- Privacy Policy URL (obbligatoria)

### Asset
- Icona 1024x1024 (no trasparenza per iOS)
- Feature Graphic 1024x500 (Android)

## 🔐 GitHub Secrets

Per CI/CD automatico, aggiungi questi secrets:

| Secret | Dove trovarlo |
|--------|---------------|
| `EXPO_TOKEN` | expo.dev → Account → Access Tokens |
| `APPLE_ID` | La tua email Apple |
| `APPLE_TEAM_ID` | developer.apple.com → Membership |
| `ASC_APP_ID` | App Store Connect → App → General → Apple ID |

## ⏱️ Timeline Tipica

| Step | Tempo |
|------|-------|
| Setup accounts | 1-2 giorni |
| Prima build | 15-30 min |
| Review iOS | 24h - 7 giorni |
| Review Android | 1h - 3 giorni |

## 🆘 Troubleshooting

### Build fallita
```bash
# Controlla logs
eas build:list
eas build:view

# Pulisci cache
eas build --clear-cache --platform ios
```

### Credenziali iOS
```bash
# Resetta credenziali
eas credentials --platform ios
```

### Errori comuni
- **Missing privacy policy**: Aggiungi URL policy in store
- **Icon transparency**: iOS non accetta icone trasparenti
- **Permissions**: Aggiungi descrizioni in app.json per ogni permesso
