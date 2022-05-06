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
  selector: 'app-share-location',
  templateUrl: './share-location.component.html',
  styleUrls: ['./share-location.component.scss'],
})
export class ShareLocationComponent implements OnInit, AfterViewInit {

  mapOptions: google.maps.MapOptions;

  latLng: any = {};
  locationAddress = '';
  marker;
  locationDescription = '';
  icon = '';


  @ViewChild('shareLocationMap') shareLocationMap: GoogleMapComponent;

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

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.shareLocationMap.initMap();

      const self = this;
      this.shareLocationMap.map.addListener('click', (event) => {

        this.latLng = {lat: event.latLng.lat(), lng: event.latLng.lng()};

        if (self.marker) {
          self.marker.setMap(null);
        }

        self.marker = new google.maps.Marker({
          position: this.latLng,
          map: self.shareLocationMap.map,
        });
      });
    }, 500);
  }


  useMyLocation() {
    this.utilService.presentLoading(3000).then();
    Geolocation.getCurrentPosition().then(resp => {

      this.latLng = {lat: resp.coords.latitude, lng: resp.coords.longitude};

      this.getAddress(this.latLng.lat, this.latLng.lng).then(address => {

        if (this.marker) {
          this.marker.setMap(null);
        }

        this.marker = new google.maps.Marker({
          position: this.latLng,
          map: this.shareLocationMap.map,
        });

        this.locationAddress = address.formatted_address;
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

  uploadMapIcon() {
    if (this.platform.is('capacitor')) {
      this.getImageOnDevice().then();
    } else {
      document.getElementById('shareLocationIcon').click();
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
        route: 'share-location'
      }
    });

    modal.onDidDismiss().then(overlayEventResult => {
      if (overlayEventResult.data) {
        this.icon = overlayEventResult.data;
        this.marker.setIcon({
          url: this.icon,
          scaledSize: new google.maps.Size(40, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0),
        });
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
    this.apiService.uploadImage(base64String, 'png', STORAGE.CRUD_MAP_ICONS).then(resp => {
      this.icon = resp.imageUrl;
      this.marker.setIcon({
        url: this.icon,
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 0),
      });
    });
  }


  shareLocation() {
    this.modalController.dismiss({
      position: this.latLng,
      icon: this.icon,
      description: this.locationDescription
    }).then();
  }

}
