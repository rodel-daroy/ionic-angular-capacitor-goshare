import {Injectable} from '@angular/core';

import {CacheService} from '../../cache/cache.service';
import {MessagingService} from '../messaging/messaging.service';
import {UtilService} from '../../util/util.service';

import {
  Capacitor,
  Plugins,
  PushNotification,
  PushNotificationActionPerformed,
  PushNotificationToken
} from '@capacitor/core';

const {PushNotifications, LocalNotifications} = Plugins;

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(private cacheService: CacheService,
              private messagingService: MessagingService,
              private utilService: UtilService) {
    this.initializePushNotification();
  }

  initializePushNotification() {
    if (Capacitor.platform !== 'web') {
      this.registerPushNotification();
    } else {
      this.requestPermission();
      this.listenForMessages();
    }
  }

  registerPushNotification() {
    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        PushNotifications.register();
      } else {
      }
    });

    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        this.cacheService.setFcmToken({token, refresh: true});
      }
    );

    PushNotifications.addListener('registrationError',
      (error: any) => {
      }
    );

    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        this.initializeLocalNotification(notification);
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
      }
    );
  }

  resetBadgeCount() {
    PushNotifications.removeAllDeliveredNotifications();
  }

  async initializeLocalNotification(notification) {
    const notifs = await LocalNotifications.schedule({
      notifications: [
        {
          title: notification?.title,
          body: notification?.body,
          id: 1,
          schedule: {at: new Date(Date.now() + 1000 * 5)},
          sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null
        }
      ]
    });
  }


  listenForMessages() {
    this.messagingService.getMessages().subscribe((msg: any) => {
      this.utilService.showAlert(msg.notification.title, msg.notification.body);
    });
  }

  requestPermission() {
    this.messagingService.requestPermission().subscribe(
      token => {
        this.cacheService.setFcmToken({token, refresh: true});
      },
      (err) => console.log('requestPermission ==========>', err)
    );
  }

  deleteToken() {
    this.messagingService.deleteToken();
  }

}
