import {AfterViewInit, Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {formatDate} from '@angular/common';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SatDatepicker} from 'saturn-datepicker';
import Swal from 'sweetalert2';

import {ActionSheetController, AlertController, ModalController, NavController, Platform} from '@ionic/angular';
import {ImagePicker} from '@ionic-native/image-picker/ngx';

import {ApiService} from '../../services/firebase/api/api.service';
import {CacheService} from '../../services/cache/cache.service';
import {EventService} from '../../services/event/event.service';
import {UtilService} from '../../services/util/util.service';
import {VariableService} from '../../services/data/variable.service';

import {GoogleMapComponent} from '../../components/utils/google-map/google-map.component';
import {DetailComponent} from '../../components/crud/detail/detail.component';
import {ImageCropperComponent} from '../../components/utils/image-cropper/image-cropper.component';
import {AddressComponent} from '../../components/crud/address/address.component';
import {GpsComponent} from '../../components/crud/gps/gps.component';
import {TermsComponent} from '../../components/crud/terms/terms.component';

import {CATEGORIES, STORAGE} from '../../app.constant';

import {CameraResultType, Plugins} from '@capacitor/core';

const {Camera} = Plugins;

@Component({
  selector: 'app-crud-new',
  templateUrl: './crud-new.page.html',
  styleUrls: ['./crud-new.page.scss'],
})
export class CrudNewPage implements OnInit, AfterViewInit, OnDestroy {

  newLoading = true;

  desktopPlatform = false;

  viewModes = {
    light: true,
    medium: false,
    dark: false
  };


  title = '';
  categories = CATEGORIES;
  selectedCategories = [];
  description = '';
  detailedDescription = '';


  step = 0;
  stepCheck = {
    description: false,
    media: false,
    map: false,
    availability: false,
    contact: false
  };
  uploadImageCriteria = '';


  editMainDescriptionState = false;
  editMainDescription = '';
  moreImages = [];
  selectedBackgroundImage = '';


  mapOptions: google.maps.MapOptions;
  addressList = [];
  markers = [];
  circles = [];
  radius = 0;


  dateRange: any = {};
  dateEditFilter = false;
  dateEditIndex = 0;
  dateRangeList = [];

  availabilityDescription = '';

  priceToggleState = false;
  priceCriteria = 'FREE';
  priceModels = ['Hourly', 'Half Day', 'Full Day', 'Guest', 'Service', 'Price Range', 'Weekly, Weekend, Nightly'];
  priceModel = '';
  priceModelDetail: any = {};

  hourlyPriceForm = new FormGroup({
    hourlyPrice: new FormControl(''),
    hourlyStart: new FormControl(''),
    hourlyEnd: new FormControl(''),
    hourlyComments: new FormControl(''),
  });

  halfDayPriceForm = new FormGroup({
    halfDayPrice: new FormControl(''),
    morningStart: new FormControl(''),
    morningEnd: new FormControl(''),
    afternoonStart: new FormControl(''),
    afternoonEnd: new FormControl(''),
    halfDayComments: new FormControl(''),
  });

  fullDayPriceForm = new FormGroup({
    fullDayPrice: new FormControl(''),
    fullDayStart: new FormControl(''),
    fullDayEnd: new FormControl(''),
    fullDayComments: new FormControl(''),
  });

  guestPriceForm = new FormGroup({
    guestPrice: new FormControl(''),
    guestComments: new FormControl('')
  });
  guestCheckModes = {
    adult: true,
    child: false,
    infant: false
  };
  guestPriceDetails = [];

  servicePriceForm = new FormGroup({
    servicePrice: new FormControl(''),
    serviceComments: new FormControl('')
  });

  priceRangeForm = new FormGroup({
    priceRangeFrom: new FormControl(''),
    priceRangeTo: new FormControl(''),
    priceRangeComments: new FormControl('')
  });

  weeklyPriceForm = new FormGroup({
    weeklyPrice: new FormControl(''),
    weeklyComments: new FormControl('')
  });
  weeklyCheckModes = {
    weekly: true,
    weekend: false,
    nightly: false
  };
  weeklyPriceDetails = [];

  addHours = false;
  addComments = false;

  priceSavingProcess = false;
  priceDetailSaved = false;


  contactSettingsForm = new FormGroup({
    phoneNumberState: new FormControl(false),
    phoneNumber: new FormControl(''),
    emailState: new FormControl(false),
    email: new FormControl(''),
    chatState: new FormControl(true)
  });


  visibilities = {
    user: false,
    rating: false,
    category: true,
    price: true,
    title: true,
    description: true
  };
  demoFlag = false;


  rating = {
    average: 0,
    count: 0
  };
  vote = 0;

  mode = 'create';
  submitFlag = false;

  crud;
  remoteId = '';

  suggestCategory = '';

  @ViewChild('createCRUDMap') createCRUDMap: GoogleMapComponent;
  @ViewChild('createCRUDReviewMap') createCRUDReviewMap: GoogleMapComponent;
  @ViewChild('picker') picker: SatDatepicker<any>;

  constructor(@Inject(LOCALE_ID) private locale: string,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              public platform: Platform,
              private actionSheetController: ActionSheetController,
              private alertController: AlertController,
              private modalController: ModalController,
              private navController: NavController,
              private imagePicker: ImagePicker,
              private apiService: ApiService,
              public cacheService: CacheService,
              private eventService: EventService,
              private utilService: UtilService,
              public variableService: VariableService) {

    if (!this.cacheService.user) {
      this.cacheService.getUser().then(resp => {
        if (!resp) {
          this.router.navigate(['login-new']).then();
        }
      });
    }

    this.mapOptions = {
      zoom: 11,
      center: this.variableService.userLocation,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      panControl: false,
    };

    this.activatedRoute.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state && this.newLoading) {
        const id = this.router.getCurrentNavigation().extras.state.id;
        const uid = this.router.getCurrentNavigation().extras.state.uid;
        this.mode = 'remote update';
        this.getEditCRUD(id, uid);
      }
    });

    this.eventService.getImageDrawing().subscribe(resp => {
      if (JSON.parse(resp).drawn) {
        if (this.variableService.imageDrawingType === 'main') {
          this.selectedBackgroundImage = JSON.parse(resp).src;
        } else {
          this.moreImages[this.variableService.imageDrawingIndex].image = JSON.parse(resp).src;
        }
      }
    });
  }

  ngOnInit() {
    this.desktopPlatform = window.innerWidth >= 600;
  }
  ngAfterViewInit() {
    this.newLoading = false;
  }

  ngOnDestroy() {
    this.eventService.createCRUDPublish(JSON.stringify({submitFlag: this.submitFlag}));
    this.utilService.dismissLoading();
  }


  getEditCRUD(id, uid) {
    this.remoteId = id;
    this.apiService.getCrud(id, uid).then(resp => this.initValues(resp));
  }

  initValues(crud) {
    this.selectedBackgroundImage = crud.main_background;
    this.selectedCategories = crud.categories;
    this.suggestCategory = crud.suggest_category ? crud.suggest_category : '';
    this.title = crud.title;
    this.description = crud.description;
    this.detailedDescription = crud.detailed_description;
    this.addressList = crud.address;
    this.dateRangeList = crud.date_range;
    this.availabilityDescription = crud.availability_description;
    this.priceCriteria = crud.price.price_criteria;
    this.priceModel = crud.price.price_model;
    this.priceModelDetail = crud.price.price_detail;
    if (this.priceModel === 'Guest') {
      if (this.priceModelDetail.hasOwnProperty('adultPrice')) {
        this.guestPriceDetails.push({
          type: 'adult',
          key: 'adultPrice',
          price: this.priceModelDetail.adultPrice,
          key1: 'guestComments',
          comments: this.priceModelDetail.guestComments
        });
      }
      if (this.priceModelDetail.hasOwnProperty('childPrice')) {
        this.guestPriceDetails.push({
          type: 'child',
          key: 'childPrice',
          price: this.priceModelDetail.childPrice,
          key1: 'guestComments',
          comments: this.priceModelDetail.guestComments
        });
      }
      if (this.priceModelDetail.hasOwnProperty('infantPrice')) {
        this.guestPriceDetails.push({
          type: 'infant',
          key: 'infantPrice',
          price: this.priceModelDetail.infantPrice,
          key1: 'guestComments',
          comments: this.priceModelDetail.guestComments
        });
      }
    } else if (this.priceModel === 'Weekly, Weekend, Nightly') {
      if (this.priceModelDetail.hasOwnProperty('weeklyPrice')) {
        this.weeklyPriceDetails.push({
          type: 'Weekly',
          key: 'weeklyPrice',
          price: this.priceModelDetail.weeklyPrice,
          key1: 'weeklyComments',
          comments: this.priceModelDetail.weeklyComments
        });
      }
      if (this.priceModelDetail.hasOwnProperty('weekendPrice')) {
        this.weeklyPriceDetails.push({
          type: 'Weekend',
          key: 'weekendPrice',
          price: this.priceModelDetail.weekendPrice,
          key1: 'weekendComments',
          comments: this.priceModelDetail.weekendComments
        });
      }
      if (this.priceModelDetail.hasOwnProperty('nightlyPrice')) {
        this.weeklyPriceDetails.push({
          type: 'Nightly',
          key: 'nightlyPrice',
          price: this.priceModelDetail.nightlyPrice,
          key1: 'nightlyComments',
          comments: this.priceModelDetail.nightlyComments
        });
      }
    }
    this.rating = crud.rating;
    this.vote = crud.vote;
    this.visibilities = crud.visibility ? crud.visibility : {
      user: false,
      rating: false,
      category: true,
      price: true,
      title: true,
      description: true
    };
    this.viewModes = crud.view_mode ? crud.view_mode : {
      light: true,
      medium: false,
      dark: false
    };
    if (!this.visibilities.price) {
      this.visibilities.price = true;
    }
    this.demoFlag = crud.isDemo;
    if (crud.host_contact_settings) {
      this.contactSettingsForm.patchValue({
        phoneNumberState: crud.host_contact_settings.phoneNumberState,
        phoneNumber: crud.host_contact_settings.phoneNumber ? crud.host_contact_settings.phoneNumber : '',
        emailState: crud.host_contact_settings.emailState,
        email: crud.host_contact_settings.email ? crud.host_contact_settings.email : '',
        chatState: crud.host_contact_settings.chatState,
      });
    }
  }


  displayPrice(): string {

    let price = '';

    if (this.priceModel === 'FREE') {
      price = 'Free';
    } else {
      if (this.priceModel === 'Hourly') {
        price = '$' + this.convertPrice(this.priceModelDetail.hourlyPrice).toFixed(2);
      } else if (this.priceModel === 'Half Day') {
        price = '$' + this.convertPrice(this.priceModelDetail.halfDayPrice).toFixed(2);
      } else if (this.priceModel === 'Full Day') {
        price = '$' + this.convertPrice(this.priceModelDetail.fullDayPrice).toFixed(2);
      } else if (this.priceModel === 'Guest') {
        for (const key in this.priceModelDetail) {
          if (!key.toLowerCase().includes('comments') && this.priceModelDetail.hasOwnProperty(key)) {
            price += '$' + this.convertPrice(this.priceModelDetail[key]).toFixed(2) + ' - ';
          }
        }
        if (price.length > 4) {
          price = price.slice(0, -3);
        }
      } else if (this.priceModel === 'Service') {
        price = '$' + this.convertPrice(this.priceModelDetail.servicePrice).toFixed(2);
      } else if (this.priceModel === 'Price Range') {
        price = '$' + this.convertPrice(this.priceModelDetail.priceRangeFrom).toFixed(2) + ' - ' + '$' + this.convertPrice(this.priceModelDetail.priceRangeTo).toFixed(2);
      } else if (this.priceModel === 'Weekly, Weekend, Nightly') {
        for (const key in this.priceModelDetail) {
          if (!key.toLowerCase().includes('comments') && this.priceModelDetail.hasOwnProperty(key)) {
            price += '$' + this.convertPrice(this.priceModelDetail[key]).toFixed(2) + ' - ';
          }
        }
        if (price.length > 4) {
          price = price.slice(0, -3);
        }
      }
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

  changeViewMode(event, mode) {
    if (event.checked) {
      if (mode === 'light') {
        this.viewModes = {
          light: true,
          medium: false,
          dark: false
        };
      } else if (mode === 'medium') {
        this.viewModes = {
          light: false,
          medium: true,
          dark: false
        };
      } else {
        this.viewModes = {
          light: false,
          medium: false,
          dark: true
        };
      }
    }
  }

  changeVisibility(element) {
    if (element === 'title') {
      this.visibilities.title = !this.visibilities.title;
    } else if (element === 'price') {
      this.visibilities.price = !this.visibilities.price;
    } else if (element === 'category') {
      this.visibilities.category = !this.visibilities.category;
    } else {
      this.visibilities.description = !this.visibilities.description;
    }
  }


  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
    if (this.step === 2) {
      if (this.addressList.length > 0) {
        this.initCreateCRUDMap();
      }
    }
  }

  prevStep() {
    this.step--;
    if (this.step === 2) {
      if (this.addressList.length > 0) {
        this.initCreateCRUDMap();
      }
    }
  }

  save(stepKey) {
    if (stepKey === 'description') {
      this.stepCheck.description = true;
    } else if (stepKey === 'media') {
      this.stepCheck.media = true;
    } else if (stepKey === 'map') {
      this.stepCheck.map = true;
    } else if (stepKey === 'availability') {
      this.stepCheck.availability = true;
    } else if (stepKey === 'contact') {
      this.stepCheck.contact = true;
    }
    this.nextStep();
  }


  selectCategories(event) {
    this.selectedCategories = event.value;
  }


  addMainBackgroundImage() {

    this.uploadImageCriteria = 'background';

    if (this.platform.is('cordova')) {
      this.getImageOnDevice().then();
    } else {
      document.getElementById('step1ImageCropper1').click();
    }
  }

  async getImageOnDevice() {

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

    this.uploadCrudImage(image.webPath);
  }

  async openGallery() {

    if (this.uploadImageCriteria === 'background') {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      });

      this.uploadCrudImage(image.webPath);
    } else if (this.uploadImageCriteria === 'moreImages') {
      const options = {
        width: 200,
        // height: 200,
        quality: 30,
        outputType: 1
      };
      this.imagePicker.getPictures(options)
        .then(results => {
          for (const result of results) {
            this.utilService.presentLoading(2000).then();
            this.apiService.uploadImage(result, 'png', STORAGE.CRUD_ITEMS_IMAGES).then(resp => this.moreImages.push({image: resp.imageUrl, description: ''}));
          }
        }, err => console.log('imagePicker error =====>', err));
    }
  }

  uploadCrudImage(base64String) {

    this.utilService.presentLoading(2000).then();

    if (this.uploadImageCriteria === 'background') {
      this.apiService.uploadImage(base64String, 'png', STORAGE.CRUD_BACKGROUND_IMAGES).then(resp => this.selectedBackgroundImage = resp.imageUrl);
    } else if (this.uploadImageCriteria === 'moreImages') {
      this.apiService.uploadImage(base64String, 'png', STORAGE.CRUD_ITEMS_IMAGES).then(resp => this.moreImages.push({image: resp.imageUrl, description: ''}));
    }
  }

  removeMainBackground() {
    this.selectedBackgroundImage = '';
  }

  removeMoreImage(index) {
    this.moreImages.splice(index, 1);
  }

  addMoreImage() {

    this.uploadImageCriteria = 'moreImages';

    if (this.platform.is('cordova')) {
      this.getImageOnDevice().then();
    } else {
      document.getElementById('step1ImageCropper2').click();
    }
  }

  fileChangeEvent(event: any) {
    this.openImageCropModal(event).then();
  }

  async openImageCropModal(event) {

    const modal = await this.modalController.create({
      component: ImageCropperComponent,
      componentProps: {
        imageChangedEvent: event,
        route: 'crud-new'
      }
    });

    modal.onDidDismiss().then(cropImageLinks => {
      if (cropImageLinks.data) {
        if (this.uploadImageCriteria === 'background') {
          if (this.step === 1) {
            this.selectedBackgroundImage = cropImageLinks.data[0];
          }
        } else if (this.uploadImageCriteria === 'moreImages') {
          for (const link of cropImageLinks.data) {
            this.moreImages.push({image: link, description: ''});
          }
        }
      }
    });

    return await modal.present();
  }

  async imageDrawing(type, index?) {

    this.variableService.imageDrawingType = type;

    if (this.variableService.imageDrawingType === 'main') {
      this.variableService.imageDrawingSrc = this.selectedBackgroundImage;
    } else {
      this.variableService.imageDrawingIndex = index;
      this.variableService.imageDrawingSrc = this.moreImages[this.variableService.imageDrawingIndex].image;
    }

    this.router.navigate(['image-drawing']).then();
  }

  addMainDescription(description) {
    this.editMainDescriptionState = true;
    this.editMainDescription = description;
  }

  saveMainDescription() {
    this.description = this.editMainDescription;
    this.editMainDescription = '';
    this.editMainDescriptionState = false;
  }


  async openAddressModal() {

    const modal = await this.modalController.create({
      component: AddressComponent,
      cssClass: 'address-modal-css'
    });

    modal.onDidDismiss().then(overlayEventDetail => {
      if (overlayEventDetail.data) {
        this.addressList = overlayEventDetail.data;
        setTimeout(() => {
          this.createCRUDMap.initMap();
          this.displayLocations();
        }, 500);
      }
    });

    return await modal.present();
  }

  displayLocations() {

    this.markers = [];
    this.circles = [];

    if (this.addressList.length > 0) {

      this.createCRUDMap.map.setCenter(this.addressList[0].latLng);

      this.addressList.forEach(item => {
        if (item.filter === 'private') {
          this.addPrivateMarker(item.latLng);
        } else {
          this.addPublicMarker(item.latLng);
        }
      });
    }
  }

  addPrivateMarker(position) {

    if (position.lat && position.lng) {
      const circle = new google.maps.Circle({
        strokeColor: '#69e750',
        strokeOpacity: 0.5,
        strokeWeight: 4,
        fillColor: 'transparent',
        map: this.createCRUDMap.map,
        center: position,
        radius: 4000
      });

      this.circles.push(circle);
    }
  }

  addPublicMarker(position) {

    if (position.lat && position.lng) {

      const marker = new google.maps.Marker({
        map: this.createCRUDMap.map,
        position
      });

      const circle = new google.maps.Circle({
        strokeColor: '#69e750',
        strokeOpacity: 0.5,
        strokeWeight: 4,
        fillColor: 'transparent',
        map: this.createCRUDMap.map,
        center: position,
        radius: 200
      });

      this.markers.push(marker);
      this.circles.push(circle);
    }
  }

  deleteAddress(index) {

    this.addressList.splice(index, 1);

    this.markers.forEach(item => item.setMap(null));
    this.circles.forEach(item => item.setMap(null));

    this.displayLocations();
  }

  async openGpsModal() {

    const modal = await this.modalController.create({component: GpsComponent});

    modal.onDidDismiss().then(overlayEventDetail => {
      if (overlayEventDetail.data) {

        this.markers.forEach(item => item.setMap(null));
        this.markers = [];
        this.addressList.push(overlayEventDetail.data);

        this.initCreateCRUDMap();
      }
    });

    return await modal.present();
  }

  initCreateCRUDMap() {
    setTimeout(() => {
      this.platform.ready().then(() => {
        this.createCRUDMap.initMap();
        if (this.addressList.length > 0) {
          this.createCRUDMap.map.setCenter(this.addressList[0].latLng);
          this.displayAddressList(false);
        }
      });
    }, 2000);
  }

  displayAddressList(flag) {
    this.addressList.forEach(item => {

      const marker = new google.maps.Marker({
        position: item.latLng,
        map: flag ? this.createCRUDReviewMap.map : this.createCRUDMap.map
      });

      if (item.icon) {
        marker.setIcon({
          url: item.icon,
          scaledSize: new google.maps.Size(40, 40), // scaled size
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(0, 0), // anchor
        });
      }

      this.markers.push(marker);
    });
  }

  change(event) {
    if (event.detail.value === 0) {
      this.variableService.radius = 10;
    } else if (event.detail.value === 2) {
      this.variableService.radius = 40;
    } else if (event.detail.value === 4) {
      this.variableService.radius = 80;
    } else if (event.detail.value === 6) {
      this.variableService.radius = 200;
    } else if (event.detail.value === 8) {
      this.variableService.radius = 500;
    } else if (event.detail.value === 10) {
      this.variableService.radius = 1000;
    } else if (event.detail.value === 12) {
      this.variableService.radius = 2000;
    } else if (event.detail.value === 14) {
      this.variableService.radius = 4000;
    }
  }

  setValue(value) {

    this.radius = value;

    if (value === 0) {
      this.variableService.radius = 10;
    } else if (value === 2) {
      this.variableService.radius = 40;
    } else if (value === 4) {
      this.variableService.radius = 80;
    } else if (value === 6) {
      this.variableService.radius = 200;
    } else if (value === 8) {
      this.variableService.radius = 500;
    } else if (value === 10) {
      this.variableService.radius = 1000;
    } else if (value === 12) {
      this.variableService.radius = 2000;
    } else if (value === 14) {
      this.variableService.radius = 4000;
    }
  }


  selectedDate() {
    if (!this.dateEditFilter) {
      this.dateRangeList.push({
        start: this.formatDate(this.dateRange.begin),
        end: this.formatDate(this.dateRange.end)
      });
    } else {
      this.dateRangeList[this.dateEditIndex] = {
        start: this.formatDate(this.dateRange.begin),
        end: this.formatDate(this.dateRange.end)
      };
      this.dateEditFilter = false;
    }
  }

  formatDate(date) {
    return formatDate(date, 'MMM dd yyyy', this.locale);
  }

  editDateRange(i) {
    this.dateEditFilter = true;
    this.dateEditIndex = i;
    this.picker.open();
  }

  deleteDateRange(i) {
    this.dateRangeList.splice(i, 1);
  }

  priceSlideChange(event) {
    if (event.checked) {
      this.priceToggleState = true;
      this.priceCriteria = 'Choose A Price Model';
    } else {
      this.priceToggleState = false;
      this.priceCriteria = 'FREE';
    }
  }


  selectPriceModel(event) {
    this.priceModel = event.detail.value;
    this.priceDetailSaved = false;
    this.addHours = false;
    this.addComments = false;
  }

  savePriceModel(priceModel) {

    this.priceSavingProcess = true;

    if (priceModel === 'Hourly') {
      this.priceModelDetail = this.hourlyPriceForm.value;
    } else if (priceModel === 'Half Day') {
      this.priceModelDetail = this.halfDayPriceForm.value;
    } else if (priceModel === 'Full Day') {
      this.priceModelDetail = this.fullDayPriceForm.value;
    } else if (priceModel === 'Service') {
      this.priceModelDetail = this.servicePriceForm.value;
    } else if (priceModel === 'Price Range') {
      this.priceModelDetail = this.priceRangeForm.value;
    }

    setTimeout(() => {
      this.priceSavingProcess = false;
      this.priceDetailSaved = true;
      Swal.fire({title: 'Pricing details saved', timer: 2000}).then();
    }, 2000);
  }

  changeGuestMode(event, mode) {
    if (event.checked) {
      if (mode === 'adult') {
        this.guestCheckModes = {adult: true, child: false, infant: false};
      } else if (mode === 'child') {
        this.guestCheckModes = {adult: false, child: true, infant: false};
      } else {
        this.guestCheckModes = {adult: false, child: false, infant: true};
      }
    }
  }

  addGuest() {

    this.priceDetailSaved = true;

    if (this.guestCheckModes.adult === true) {

      const already = this.guestPriceDetails.filter(item => item.type === 'adult');

      if (already.length < 1) {
        this.guestPriceDetails.push({
          type: 'adult',
          key: 'adultPrice',
          price: this.guestPriceForm.value.guestPrice,
          key1: 'guestComments',
          comments: this.guestPriceForm.value.guestComments
        });
      }
    } else if (this.guestCheckModes.child === true) {

      const already = this.guestPriceDetails.filter(item => item.type === 'child');

      if (already.length < 1) {
        this.guestPriceDetails.push({
          type: 'child',
          key: 'childPrice',
          price: this.guestPriceForm.value.guestPrice,
          key1: 'guestComments',
          comments: this.guestPriceForm.value.guestComments
        });
      }
    } else if (this.guestCheckModes.infant === true) {

      const already = this.guestPriceDetails.filter(item => item.type === 'infant');

      if (already.length < 1) {
        this.guestPriceDetails.push({
          type: 'infant',
          key: 'infantPrice',
          price: this.guestPriceForm.value.guestPrice,
          key1: 'guestComments',
          comments: this.guestPriceForm.value.guestComments
        });
      }
    }

    this.guestPriceForm.patchValue({guestPrice: '', guestComments: ''});
  }

  deleteGuest(i) {
    this.guestPriceDetails.splice(i, 1);
  }

  changeWeeklyMode(event, mode) {
    if (event.checked) {
      if (mode === 'weekly') {
        this.weeklyCheckModes = {weekly: true, weekend: false, nightly: false};
        this.weeklyPriceForm.patchValue({weeklyPrice: '', weeklyComments: ''});
      } else if (mode === 'weekend') {
        this.weeklyCheckModes = {weekly: false, weekend: true, nightly: false};
        this.weeklyPriceForm.patchValue({weeklyPrice: '', weeklyComments: ''});
      } else {
        this.weeklyCheckModes = {weekly: false, weekend: false, nightly: true};
        this.weeklyPriceForm.patchValue({weeklyPrice: '', weeklyComments: ''});
      }
    }
  }

  addWeekly() {

    this.priceDetailSaved = true;

    if (this.weeklyCheckModes.weekly === true) {

      const already = this.weeklyPriceDetails.filter(item => item.type === 'Weekly');

      if (already.length < 1) {
        this.weeklyPriceDetails.push({
          type: 'Weekly',
          key: 'weeklyPrice',
          price: this.weeklyPriceForm.value.weeklyPrice,
          key1: 'weeklyComments',
          comments: this.weeklyPriceForm.value.weeklyComments
        });
      }
    } else if (this.weeklyCheckModes.weekend === true) {

      const already = this.weeklyPriceDetails.filter(item => item.type === 'Weekend');

      if (already.length < 1) {
        this.weeklyPriceDetails.push({
          type: 'Weekend',
          key: 'weekendPrice',
          price: this.weeklyPriceForm.value.weeklyPrice,
          key1: 'weekendComments',
          comments: this.weeklyPriceForm.value.weeklyComments
        });
      }
    } else if (this.weeklyCheckModes.nightly === true) {

      const already = this.weeklyPriceDetails.filter(item => item.type === 'Nightly');

      if (already.length < 1) {
        this.weeklyPriceDetails.push({
          type: 'Nightly',
          key: 'nightlyPrice',
          price: this.weeklyPriceForm.value.weeklyPrice,
          key1: 'nightlyComments',
          comments: this.weeklyPriceForm.value.weeklyComments
        });
      }
    }

    this.weeklyPriceForm.patchValue({weeklyPrice: '', weeklyComments: ''});
  }

  deleteWeekly(i) {
    this.weeklyPriceDetails.splice(i, 1);
  }

  clearSavedPrice() {
    if (this.priceModel === 'Guest') {
      this.guestPriceDetails = [];
    } else if (this.priceModel === 'Weekly, Weekend, Nightly') {
      this.weeklyPriceDetails = [];
    } else {
      this.priceDetailSaved = false;
      this.priceModelDetail = {};
    }
  }

  deleteSavedPriceDetails() {
    this.priceDetailSaved = false;
    this.priceModelDetail = {};
  }

  displayComments(): string {

    let comments = '';

    if (this.priceModel === 'Hourly') {
      comments = this.priceModelDetail.hourlyComments;
    } else if (this.priceModel === 'Half Day') {
      comments = this.priceModelDetail.halfDayComments;
    } else if (this.priceModel === 'Full Day') {
      comments = this.priceModelDetail.fullDayComments;
    } else if (this.priceModel === 'Service') {
      comments = this.priceModelDetail.serviceComments;
    } else if (this.priceModel === 'Price Range') {
      comments = this.priceModelDetail.priceRangeComments;
    }

    return comments;
  }

  displaySavedPrice(): string {

    let price = '';

    if (this.priceModel === 'Hourly') {
      price = this.priceModelDetail.hourlyPrice;
    } else if (this.priceModel === 'Half Day') {
      price = this.priceModelDetail.halfDayPrice;
    } else if (this.priceModel === 'Full Day') {
      price = this.priceModelDetail.fullDayPrice;
    } else if (this.priceModel === 'Service') {
      price = this.priceModelDetail.servicePrice;
    } else if (this.priceModel === 'Price Range') {
      price = this.priceModelDetail.priceRangeFrom + '-' + this.priceModelDetail.priceRangeTo;
    }

    return price;
  }

  checkPriceDetailSaved() {

    let showAlertState = false;

    if (this.priceModel === 'Hourly') {
      if (this.hourlyPriceForm.value.hourlyPrice && !this.priceDetailSaved) {
        showAlertState = true;
      }
    } else if (this.priceModel === 'Half Day') {
      if (this.halfDayPriceForm.value.halfDayPrice && !this.priceDetailSaved) {
        showAlertState = true;
      }
    } else if (this.priceModel === 'Full Day') {
      if (this.fullDayPriceForm.value.fullDayPrice && !this.priceDetailSaved) {
        showAlertState = true;
      }
    } else if (this.priceModel === 'Guest') {
      if (this.guestPriceDetails.length === 0) {
        showAlertState = true;
      }
    } else if (this.priceModel === 'Service') {
      if (this.servicePriceForm.value.servicePrice && !this.priceDetailSaved) {
        showAlertState = true;
      }
    } else if (this.priceModel === 'Price Range') {
      if ((this.priceRangeForm.value.priceRangeFrom || this.priceRangeForm.value.priceRangeTo) && !this.priceDetailSaved) {
        showAlertState = true;
      }
    } else if (this.priceModel === 'Weekly, Weekend, Nightly') {
      if (this.weeklyPriceDetails.length === 0) {
        showAlertState = true;
      }
    }

    if (showAlertState) {
      this.showPriceDetailAlert().then();
    } else {
      if (this.priceModel === 'Guest') {
        const guestPrices: any = {};
        for (const item of this.guestPriceDetails) {
          guestPrices[item.key] = item.price;
          guestPrices[item.key1] = item.comments;
        }
        this.priceModelDetail = guestPrices;
      } else if (this.priceModel === 'Weekly, Weekend, Nightly') {
        const weeklyPrices: any = {};
        for (const item of this.weeklyPriceDetails) {
          weeklyPrices[item.key] = item.price;
          weeklyPrices[item.key1] = item.comments;
        }
        this.priceModelDetail = weeklyPrices;
      }
      this.save('availability');
    }
  }

  async showPriceDetailAlert() {

    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Do you want to save first?',
      buttons: [
        {
          text: 'Stop',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Save & Continue',
          handler: () => {
            if (this.priceModel === 'Hourly') {
              this.priceModelDetail = this.hourlyPriceForm.value;
            } else if (this.priceModel === 'Half Day') {
              this.priceModelDetail = this.halfDayPriceForm.value;
            } else if (this.priceModel === 'Full Day') {
              this.priceModelDetail = this.fullDayPriceForm.value;
            } else if (this.priceModel === 'Guest') {
              const guestPrices: any = {};
              for (const item of this.guestPriceDetails) {
                guestPrices[item.key] = item.price;
                guestPrices[item.key1] = item.comments;
              }
              this.priceModelDetail = guestPrices;
            } else if (this.priceModel === 'Service') {
              this.priceModelDetail = this.servicePriceForm.value;
            } else if (this.priceModel === 'Price Range') {
              this.priceModelDetail = this.priceRangeForm.value;
            } else if (this.priceModel === 'Weekly, Weekend, Nightly') {
              const weeklyPrices: any = {};
              for (const item of this.weeklyPriceDetails) {
                weeklyPrices[item.key] = item.price;
                weeklyPrices[item.key1] = item.comments;
              }
              this.priceModelDetail = weeklyPrices;
            }
            this.save('availability');
            this.nextStep();
          }
        }
      ]
    });

    await alert.present();
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


  demoChecked(event) {
    this.demoFlag = event.checked;
  }

  ratingChecked(event) {
    this.visibilities.rating = event.checked;
  }

  userChecked(event) {
    this.visibilities.user = event.checked;
  }


  submit() {

    this.nextStep();

    this.crud = {
      main_background: this.selectedBackgroundImage,
      categories: this.selectedCategories,
      suggest_category: this.suggestCategory,
      title: this.title,
      description: this.description,
      detailed_description: this.detailedDescription,
      address: this.addressList,
      radius: this.variableService.radius,
      date_range: this.dateRangeList,
      availability_description: this.availabilityDescription,
      price: {
        price_criteria: this.priceCriteria,
        price_model: this.priceModel,
        price_detail: this.priceModelDetail
      },
      more_images: this.moreImages,
      host_contact_settings: this.contactSettingsForm.value,
      rating: this.rating,
      vote: this.vote,
      visibility: this.visibilities,
      view_mode: this.viewModes,
      isDemo: this.demoFlag,
      uid: this.cacheService.user.uid
    };

    if (this.mode === 'remote update') {
      this.utilService.presentLoading(2000).then();
      this.apiService.updateCrud(this.remoteId, this.crud).then(() => {
        this.submitFlag = true;
        this.navController.back();
      });
    } else {
      this.utilService.presentLoading(2000).then();
      this.apiService.addCrud(this.crud).then(() => {
        this.submitFlag = true;
        Swal.fire({
          title: 'Successfully Shared:',
          html: this.title,
          confirmButtonText: 'AWESOME'
        }).then(() => this.openTerms());
      });
    }
  }

  async openTerms() {
    const modal = await this.modalController.create({component: TermsComponent});

    modal.onDidDismiss().then(() => this.navController.back());

    await modal.present();
  }


  unList() {
    this.utilService.presentLoading(2000).then();
    this.apiService.archiveCrud(this.remoteId).then(() => {
      this.submitFlag = true;
      this.navController.back();
    });
  }

  delete() {
    Swal.fire({
      title: 'Are you sure you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
    }).then(sweetAlertResult => {
      if (sweetAlertResult.value) {
        this.utilService.presentLoading(2000).then();
        this.apiService.deleteCrud(this.remoteId).then(() => {
          this.submitFlag = true;
          this.navController.back();
        });
      } else if (sweetAlertResult.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  async preview() {

    this.crud = {
      main_background: this.selectedBackgroundImage,
      categories: this.selectedCategories,
      suggest_category: this.suggestCategory,
      title: this.title,
      description: this.description,
      detailed_description: this.detailedDescription,
      address: this.addressList,
      radius: this.variableService.radius,
      date_range: this.dateRangeList,
      availability_description: this.availabilityDescription,
      price: {
        price_criteria: this.priceCriteria,
        price_model: this.priceModel,
        price_detail: this.priceModelDetail
      },
      more_images: this.moreImages,
      host_contact_settings: this.contactSettingsForm.value,
      rating: this.rating,
      vote: this.vote,
      visibility: this.visibilities,
      view_mode: this.viewModes,
      isDemo: this.demoFlag,
      uid: this.cacheService.user.uid,
      user: this.cacheService.user
    };

    const modal = await this.modalController.create({
      component: DetailComponent,
      componentProps: {crud: this.crud}
    });

    return await modal.present();
  }
}
