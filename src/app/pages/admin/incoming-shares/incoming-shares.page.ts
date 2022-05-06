import {Component, OnInit} from '@angular/core';

import {ModalController} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {FunctionService} from '../../../services/firebase/function/function.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

import {DetailComponent} from '../../../components/crud/detail/detail.component';
import {RequestDetailComponent} from '../../../components/request/request-detail/request-detail.component';

import {DATABASE} from '../../../app.constant';

@Component({
  selector: 'app-incoming-shares',
  templateUrl: './incoming-shares.page.html',
  styleUrls: ['./incoming-shares.page.scss'],
})
export class IncomingSharesPage implements OnInit {

  desktopPlatform: boolean;

  pendingCruds = [];
  approvedCruds = [];
  deniedCruds = [];
  flaggedCruds = [];

  allRequests = [];
  flaggedRequests = [];
  approvedRequests = [];
  deniedRequests = [];

  constructor(private modalController: ModalController,
              private apiService: ApiService,
              private cacheService: CacheService,
              private functionService: FunctionService,
              private utilService: UtilService,
              public variableService: VariableService) {

    this.getIncomingShares();
  }

  ngOnInit() {
    this.desktopPlatform = window.innerWidth >= 600;
  }


  getIncomingShares() {
    this.utilService.presentLoading(10000).then(() => {
      this.apiService.incomingShares().then(resp => {
        this.pendingCruds = resp.crud.pending;
        this.flaggedCruds = resp.crud.flagged;
        this.approvedCruds = resp.crud.approved;
        this.deniedCruds = resp.crud.denied;
        this.allRequests = resp.request.all;
        this.flaggedRequests = resp.request.flagged;
        this.approvedRequests = resp.request.approved;
        this.deniedRequests = resp.request.denied;
        this.utilService.dismissLoading();
      });
    });
  }

  async crudDetail(crud) {
    const modal = await this.modalController.create({
      component: DetailComponent,
      componentProps: {crud}
    });

    return await modal.present();
  }

  blockCrud(crud) {
    this.apiService.blockCrud(crud.id).then(() => this.getIncomingShares());
  }

  keepCrud(crud) {
    this.apiService.keepCrud(crud.id).then(() => {
      this.getIncomingShares();
      if (crud.user.fcmToken && crud.user.fcmToken !== '') {
        const notificationData = {
          fcmToken: crud.user.fcmToken,
          title: 'This item has been approved by an admin',
          body: 'From Admin'
        };
        this.functionService.pushNotification(notificationData).then().catch();
      }
    });
  }

  approveCrud(crud) {
    this.apiService.approveCrud(crud.id).then(() => this.getIncomingShares());
  }

  denyCrud(crud) {
    this.apiService.denyCrud(crud.id).then(() => this.getIncomingShares());
  }

  async requestDetail(request) {
    const modal = await this.modalController.create({
      component: RequestDetailComponent,
      componentProps: {request}
    });

    return await modal.present();
  }

  blockRequest(request) {
    this.apiService.adminBlockRequest(request.id).then(() => this.getIncomingShares());
  }

  keepRequest(request) {
    this.apiService.keepRequest(request.id).then(() => {
      this.getIncomingShares();
      if (request.user.fcmToken && request.user.fcmToken !== '') {
        const notificationData = {
          fcmToken: request.user.fcmToken,
          title: 'This item has been approved by an admin',
          body: 'From Admin'
        };
        this.functionService.pushNotification(notificationData).then().catch();
      }
    });
  }

  approveRequest(request) {
    this.apiService.approveRequest(request.id).then(() => this.getIncomingShares());
  }

  denyRequest(request) {
    this.apiService.denyRequest(request.id).then(() => this.getIncomingShares());
  }

  sendMsg(user, message) {

    const newMsg = {
      text: message,
      user: this.cacheService.user,
      createdAt: new Date().getTime(),
      status: 'pending'
    };

    const chatRefUrl = `${DATABASE.CHAT}/${user.uid}|${this.cacheService.user.uid}`;

    this.apiService.sendMessage(chatRefUrl, this.cacheService.user, user, newMsg)
      .then(() => {
        if (user.fcmToken && user.fcmToken !== '') {
          const notificationData = {
            fcmToken: user.fcmToken,
            title: 'Incoming Chat Messages',
            body: 'From ' + this.cacheService.user?.username
          };
          this.functionService.pushNotification(notificationData).then().catch();
        }
      });
  }

}
