import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';

import {ModalController, Platform} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {UtilService} from '../../../services/util/util.service';

import {Plugins} from '@capacitor/core';

const {Browser} = Plugins;

export interface Profile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  zipCode: string;
}

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {

  currentProfile: Profile;
  newProfile: Profile;
  updatedFields = [];

  validateWarning: string;

  constructor(private platform: Platform,
              public modalController: ModalController,
              private apiService: ApiService,
              private cacheService: CacheService,
              private utilService: UtilService) {

    this.currentProfile = {
      firstName: this.cacheService.user.firstName ? this.cacheService.user.firstName : '',
      lastName: this.cacheService.user.lastName ? this.cacheService.user.lastName : '',
      username: this.cacheService.user.username,
      email: this.cacheService.user.email,
      phone: this.cacheService.user.phone,
      zipCode: this.cacheService.user.address.zipCode
    };

    this.newProfile = {
      firstName: this.cacheService.user.firstName ? this.cacheService.user.firstName : '',
      lastName: this.cacheService.user.lastName ? this.cacheService.user.lastName : '',
      username: this.cacheService.user.username,
      email: this.cacheService.user.email,
      phone: this.cacheService.user.phone,
      zipCode: this.cacheService.user.address.zipCode
    };
  }

  ngOnInit() {
  }


  async openTermsConditionsPage() {
    await Browser.open({url: 'https://goshare360.com/privacy-policy-2/'});
  }

  async openContactPage() {
    await Browser.open({url: 'https://goshare360.com/contact/'});
  }

  save() {
    this.compareProfile().then(resp => {
      if (resp === true) {
        this.updateUser();
      } else {
        Swal.fire('There isn\'t any update').then();
      }
    });
  }

  compareProfile(): Promise<any> {

    let updatedFlag = false;
    this.updatedFields = [];

    return new Promise(resolve => {
      for (const key in this.newProfile) {
        if (this.newProfile.hasOwnProperty(key)) {
          if (this.currentProfile[key] !== this.newProfile[key]) {
            this.updatedFields.push(key);
            updatedFlag = true;
          }
        }
      }

      resolve(updatedFlag);
    });
  }

  updateUser() {
    if (this.validate()) {

      this.utilService.presentLoading(3000).then();
      const updatedProfile = {};

      for (const field of this.updatedFields) {
        updatedProfile[field] = this.newProfile[field];
      }

      this.apiService.updateProfile(this.cacheService.user.uid, updatedProfile)
        .then(() => {
          this.currentProfile = this.newProfile;
          this.cacheService.updateUser(this.cacheService.user.uid).then(() => this.utilService.dismissLoading());
        });
    } else {
      this.utilService.showToast(this.validateWarning).then();
    }
  }

  validate(): boolean {

    let valid = true;

    if (!this.newProfile.firstName && this.newProfile.firstName === '') {
      valid = false;
      this.validateWarning = 'First Name is required';
    } else if (!this.newProfile.lastName && this.newProfile.lastName === '') {
      valid = false;
      this.validateWarning = 'Last Name is required';
    } else if (!this.newProfile.username && this.newProfile.username === '') {
      valid = false;
      this.validateWarning = 'Username is required';
    } else if (!this.newProfile.phone && this.newProfile.phone === '') {
      valid = false;
      this.validateWarning = 'Phone Number is required';
    }

    return valid;
  }

}
