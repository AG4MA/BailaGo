import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { config } from '../config/index.js';

// Inizializza Expo SDK
const expo = new Expo({
  accessToken: config.expo.accessToken || undefined,
});

export interface PushNotification {
  to: string | string[]; // Expo push token(s)
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
}

// Invia notifica push singola o multipla
export const sendPushNotification = async (
  notification: PushNotification
): Promise<boolean> => {
  try {
    const tokens = Array.isArray(notification.to) ? notification.to : [notification.to];
    
    // Filtra token validi
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      console.log('⚠️ Nessun token push valido');
      return false;
    }

    // Crea messaggi
    const messages: ExpoPushMessage[] = validTokens.map(token => ({
      to: token,
      sound: notification.sound ?? 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data,
      badge: notification.badge,
    }));

    // Invia in chunk (Expo ha limiti)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    // Log risultati
    const successCount = tickets.filter(t => t.status === 'ok').length;
    console.log(`📱 Push inviate: ${successCount}/${tickets.length}`);
    
    return successCount > 0;
  } catch (error) {
    console.error('❌ Errore invio push:', error);
    return false;
  }
};

// Notifica nuovo evento nella zona
export const notifyNewEventNearby = async (
  pushTokens: string[],
  eventTitle: string,
  danceType: string,
  city: string,
  eventId: string
): Promise<boolean> => {
  return sendPushNotification({
    to: pushTokens,
    title: `🎉 Nuovo evento ${danceType}!`,
    body: `"${eventTitle}" a ${city}`,
    data: { type: 'new_event', eventId },
  });
};

// Notifica qualcuno si è iscritto al tuo evento
export const notifyNewParticipant = async (
  creatorPushToken: string,
  participantName: string,
  eventTitle: string,
  eventId: string
): Promise<boolean> => {
  return sendPushNotification({
    to: creatorPushToken,
    title: '👋 Nuovo partecipante!',
    body: `${participantName} parteciperà a "${eventTitle}"`,
    data: { type: 'new_participant', eventId },
  });
};

// Notifica evento sta per iniziare (reminder)
export const notifyEventReminder = async (
  pushTokens: string[],
  eventTitle: string,
  startTime: string,
  eventId: string
): Promise<boolean> => {
  return sendPushNotification({
    to: pushTokens,
    title: '⏰ Tra poco si balla!',
    body: `"${eventTitle}" inizia alle ${startTime}`,
    data: { type: 'event_reminder', eventId },
  });
};

// Notifica evento cancellato
export const notifyEventCancelled = async (
  pushTokens: string[],
  eventTitle: string,
  eventId: string
): Promise<boolean> => {
  return sendPushNotification({
    to: pushTokens,
    title: '😔 Evento cancellato',
    body: `"${eventTitle}" è stato cancellato`,
    data: { type: 'event_cancelled', eventId },
  });
};

// Notifica evento modificato
export const notifyEventUpdated = async (
  pushTokens: string[],
  eventTitle: string,
  changeDescription: string,
  eventId: string
): Promise<boolean> => {
  return sendPushNotification({
    to: pushTokens,
    title: '📝 Evento modificato',
    body: `"${eventTitle}": ${changeDescription}`,
    data: { type: 'event_updated', eventId },
  });
};

// Notifica messaggio dal creatore dell'evento
export const notifyEventMessage = async (
  pushTokens: string[],
  creatorName: string,
  eventTitle: string,
  message: string,
  eventId: string
): Promise<boolean> => {
  return sendPushNotification({
    to: pushTokens,
    title: `💬 ${creatorName}`,
    body: message.length > 100 ? message.substring(0, 100) + '...' : message,
    data: { type: 'event_message', eventId },
  });
};
