import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { CreateGroupInput, GroupRole } from '../types/index.js';

const router = Router();

// ============ GROUP CRUD ============

// GET /api/groups - Lista gruppi dell'utente
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const groups = db.groups.findByMember(req.user!.id);
    
    // Add isAdmin flag for each group
    const groupsWithRole = groups.map(g => ({
      ...g,
      memberCount: g.members.length,
      isAdmin: db.groups.isAdmin(g.id, req.user!.id),
    }));
    
    res.json({ success: true, data: groupsWithRole });
  } catch (error) {
    console.error('[Groups] Error listing groups:', error);
    res.status(500).json({ success: false, error: 'Errore nel recupero dei gruppi' });
  }
});

// GET /api/groups/:id - Dettaglio gruppo
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const group = db.groups.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Gruppo non trovato' });
    }
    
    // Check if user is member
    if (!db.groups.isMember(group.id, req.user!.id)) {
      return res.status(403).json({ success: false, error: 'Non sei membro di questo gruppo' });
    }
    
    res.json({ 
      success: true, 
      data: {
        ...group,
        memberCount: group.members.length,
        isAdmin: db.groups.isAdmin(group.id, req.user!.id),
      }
    });
  } catch (error) {
    console.error('[Groups] Error getting group:', error);
    res.status(500).json({ success: false, error: 'Errore nel recupero del gruppo' });
  }
});

// POST /api/groups - Crea gruppo
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const input: CreateGroupInput = req.body;
    
    if (!input.name || input.name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Nome gruppo richiesto (min 2 caratteri)' });
    }
    
    const user = db.users.findById(req.user!.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Utente non trovato' });
    }
    
    const group = db.groups.create(input, user);
    console.log(`[Groups] Group created: ${group.name} by ${user.email}`);
    
    res.status(201).json({ 
      success: true, 
      data: {
        ...group,
        memberCount: group.members.length,
        isAdmin: true,
      }
    });
  } catch (error) {
    console.error('[Groups] Error creating group:', error);
    res.status(500).json({ success: false, error: 'Errore nella creazione del gruppo' });
  }
});

// PUT /api/groups/:id - Aggiorna gruppo (solo admin)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const group = db.groups.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Gruppo non trovato' });
    }
    
    if (!db.groups.isAdmin(group.id, req.user!.id)) {
      return res.status(403).json({ success: false, error: 'Solo gli admin possono modificare il gruppo' });
    }
    
    const updated = db.groups.update(req.params.id, req.body);
    console.log(`[Groups] Group updated: ${updated?.name}`);
    
    res.json({ 
      success: true, 
      data: {
        ...updated,
        memberCount: updated!.members.length,
        isAdmin: true,
      }
    });
  } catch (error) {
    console.error('[Groups] Error updating group:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'aggiornamento del gruppo' });
  }
});

// DELETE /api/groups/:id - Elimina gruppo (solo creator)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const group = db.groups.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Gruppo non trovato' });
    }
    
    // Solo il creator può eliminare il gruppo
    if (group.creatorId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Solo il creatore può eliminare il gruppo' });
    }
    
    db.groups.delete(req.params.id);
    console.log(`[Groups] Group deleted: ${group.name}`);
    
    res.json({ success: true, message: 'Gruppo eliminato' });
  } catch (error) {
    console.error('[Groups] Error deleting group:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'eliminazione del gruppo' });
  }
});

// ============ MEMBER MANAGEMENT ============

// POST /api/groups/:id/invite - Invita utente (solo admin)
router.post('/:id/invite', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body; // Cambiato da email a username (può essere username o nickname)
    
    const group = db.groups.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Gruppo non trovato' });
    }
    
    if (!db.groups.isAdmin(group.id, req.user!.id)) {
      return res.status(403).json({ success: false, error: 'Solo gli admin possono invitare membri' });
    }
    
    // Find user by username, nickname, or displayName
    const userToInvite = db.users.findByUsername(username) || 
                         db.users.findByNickname(username) ||
                         Array.from(db.users.findAll()).find(u => 
                           u.displayName?.toLowerCase() === username.toLowerCase()
                         );
    
    if (!userToInvite) {
      return res.status(404).json({ success: false, error: 'Utente non trovato' });
    }
    
    // Check if already member
    if (db.groups.isMember(group.id, userToInvite.id)) {
      return res.status(400).json({ success: false, error: 'L\'utente è già membro del gruppo' });
    }
    
    const invite = db.invites.create(group.id, userToInvite.id, req.user!.id);
    console.log(`[Groups] Invite sent to ${username} (${userToInvite.id}) for group ${group.name}`);
    
    // TODO: Send push notification to invited user
    
    res.status(201).json({ success: true, data: invite });
  } catch (error) {
    console.error('[Groups] Error inviting user:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'invio dell\'invito' });
  }
});

// POST /api/groups/:id/leave - Lascia gruppo (con logica speciale per creator)
router.post('/:id/leave', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { newAdminId } = req.body; // Optional: ID del nuovo admin se sei il creator
    
    const group = db.groups.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Gruppo non trovato' });
    }
    
    const isCreator = group.creatorId === req.user!.id;
    const isOnlyMember = group.members.length === 1;
    
    // Se sei il creator e l'unico membro, non puoi lasciare - devi eliminare
    if (isCreator && isOnlyMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sei l\'unico membro. Elimina il gruppo invece di uscire.',
        code: 'MUST_DELETE'
      });
    }
    
    // Se sei il creator ma ci sono altri membri, devi designare un nuovo admin
    if (isCreator && !isOnlyMember) {
      if (!newAdminId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Devi designare un altro membro come admin prima di uscire.',
          code: 'MUST_DESIGNATE_ADMIN',
          data: { members: group.members.filter(m => m.userId !== req.user!.id) }
        });
      }
      
      // Verifica che il nuovo admin sia un membro
      const newAdminMember = group.members.find(m => m.userId === newAdminId);
      if (!newAdminMember) {
        return res.status(400).json({ success: false, error: 'Il nuovo admin deve essere un membro del gruppo' });
      }
      
      // Promuovi il nuovo admin
      db.groups.updateMemberRole(group.id, newAdminId, 'admin');
      console.log(`[Groups] New admin designated: ${newAdminId}`);
    }
    
    // Ora puoi uscire
    const result = db.groups.removeMember(req.params.id, req.user!.id);
    if (!result) {
      return res.status(400).json({ success: false, error: 'Impossibile lasciare il gruppo' });
    }
    
    console.log(`[Groups] User left group: ${group.name}`);
    
    res.json({ success: true, message: 'Hai lasciato il gruppo' });
  } catch (error) {
    console.error('[Groups] Error leaving group:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'uscita dal gruppo' });
  }
});

// DELETE /api/groups/:id/members/:userId - Rimuovi membro (solo admin)
router.delete('/:id/members/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const group = db.groups.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Gruppo non trovato' });
    }
    
    if (!db.groups.isAdmin(group.id, req.user!.id)) {
      return res.status(403).json({ success: false, error: 'Solo gli admin possono rimuovere membri' });
    }
    
    const result = db.groups.removeMember(req.params.id, req.params.userId);
    if (!result) {
      return res.status(400).json({ success: false, error: 'Impossibile rimuovere il membro' });
    }
    
    console.log(`[Groups] Member removed from group: ${group.name}`);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Groups] Error removing member:', error);
    res.status(500).json({ success: false, error: 'Errore nella rimozione del membro' });
  }
});

// PUT /api/groups/:id/members/:userId/role - Cambia ruolo membro (solo admin)
router.put('/:id/members/:userId/role', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body as { role: GroupRole };
    
    if (!['admin', 'member', 'dj'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Ruolo non valido' });
    }
    
    const group = db.groups.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Gruppo non trovato' });
    }
    
    if (!db.groups.isAdmin(group.id, req.user!.id)) {
      return res.status(403).json({ success: false, error: 'Solo gli admin possono modificare i ruoli' });
    }
    
    const result = db.groups.updateMemberRole(req.params.id, req.params.userId, role);
    if (!result) {
      return res.status(400).json({ success: false, error: 'Impossibile modificare il ruolo' });
    }
    
    console.log(`[Groups] Member role changed in group: ${group.name}`);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Groups] Error updating member role:', error);
    res.status(500).json({ success: false, error: 'Errore nella modifica del ruolo' });
  }
});

// ============ INVITES ============

// GET /api/groups/invites/pending - Lista inviti pendenti per l'utente corrente
router.get('/invites/pending', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invites = db.invites.findByUser(req.user!.id);
    
    // Enrich with group info
    const enrichedInvites = invites.map(invite => {
      const group = db.groups.findById(invite.groupId);
      const invitedBy = db.users.findById(invite.invitedByUserId);
      return {
        ...invite,
        groupName: group?.name,
        invitedByUser: invitedBy ? {
          id: invitedBy.id,
          username: invitedBy.username,
          displayName: invitedBy.displayName,
        } : undefined,
      };
    });
    
    res.json({ success: true, data: enrichedInvites });
  } catch (error) {
    console.error('[Groups] Error getting invites:', error);
    res.status(500).json({ success: false, error: 'Errore nel recupero degli inviti' });
  }
});

// POST /api/groups/invites/:id/accept - Accetta invito
router.post('/invites/:id/accept', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invite = db.invites.findById(req.params.id);
    if (!invite) {
      return res.status(404).json({ success: false, error: 'Invito non trovato' });
    }
    
    if (invite.invitedUserId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Questo invito non è per te' });
    }
    
    const accepted = db.invites.accept(req.params.id);
    if (!accepted) {
      return res.status(400).json({ success: false, error: 'Invito scaduto o già gestito' });
    }
    
    // Add user to group
    const user = db.users.findById(req.user!.id);
    if (user) {
      db.groups.addMember(invite.groupId, user);
    }
    
    const group = db.groups.findById(invite.groupId);
    console.log(`[Groups] Invite accepted for group: ${group?.name}`);
    
    res.json({ success: true, message: 'Invito accettato', data: group });
  } catch (error) {
    console.error('[Groups] Error accepting invite:', error);
    res.status(500).json({ success: false, error: 'Errore nell\'accettazione dell\'invito' });
  }
});

// POST /api/groups/invites/:id/reject - Rifiuta invito
router.post('/invites/:id/reject', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invite = db.invites.findById(req.params.id);
    if (!invite) {
      return res.status(404).json({ success: false, error: 'Invito non trovato' });
    }
    
    if (invite.invitedUserId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Questo invito non è per te' });
    }
    
    db.invites.reject(req.params.id);
    console.log(`[Groups] Invite rejected`);
    
    res.json({ success: true, message: 'Invito rifiutato' });
  } catch (error) {
    console.error('[Groups] Error rejecting invite:', error);
    res.status(500).json({ success: false, error: 'Errore nel rifiuto dell\'invito' });
  }
});

export default router;
