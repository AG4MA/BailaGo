import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../db/index.js';
import { authMiddleware, generateToken, AuthRequest } from '../middleware/auth.js';
import { UserCreateInput, UserLoginInput } from '../types/index.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username deve essere 3-30 caratteri'),
    body('email').isEmail().normalizeEmail().withMessage('Email non valida'),
    body('displayName').trim().isLength({ min: 2, max: 50 }).withMessage('Nome deve essere 2-50 caratteri'),
    body('password').isLength({ min: 6 }).withMessage('Password minimo 6 caratteri'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { username, email, displayName, password }: UserCreateInput = req.body;

      // Check existing user
      if (db.users.findByEmail(email)) {
        res.status(400).json({ success: false, error: 'Email già registrata' });
        return;
      }
      if (db.users.findByUsername(username)) {
        res.status(400).json({ success: false, error: 'Username già in uso' });
        return;
      }

      const user = await db.users.create({ username, email, displayName, password });
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        data: { user, token },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, error: 'Errore durante la registrazione' });
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

      const isValidPassword = await db.users.validatePassword(user, password);
      if (!isValidPassword) {
        res.status(401).json({ success: false, error: 'Credenziali non valide' });
        return;
      }

      const token = generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { user: userWithoutPassword, token },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Errore durante il login' });
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
    body('bio').optional().trim().isLength({ max: 200 }),
    body('favoriteDances').optional().isArray(),
  ],
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { displayName, bio, favoriteDances, avatarUrl } = req.body;
      const updates: any = {};
      
      if (displayName !== undefined) updates.displayName = displayName;
      if (bio !== undefined) updates.bio = bio;
      if (favoriteDances !== undefined) updates.favoriteDances = favoriteDances;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

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

export default router;
