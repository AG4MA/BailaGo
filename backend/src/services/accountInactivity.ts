/**
 * Account Inactivity Service
 * 
 * Handles the logic for managing user account inactivity:
 * - After 3 months of inactivity: Account is deactivated
 * - After 6 months of inactivity: Account is permanently deleted
 * 
 * This service should be run periodically (e.g., daily via cron job)
 */

import { db } from '../db';
import { sendEmail } from './email';

// Time constants
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000; // 180 days
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days - warning before deletion

interface InactivityCheckResult {
  deactivatedCount: number;
  deletedCount: number;
  warningsSent: number;
}

class AccountInactivityService {
  /**
   * Updates the last active timestamp for a user
   * Should be called on significant user actions (login, create event, join event, etc.)
   */
  async updateLastActive(userId: string): Promise<void> {
    const user = db.users.findById(userId);
    if (user) {
      const updates: any = {
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      };
      
      // If user was deactivated but is now active again, reactivate
      if (user.status === 'deactivated' || user.status === 'inactive') {
        updates.status = 'active';
        updates.deactivatedAt = undefined;
        updates.scheduledDeletionAt = undefined;
      }
      
      db.users.update(userId, updates);
    }
  }

  /**
   * Checks all users for inactivity and takes appropriate actions
   * Should be run periodically (daily recommended)
   */
  async checkInactiveAccounts(): Promise<InactivityCheckResult> {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - THREE_MONTHS_MS);
    const sixMonthsAgo = new Date(now.getTime() - SIX_MONTHS_MS);
    const oneWeekFromNow = new Date(now.getTime() + ONE_WEEK_MS);

    let deactivatedCount = 0;
    let deletedCount = 0;
    let warningsSent = 0;

    const allUsers = db.users.findAllWithStatus();

    for (const user of allUsers) {
      // Skip already deleted accounts
      if (user.status === 'deleted') continue;

      const lastActive = new Date(user.lastActiveAt || user.createdAt);

      // Check for accounts scheduled for deletion
      if (user.scheduledDeletionAt && new Date(user.scheduledDeletionAt) <= now) {
        await this.deleteAccount(user.id);
        deletedCount++;
        continue;
      }

      // Check for accounts inactive for 6+ months
      if (lastActive < sixMonthsAgo) {
        // Schedule for deletion if not already scheduled
        if (!user.scheduledDeletionAt) {
          db.users.update(user.id, {
            status: 'deactivated',
            scheduledDeletionAt: oneWeekFromNow,
            updatedAt: now,
          });

          // Send final warning email
          await this.sendDeletionWarningEmail(user);
          warningsSent++;
        }
        continue;
      }

      // Check for accounts inactive for 3+ months (but less than 6)
      if (lastActive < threeMonthsAgo && user.status === 'active') {
        db.users.update(user.id, {
          status: 'inactive',
          deactivatedAt: now,
          updatedAt: now,
        });

        // Send inactivity warning email
        await this.sendInactivityWarningEmail(user);
        deactivatedCount++;
      }
    }

    console.log(`[AccountInactivity] Check completed: ${deactivatedCount} deactivated, ${deletedCount} deleted, ${warningsSent} warnings sent`);

    return {
      deactivatedCount,
      deletedCount,
      warningsSent,
    };
  }

  /**
   * Permanently deletes a user account
   */
  private async deleteAccount(userId: string): Promise<void> {
    const user = db.users.findById(userId);
    if (!user) return;

    // Mark as deleted instead of removing (for data integrity)
    db.users.update(userId, {
      status: 'deleted',
      email: `deleted_${userId}@deleted.local`,
      displayName: 'Utente eliminato',
      bio: undefined,
      avatarUrl: undefined,
      favoriteDances: [],
      updatedAt: new Date(),
    });

    // Note: In production, you might want to:
    // - Remove user from all groups
    // - Cancel user's events
    // - Remove user from event participants
    // - Clean up any related data

    console.log(`[AccountInactivity] Account deleted: ${userId}`);
  }

  /**
   * Sends a warning email about account inactivity
   */
  private async sendInactivityWarningEmail(user: any): Promise<void> {
    try {
      await sendEmail({
        to: user.email,
        subject: 'Il tuo account BailaGo è inattivo',
        html: `
          <h2>Ciao ${user.displayName}! 👋</h2>
          <p>Ci sei mancato! Abbiamo notato che non accedi a BailaGo da più di 3 mesi.</p>
          <p>Il tuo account è stato temporaneamente disattivato. Per riattivarlo, basta accedere nuovamente.</p>
          <p><strong>Importante:</strong> Se non effettui l'accesso entro 3 mesi, il tuo account verrà eliminato definitivamente.</p>
          <p>Speriamo di rivederti presto sulla pista! 💃🕺</p>
          <p>Il team BailaGo</p>
        `,
      });
    } catch (error) {
      console.error(`[AccountInactivity] Failed to send inactivity warning email to ${user.email}:`, error);
    }
  }

  /**
   * Sends a final warning email before account deletion
   */
  private async sendDeletionWarningEmail(user: any): Promise<void> {
    try {
      await sendEmail({
        to: user.email,
        subject: '⚠️ Il tuo account BailaGo verrà eliminato tra 7 giorni',
        html: `
          <h2>Attenzione ${user.displayName}!</h2>
          <p>Il tuo account BailaGo è inattivo da più di 6 mesi.</p>
          <p><strong>Il tuo account verrà eliminato definitivamente tra 7 giorni.</strong></p>
          <p>Se desideri mantenere il tuo account, accedi subito per riattivarlo.</p>
          <p>Accedi a BailaGo</p>
          <p>Ci dispiacerebbe perderti! 💃</p>
          <p>Il team BailaGo</p>
        `,
      });
    } catch (error) {
      console.error(`[AccountInactivity] Failed to send deletion warning email to ${user.email}:`, error);
    }
  }

  /**
   * Allows a user to manually reactivate their account
   */
  async reactivateAccount(userId: string): Promise<boolean> {
    const user = db.users.findById(userId);
    if (!user) return false;

    if (user.status === 'deleted') {
      // Cannot reactivate a deleted account
      return false;
    }

    db.users.update(userId, {
      status: 'active',
      lastActiveAt: new Date(),
      deactivatedAt: undefined,
      scheduledDeletionAt: undefined,
      updatedAt: new Date(),
    });

    return true;
  }

  /**
   * Gets the inactivity status for a user
   */
  getInactivityStatus(userId: string): {
    status: string;
    lastActiveAt?: Date;
    deactivatedAt?: Date;
    scheduledDeletionAt?: Date;
    daysUntilDeletion?: number;
  } | null {
    const user = db.users.findById(userId);
    if (!user) return null;

    const result: any = {
      status: user.status || 'active',
      lastActiveAt: user.lastActiveAt,
      deactivatedAt: user.deactivatedAt,
      scheduledDeletionAt: user.scheduledDeletionAt,
    };

    if (user.scheduledDeletionAt) {
      const now = new Date();
      const deletionDate = new Date(user.scheduledDeletionAt);
      result.daysUntilDeletion = Math.ceil((deletionDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    }

    return result;
  }
}

export const accountInactivityService = new AccountInactivityService();
