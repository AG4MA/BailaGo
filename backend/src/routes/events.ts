import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { db } from '../db/index.js';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { CreateEventInput } from '../types/index.js';

const router = Router();

// GET /api/events - Lista eventi (pubblico)
router.get(
  '/',
  optionalAuthMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { danceType, city, page = '1', limit = '20' } = req.query;
      
      const events = db.events.findAll({
        danceType: danceType as string,
        city: city as string,
      });

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedEvents = events.slice(startIndex, startIndex + limitNum);

      res.json({
        success: true,
        data: {
          items: paginatedEvents,
          total: events.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(events.length / limitNum),
        },
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ success: false, error: 'Errore nel recupero eventi' });
    }
  }
);

// GET /api/events/my - I miei eventi (autenticato)
router.get('/my', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const created = db.events.findByCreator(req.user!.id);
    const participating = db.events.findByParticipant(req.user!.id);

    res.json({
      success: true,
      data: { created, participating },
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ success: false, error: 'Errore nel recupero eventi' });
  }
});

// GET /api/events/:id - Dettaglio evento (pubblico)
router.get('/:id', optionalAuthMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const event = db.events.findById(req.params.id);
    
    if (!event) {
      res.status(404).json({ success: false, error: 'Evento non trovato' });
      return;
    }

    // Se showParticipantNames è false, nascondi i nomi dei partecipanti
    let eventData = { ...event };
    if (!event.showParticipantNames && event.creatorId !== req.user?.id) {
      eventData.participants = [];
    }

    res.json({
      success: true,
      data: { event: eventData },
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, error: 'Errore nel recupero evento' });
  }
});

// POST /api/events - Crea evento (autenticato)
router.post(
  '/',
  authMiddleware,
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Titolo 3-100 caratteri'),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('danceType').notEmpty().withMessage('Tipo di ballo richiesto'),
    body('location.name').trim().notEmpty().withMessage('Nome luogo richiesto'),
    body('location.city').trim().notEmpty().withMessage('Città richiesta'),
    body('date').isISO8601().withMessage('Data non valida'),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Orario non valido'),
    body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('showParticipantNames').isBoolean(),
    body('maxParticipants').optional().isInt({ min: 1, max: 10000 }),
  ],
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const eventData: CreateEventInput = req.body;
      const event = db.events.create(eventData, req.user!);

      res.status(201).json({
        success: true,
        data: { event },
        message: 'Evento creato con successo',
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ success: false, error: 'Errore nella creazione evento' });
    }
  }
);

// PUT /api/events/:id - Modifica evento (solo creatore)
router.put(
  '/:id',
  authMiddleware,
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('date').optional().isISO8601(),
    body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  ],
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const event = db.events.findById(req.params.id);
      if (!event) {
        res.status(404).json({ success: false, error: 'Evento non trovato' });
        return;
      }

      if (event.creatorId !== req.user!.id) {
        res.status(403).json({ success: false, error: 'Non autorizzato' });
        return;
      }

      const updated = db.events.update(req.params.id, req.body);
      
      res.json({
        success: true,
        data: { event: updated },
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ success: false, error: 'Errore nell\'aggiornamento' });
    }
  }
);

// DELETE /api/events/:id - Elimina evento (solo creatore)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const event = db.events.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, error: 'Evento non trovato' });
      return;
    }

    if (event.creatorId !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Non autorizzato' });
      return;
    }

    db.events.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Evento eliminato',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'eliminazione' });
  }
});

// POST /api/events/:id/join - Partecipa a evento
router.post('/:id/join', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const event = db.events.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, error: 'Evento non trovato' });
      return;
    }

    // Check se già partecipa
    if (event.participants.some(p => p.userId === req.user!.id)) {
      res.status(400).json({ success: false, error: 'Già iscritto a questo evento' });
      return;
    }

    // Check max partecipanti
    if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
      res.status(400).json({ success: false, error: 'Evento al completo' });
      return;
    }

    const updated = db.events.addParticipant(req.params.id, req.user!);
    
    res.json({
      success: true,
      data: { event: updated },
      message: 'Iscrizione confermata!',
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'iscrizione' });
  }
});

// DELETE /api/events/:id/leave - Lascia evento
router.delete('/:id/leave', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const event = db.events.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, error: 'Evento non trovato' });
      return;
    }

    const updated = db.events.removeParticipant(req.params.id, req.user!.id);
    
    res.json({
      success: true,
      data: { event: updated },
      message: 'Hai lasciato l\'evento',
    });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'uscita dall\'evento' });
  }
});

export default router;
