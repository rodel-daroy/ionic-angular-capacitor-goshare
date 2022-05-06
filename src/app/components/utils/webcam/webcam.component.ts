import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {WebcamImage, WebcamInitError} from 'ngx-webcam';
import {Observable, Subject} from 'rxjs';

import {ModalController, Platform} from '@ionic/angular';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss'],
})
export class WebcamComponent implements OnInit {

  @Output()
  public pictureTaken = new EventEmitter<WebcamImage>();

  public showWebcam = true;
  public allowCameraSwitch = true;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];
  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  constructor(private platform: Platform,
              public modalController: ModalController) {
  }

  ngOnInit() {
  }


  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  public handleImage(webcamImage: WebcamImage) {
    this.pictureTaken.emit(webcamImage);
    this.modalController.dismiss(webcamImage).then();
  }

  public cameraWasSwitched(deviceId: string) {
    this.deviceId = deviceId;
  }

  public handleInitError(error: WebcamInitError) {
    this.errors.push(error);
  }

  public triggerSnapshot() {
    this.trigger.next();
  }

}
