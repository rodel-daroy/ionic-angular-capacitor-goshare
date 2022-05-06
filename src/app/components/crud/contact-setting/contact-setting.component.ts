import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {ModalController, NavParams, Platform} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
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
    chatState: new FormControl(false)
  });

  hostIndex: number;
  renterIndex: number;

  crud;
  role: string;

  constructor(private platform: Platform,
              private navParams: NavParams,
              public modalController: ModalController,
              private apiService: ApiService,
              private cacheService: CacheService,
              private utilService: UtilService) {

    this.crud = navParams.get('crud');
    this.role = navParams.get('role');

    if ((this.role === 'host') && this.crud.hasOwnProperty('host_contact_settings')) {
      this.hostIndex = navParams.get('index');
      this.contactSettingsForm.patchValue({
        phoneNumberState: this.crud.host_contact_settings.phoneNumberState ? this.crud.host_contact_settings.phoneNumberState : false,
        phoneNumber: this.crud.host_contact_settings.phoneNumber ? this.crud.host_contact_settings.phoneNumber : '',
        emailState: this.crud.host_contact_settings.emailState ? this.crud.host_contact_settings.emailState : false,
        email: this.crud.host_contact_settings.email ? this.crud.host_contact_settings.email : '',
        chatState: this.crud.host_contact_settings.chatState ? this.crud.host_contact_settings.chatState : false
      });
    }
    if ((this.role === 'renter')) {
      this.renterIndex = this.crud.book_list.findIndex((book) => book.uid === this.cacheService.user.uid);
      if (this.renterIndex > -1) {
        this.contactSettingsForm.patchValue({
          phoneNumberState: this.crud.contact_settings_list[this.renterIndex].phoneNumberState ? this.crud.contact_settings_list[this.renterIndex].phoneNumberState : false,
          phoneNumber: this.crud.contact_settings_list[this.renterIndex].phoneNumber ? this.crud.contact_settings_list[this.renterIndex].phoneNumber : '',
          emailState: this.crud.contact_settings_list[this.renterIndex].emailState ? this.crud.contact_settings_list[this.renterIndex].emailState : false,
          email: this.crud.contact_settings_list[this.renterIndex].email ? this.crud.contact_settings_list[this.renterIndex].email : '',
          chatState: this.crud.contact_settings_list[this.renterIndex].chatState ? this.crud.contact_settings_list[this.renterIndex].chatState : false
        });
      }
    }
    if (!this.contactSettingsForm.value.phoneNumberState) {
      this.contactSettingsForm.controls.phoneNumber.disable();
    }
    if (!this.contactSettingsForm.value.emailState) {
      this.contactSettingsForm.controls.email.disable();
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

  block() {

    const blockedContacts = this.cacheService.user.blocked_contacts ? this.cacheService.user.blocked_contacts : [];

    if (blockedContacts.findIndex((contact) => contact.uid === this.crud.renter.uid) > -1) {
      this.utilService.showToast('This contact was already blocked').then();
    } else {
      this.utilService.presentLoading(3000).then();
      this.apiService.denyBook(this.crud, this.hostIndex).then(() => this.modalController.dismiss());
    }
  }

  cancel() {
  }

  save() {
    this.utilService.presentLoading(3000).then();
    this.apiService.saveContactInfo(this.crud, this.contactSettingsForm.value, this.role, this.renterIndex)
      .then(() => this.modalController.dismiss());
  }

}
