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
      
      // Get user's groups for visibility filtering
      let userGroupIds: string[] = [];
      if (req.user) {
        const userGroups = db.groups.findByMember(req.user.id);
        userGroupIds = userGroups.map(g => g.id);
      }
      
      const events = db.events.findAll({
        danceType: danceType as string,
        city: city as string,
        userId: req.user?.id,
        groupIds: userGroupIds,
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
    // New fields
    body('visibility').optional().isIn(['public', 'private', 'group']).withMessage('Visibilità non valida'),
    body('groupId').optional().isString(),
    body('djMode').optional().isIn(['open', 'assigned', 'none']).withMessage('Modalità DJ non valida'),
    body('djName').optional().trim().isLength({ max: 100 }),
    body('djContact').optional().trim().isLength({ max: 200 }),
  ],
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('[Events] Validation errors:', errors.array());
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const eventData: CreateEventInput = req.body;
      
      // Validate group visibility
      if (eventData.visibility === 'group') {
        if (!eventData.groupId) {
          res.status(400).json({ success: false, error: 'Gruppo richiesto per eventi di gruppo' });
          return;
        }
        // Check if user is admin of the group
        if (!db.groups.isAdmin(eventData.groupId, req.user!.id)) {
          res.status(403).json({ success: false, error: 'Solo gli admin del gruppo possono creare eventi di gruppo' });
          return;
        }
      }
      
      console.log('[Events] Creating event:', eventData.title, 'by', req.user!.email);
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

// ============ DJ REQUESTS ============

// POST /api/events/:id/dj-request - Candidati come DJ
router.post('/:id/dj-request', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const event = db.events.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, error: 'Evento non trovato' });
      return;
    }

    if (event.djMode === 'none') {
      res.status(400).json({ success: false, error: 'Questo evento non prevede DJ' });
      return;
    }

    if (event.djMode === 'assigned' && event.djUserId && event.djUserId !== req.user!.id) {
      // Already has a DJ, this is a request to replace
    }

    const { message } = req.body;
    const updated = db.events.addDjRequest(req.params.id, req.user!, message);
    
    if (!updated) {
      res.status(400).json({ success: false, error: 'Non è possibile candidarsi come DJ' });
      return;
    }

    console.log(`[Events] DJ request from ${req.user!.email} for event ${event.title}`);
    
    // TODO: Send push notification to event creator
    
    res.json({
      success: true,
      data: { event: updated },
      message: 'Candidatura inviata! Il creatore dell\'evento la valuterà.',
    });
  } catch (error) {
    console.error('DJ request error:', error);
    res.status(500).json({ success: false, error: 'Errore nella candidatura' });
  }
});

// POST /api/events/:id/dj-request/:userId/approve - Approva candidatura DJ (solo creatore)
router.post('/:id/dj-request/:userId/approve', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const event = db.events.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, error: 'Evento non trovato' });
      return;
    }

    if (event.creatorId !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Solo il creatore può approvare le candidature' });
      return;
    }

    const updated = db.events.approveDjRequest(req.params.id, req.params.userId);
    
    if (!updated) {
      res.status(400).json({ success: false, error: 'Candidatura non trovata' });
      return;
    }

    console.log(`[Events] DJ request approved for event ${event.title}`);
    
    // TODO: Send push notification to approved DJ
    
    res.json({
      success: true,
      data: { event: updated },
      message: 'DJ approvato!',
    });
  } catch (error) {
    console.error('DJ approve error:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'approvazione' });
  }
});

// POST /api/events/:id/dj-request/:userId/reject - Rifiuta candidatura DJ (solo creatore)
router.post('/:id/dj-request/:userId/reject', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const event = db.events.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, error: 'Evento non trovato' });
      return;
    }

    if (event.creatorId !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Solo il creatore può rifiutare le candidature' });
      return;
    }

    const updated = db.events.rejectDjRequest(req.params.id, req.params.userId);
    
    if (!updated) {
      res.status(400).json({ success: false, error: 'Candidatura non trovata' });
      return;
    }

    console.log(`[Events] DJ request rejected for event ${event.title}`);
    
    res.json({
      success: true,
      data: { event: updated },
      message: 'Candidatura rifiutata',
    });
  } catch (error) {
    console.error('DJ reject error:', error);
    res.status(500).json({ success: false, error: 'Errore nel rifiuto' });
  }
});

export default router;
