import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FunctionService {

  EMAIL_HOST = 'https://us-central1-goshare360.cloudfunctions.net/email/sendEmail';
  NOTIFICATION_HOST = 'https://us-central1-goshare360.cloudfunctions.net/notification/sendRequest';

  constructor(private httpClient: HttpClient) { }

  sendEmail(data) {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.post(this.EMAIL_HOST, data).subscribe((resp: any) => {
        if (resp.success === 1) {
          resolve();
        } else {
          reject();
        }
      }, () => {
        reject();
      });
    });
  }

  pushNotification(data) {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.post(this.NOTIFICATION_HOST, data).subscribe((resp: any) => {
        if (resp.success === 1) {
          resolve();
        } else {
          reject();
        }
      }, () => {
        reject();
      });
    });
  }

}
