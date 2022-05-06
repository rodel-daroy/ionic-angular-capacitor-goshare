import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import * as moment from 'moment';
import * as $ from 'jquery';

import {ActionSheetController, ModalController, Platform} from '@ionic/angular';
import {IAPProduct, InAppPurchase2} from '@ionic-native/in-app-purchase-2/ngx';

import {ApiService} from '../../services/firebase/api/api.service';
import {CacheService} from '../../services/cache/cache.service';
import {UtilService} from '../../services/util/util.service';
import {VariableService} from '../../services/data/variable.service';

import {BlockedUsersComponent} from '../../components/user/blocked-users/blocked-users.component';
import {ImageCropperComponent} from '../../components/utils/image-cropper/image-cropper.component';
import {SettingComponent} from '../../components/user/setting/setting.component';

import {STORAGE, SUBSCRIPTION} from '../../app.constant';

import {CameraResultType, Plugins} from '@capacitor/core';

const {Camera} = Plugins;

declare let paypal;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, AfterViewInit {

  desktopPlatform: boolean;

  expiredDays = 60;

  uploadType = '';

  supportingShow = false;
  proShow = false;

  inAppPurchaseProducts = [];

  underscoreUsername = '';

  profileTitle = '';
  titleBlur: boolean;
  profileDescription = '';
  descriptionBlur: boolean;

  constructor(private titleService: Title,
              private meta: Meta,
              private router: Router,
              private platform: Platform,
              private actionSheetController: ActionSheetController,
              private modalController: ModalController,
              private store: InAppPurchase2,
              private apiService: ApiService,
              public cacheService: CacheService,
              private utilService: UtilService,
              public variableService: VariableService,
              private changeDetectorRef: ChangeDetectorRef) {

    if (this.cacheService.user) {
      this.checkExpiredTime();
    } else {
      this.cacheService.getUser().then(resp => {
        if (resp) {
          this.checkExpiredTime();
        } else {
          this.router.navigate(['login']).then();
        }
      });
    }
  }

  ngOnInit() {
    this.desktopPlatform = window.innerWidth >= 600;
  }

  ionViewWillEnter() {
    if (this.cacheService.user) {
      this.apiService.getUser(this.cacheService.user?.uid).then(resp => {

        this.cacheService.setUser(resp).then();

        if (this.cacheService.user.profileTitle) {
          this.profileTitle = this.cacheService.user.profileTitle;
          this.titleService.setTitle(this.profileTitle);
          this.meta.updateTag({property: 'og:title', content: this.profileTitle});
        }
        if (this.cacheService.user.profileDescription) {
          this.profileDescription = this.cacheService.user.profileDescription;
          this.meta.updateTag({property: 'og:description', content: this.profileDescription});
        }
      });
    }
  }

  ngAfterViewInit() {
    this.platform.ready().then(() => {
      if (this.platform.is('ios') && this.platform.is('capacitor')) {

        this.store.verbosity = this.store.DEBUG;

        this.store.register({
          id: '03',
          type: this.store.NON_RENEWING_SUBSCRIPTION,
        });

        this.store.register({
          id: '04',
          type: this.store.NON_CONSUMABLE,
        });

        this.store.refresh();


        this.store.ready(() => this.changeDetectorRef.detectChanges());

        this.store.when('03').approved((product: IAPProduct) => {
          this.changeDetectorRef.detectChanges();
          return product.verify();
        }).verified((product: IAPProduct) => product.finish());

        this.store.when('04').approved(p => {
          p.verify();
        }).verified(p => p.finish());

        this.store.refresh();

      } else {
        $(document).ready(() => {
          const self = this;
          paypal.Buttons({
            createSubscription: (data, actions) => actions.subscription.create({plan_id: SUBSCRIPTION.supportingPlan}),
            onApprove: (data) => {
              alert('You have successfully created subscription ' + data.subscriptionID);

              self.supportingShow = false;

              const oldUser = self.cacheService.user;
              oldUser.membership = 'supporting';

              self.apiService.updateUser(oldUser.uid, oldUser).then(() => {
                self.utilService.showToast('You have a supporting membership')
                  .then(() => self.cacheService.setUser(oldUser));
              });
            }
          }).render('#supporting');

          paypal.Buttons({
            createSubscription: (data, actions) => actions.subscription.create({plan_id: SUBSCRIPTION.proPlan}),
            onApprove: (data) => {
              alert('You have successfully created subscription ' + data.subscriptionID);

              self.proShow = false;

              const oldUser = self.cacheService.user;
              oldUser.membership = 'pro';

              self.apiService.updateUser(oldUser.uid, oldUser).then(() => {
                self.utilService.showToast('You have a pro membership')
                  .then(() => self.cacheService.setUser(oldUser));
              });
            }
          }).render('#pro');
        });
      }
    });
  }

  checkExpiredTime() {

    this.underscoreUsername = this.cacheService.user?.username.split(' ').join('_');

    if (this.cacheService.user.membership === 'free-trial') {
      if (this.cacheService.user.updatedAt) {
        const firstDate = moment(new Date());
        const secondDate = moment(new Date(this.cacheService.user.updatedAt));
        const diffInDays = Math.abs(firstDate.diff(secondDate, 'days'));
        this.expiredDays = diffInDays <= 60 ? (60 - diffInDays) : 0;
      } else {
        const data = {
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        };
        this.apiService.updateUser(this.cacheService.user.uid, data).then(() => {
          this.cacheService.user.createdAt = data.createdAt;
          this.cacheService.user.updatedAt = data.updatedAt;
          this.expiredDays = 60;
          this.cacheService.setUser(this.cacheService.user).then();
        });
      }
    }
  }

  supportingMembership() {
    if (this.platform.is('ios') && this.platform.is('capacitor')) {
      this.store.order('03');
    } else {
      this.supportingShow = true;
      this.proShow = false;
    }
  }

  proMembership() {
    if (this.platform.is('ios') && this.platform.is('capacitor')) {
      if (this.inAppPurchaseProducts[1]) {
        this.store.order(this.inAppPurchaseProducts[1]);
      }
    } else {
      this.proShow = true;
      this.supportingShow = false;
    }
  }


  async updateMyProfile() {
    const modal = await this.modalController.create({component: SettingComponent});

    return await modal.present();
  }

  updateCoverPic() {

    this.uploadType = 'coverPic';

    if (this.platform.is('capacitor')) {
      this.getAvatarOnDevice().then();
    } else {
      document.getElementById('profileCoverPicUpload').click();
    }
  }

  onAvatarClick() {

    this.uploadType = 'avatar';

    if (this.platform.is('capacitor')) {
      this.getAvatarOnDevice().then();
    } else {
      document.getElementById('profileAvatarUpload').click();
    }
  }

  async getAvatarOnDevice() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Add Image',
      buttons: [
        {
          text: 'Take A Picture',
          role: 'destructive',
          cssClass: 'buttonCss',
          icon: !this.platform.is('ios') ? 'camera' : null,
          handler: () => this.openCamera()
        },
        {
          text: 'Pick From Gallery',
          icon: !this.platform.is('ios') ? 'images' : null,
          handler: () => this.openGallery()
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'buttonCss_Cancel',
          icon: !this.platform.is('ios') ? 'close' : null
        }
      ]
    });

    await actionSheet.present();
  }

  async openCamera() {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
    });

    this.uploadProfile(image.webPath);
  }

  async openGallery() {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
    });

    this.uploadProfile(image.webPath);
  }

  uploadProfile(base64String) {
    this.utilService.presentLoading(3000).then();
    this.apiService.uploadImage(base64String, 'png', STORAGE.USER_PROFILE_IMAGES).then(resp => this.updateProfileImages(resp.imageUrl));
  }

  profileCoverPicUpload(event: any) {
    this.openImageCropper(event).then();
  }

  profileAvatarUpload(event: any) {
    this.openImageCropper(event).then();
  }

  async openImageCropper(event) {

    const modal = await this.modalController.create({
      component: ImageCropperComponent,
      componentProps: {imageChangedEvent: event, route: 'profile'}
    });

    modal.onDidDismiss().then(overlayEventResult => {
      if (overlayEventResult.data) {
        this.updateProfileImages(overlayEventResult.data);
      }
    });

    return await modal.present();
  }

  updateProfileImages(link) {

    this.utilService.presentLoading(3000).then();

    if (this.uploadType === 'avatar') {
      this.apiService.updateUser(this.cacheService.user.uid, {avatar: link}).then(() => {
        this.apiService.getUser(this.cacheService.user?.uid).then(resp => this.cacheService.setUser(resp));
      });
    }
    if (this.uploadType === 'coverPic') {
      this.apiService.updateUser(this.cacheService.user.uid, {coverPic: link}).then(() => {
        this.apiService.getUser(this.cacheService.user?.uid).then(resp => this.cacheService.setUser(resp));
      });
    }
  }

  makeVerified() {
    this.cacheService.user.verification = 'verified';
    this.cacheService.setUser(this.cacheService.user).then(() => this.apiService.updateUser(this.cacheService.user.uid, this.cacheService.user).then());
  }

  async openBlockedUsers() {
    const modal = await this.modalController.create({component: BlockedUsersComponent});

    return await modal.present();
  }

  async share() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'profile-actionSheet',
      header: 'Share',
      buttons: [
        {text: 'Email'},
        {text: 'Social Media'},
        {text: 'Copy Link'}
      ]
    });

    await actionSheet.present();
  }

  public_private(event) {
    this.apiService.updateUser(this.cacheService.user.uid, {public: event.detail.checked}).then(() => {
      this.apiService.getUser(this.cacheService.user?.uid).then(resp => this.cacheService.setUser(resp));
    });
  }

  titleEditing() {
    this.titleBlur = false;
  }

  titleEdited() {
    this.titleBlur = true;
  }

  updateTitle() {
    this.apiService.updateUser(this.cacheService.user.uid, {profileTitle: this.profileTitle}).then(() => {
      this.apiService.getUser(this.cacheService.user?.uid).then(resp => {
        this.cacheService.setUser(resp).then(() => {
          this.titleService.setTitle(this.profileTitle);
          this.meta.updateTag({property: 'og:title', content: this.profileTitle});
        });
      });
    });
  }

  descriptionEditing() {
    this.descriptionBlur = false;
  }

  descriptionEdited() {
    this.descriptionBlur = true;
  }

  updateDescription() {
    this.apiService.updateUser(this.cacheService.user.uid, {profileDescription: this.profileDescription}).then(() => {
      this.apiService.getUser(this.cacheService.user?.uid).then(resp => {
        this.cacheService.setUser(resp).then(() => {
          this.meta.updateTag({property: 'og:description', content: this.profileDescription});
        });
      });
    });
  }

}
