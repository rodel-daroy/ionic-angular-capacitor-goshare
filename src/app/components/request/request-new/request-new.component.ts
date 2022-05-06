import {Component, NgZone, OnInit} from '@angular/core';

import {ActionSheetController, ModalController, Platform} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {UtilService} from '../../../services/util/util.service';

import {ImageCropperComponent} from '../../utils/image-cropper/image-cropper.component';

import {CATEGORIES, STORAGE} from '../../../app.constant';

import {CameraResultType, Plugins} from '@capacitor/core';

const {Camera} = Plugins;

declare let google;

@Component({
  selector: 'app-request-new',
  templateUrl: './request-new.component.html',
  styleUrls: ['./request-new.component.scss'],
})
export class RequestNewComponent implements OnInit {

  keyword = '';

  GoogleAutocomplete: google.maps.places.AutocompleteService;
  googleAutocomplete: { location: string };
  googleAutocompleteItems = [];

  selectedCities = [];
  allCities = false;

  comments = '';

  image = '';

  allCategories = [];
  categories = '';

  constructor(private zone: NgZone,
              private platform: Platform,
              private actionSheetController: ActionSheetController,
              public modalController: ModalController,
              private apiService: ApiService,
              private cacheService: CacheService,
              private utilService: UtilService) {

    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.googleAutocomplete = {location: ''};
    this.googleAutocompleteItems = [];

    this.allCategories = CATEGORIES;
  }

  ngOnInit() {
  }


  cityChange(event) {

    if (event.target.value.length < 3) {
      this.googleAutocompleteItems = [];
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions({input: event.target.value}, autocompletePredictions => {
      this.googleAutocompleteItems = [];
      this.zone.run(() => autocompletePredictions.forEach(autocompletePrediction => this.googleAutocompleteItems.push(autocompletePrediction)));
    });
  }

  selectSearchLocation(prediction) {

    this.googleAutocompleteItems = [];

    this.googleAutocomplete.location = prediction.description;
    const addressArray = prediction.description.split(', ');
    this.selectedCities.push(addressArray[0]);
  }

  removeCity(i) {
    this.selectedCities.splice(i, 1);
  }

  allCitiesChange() {
    this.allCities = !this.allCities;
  }

  uploadImage() {
    if (this.platform.is('cordova')) {
      this.getAvatarOnDevice().then();
    } else {
      document.getElementById('imageUpload').click();
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

    this.saveImage(image.webPath);
  }

  async openGallery() {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
    });

    this.saveImage(image.webPath);
  }

  saveImage(base64String) {
    this.utilService.presentLoading(3000).then();
    this.apiService.uploadImage(base64String, 'png', STORAGE.USER_PROFILE_IMAGES).then(resp => this.viewImage(resp.imageUrl));
  }

  async imageUpload(event) {
    const modal = await this.modalController.create({
      component: ImageCropperComponent,
      componentProps: {imageChangedEvent: event, route: 'request'}
    });

    modal.onDidDismiss().then((cropImageLink: any) => {
      if (cropImageLink.data) {
        this.viewImage(cropImageLink.data);
      }
    });

    return await modal.present();
  }

  viewImage(src) {
    this.image = src;
  }

  categoriesSelectionChange(event) {
    this.categories = event.value;
  }

  submit() {
    if (this.keyword === '' || !(this.selectedCities.length > 0 || this.allCities)) {
      this.utilService.showToast('Request fields are not valid').then();
    } else {
      this.utilService.presentLoading(3000).then();
      this.apiService.addRequest({
        keyword: this.keyword,
        cities: this.selectedCities,
        allCities: this.allCities,
        comments: this.comments,
        image: this.image,
        categories: this.categories,
        uid: this.cacheService.user.uid
      }).then(() => this.modalController.dismiss({submit: 'success'}));
    }
  }

}
