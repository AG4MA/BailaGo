import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../db/index.js';
import { authMiddleware, generateToken, AuthRequest } from '../middleware/auth.js';
import { UserCreateInput, UserLoginInput, OAuthLoginInput, ForgotPasswordInput, ResetPasswordInput, VerifyEmailInput } from '../types/index.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendWelcomeEmail } from '../services/email.js';
import { config } from '../config/index.js';
import { OAuth2Client } from 'google-auth-library';
import { accountInactivityService } from '../services/accountInactivity.js';

const router = Router();

// Google OAuth client
const googleClient = new OAuth2Client(config.google.clientId);

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username deve essere 3-30 caratteri'),
    body('nickname').trim().isLength({ min: 2, max: 30 }).withMessage('Nickname deve essere 2-30 caratteri'),
    body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('Nome richiesto'),
    body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Cognome richiesto'),
    body('email').isEmail().normalizeEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 6 }).withMessage('Password minimo 6 caratteri'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { username, nickname, firstName, lastName, email, password }: UserCreateInput = req.body;

      // Check existing user
      if (db.users.findByEmail(email)) {
        res.status(400).json({ success: false, error: 'Email già registrata' });
        return;
      }
      if (db.users.findByUsername(username)) {
        res.status(400).json({ success: false, error: 'Username già in uso' });
        return;
      }
      if (nickname && db.users.findByNickname(nickname)) {
        res.status(400).json({ success: false, error: 'Nickname già in uso' });
        return;
      }

      const user = await db.users.create({ 
        username, 
        nickname, 
        firstName, 
        lastName, 
        email, 
        password,
        displayName: `${firstName} ${lastName}`.trim()
      });

      // Invia email di verifica
      const userWithToken = db.users.findByEmail(email);
      if (userWithToken?.emailVerificationToken) {
        await sendVerificationEmail(
          email,
          firstName || nickname || 'Utente',
          userWithToken.emailVerificationToken
        );
      }

      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        data: { 
          user, 
          token,
          message: 'Registrazione completata! Controlla la tua email per verificare l\'account.'
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, error: 'Errore durante la registrazione' });
    }
  }
);

// POST /api/auth/verify-email
router.post(
  '/verify-email',
  [
    body('token').notEmpty().withMessage('Token richiesto'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { token }: VerifyEmailInput = req.body;

      const user = db.users.verifyEmail(token);
      if (!user) {
        res.status(400).json({ success: false, error: 'Token non valido o scaduto' });
        return;
      }

      // Invia email di benvenuto
      await sendWelcomeEmail(user.email, user.firstName || user.nickname || 'Utente');

      res.json({
        success: true,
        data: { user, message: 'Email verificata con successo!' },
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ success: false, error: 'Errore durante la verifica' });
    }
  }
);

// POST /api/auth/resend-verification
router.post(
  '/resend-verification',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = db.users.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ success: false, error: 'Utente non trovato' });
        return;
      }

      if (user.emailVerified) {
        res.status(400).json({ success: false, error: 'Email già verificata' });
        return;
      }

      if (user.emailVerificationToken) {
        await sendVerificationEmail(
          user.email,
          user.firstName || user.nickname || 'Utente',
          user.emailVerificationToken
        );
      }

      res.json({
        success: true,
        data: { message: 'Email di verifica inviata!' },
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ success: false, error: 'Errore durante l\'invio' });
    }
  }
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email non valida'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { email }: ForgotPasswordInput = req.body;

      const result = db.users.createPasswordResetToken(email);
      
      // Per sicurezza rispondiamo sempre positivamente
      if (result) {
        await sendPasswordResetEmail(
          email,
          result.user.firstName || result.user.nickname || 'Utente',
          result.token
        );
      }

      res.json({
        success: true,
        data: { message: 'Se l\'email esiste, riceverai un link per il reset della password.' },
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ success: false, error: 'Errore durante la richiesta' });
    }
  }
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token richiesto'),
    body('password').isLength({ min: 6 }).withMessage('Password minimo 6 caratteri'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { token, password }: ResetPasswordInput = req.body;

      const user = await db.users.resetPassword(token, password);
      if (!user) {
        res.status(400).json({ success: false, error: 'Token non valido o scaduto' });
        return;
      }

      // Notifica cambio password
      await sendPasswordChangedEmail(
        user.email,
        user.firstName || user.nickname || 'Utente'
      );

      res.json({
        success: true,
        data: { message: 'Password aggiornata con successo!' },
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, error: 'Errore durante il reset' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { email, password }: UserLoginInput = req.body;

      const user = db.users.findByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, error: 'Credenziali non valide' });
        return;
      }

      // Se l'utente ha usato OAuth, non può fare login con password
      if (user.provider !== 'local') {
        res.status(400).json({ 
          success: false, 
          error: `Questo account usa ${user.provider} per il login` 
        });
        return;
      }

      const isValidPassword = await db.users.validatePassword(user, password);
      if (!isValidPassword) {
        res.status(401).json({ success: false, error: 'Credenziali non valide' });
        return;
      }

      const token = generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { 
          user: userWithoutPassword, 
          token,
          emailVerified: user.emailVerified
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Errore durante il login' });
    }
  }
);

// POST /api/auth/oauth/google
router.post(
  '/oauth/google',
  [
    body('idToken').notEmpty().withMessage('Token Google richiesto'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { idToken } = req.body;

      // Verifica il token con Google
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(400).json({ success: false, error: 'Token Google non valido' });
        return;
      }

      const { sub: providerId, email, given_name, family_name, picture } = payload;

      // Cerca utente esistente
      let user = db.users.findByProviderId('google', providerId!);
      
      if (!user) {
        // Controlla se esiste un utente con questa email
        user = db.users.findByEmail(email);
        if (user) {
          // Collega l'account Google
          db.users.update(user.id, {
            provider: 'google',
            providerId: providerId!,
            avatarUrl: picture,
            emailVerified: true,
          });
        } else {
          // Crea nuovo utente
          const oauthInput: OAuthLoginInput = {
            provider: 'google',
            providerId: providerId!,
            email,
            firstName: given_name,
            lastName: family_name,
            avatarUrl: picture,
          };
          user = await db.users.createFromOAuth(oauthInput);
          
          // Invia email di benvenuto
          await sendWelcomeEmail(email, given_name || 'Utente');
        }
      }

      const token = generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { user: userWithoutPassword, token },
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ success: false, error: 'Errore durante l\'autenticazione Google' });
    }
  }
);

// POST /api/auth/oauth/instagram
router.post(
  '/oauth/instagram',
  [
    body('accessToken').notEmpty().withMessage('Access token Instagram richiesto'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { accessToken } = req.body;

      // Recupera i dati utente da Instagram
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );

      if (!response.ok) {
        res.status(400).json({ success: false, error: 'Token Instagram non valido' });
        return;
      }

      const instagramUser = await response.json() as { id: string; username: string };

      // Instagram non fornisce email, usiamo username@instagram.placeholder
      const email = `${instagramUser.username}@instagram.placeholder`;

      // Cerca utente esistente
      let user = db.users.findByProviderId('instagram', instagramUser.id);
      
      if (!user) {
        // Crea nuovo utente
        const oauthInput: OAuthLoginInput = {
          provider: 'instagram',
          providerId: instagramUser.id,
          email,
          firstName: instagramUser.username,
        };
        user = await db.users.createFromOAuth(oauthInput);
      }

      const token = generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { 
          user: userWithoutPassword, 
          token,
          requiresEmail: email.includes('@instagram.placeholder')
        },
      });
    } catch (error) {
      console.error('Instagram OAuth error:', error);
      res.status(500).json({ success: false, error: 'Errore durante l\'autenticazione Instagram' });
    }
  }
);

// POST /api/auth/update-push-token
router.post(
  '/update-push-token',
  authMiddleware,
  [
    body('pushToken').notEmpty().withMessage('Push token richiesto'),
  ],
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { pushToken } = req.body;
      const user = db.users.updatePushToken(req.user!.id, pushToken);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error('Update push token error:', error);
      res.status(500).json({ success: false, error: 'Errore durante l\'aggiornamento' });
    }
  }
);

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

// PUT /api/auth/profile
router.put(
  '/profile',
  authMiddleware,
  [
    body('displayName').optional().trim().isLength({ min: 2, max: 50 }),
    body('nickname').optional().trim().isLength({ min: 2, max: 30 }),
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('bio').optional().trim().isLength({ max: 200 }),
    body('favoriteDances').optional().isArray(),
    body('pushEnabled').optional().isBoolean(),
  ],
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { displayName, nickname, firstName, lastName, bio, favoriteDances, avatarUrl, pushEnabled } = req.body;
      const updates: any = {};
      
      if (displayName !== undefined) updates.displayName = displayName;
      if (nickname !== undefined) {
        // Verifica nickname unico
        const existing = db.users.findByNickname(nickname);
        if (existing && existing.id !== req.user!.id) {
          res.status(400).json({ success: false, error: 'Nickname già in uso' });
          return;
        }
        updates.nickname = nickname;
      }
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (bio !== undefined) updates.bio = bio;
      if (favoriteDances !== undefined) updates.favoriteDances = favoriteDances;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
      if (pushEnabled !== undefined) updates.pushEnabled = pushEnabled;

      const user = db.users.update(req.user!.id, updates);
      
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, error: 'Errore durante l\'aggiornamento' });
    }
  }
);

// GET /api/auth/search - Ricerca utenti per nickname/displayName
router.get(
  '/search',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const query = (req.query.q as string || '').trim().toLowerCase();
      
      if (!query || query.length < 2) {
        res.status(400).json({ success: false, error: 'Query troppo corta (minimo 2 caratteri)' });
        return;
      }

      // Cerca in tutti gli utenti
      const allUsers = db.users.findAll();
      const matchingUsers = allUsers
        .filter(u => 
          u.id !== req.user!.id && ( // Escludi te stesso
            u.nickname?.toLowerCase().includes(query) ||
            u.displayName?.toLowerCase().includes(query) ||
            u.username?.toLowerCase().includes(query)
          )
        )
        .slice(0, 20) // Limita a 20 risultati
        .map(u => ({
          id: u.id,
          username: u.username,
          nickname: u.nickname,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
        }));

      res.json({
        success: true,
        data: matchingUsers,
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ success: false, error: 'Errore durante la ricerca' });
    }
  }
);

// ============ ACCOUNT INACTIVITY ROUTES ============

// GET /api/auth/account-status - Get current user's account inactivity status
router.get(
  '/account-status',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const status = accountInactivityService.getInactivityStatus(req.user!.id);
      
      if (!status) {
        res.status(404).json({ success: false, error: 'Stato account non trovato' });
        return;
      }

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Get account status error:', error);
      res.status(500).json({ success: false, error: 'Errore durante il recupero dello stato account' });
    }
  }
);

// POST /api/auth/reactivate - Manually reactivate a deactivated account
router.post(
  '/reactivate',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const success = await accountInactivityService.reactivateAccount(req.user!.id);
      
      if (!success) {
        res.status(400).json({ success: false, error: 'Impossibile riattivare l\'account' });
        return;
      }

      res.json({
        success: true,
        message: 'Account riattivato con successo',
      });
    } catch (error) {
      console.error('Reactivate account error:', error);
      res.status(500).json({ success: false, error: 'Errore durante la riattivazione' });
    }
  }
);

// POST /api/auth/check-inactive - Admin endpoint to run inactivity check (should be protected in production)
router.post(
  '/check-inactive',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // In production, this should be protected with admin auth or API key
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== process.env.ADMIN_API_KEY && process.env.NODE_ENV === 'production') {
        res.status(403).json({ success: false, error: 'Non autorizzato' });
        return;
      }

      const result = await accountInactivityService.checkInactiveAccounts();
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Check inactive accounts error:', error);
      res.status(500).json({ success: false, error: 'Errore durante il controllo degli account inattivi' });
    }
  }
);

export default router;
