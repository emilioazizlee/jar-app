/* SCAFFOLD - Firebase Cloud Messaging integration pending Firebase project setup */
/* To enable: create a Firebase project, add config below, install firebase npm package */

// ─── Local (browser) notification helpers — no Firebase required ──────────────

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

export function scheduleLocalNotification(title, body, delayMs) {
  if (delayMs < 0) return;
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, delayMs);
}

export function showNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

// ─── FCM scaffold (requires Firebase setup) ──────────────────────────────────
export async function initNotifications() {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return null;
  // TODO: Initialize Firebase app + getToken when Firebase config is provided
  console.log('[JAR] Notifications enabled (local only — FCM pending Firebase setup)');
  return 'local';
}