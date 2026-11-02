import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const DAILY_REMINDER_ID = 1001;
const EVENING_ALERT_ID = 1002;

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  } catch (e) {
    console.warn('Notification permission request failed:', e);
  }
  return false;
};

export const scheduleDailyReminders = async (
  streak = 1,
  lang: 'en' | 'hi' = 'en',
  isEnabled = true
) => {
  if (!isEnabled) {
    await cancelDailyReminders();
    return;
  }

  try {
    if (Capacitor.isNativePlatform()) {
      // Clear previous schedules
      await LocalNotifications.cancel({
        notifications: [{ id: DAILY_REMINDER_ID }, { id: EVENING_ALERT_ID }]
      });

      const title = lang === 'hi' 
        ? `🔥 अपनी ${streak} दिन की स्ट्रीक बचाइए!`
        : `🔥 Keep your ${streak}-day streak alive!`;

      const body = lang === 'hi'
        ? `आज आपने अभ्यास नहीं किया! Gkoo पर 2 मिनट में महत्वपूर्ण प्रश्न हल करें 🦜`
        : `You haven't practiced today! Spend 2 minutes on important questions 🦜`;

      // Schedule for 7:30 PM daily
      await LocalNotifications.schedule({
        notifications: [
          {
            id: DAILY_REMINDER_ID,
            title,
            body,
            schedule: {
              on: {
                hour: 19,
                minute: 30
              },
              allowWhileIdle: true
            },
            sound: 'beep.wav',
            smallIcon: 'ic_launcher',
            actionTypeId: '',
            extra: { type: 'daily_reminder' }
          },
          {
            id: EVENING_ALERT_ID,
            title: lang === 'hi' ? '⏰ अपनी दैनिक स्ट्रीक सुरक्षित करें!' : '⏰ Your daily streak is at risk!',
            body: lang === 'hi' ? 'दिन खत्म होने से पहले 1 टेस्ट पूरा करें और अपना स्कोर बढ़ाएं!' : 'Complete 1 test before midnight to keep your study streak safe!',
            schedule: {
              on: {
                hour: 21,
                minute: 45
              },
              allowWhileIdle: true
            },
            sound: 'beep.wav',
            smallIcon: 'ic_launcher',
            actionTypeId: '',
            extra: { type: 'urgent_reminder' }
          }
        ]
      });
    }
  } catch (e) {
    console.warn('Failed to schedule local notifications:', e);
  }
};

export const cancelDailyReminders = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.cancel({
        notifications: [{ id: DAILY_REMINDER_ID }, { id: EVENING_ALERT_ID }]
      });
    }
  } catch (e) {
    console.warn('Failed to cancel local notifications:', e);
  }
};

export const sendImmediateTestNotification = async (
  streak = 1,
  lang: 'en' | 'hi' = 'en'
): Promise<boolean> => {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    const title = lang === 'hi' 
      ? `🦜 Gkoo: अपनी ${streak} दिन की स्ट्रीक जारी रखें!`
      : `🦜 Gkoo: Keep your ${streak}-day streak alive!`;

    const body = lang === 'hi'
      ? `आज का अभ्यास पूरा करें और अपनी तैयारी को मजबूत बनाएं 🔥`
      : `Practice today's questions and keep your preparation on track 🔥`;

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 90000) + 10000,
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            smallIcon: 'ic_launcher'
          }
        ]
      });
      return true;
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: '/gkoo-logo.svg'
      });
      return true;
    }
  } catch (e) {
    console.warn('Test notification error:', e);
  }
  return false;
};
