import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {finalize} from 'rxjs/operators';

import {AlertController, IonContent, ModalController, NavParams, Platform} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {FunctionService} from '../../../services/firebase/function/function.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

import {ShareLocationComponent} from '../share-location/share-location.component';
import {ShowImageComponent} from '../show-image/show-image.component';

import {DATABASE, STORAGE} from '../../../app.constant';

import {AngularFireDatabase} from '@angular/fire/database';
import {AngularFireStorage} from '@angular/fire/storage';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {

  chatUser: any;
  user: any;
  editorMsg = '';
  chatRefUrl: string;

  conversations: any[] = [];

  database: any;

  @ViewChild(IonContent) content: IonContent;

  constructor(private router: Router,
              private platform: Platform,
              private alertController: AlertController,
              private navParams: NavParams,
              public modalController: ModalController,
              private apiService: ApiService,
              private cacheService: CacheService,
              private functionService: FunctionService,
              private utilService: UtilService,
              public variableService: VariableService,
              private angularFireDatabase: AngularFireDatabase,
              private angularFireStorage: AngularFireStorage,
              private changeDetectorRef: ChangeDetectorRef) {

    this.user = this.cacheService.user;
    this.chatUser = navParams.get('receiver');

    this.database = this.angularFireDatabase.database;
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.utilService.presentLoading(10000).then(() => this.getFirstLoadedContent());
  }


  async getFirstLoadedContent() {

    this.chatRefUrl = `${DATABASE.CHAT}/${this.user.uid}|${this.chatUser ? this.chatUser.uid : this.user.uid}`;

    const usersValue = await this.database.ref(DATABASE.USERS).once('value');
    const usersVal = usersValue.val();

    const chatRefValue1 = await this.database.ref(this.chatRefUrl).orderByChild('createdAt').once('value');
    if (chatRefValue1.val()) {
      const messages = [];

      const chatRefVal1 = chatRefValue1.val();
      for (const key in chatRefVal1) {
        if (chatRefVal1.hasOwnProperty(key) && key !== 'last_message' && key !== 'unread') {
          if (chatRefVal1[key].text) {
            messages.push({
              text: chatRefVal1[key].text,
              user: {uid: chatRefVal1[key].user, ...usersVal[chatRefVal1[key].user]},
              createdAt: chatRefVal1[key].createdAt,
              status: 'success'
            });
          }
          if (chatRefVal1[key].image) {
            messages.push({
              image: chatRefVal1[key].image,
              user: {uid: chatRefVal1[key].user, ...usersVal[chatRefVal1[key].user]},
              createdAt: chatRefVal1[key].createdAt,
              status: 'success'
            });
          }
          if (chatRefVal1[key].map) {
            messages.push({
              map: chatRefVal1[key].map,
              user: {uid: chatRefVal1[key].user, ...usersVal[chatRefVal1[key].user]},
              createdAt: chatRefVal1[key].createdAt,
              status: 'success'
            });
          }
        }
      }
      this.conversations = messages;
      this.changeDetectorRef.detectChanges();
      this.utilService.dismissLoading();
      this.scrollToBottom();
    } else {
      this.chatRefUrl = `${DATABASE.CHAT}/${this.chatUser ? this.chatUser.uid : this.user.uid}|${this.user.uid}`;
      const messages = [];

      const chatRefValue2 = await this.database.ref(this.chatRefUrl).orderByChild('createdAt').once('value');
      const chatRefVal2 = chatRefValue2.val();
      for (const key in chatRefVal2) {
        if (chatRefVal2.hasOwnProperty(key) && key !== 'last_message' && key !== 'unread') {
          if (chatRefVal2[key].text) {
            messages.push({
              text: chatRefVal2[key].text,
              user: {uid: chatRefVal2[key].user, ...usersVal[chatRefVal2[key].user]},
              createdAt: chatRefVal2[key].createdAt,
              status: 'success'
            });
          }
          if (chatRefVal2[key].image) {
            messages.push({
              image: chatRefVal2[key].image,
              user: {uid: chatRefVal2[key].user, ...usersVal[chatRefVal2[key].user]},
              createdAt: chatRefVal2[key].createdAt,
              status: 'success'
            });
          }
          if (chatRefVal2[key].map) {
            messages.push({
              map: chatRefVal2[key].map,
              user: {uid: chatRefVal2[key].user, ...usersVal[chatRefVal2[key].user]},
              createdAt: chatRefVal2[key].createdAt,
              status: 'success'
            });
          }
        }
      }
      this.conversations = messages;
      this.changeDetectorRef.detectChanges();
      this.utilService.dismissLoading();
      this.scrollToBottom();
    }

    this.removeUnreadState();
    this.getRealtimeMessages();
  }

  removeUnreadState() {
    this.database.ref(`${DATABASE.CHAT}/${this.user.uid}|${this.chatUser ? this.chatUser.uid : this.user.uid}`).once('value').then(snapshot => {
      if (snapshot.exists()) {
        this.database.ref(`${DATABASE.CHAT}/${this.user.uid}|${this.chatUser ? this.chatUser.uid : this.user.uid}`).child(`unread/${this.user.uid}`).set(0).then();
      } else {
        this.database.ref(`${DATABASE.CHAT}/${this.chatUser ? this.chatUser.uid : this.user.uid}|${this.user.uid}`).once('value').then(snapshot2 => {
          if (snapshot2.exists()) {
            this.database.ref(`${DATABASE.CHAT}/${this.chatUser ? this.chatUser.uid : this.user.uid}|${this.user.uid}`).child(`unread/${this.user.uid}`).set(0).then();
          }
        });
      }
    });
  }

  getRealtimeMessages() {
    this.angularFireDatabase.database.ref(this.chatRefUrl).orderByChild('createdAt').on('value', snapshot => {
      if (snapshot.exists()) {

        const arrSnapshot = [];

        snapshot.forEach(snap => {
          if (snap.key !== 'last_message' && snap.key !== 'unread') {
            arrSnapshot.push(snap);
          }
        });

        if (arrSnapshot.length > this.conversations.length) {
          const lastSnap = arrSnapshot[arrSnapshot.length - 1].val();

          this.apiService.getUser(lastSnap.user).then(resp => {
            if (lastSnap.hasOwnProperty('text')) {
              this.conversations.push({
                text: lastSnap.text, user: resp, createdAt: lastSnap.createdAt, status: 'success'
              });
            }
            if (lastSnap.hasOwnProperty('image')) {
              this.conversations.push({
                image: lastSnap.image, user: resp, createdAt: lastSnap.createdAt, status: 'success'
              });
            }
            if (lastSnap.hasOwnProperty('map')) {
              this.conversations.push({
                map: lastSnap.map, user: resp, createdAt: lastSnap.createdAt, status: 'success'
              });
            }
            this.changeDetectorRef.detectChanges();
            this.scrollToBottom();
          });
        }
      }
    });
  }

  async openShowImage(image) {

    const modal = await this.modalController.create({
      component: ShowImageComponent,
      componentProps: {image}
    });

    return await modal.present();
  }

  async openLocationDialog(map) {

    const location = map.position.lat + ',' + map.position.lng;

    const alert = await this.alertController.create({
      header: 'Display Available Map Applications to open map location',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Ok',
          handler: () => {
            if (this.platform.is('cordova')) {
              if (this.platform.is('android')) {
                window.location.href = 'geo:' + location;
              } else {
                window.location.href = 'maps://maps.apple.com/?q=' + location;
              }
            } else {
              const url = 'http://www.google.com/maps/place/' + location;
              window.open(url, '_blank', 'location=yes');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  sendMsg() {

    if (!this.editorMsg.trim()) {
      return;
    }

    const newMsg = {
      text: this.editorMsg,
      user: this.user.uid,
      createdAt: new Date().getTime(),
      status: 'pending'
    };

    this.editorMsg = '';
    this.apiService.sendMessage(this.chatRefUrl, this.user, this.chatUser ? this.chatUser : this.user, newMsg)
      .then(() => {
        this.scrollToBottom();
        if (this.chatUser.fcmToken && this.chatUser.fcmToken !== '') {
          const data = {
            fcmToken: this.chatUser.fcmToken,
            title: 'Incoming Chat Messages',
            body: 'From ' + this.cacheService.user?.username
          };
          this.functionService.pushNotification(data).then().catch();
        }
      });
  }

  something($event: any) {
    $event.preventDefault();
  }

  sendImage() {
    document.getElementById('imageMessage').click();
  }

  imageChangeEvent(event: any) {

    this.utilService.presentLoading().then();

    const fileName = new Date().toDateString();
    const fileRef = this.angularFireStorage.ref(STORAGE.CHAT_MESSAGE_IMAGES + '/' + fileName);
    const task = this.angularFireStorage.upload(STORAGE.CHAT_MESSAGE_IMAGES + '/' + fileName, event.target.files[0]);

    task.snapshotChanges()
      .pipe(
        finalize(() => {
          const downloadURL = fileRef.getDownloadURL();
          downloadURL.subscribe(url => {
            if (url) {
              const newMsg = {
                image: url,
                user: this.user.uid,
                createdAt: new Date().getTime(),
                status: 'pending'
              };
              this.apiService.sendMessage(this.chatRefUrl, this.user, this.chatUser ? this.chatUser : this.user, newMsg)
                .then(() => {
                  this.utilService.dismissLoading();
                  this.scrollToBottom();
                  if (this.chatUser.fcmToken && this.chatUser.fcmToken !== '') {
                    const data = {
                      fcmToken: this.chatUser.fcmToken,
                      title: 'Incoming Chat Messages',
                      body: 'From ' + this.cacheService.user?.username
                    };
                    this.functionService.pushNotification(data).then().catch();
                  }
                }).catch(() => this.utilService.dismissLoading());
            }
          });
        })
      ).subscribe(url => {
      if (url) {
        console.log();
      }
    });
  }

  sendVideo() {
    document.getElementById('videoMessage').click();
  }

  videoChangeEvent(event) {

    this.utilService.presentLoading().then();

    const fileName = new Date().toDateString();
    const fileRef = this.angularFireStorage.ref(STORAGE.CHAT_MESSAGE_VIDEOS + '/' + fileName);
    const task = this.angularFireStorage.upload(STORAGE.CHAT_MESSAGE_VIDEOS + '/' + fileName, event.target.files[0]);

    task.snapshotChanges()
      .pipe(
        finalize(() => {
          const downloadURL = fileRef.getDownloadURL();
          downloadURL.subscribe(url => {
            if (url) {
              const newMsg = {
                video: url,
                user: this.user.uid,
                createdAt: new Date().getTime(),
                status: 'pending'
              };
              this.apiService.sendMessage(this.chatRefUrl, this.user, this.chatUser ? this.chatUser : this.user, newMsg)
                .then(() => {
                  this.utilService.dismissLoading();
                  this.scrollToBottom();
                  if (this.chatUser.fcmToken && this.chatUser.fcmToken !== '') {
                    const data = {
                      fcmToken: this.chatUser.fcmToken,
                      title: 'Incoming Chat Messages',
                      body: 'From ' + this.cacheService.user?.username
                    };
                    this.functionService.pushNotification(data).then().catch();
                  }
                }).catch(() => this.utilService.dismissLoading());
            }
          });
        })
      ).subscribe(url => {
      if (url) {
        console.log();
      }
    });
  }

  async sendLocation() {

    const modal = await this.modalController.create({component: ShareLocationComponent});

    modal.onDidDismiss().then(resp => {
      if (resp.data) {
        const newMsg = {
          map: resp.data,
          user: this.user.uid,
          createdAt: new Date().getTime(),
          status: 'pending'
        };
        this.utilService.presentLoading(3000);
        this.apiService.sendMessage(this.chatRefUrl, this.user, this.chatUser ? this.chatUser : this.user, newMsg)
          .then(() => {
            this.scrollToBottom();
            if (this.chatUser.fcmToken && this.chatUser.fcmToken !== '') {
              const data = {
                fcmToken: this.chatUser.fcmToken,
                title: 'Incoming Chat Messages',
                body: 'From ' + this.cacheService.user?.username
              };
              this.functionService.pushNotification(data).then().catch();
            }
          });
      }
    });

    return await modal.present();
  }

  userTyping() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => this.content.scrollToBottom(50), 1000);
  }

}
