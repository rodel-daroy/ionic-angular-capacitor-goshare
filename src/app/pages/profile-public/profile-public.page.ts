import { Component, OnDestroy, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';

import {ActionSheetController, ModalController, Platform} from '@ionic/angular';

import {ApiService} from '../../services/firebase/api/api.service';
import {CacheService} from '../../services/cache/cache.service';
import {UtilService} from '../../services/util/util.service';
import {VariableService} from '../../services/data/variable.service';

@Component({
  selector: 'app-profile-public',
  templateUrl: './profile-public.page.html',
  styleUrls: ['./profile-public.page.scss'],
})
export class ProfilePublicPage implements OnInit, OnDestroy {

  desktopPlatform: boolean;

  publicUser;

  expiredDays = 60;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private platform: Platform,
              private actionSheetController: ActionSheetController,
              private modalController: ModalController,
              private apiService: ApiService,
              public cacheService: CacheService,
              private utilService: UtilService,
              public variableService: VariableService) {

    this.activatedRoute.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.publicUser = this.router.getCurrentNavigation().extras.state.user;
        this.utilService.presentLoading(10000).then(() => this.getUserData());
      }
      if (this.router.getCurrentNavigation().finalUrl) {
        const currentUrl = this.router.getCurrentNavigation().finalUrl.toString();
        let urlUserName = currentUrl.split('/')[2];
        if (urlUserName.includes('?')) {
          urlUserName = urlUserName.split('?')[0];
        }
        this.utilService.presentLoading(10000).then(() => {
          this.apiService.getPublicUser(urlUserName).then(resp => {
            if (!this.publicUser) {
              this.publicUser = resp;
              this.getUserData();
            }
          });
        });
      }
    });
  }

  ngOnInit() {
    this.desktopPlatform = window.innerWidth >= 600;
  }

  ngOnDestroy() {
    this.utilService.dismissLoading();
  }


  checkExpiredTime() {
    if (this.publicUser?.membership === 'free-trial') {
      if (this.publicUser.updatedAt) {
        const firstDate = moment(new Date());
        const secondDate = moment(new Date(this.publicUser.updatedAt));
        const diffInDays = Math.abs(firstDate.diff(secondDate, 'days'));
        this.expiredDays = diffInDays <= 60 ? (60 - diffInDays) : 0;
      } else {
        const data = {
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        };
        this.apiService.updateUser(this.publicUser.uid, data).then(() => {
          this.publicUser.createdAt = data.createdAt;
          this.publicUser.updatedAt = data.updatedAt;
          this.expiredDays = 60;
        });
      }
    }
  }

  getUserData() {
    this.checkExpiredTime();
  }

  async updateMembership() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'profile-actionSheet',
      header: 'Membership',
      buttons: [
        {
          text: 'Free trial Membership *60 Days',
          handler: () => this.apiService.updateUser(this.publicUser.uid, {updatedAt: new Date().getTime(), membership: 'free-trial'})
            .then(() => this.apiService.getUser(this.publicUser.uid).then(resp => this.publicUser = resp))
        }, {
          text: 'Supporting Membership',
          handler: () => this.apiService.updateMembership(this.publicUser.uid, 'supporting')
            .then(() => this.apiService.getUser(this.publicUser.uid).then(resp => this.publicUser = resp))
        }, {
          text: 'Pro Membership',
          handler: () => this.apiService.updateMembership(this.publicUser.uid, 'pro')
            .then(() => this.apiService.getUser(this.publicUser.uid).then(resp => this.publicUser = resp))
        }
      ]
    });

    await actionSheet.present();
  }

  async updateVerification() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'profile-actionSheet',
      header: 'Verification',
      buttons: [
        {
          text: 'Make Verified',
          handler: () => this.apiService.updateVerification(this.publicUser.uid, 'verified')
            .then(() => this.apiService.getUser(this.publicUser.uid).then(resp => this.publicUser = resp))
        }, {
          text: 'Make Denied',
          handler: () => this.apiService.updateVerification(this.publicUser.uid, 'denied')
            .then(() => this.apiService.getUser(this.publicUser.uid).then(resp => this.publicUser = resp))
        }
      ]
    });

    await actionSheet.present();
  }

  block() {

    let blockedUsers = [];

    if (this.cacheService.user.blocked) {
      blockedUsers = this.cacheService.user.blocked;
    } else {
      blockedUsers.push(this.publicUser.uid);
    }

    this.apiService.updateUser(this.cacheService.user.uid, {blocked: blockedUsers}).then(() => this.cacheService.updateUser(this.cacheService.user.uid));
  }

}
