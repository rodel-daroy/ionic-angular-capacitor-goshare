import {Component, OnInit} from '@angular/core';
import {ImageCroppedEvent} from 'ngx-image-cropper';

import {ModalController, NavParams} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {UtilService} from '../../../services/util/util.service';

import {STORAGE} from '../../../app.constant';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
})
export class ImageCropperComponent implements OnInit {

  activatedRoute = '';

  imageChangedEvent;
  croppedImage = '';

  constructor(private navParams: NavParams,
              public  modalController: ModalController,
              private apiService: ApiService,
              private utilService: UtilService) {

    this.activatedRoute = navParams.get('route');
    this.imageChangedEvent = navParams.get('imageChangedEvent');
  }

  ngOnInit() {
  }


  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  crop() {
    this.utilService.presentLoading(5000).then(() => {
      if (this.activatedRoute === 'profile') {
        this.apiService.uploadImage(this.croppedImage.replace('data:image/png;base64,', ''), 'png', STORAGE.USER_PROFILE_IMAGES)
          .then(resp => this.modalController.dismiss(resp.imageUrl).then(() => this.utilService.dismissLoading()));
      } else if (this.activatedRoute === 'request') {
        this.apiService.uploadImage(this.croppedImage.replace('data:image/png;base64,', ''), 'png', STORAGE.REQUEST_IMAGES)
          .then(resp => this.modalController.dismiss(resp.imageUrl).then(() => this.utilService.dismissLoading()));
      } else {
        this.apiService.uploadImage(this.croppedImage.replace('data:image/png;base64,', ''), 'png', STORAGE.USER_VERIFICATION_IMAGES)
          .then(resp => this.modalController.dismiss(resp.imageUrl).then(() => this.utilService.dismissLoading()));
      }
    });
  }

}
