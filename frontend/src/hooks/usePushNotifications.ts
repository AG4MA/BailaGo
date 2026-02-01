import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Configura come vengono mostrate le notifiche quando l'app è in primo piano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

export function usePushNotifications() {
  const { updatePushToken, isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          // Invia il token al backend se autenticato
          if (isAuthenticated) {
            updatePushToken(token);
          }
        }
      })
      .catch(err => {
        setError(err.message);
      });

    // Listener per notifiche ricevute quando l'app è in primo piano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener per quando l'utente clicca sulla notifica
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      handleNotificationResponse(data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]);

  // Invia token al backend quando cambia lo stato di autenticazione
  useEffect(() => {
    if (isAuthenticated && expoPushToken) {
      updatePushToken(expoPushToken);
    }
  }, [isAuthenticated, expoPushToken]);

  const handleNotificationResponse = (data: Record<string, any>) => {
    // Gestisce il tap sulla notifica in base al tipo
    switch (data.type) {
      case 'new_event':
      case 'event_reminder':
      case 'event_updated':
      case 'event_cancelled':
      case 'new_participant':
      case 'event_message':
        // Naviga all'evento (la navigazione va gestita a livello di componente)
        console.log('Navigate to event:', data.eventId);
        break;
      default:
        console.log('Unknown notification type:', data);
    }
  };

  return {
    expoPushToken,
    notification,
    error,
  };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Le notifiche push funzionano solo su dispositivi fisici
  if (!Device.isDevice) {
    console.log('⚠️ Push notifications richiedono un dispositivo fisico');
    return null;
  }

  // Richiedi permessi su Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E91E63',
    });
  }

  // Verifica permessi esistenti
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Richiedi permessi se non già concessi
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('⚠️ Permessi notifiche push non concessi');
    return null;
  }

  // Ottieni il token Expo Push
  try {
    const pushTokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    token = pushTokenData.data;
    console.log('📱 Expo Push Token:', token);
  } catch (error) {
    console.error('Errore ottenimento push token:', error);
  }

  return token;
}

// Utility per inviare notifica locale (per test)
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Invia immediatamente
  });
}

// Utility per programmare reminder
export async function scheduleEventReminder(
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  minutesBefore: number = 30
) {
  const triggerDate = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);
  
  // Non programmare se la data è nel passato
  if (triggerDate <= new Date()) {
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Tra poco si balla!',
      body: `"${eventTitle}" inizia tra ${minutesBefore} minuti`,
      data: { type: 'event_reminder', eventId },
    },
    trigger: { 
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate 
    },
  });

  return notificationId;
}

// Cancella un reminder programmato
export async function cancelEventReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
