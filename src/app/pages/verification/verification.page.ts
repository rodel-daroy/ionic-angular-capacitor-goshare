import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import {WebcamInitError, WebcamUtil} from 'ngx-webcam';

import {ActionSheetController, AlertController, ModalController, Platform} from '@ionic/angular';

import {ApiService} from '../../services/firebase/api/api.service';
import {CacheService} from '../../services/cache/cache.service';

import {WebcamComponent} from '../../components/utils/webcam/webcam.component';

import {VERIFICATION} from '../../app.constant';

import {CameraResultType, Plugins} from '@capacitor/core';

const {Camera} = Plugins;

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
})
export class VerificationPage implements OnInit {

  verificationTypes = VERIFICATION.US;
  documentType;

  uploadType = '';

  firstName = '';
  lastName = '';
  phoneNumber = '';
  address = '';

  valid = {front: false, back: false, live: false};

  images = {front: '', back: '', live: ''};

  multipleWebcamsAvailable = false;
  deviceId = '';

  constructor(private platform: Platform,
              private actionSheetController: ActionSheetController,
              private alertController: AlertController,
              private modalController: ModalController,
              private apiService: ApiService,
              private cacheService: CacheService) { }

  ngOnInit() {
    WebcamUtil.getAvailableVideoInputs().then((mediaDevices: MediaDeviceInfo[]) => {
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    });
  }



  public cameraWasSwitched(deviceId: string) {
    this.deviceId = deviceId;
  }

  public handleInitError(error: WebcamInitError) {
  }

  selectType(event) {
    this.documentType = event.value;
  }

  uploadImage(type: string) {

    this.uploadType = type;

    if (this.platform.is('cordova')) {
      this.fromMobile().then();
    } else {
      if (this.uploadType === 'live') {
        if (this.deviceId === '') {
          Swal.fire('Webcam is not connected.').then();
        } else {
          this.openWebcam().then();
        }
      } else {
        document.getElementById('verificationUpload').click();
      }
    }
  }

  async fromMobile() {
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

    this.uploadMobileImage(image.webPath);
  }

  async openGallery() {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
    });

    this.uploadMobileImage(image.webPath);
  }

  uploadMobileImage(base64String) {

    const imageSrc = 'data:image/png;base64,' + base64String;

    if (this.uploadType === 'front') {
      this.images.front = imageSrc;
      this.valid.front = true;
    } else if (this.uploadType === 'back') {
      this.images.back = imageSrc;
      this.valid.back = true;
    } else if (this.uploadType === 'live') {
      this.images.live = imageSrc;
      this.valid.live = true;
    }
  }


  verificationUpload(event: any) {
    this.openImageCropper(event);
  }

  openImageCropper(event) {

    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = () => {
      if (this.uploadType === 'front') {
        this.images.front = reader.result as string;
        this.valid.front = true;
      } else if (this.uploadType === 'back') {
        this.images.back = reader.result as string;
        this.valid.back = true;
      }
    };
  }

  async openWebcam() {
    const modal = await this.modalController.create({component: WebcamComponent});

    modal.onDidDismiss().then(overlayEventResult => {
      if (overlayEventResult.data) {
        // eslint-disable-next-line no-underscore-dangle
        this.images.live = overlayEventResult.data._imageAsDataUrl;
        this.valid.live = true;
      }
    });

    return await modal.present();
  }

  async removeImage(type: string) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Do you want to remove this document',
      buttons: [
        {
          text: 'DELETE',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            if (type === 'front') {
              this.images.front = '';
              this.valid.front = false;
            } else if (type === 'back') {
              this.images.back = '';
              this.valid.back = false;
            } else if (type === 'live') {
              this.images.live = '';
              this.valid.live = false;
            }
          }
        },
        {
          text: 'KEEP'
        }
      ]
    });

    await alert.present();
  }

  submit() {

    const verifyData = {
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      address: this.address,
      front: this.images.front,
      back: this.images.back,
      live: this.images.live,
      type: this.documentType
    };

    this.apiService.submitVerification(this.cacheService.user.uid, verifyData).then(() => {
      Swal.fire({title: 'Verification Data is successfully submitted!', icon: 'success'}).then();
      this.valid = {front: false, back: false, live: false};
      this.images = {front: '', back: '', live: ''};
    });
  }

}
