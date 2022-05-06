import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';

import {ActionSheetController, ModalController, Platform} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

import {GoogleMapComponent} from '../../utils/google-map/google-map.component';
import {ImageCropperComponent} from '../../utils/image-cropper/image-cropper.component';

import {STORAGE} from '../../../app.constant';

import {CameraResultType, Plugins} from '@capacitor/core';

const {Camera, Geolocation} = Plugins;

@Component({
  selector: 'app-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss'],
})
export class GpsComponent implements OnInit, AfterViewInit {

  locationTitle = '';
  locationDescription = '';
  locationFilter = 'private';
  icon = '';
  latLng: any = {};
  scrapeAddress = {};
  locationAddress = '';
  marker;

  mapOptions: google.maps.MapOptions;

  @ViewChild('gpsModalMap') gpsModalMap: GoogleMapComponent;

  constructor(private platform: Platform,
              private actionSheetController: ActionSheetController,
              public modalController: ModalController,
              private apiService: ApiService,
              private utilService: UtilService,
              private variableService: VariableService) {

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
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.platform.ready().then(() => {
      setTimeout(() => {

        this.gpsModalMap.initMap();

        const self = this;
        this.gpsModalMap.map.addListener('click', (event) => {

          if (self.marker) {
            self.marker.setMap(null);
          }

          const position = {lat: event.latLng.lat(), lng: event.latLng.lng()};

          self.utilService.presentLoading(1000).then();
          self.getAddress(position.lat, position.lng).then(address => {

            const addressArray = address.address_components;
            self.locationAddress = address.formatted_address;
            const formattedArray = self.locationAddress.split(',');
            const formattedCity = formattedArray[formattedArray.length - 3].trim();
            self.latLng = position;

            if (addressArray[8]) {
              if (self.locationAddress.split(',').length === 5) {
                self.scrapeAddress = {
                  country: addressArray[7].short_name,
                  state: addressArray[6].short_name,
                  city: addressArray[4].short_name === formattedCity ? addressArray[4].short_name : formattedCity,
                  zipCode: addressArray[8].short_name
                };
              } else {
                self.scrapeAddress = {
                  country: addressArray[6].short_name,
                  state: addressArray[5].short_name,
                  city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
                  zipCode: addressArray[7].short_name
                };
              }
            } else if (addressArray[7]) {
              self.scrapeAddress = {
                country: addressArray[6].short_name,
                state: addressArray[5].short_name,
                city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
                zipCode: addressArray[7].short_name
              };
            } else if (addressArray[6]) {
              self.scrapeAddress = {
                country: addressArray[5].short_name,
                state: addressArray[4].short_name,
                city: addressArray[2].short_name === formattedCity ? addressArray[2].short_name : formattedCity,
                zipCode: addressArray[6].short_name
              };
            } else if (addressArray[5]) {
              self.scrapeAddress = {
                country: addressArray[4].short_name,
                state: addressArray[3].short_name,
                city: addressArray[1].short_name === formattedCity ? addressArray[1].short_name : formattedCity,
                zipCode: addressArray[5].short_name
              };
            } else if (addressArray[2]) {
              self.scrapeAddress = {
                country: addressArray[2].short_name,
                state: addressArray[1].short_name,
                city: addressArray[0].short_name === formattedCity ? addressArray[0].short_name : formattedCity,
                zipCode: ''
              };
            }

            self.marker = new google.maps.Marker({
              position,
              map: self.gpsModalMap.map,
            });

            if (self.icon) {
              self.marker.setIcon({
                url: self.icon,
                scaledSize: new google.maps.Size(40, 40), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0), // anchor
              });
            }

          });
        });
      }, 500);
    });
  }


  locationRadioChange(event) {
    this.locationFilter = event.value;
  }

  uploadMapIcon() {

    if (this.platform.is('cordova')) {
      this.getImageOnDevice().then();
    } else {
      document.getElementById('gpsIconImageCropper').click();
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
        route: 'gps'
      }
    });

    modal.onDidDismiss().then(resp => {
      if (resp.data) {
        this.icon = resp.data;
      }
    });

    return await modal.present();
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

    this.uploadIconImage(image.webPath);
  }

  async openGallery() {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
    });

    this.uploadIconImage(image.webPath);
  }

  uploadIconImage(base64String) {
    this.utilService.presentLoading(3000).then();
    this.icon = 'data:image/png;base64,' + base64String;
    this.apiService.uploadImage(base64String, 'png', STORAGE.CRUD_MAP_ICONS).then(resp => this.icon = resp.imageUrl);
  }

  useMyLocation() {
    this.utilService.presentLoading(1000).then();
    Geolocation.getCurrentPosition().then(geoPosition => {

      const currentPosition = {lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude};
      this.getAddress(currentPosition.lat, currentPosition.lng).then((address: any) => {

        if (this.marker) {
          this.marker.setMap(null);
        }

        const addressArray = address.address_components;
        this.locationAddress = address.formatted_address;
        const formattedArray = this.locationAddress.split(',');
        const formattedCity = formattedArray[formattedArray.length - 3].trim();
        this.latLng = currentPosition;

        if (addressArray[8]) {
          if (this.locationAddress.split(',').length === 5) {
            this.scrapeAddress = {
              country: addressArray[7].short_name,
              state: addressArray[6].short_name,
              city: addressArray[4].short_name === formattedCity ? addressArray[4].short_name : formattedCity,
              zipCode: addressArray[8].short_name
            };
          } else {
            this.scrapeAddress = {
              country: addressArray[6].short_name,
              state: addressArray[5].short_name,
              city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
              zipCode: addressArray[7].short_name
            };
          }
        } else if (addressArray[7]) {
          this.scrapeAddress = {
            country: addressArray[6].short_name,
            state: addressArray[5].short_name,
            city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
            zipCode: addressArray[7].short_name
          };
        } else if (addressArray[6]) {
          this.scrapeAddress = {
            country: addressArray[5].short_name,
            state: addressArray[4].short_name,
            city: addressArray[2].short_name === formattedCity ? addressArray[2].short_name : formattedCity,
            zipCode: addressArray[6].short_name
          };
        } else if (addressArray[5]) {
          this.scrapeAddress = {
            country: addressArray[4].short_name,
            state: addressArray[3].short_name,
            city: addressArray[1].short_name === formattedCity ? addressArray[1].short_name : formattedCity,
            zipCode: addressArray[5].short_name
          };
        } else if (addressArray[2]) {
          this.scrapeAddress = {
            country: addressArray[2].short_name,
            state: addressArray[1].short_name,
            city: addressArray[0].short_name === formattedCity ? addressArray[0].short_name : formattedCity,
            zipCode: ''
          };
        }

        this.marker = new google.maps.Marker({
          position: currentPosition,
          map: this.gpsModalMap.map,
        });

        if (this.icon) {
          this.marker.setIcon({
            url: this.icon,
            scaledSize: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 0),
          });
        }

      });
    });
  }

  getAddress(latitude, longitude): Promise<any> {

    return new Promise((resolve, reject) => {

      const request = new XMLHttpRequest();

      const method = 'GET';
      const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=true&key=';
      const async = true;

      request.open(method, url, async);
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 200) {
            const data = JSON.parse(request.responseText);
            const address = data.results[0];
            resolve(address);
          } else {
            reject(request.status);
          }
        }
      };
      request.send();
    });
  }

  saveLocation() {

    const itineraryItem = {
      title: this.locationTitle,
      description: this.locationDescription,
      icon: this.icon,
      latLng: this.latLng,
      scrape_address: this.scrapeAddress,
      formatted_address: this.locationAddress
    };

    this.modalController.dismiss(itineraryItem).then();
  }

}
