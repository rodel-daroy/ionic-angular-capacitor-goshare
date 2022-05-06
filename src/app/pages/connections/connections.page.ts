import {AfterViewInit, ChangeDetectorRef, Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {formatDate} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import * as moment from 'moment';

import {AlertController, IonSlides, ModalController, Platform} from '@ionic/angular';

import {ApiService} from '../../services/firebase/api/api.service';
import {CacheService} from '../../services/cache/cache.service';
import {EventService} from '../../services/event/event.service';
import {FunctionService} from '../../services/firebase/function/function.service';
import {UtilService} from '../../services/util/util.service';
import {VariableService} from '../../services/data/variable.service';

import {ArchiveListComponent} from '../../components/connection/archive-list/archive-list.component';
import {ContactSettingComponent} from '../../components/connection/contact-setting/contact-setting.component';
import {ShareLocationComponent} from '../../components/connection/share-location/share-location.component';
import {ShowImageComponent} from '../../components/connection/show-image/show-image.component';
import {ChatComponent} from '../../components/connection/chat/chat.component';

import {STORAGE} from '../../app.constant';

import {AngularFireDatabase} from '@angular/fire/database';
import {AngularFireStorage} from '@angular/fire/storage';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.page.html',
  styleUrls: ['./connections.page.scss'],
})
export class ConnectionsPage implements OnInit, AfterViewInit, OnDestroy {

  mobilePlatform: boolean;
  showDetails = false;
  title = 'Incoming/Outgoing Connection';
  currentSegment = 'allChats';
  showingInit = true;

  pendingConnectionUsers = [];
  pendingActiveIndex: number;
  approvedConnectionUsers = [];
  approvedActiveIndex: number;

  selectedUser;
  activeState = '';
  currentSlideIndex = 0;
  rentBookList = [];
  hostBookList = [];
  contactInfo;
  messages = [];
  chatRef: string;

  typingMessage = '';

  typingTimer;

  @ViewChild('slides') slides: IonSlides;

  constructor(@Inject(LOCALE_ID) private locale: string,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              public platform: Platform,
              private alertController: AlertController,
              private modalController: ModalController,
              private apiService: ApiService,
              public cacheService: CacheService,
              private eventService: EventService,
              private functionService: FunctionService,
              private utilService: UtilService,
              public variableService: VariableService,
              private angularFireDatabase: AngularFireDatabase,
              private angularFireStorage: AngularFireStorage,
              private changeDetectorRef: ChangeDetectorRef) {

    this.activatedRoute.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        const chatUser = this.router.getCurrentNavigation().extras.state.user;
        this.openChat(chatUser).then();
      }
    });

    this.eventService.getExecuted().subscribe(resp => {
      if (resp.executed) {
        this.getConnectionUsers();
      }
    });
  }

  ngOnInit() {
    this.mobilePlatform = window.innerWidth < 600;
  }

  ngAfterViewInit() {
    if (this.cacheService.user) {
      this.getConnectionUsers();
    } else {
      this.cacheService.getUser().then(resp => {
        if (resp) {
          this.getConnectionUsers();
        } else {
          this.router.navigate(['login-new']).then();
        }
      });
    }
  }

  ngOnDestroy() {
    this.utilService.dismissLoading();
  }


  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  async openChat(user) {
    const modal = await this.modalController.create({
      component: ChatComponent,
      componentProps: {receiver: user}
    });

    await modal.present();
  }

  getConnectionUsers() {
    this.utilService.presentLoading(10000).then(() => {
      this.apiService.connectionUsers(this.cacheService.user.uid).then(resp => {
        this.pendingConnectionUsers = resp.pending;
        this.approvedConnectionUsers = resp.approved;
        this.utilService.dismissLoading();
      });
    });
  }

  getFormattedDate(date) {

    const REFERENCE = moment();
    const TODAY = REFERENCE.clone().startOf('day');
    const YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
    const A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');

    if (moment(date).isSame(TODAY, 'd')) {
      return `Today, ${moment(date).format('hh:mm a')}`;
    } else if (moment(date).isSame(YESTERDAY, 'd')) {
      return 'Yesterday';
    } else if (moment(date).isSame(A_WEEK_OLD, 'd')) {
      return moment(date).format('DDD');
    }

    return moment(date).format('MM/DD/YYYY');
  }

  dateFormat(date) {
    return (moment(date.toDate()).format('MM/DD/YYYY') + '\n' + date.toDate().toLocaleTimeString('en-US'));
  }

  async openArchiveList() {
    const modal = await this.modalController.create({component: ArchiveListComponent});

    return await modal.present();
  }

  segmentChanged() {
    if (this.currentSegment === 'allChats') {
      this.title = 'Incoming/Outgoing Connection';
    } else if (this.currentSegment === 'host') {
      this.title = 'Incoming Connection';
    } else if (this.currentSegment === 'renter') {
      this.title = 'Outgoing Connection';
    }
  }

  selectUser(user, i: number, state: string) {

    this.showingInit = false;
    this.selectedUser = user;
    this.activeState = state;

    if (this.activeState === 'pending') {
      this.pendingActiveIndex = i;
    } else {
      this.approvedActiveIndex = i;
    }

    this.utilService.presentLoading(10000).then(() => {
      this.apiService.connectionInfos(this.cacheService.user.uid, this.selectedUser.uid, this.activeState).then(resp => {
        this.rentBookList = resp.rentBookList;
        this.hostBookList = resp.hostBookList;
        this.contactInfo = resp.contactInfo;
        this.messages = resp.messages;
        this.chatRef = resp.chatRef;
        this.getRealtimeMessages();
        this.readCheckMark();
        this.scrollToBottom();
        this.utilService.dismissLoading();
      });
    });
  }

  readCheckMark() {
    this.apiService.readCheckMark(this.chatRef, this.selectedUser.uid).then();
  }

  getRealtimeMessages() {
    this.angularFireDatabase.database.ref(this.chatRef).orderByChild('createdAt').on('value', snapshot => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => this.continueWorking(snapshot), 1000);
    });
  }

  continueWorking(snapshot) {
    if (snapshot.exists()) {

      const arrSnapshot = [];

      snapshot.forEach(snap => {
        if (snap.key !== 'last_message' && snap.key !== 'unread') {
          arrSnapshot.push(snap);
        }
      });

      if (arrSnapshot.length > this.messages.length) {

        const lastSnap = arrSnapshot[arrSnapshot.length - 1].val();

        this.apiService.getUser(lastSnap.user).then(resp => {
          if (lastSnap.hasOwnProperty('text')) {
            this.messages.push({messageId: lastSnap.key, text: lastSnap.text, user: resp, createdAt: lastSnap.createdAt, status: 'success'});
          }
          if (lastSnap.hasOwnProperty('image')) {
            this.messages.push({messageId: lastSnap.key, image: lastSnap.image, user: resp, createdAt: lastSnap.createdAt, status: 'success'});
          }
          if (lastSnap.hasOwnProperty('map')) {
            this.messages.push({messageId: lastSnap.key, map: lastSnap.map, user: resp, createdAt: lastSnap.createdAt, status: 'success'});
          }
          this.changeDetectorRef.detectChanges();
          this.scrollToBottom();
          this.lastMessageRead(lastSnap.key);
        });
      }
    }
  }

  lastMessageRead(lastKey) {
    this.apiService.lastMessageRead(this.chatRef, lastKey, this.selectedUser.uid).then();
  }

  formatDate(date) {
    return formatDate(date, 'hh:mm', this.locale);
  }


  closeWindow() {
    this.showingInit = true;
    this.selectedUser = null;
  }

  slideLoaded() {
    this.title = 'Incoming Connection';
  }

  slideChanged() {
    this.slides.getActiveIndex().then((index: number) => {

      this.currentSlideIndex = index;

      if (this.currentSlideIndex === 0) {
        this.title = 'Incoming Connection';
      } else if (this.currentSlideIndex === 1) {
        this.title = 'Outgoing Connection';
      }
    });
  }

  approveConnection() {
    this.apiService.approveConnection(this.cacheService.user.uid, this.selectedUser.uid).then(async () => {
      const alert = await this.alertController.create({
        header: 'You can now chat with ' + this.selectedUser.username,
        buttons: [{
          text: 'Ok',
          handler: () => {
            this.closeWindow();
            this.getConnectionUsers();
            const notificationData = {
              fcmToken: this.selectedUser.fcmToken,
              title: 'Approve Request',
              body: 'From ' + this.cacheService.user.username
            };
            this.functionService.pushNotification(notificationData).then().catch();
          }
        }]
      });

      await alert.present();
    });
  }

  denyConnection() {
    this.apiService.denyConnection(this.cacheService.user.uid, this.selectedUser.uid, this.activeState).then(() => {

      this.getConnectionUsers();

      const notificationData = {
        fcmToken: this.selectedUser.fcmToken,
        title: 'Deny Request',
        body: 'From ' + this.cacheService.user.username
      };

      this.functionService.pushNotification(notificationData).then().catch();
    });
  }

  async openContactSettings() {
    const modal = await this.modalController.create({
      component: ContactSettingComponent,
      componentProps: {
        selectedUser: this.selectedUser,
        activeState: this.activeState,
        contactInfo: this.contactInfo,
        hostBookList: this.hostBookList,
        rentBookList: this.rentBookList
      }
    });

    modal.onDidDismiss().then(overlayEventResult => {
      if (overlayEventResult.data) {
        this.contactInfo = overlayEventResult.data.contactInfo;
      }
    });

    return await modal.present();
  }


  sendMessage() {

    if (!this.typingMessage.trim()) {
      return;
    }

    const newTextMessage = {
      text: this.typingMessage,
      user: this.cacheService.user.uid,
      status: 'pending',
      createdAt: new Date().getTime()
    };

    this.typingMessage = '';

    this.apiService.sendMessage(this.chatRef, this.cacheService.user, this.selectedUser, newTextMessage)
      .then(() => {
        this.scrollToBottom();
        this.chatNotification();
      });
  }

  something($event) {
    $event.preventDefault();
  }

  sendImage() {
    document.getElementById('imageMessage').click();
  }

  imageChangeEvent(event: any) {

    this.utilService.presentLoading(5000).then();

    const fileName = new Date().toDateString();
    const fileRef = this.angularFireStorage.ref(STORAGE.CHAT_MESSAGE_IMAGES + '/' + fileName);
    const task = this.angularFireStorage.upload(STORAGE.CHAT_MESSAGE_IMAGES + '/' + fileName, event.target.files[0]);

    task.snapshotChanges()
      .pipe(
        finalize(() => {
          const downloadURL = fileRef.getDownloadURL();
          downloadURL.subscribe(url => {
            if (url) {
              const newImageMessage = {
                image: url,
                user: this.cacheService.user.uid,
                status: 'pending',
                createdAt: new Date().getTime()
              };
              this.utilService.dismissLoading();
              this.apiService.sendMessage(this.chatRef, this.cacheService.user, this.selectedUser, newImageMessage)
                .then(() => {
                  this.scrollToBottom();
                  this.chatNotification();
                });
            }
          });
        })
      ).subscribe();
  }

  async sendLocation() {
    const modal = await this.modalController.create({component: ShareLocationComponent});

    modal.onDidDismiss().then(overlayEventResult => {
      if (overlayEventResult.data) {
        const newLocationMessage = {
          map: overlayEventResult.data,
          user: this.cacheService.user.uid,
          createdAt: new Date().getTime(),
          status: 'pending'
        };
        this.utilService.presentLoading(3000);
        this.apiService.sendMessage(this.chatRef, this.cacheService.user, this.selectedUser, newLocationMessage)
          .then(() => {
            this.scrollToBottom();
            this.chatNotification();
          });
      }
    });

    return await modal.present();
  }

  messageTyping() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      const content = document.getElementById('chat-container');
      const parent = document.getElementById('chat-parent');
      const scrollOptions = {
        left: 0,
        top: content?.offsetHeight
      };
      parent?.scrollTo(scrollOptions);
    }, 1000);
  }

  chatNotification() {
    if (this.selectedUser.fcmToken !== '') {
      const notificationData = {
        fcmToken: this.selectedUser.fcmToken,
        title: 'Incoming Chat Messages',
        body: 'From ' + this.cacheService.user?.username
      };

      this.functionService.pushNotification(notificationData).then().catch();
    }
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

  async deleteMessage(message, index) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you really want to delete this message?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Yes',
          handler: () => {
            this.apiService.deleteMessage(this.chatRef, message.messageId);
            this.messages.splice(index, 1);
            this.changeDetectorRef.detectChanges();
          }
        }
      ]
    });

    await alert.present();
  }

}
