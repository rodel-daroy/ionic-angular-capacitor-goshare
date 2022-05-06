import {Injectable} from '@angular/core';
import {AngularFireMessaging} from '@angular/fire/messaging';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  token = null;

  constructor(private angularFireMessaging: AngularFireMessaging) {
  }

  requestPermission() {
    return this.angularFireMessaging.requestToken.pipe(
      tap(token => {
      })
    );
  }

  getMessages() {
    return this.angularFireMessaging.messages;
  }

  deleteToken() {
    if (this.token) {
      this.angularFireMessaging.deleteToken(this.token);
      this.token = null;
    }
  }

}
