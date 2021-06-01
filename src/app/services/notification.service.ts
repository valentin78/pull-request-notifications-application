import {Injectable} from '@angular/core';

@Injectable()
export class NotificationService {
  private requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission !== 'denied') {
      return Notification.requestPermission();
    }

    return new Promise<NotificationPermission>(() => Notification.permission);
  }

  sendNotification(title: string, options: NotificationOptions) {
    this.requestPermission()
      .then(permission => {
        if (permission === 'granted') {
          options.icon = options.icon || 'favicon.ico';
          const notification = new Notification(title, options);
        }
      });
  }

  setBadge(options: { title?: string, message?: string, color?: string }) {
    if (options.message) {
      // @ts-ignore
      chrome.browserAction.setBadgeText({text: options.message});
    }

    if (options.color) {
      // @ts-ignore
      chrome.browserAction.setBadgeBackgroundColor({color: options.color});
    }

    if (options.title) {
      // @ts-ignore
      chrome.browserAction.setTitle({title: options.title});
    }
  }
}
