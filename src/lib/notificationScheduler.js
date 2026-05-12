import { scheduleLocalNotification } from './notifications';

export function scheduleSubscriptionReminders(subscriptions) {
  if (!Array.isArray(subscriptions)) return;
  subscriptions.forEach(sub => {
    const dueDate = sub.next_renewal ? new Date(sub.next_renewal) : null;
    if (!dueDate) return;
    const now = new Date();
    const msUntilDue = dueDate - now;
    const daysUntil = Math.floor(msUntilDue / 86400000);

    if (daysUntil === 1 || daysUntil === 3) {
      scheduleLocalNotification(
        `Subscription due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
        `${sub.title || sub.label} — ${sub.currency || ''}${sub.amount || ''}`,
        msUntilDue - daysUntil * 86400000
      );
    }
  });
}

export function scheduleDailyLoggingReminder(hour = 21) {
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(hour, 0, 0, 0);
  if (reminderTime <= now) reminderTime.setDate(reminderTime.getDate() + 1);
  const delay = reminderTime - now;
  scheduleLocalNotification(
    'Daily Check-In 🫙',
    "Have you logged today's activities?",
    delay
  );
}

export function scheduleTaskDeadlineReminders(tasks) {
  if (!Array.isArray(tasks)) return;
  tasks.forEach(task => {
    if (!task.deadline || task.status === 'done') return;
    const dueDate = new Date(task.deadline);
    const now = new Date();
    const msUntil = dueDate - now;
    const hoursUntil = msUntil / 3600000;

    if (hoursUntil > 0 && hoursUntil <= 24) {
      scheduleLocalNotification(
        'Task deadline approaching',
        `"${task.title}" is due ${hoursUntil < 2 ? 'soon' : 'tomorrow'}`,
        Math.max(0, msUntil - 3600000) // 1h before
      );
    }
  });
}