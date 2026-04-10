export class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async notify(title: string, options?: NotificationOptions) {
    if (Notification.permission === 'granted') {
      // Check if tab is visible
      if (document.visibilityState === 'visible') {
        // Optional: still show notification or just skip
      }
      
      const notification = new Notification(title, {
        icon: '/favicon.ico', // Default icon
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
}
