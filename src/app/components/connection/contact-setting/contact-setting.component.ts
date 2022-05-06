import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {ModalController, NavParams} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {EventService} from '../../../services/event/event.service';
import {FunctionService} from '../../../services/firebase/function/function.service';
import {UtilService} from '../../../services/util/util.service';

@Component({
  selector: 'app-contact-setting',
  templateUrl: './contact-setting.component.html',
  styleUrls: ['./contact-setting.component.scss'],
})
export class ContactSettingComponent implements OnInit {

  contactSettingsForm = new FormGroup({
    phoneNumberState: new FormControl(false),
    phoneNumber: new FormControl(''),
    emailState: new FormControl(false),
    email: new FormControl(''),
    chatState: new FormControl(true)
  });

  selectedUser;
  activeState: string;
  contactInfo;
  hostBookList = [];
  rentBookList = [];

  constructor(private navParams: NavParams,
              public modalController: ModalController,
              private apiService: ApiService,
              private cacheService: CacheService,
              private eventService: EventService,
              private functionService: FunctionService,
              private utilService: UtilService) {

    this.selectedUser = navParams.get('selectedUser');
    this.activeState = navParams.get('activeState');
    this.contactInfo = navParams.get('contactInfo');
    this.hostBookList = navParams.get('hostBookList');
    this.rentBookList = navParams.get('rentBookList');

    if (this.contactInfo) {
      this.contactSettingsForm.patchValue({
        phoneNumberState: this.contactInfo.phoneNumberState,
        phoneNumber: this.contactInfo.phoneNumber,
        emailState: this.contactInfo.emailState,
        email: this.contactInfo.email,
        chatState: this.contactInfo.chatState
      });
    }
  }

  ngOnInit() {
  }


  changePhoneNumber(event) {
    if (event.checked) {
      this.contactSettingsForm.controls.phoneNumber.enable();
    } else {
      this.contactSettingsForm.controls.phoneNumber.disable();
    }
  }

  changeEmail(event) {
    if (event.checked) {
      this.contactSettingsForm.controls.email.enable();
    } else {
      this.contactSettingsForm.controls.email.disable();
    }
  }

  deny() {
    this.utilService.presentLoading(3000).then();
    this.apiService.denyConnection(this.cacheService.user.uid, this.selectedUser.uid, this.activeState).then(() => {
      this.eventService.executedPublish({executed: true});
      const notificationData = {
        fcmToken: this.selectedUser.fcmToken,
        title: 'Deny Request',
        body: 'From ' + this.cacheService.user.username
      };
      this.functionService.pushNotification(notificationData).then().catch();
    });
  }

  block() {
    this.utilService.presentLoading(3000).then();
    this.apiService.denyConnection(this.cacheService.user.uid, this.selectedUser.uid, this.activeState).then(() => {
      this.eventService.executedPublish({executed: true});
      const notificationData = {
        fcmToken: this.selectedUser.fcmToken,
        title: 'Deny Request',
        body: 'From ' + this.cacheService.user.username
      };
      this.functionService.pushNotification(notificationData).then().catch();
      this.modalController.dismiss().then();
    });
  }

  delete() {
    this.utilService.presentLoading(3000).then();
    this.apiService.deleteConnection(this.cacheService.user.uid, this.selectedUser.uid).then(() => {
      this.eventService.executedPublish({executed: true});
      this.modalController.dismiss().then();
    });
  }

  save() {
    this.utilService.presentLoading(3000).then();
    this.apiService.updateConnectionContactSetting(this.cacheService.user.uid, this.selectedUser.uid, this.contactSettingsForm.value)
      .then(() => this.modalController.dismiss({contactInfo: this.contactSettingsForm.value}));
  }

}
