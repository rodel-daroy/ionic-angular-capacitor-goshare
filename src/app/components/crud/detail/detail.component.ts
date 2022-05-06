import {AfterViewInit, Component, Inject, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {NavigationExtras, Router} from '@angular/router';
import * as moment from 'moment';

import {IonSlides, ModalController, NavParams, Platform} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {FunctionService} from '../../../services/firebase/function/function.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

import {GoogleMapComponent} from '../../utils/google-map/google-map.component';
import {SocialShareComponent} from '../../utils/social-share/social-share.component';
import {ConnectComponent} from '../connect/connect.component';
import {FlagComponent} from '../flag/flag.component';
import {ReportComponent} from '../report/report.component';
import {ChatComponent} from '../../connection/chat/chat.component';

declare let google;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, AfterViewInit {

  desktopPlatform: boolean;

  crudDetail;
  connected = false;
  bookAvailability = false;
  bookInfo;

  mapOptions: google.maps.MapOptions;

  thingForm = new FormGroup({
    thingPickUp: new FormControl(''),
    thingPickUpDisplay: new FormControl(''),
    thingDropOff: new FormControl(''),
    thingDropOffDisplay: new FormControl(''),
  });

  serviceForm = new FormGroup({
    serviceDate: new FormControl(''),
    serviceDateDisplay: new FormControl('')
  });

  @ViewChild('gallerySlides') gallerySlides: IonSlides;
  @ViewChild('crudDetailMap') crudDetailMap: GoogleMapComponent;

  constructor(@Inject(LOCALE_ID) private locale: string,
              private platform: Platform,
              private router: Router,
              public modalController: ModalController,
              private navParams: NavParams,
              private apiService: ApiService,
              public cacheService: CacheService,
              private functionService: FunctionService,
              private utilService: UtilService,
              public variableService: VariableService) {

    this.mapOptions = {
      zoom: 11,
      center: this.variableService.userLocation,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      panControl: false
    };

    this.crudDetail = navParams.get('crud');

    this.checkBookAvailability();
  }

  ngOnInit() {
    this.desktopPlatform = window.innerWidth >= 600;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.crudDetailMap.initMap();
      if (this.crudDetail.address) {
        this.showCRUDOnMap(this.crudDetail);
      }
    }, 500);
  }


  checkBookAvailability() {

    this.apiService.bookAvailability(this.cacheService.user.uid, this.crudDetail.uid, this.crudDetail.id).then(resp => {

      this.connected = resp.connected;

      if (resp.availability) {
        this.bookAvailability = resp.availability;
      } else {
        this.bookInfo = resp.bookInfo;
      }
    });
  }

  ViewFullScreen() {
    const navigationExtras: NavigationExtras = {
      state: {crud: this.crudDetail}
    };

    this.modalController.dismiss().then(() => this.router.navigate(['crud-detail'], navigationExtras));
  }

  showCRUDOnMap(crud) {
    if (crud.address[0] && crud.address[0].latLng) {

      const marker = new google.maps.Marker({
        position: crud.address[0].latLng,
        map: this.crudDetailMap.map,
      });

      if (this.iconUrl(crud)) {
        marker.setIcon({
          url: this.iconUrl(crud),
          scaledSize: new google.maps.Size(40, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0),
        });
      }

      this.crudDetailMap.map.setCenter(this.crudDetail.address[0].latLng);
    }
  }

  iconUrl(crud) {

    let iconUrl;

    if (crud.address[0] && crud.address[0].icon) {
      iconUrl = crud.address[0].icon;
    } else if (crud.main_background !== '') {
      iconUrl = crud.main_background;
    }

    return iconUrl;
  }

  favourite() {
    this.apiService.saveFavourite(this.cacheService.user.uid, this.crudDetail)
      .then(() => this.utilService.showToast('Successfully saved!'));
  }

  async share() {
    const modal = await this.modalController.create({
      component: SocialShareComponent,
      componentProps: {crud: this.crudDetail}
    });

    return await modal.present();
  }

  gallery() {

    const allImages = [];

    if (this.crudDetail.main_background !== '') {
      allImages.push(this.crudDetail.main_background);
    }
    if (this.crudDetail.more_images) {
      this.crudDetail.more_images.forEach(item => allImages.push(item.image));
    }

    return allImages;
  }

  viewImage(image) {
    const allImages = this.gallery();
    const index = allImages.indexOf(image);
    this.gallerySlides.slideTo(index, 300).then();
  }

  pinTo(list) {
    this.crudDetailMap.map.panTo(list.latLng);
  }

  displayFormatDate(date) {
    return new Date(date);
  }

  getNextMonth(date) {

    const current = new Date(date);
    let next;

    if (current.getMonth() === 11) {
      next = new Date(current.getFullYear() + 1, 0, 1);
    } else {
      next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return next;
  }


  thingPickUpChange(event) {
    const momentObj = moment(event.value);
    const formattedDate = momentObj.format('MMM DD');
    this.thingForm.patchValue({thingPickUpDisplay: formattedDate});
  }

  thingDropOffChange(event) {
    const momentObj = moment(event.value);
    const formattedDate = momentObj.format('MMM DD');
    this.thingForm.patchValue({thingDropOffDisplay: formattedDate});
  }

  serviceDateChange(event) {
    const momentObj = moment(event.value);
    const formattedDate = momentObj.format('MMM DD');
    this.serviceForm.patchValue({serviceDateDisplay: formattedDate});
  }

  displayPrice(model) {

    let price;

    if (model === 'Hourly') {
      price = this.convertPrice(this.crudDetail.price.price_detail?.hourlyPrice).toFixed(2);
    } else if (model === 'Half Day') {
      price = this.convertPrice(this.crudDetail.price.price_detail?.halfDayPrice).toFixed(2);
    } else if (model === 'Full Day') {
      price = this.convertPrice(this.crudDetail.price.price_detail?.fullDayPrice).toFixed(2);
    } else if (model === 'Service') {
      price = this.convertPrice(this.crudDetail.price.price_detail?.servicePrice).toFixed(2);
    } else if (model === 'Price Range') {
      price = this.convertPrice(this.crudDetail.price.price_detail?.priceRangeFrom).toFixed(2) + ' - ' + this.convertPrice(this.crudDetail.price.price_detail?.priceRangeTo).toFixed(2);
    }

    return price;
  }

  convertPrice(price): number {
    if (price) {
      return parseFloat(price);
    } else {
      return parseFloat('0');
    }
  }

  displayGuestPrice(type): number {

    let price;

    if (type === 'adult') {
      price = parseFloat(this.crudDetail.price.price_detail?.adultPrice).toFixed(2);
    } else if (type === 'child') {
      price = parseFloat(this.crudDetail.price.price_detail?.childPrice).toFixed(2);
    } else if (type === 'infant') {
      price = parseFloat(this.crudDetail.price.price_detail?.infantPrice).toFixed(2);
    }

    return price;
  }

  displayGuestPrices(): any[] {

    const prices = [];

    if (this.crudDetail.price.price_detail?.adultPrice) {
      prices.push({
        price: parseFloat(this.crudDetail.price.price_detail?.adultPrice).toFixed(2),
        unit: 'adult'
      });
    }
    if (this.crudDetail.price.price_detail?.childPrice) {
      prices.push({
        price: parseFloat(this.crudDetail.price.price_detail?.childPrice).toFixed(2),
        unit: 'child'
      });
    }
    if (this.crudDetail.price.price_detail?.infantPrice) {
      prices.push({
        price: parseFloat(this.crudDetail.price.price_detail?.infantPrice).toFixed(2),
        unit: 'infant'
      });
    }

    return prices;
  }

  displayWeeklyPrice(type): number {

    let price;

    if (type === 'weekly') {
      price = parseFloat(this.crudDetail.price.price_detail?.weeklyPrice).toFixed(2);
    } else if (type === 'weekend') {
      price = parseFloat(this.crudDetail.price.price_detail?.weekendPrice).toFixed(2);
    } else if (type === 'nightly') {
      price = parseFloat(this.crudDetail.price.price_detail?.nightlyPrice).toFixed(2);
    }

    return price;
  }

  displayWeeklyPrices(): any[] {

    const prices = [];

    if (this.crudDetail.price.price_detail?.weeklyPrice) {
      prices.push({
        price: parseFloat(this.crudDetail.price.price_detail?.weeklyPrice).toFixed(2),
        unit: 'weekly'
      });
    }
    if (this.crudDetail.price.price_detail?.weekendPrice) {
      prices.push({
        price: parseFloat(this.crudDetail.price.price_detail?.weekendPrice).toFixed(2),
        unit: 'weekend'
      });
    }
    if (this.crudDetail.price.price_detail?.nightlyPrice) {
      prices.push({
        price: parseFloat(this.crudDetail.price.price_detail?.nightlyPrice).toFixed(2),
        unit: 'night'
      });
    }

    return prices;
  }

  displayComments(model): string {

    let comments = '';

    if (model === 'Hourly') {
      comments = this.crudDetail.price.price_detail?.hourlyComments;
    } else if (model === 'Half Day') {
      comments = this.crudDetail.price.price_detail?.halfDayComments;
    } else if (model === 'Full Day') {
      comments = this.crudDetail.price.price_detail?.fullDayComments;
    } else if (model === 'Service') {
      comments = this.crudDetail.price.price_detail?.serviceComments;
    } else if (model === 'Price Range') {
      comments = this.crudDetail.price.price_detail?.priceRangeComments;
    }

    return comments;
  }

  displayGuestComments(type): string {

    let comments = '';

    if (type === 'adult') {
      comments = this.crudDetail.price.price_detail?.adultComments;
    } else if (type === 'child') {
      comments = this.crudDetail.price.price_detail?.childComments;
    } else if (type === 'infant') {
      comments = this.crudDetail.price.price_detail?.infantComments;
    }

    return comments;
  }

  displayWeeklyComments(type): string {

    let comments = '';

    if (type === 'weekly') {
      comments = this.crudDetail.price.price_detail?.weeklyComments;
    } else if (type === 'weekend') {
      comments = this.crudDetail.price.price_detail?.weekendComments;
    } else if (type === 'nightly') {
      comments = this.crudDetail.price.price_detail?.nightlyComments;
    }

    return comments;
  }


  edit() {
    const navigationExtras: NavigationExtras = {
      state: {
        id: this.crudDetail.id,
        uid: this.crudDetail.uid
      }
    };

    this.modalController.dismiss().then(() => this.router.navigate(['crud-new'], navigationExtras));
  }

  openPublicProfile() {
    if (this.crudDetail.user?.public) {

      const navigationExtras: NavigationExtras = {
        state: {user: this.crudDetail.user}
      };

      const underscoreUsername = this.crudDetail.user?.username.split(' ').join('_');

      this.modalController.dismiss().then(() => this.router.navigate(['profile/' + underscoreUsername], navigationExtras));
    }
  }

  async connect() {
    const modal = await this.modalController.create({
      component: ConnectComponent,
      componentProps: {crud: this.crudDetail}
    });

    modal.onDidDismiss().then(resp => {
      if (resp.data) {
        this.utilService.presentLoading(2000).then();
        this.apiService.bookCrud(this.cacheService.user.uid, this.crudDetail, resp.data.contactInfo, resp.data.contactMessage).then(() => {
          const notificationData = {
            fcmToken: this.crudDetail.user.fcmToken,
            title: 'Incoming Requests',
            body: 'From ' + this.cacheService.user.username
          };
          this.functionService.pushNotification(notificationData).then().catch();
        });
      }
    });

    return await modal.present();
  }

  viewConnect() {
    this.modalController.dismiss().then(() => this.router.navigate(['connections']));
  }

  call() {
  }

  email() {
  }

  async chat() {
    const modal = await this.modalController.create({
      component: ChatComponent,
      componentProps: {receiver: this.crudDetail.user}
    });

    return await modal.present();
  }

  approve() {
    this.apiService.approveCrud(this.crudDetail.id);
  }

  deny() {
    this.apiService.denyCrud(this.crudDetail.id);
  }

  async flag() {
    const modal = await this.modalController.create({component: FlagComponent});

    modal.onDidDismiss().then(overlayEventResult => {
      if (overlayEventResult.data) {
        this.utilService.presentLoading(2000);
        this.apiService.flagUser(this.cacheService.user.uid, this.crudDetail.uid, this.crudDetail.id, overlayEventResult.data.reason);
      }
    });

    return await modal.present();
  }

  block() {
    this.utilService.presentLoading(2000).then();
    this.apiService.blockUser(this.cacheService.user.uid, this.crudDetail.uid, this.crudDetail.id).then(() => {
      this.utilService.showAlert(
        'BLOCK ALERT',
        'You have blocked ' + this.crudDetail.user.username + ' successfully. ' +
        'You will not see any more items from ' + this.crudDetail.user.username + '.' +
        'If you would like to un-lock this user go to your profile and tap the Blocked Users button'
      ).then(() => this.modalController.dismiss());
    });
  }

  async report() {
    const modal = await this.modalController.create({component: ReportComponent});

    modal.onDidDismiss().then(overlayEventResult => {
      if (overlayEventResult.data) {
        this.utilService.presentLoading(2000);
        this.apiService.blockUser(this.cacheService.user.uid, this.crudDetail.uid, this.crudDetail.id, overlayEventResult.data.reason).then(() => {
          this.utilService.showAlert(
            'BLOCK ALERT',
            'You have blocked ' + this.crudDetail.user.username + ' successfully. ' +
            'You will not see any more items from ' + this.crudDetail.user.username + '.' +
            'If you would like to un-lock this user go to your profile and tap the Blocked Users button'
          ).then(() => this.modalController.dismiss());
        });
      }
    });

    return await modal.present();
  }

}
