import { Component, OnInit } from '@angular/core';

import {ActionSheetController, ModalController, NavParams} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {FunctionService} from '../../../services/firebase/function/function.service';
import {VariableService} from '../../../services/data/variable.service';

import {RequestReportComponent} from '../request-report/request-report.component';
import {RequestBlockComponent} from '../request-block/request-block.component';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss'],
})
export class RequestDetailComponent implements OnInit {

  requestDetail;

  connectionState: string;

  constructor(private actionSheetController: ActionSheetController,
              public modalController: ModalController,
              private navParams: NavParams,
              private apiService: ApiService,
              private cacheService: CacheService,
              private functionService: FunctionService,
              public variableService: VariableService) {

    this.requestDetail = navParams.get('request');

    this.checkConnectionState();
  }

  ngOnInit() {}



  checkConnectionState() {
    this.apiService.checkConnectionState(this.cacheService.user.uid, this.requestDetail.uid, this.requestDetail.id).then(resp => this.connectionState = resp);
  }

  async openDrawer() {

    if (this.requestDetail.user.uid === this.cacheService.user.uid) {

      const actionSheet = await this.actionSheetController.create({
        cssClass: 'profile-actionSheet',
        buttons: [
          {
            text: 'Remove this',
            handler: () => this.apiService.deleteRequest(this.requestDetail.id).then(() => this.modalController.dismiss({submit: 'success'}))
          }
        ]
      });

      await actionSheet.present();
    } else {

      const actionSheet = await this.actionSheetController.create({
        cssClass: 'profile-actionSheet',
        buttons: [
          {
            text: 'Report this',
            handler: async () => {
              const modal = await this.modalController.create({
                component: RequestReportComponent,
                componentProps: {request: this.requestDetail}
              });

              await modal.present();
            }
          }, {
            text: 'Report & Block',
            handler: async () => {
              const modal = await this.modalController.create({
                component: RequestBlockComponent,
                componentProps: {request: this.requestDetail}
              });

              await modal.present();
            }
          }
        ]
      });

      await actionSheet.present();
    }
  }

  connect() {
    this.apiService.connectRequest(this.cacheService.user.uid, this.requestDetail.uid, this.requestDetail.id).then(() => {
      const notificationData = {
        fcmToken: this.requestDetail.user.fcmToken,
        title: 'Incoming Requests',
        body: 'From ' + this.cacheService.user.username
      };
      this.functionService.pushNotification(notificationData).then().catch();
    });
  }

}
