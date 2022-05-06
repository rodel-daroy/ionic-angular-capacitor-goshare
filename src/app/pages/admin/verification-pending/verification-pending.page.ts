import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

import {ModalController} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

import {VerificationDetailPage} from '../verification-detail/verification-detail.page';

@Component({
  selector: 'app-verification-pending',
  templateUrl: './verification-pending.page.html',
  styleUrls: ['./verification-pending.page.scss'],
})
export class VerificationPendingPage implements OnInit {

  desktopPlatform: boolean;

  pendingUsers = [];
  verifiedUsers = [];
  deniedUsers = [];
  deletedUsers = [];

  selectedPendingUser;

  constructor(private modalController: ModalController,
              private apiService: ApiService,
              private utilService: UtilService,
              public variableService: VariableService) {

    this.getPendingVerifications();
  }

  ngOnInit() {
    this.desktopPlatform = window.innerWidth >= 600;
  }


  getPendingVerifications() {
    this.utilService.presentLoading(5000).then(() => {
      this.apiService.getPendingUsers().then(resp => {
        this.pendingUsers = resp.pending;
        this.verifiedUsers = resp.verified;
        this.deniedUsers = resp.denied;
        this.deletedUsers = resp.deleted;
        this.utilService.dismissLoading();
      });
    });
  }

  deleteVerification(user) {
    this.apiService.updateUser(user.uid, {verifyStatus: 'deleted'}).then(() => {
      Swal.fire({title: user?.username + ' is deleted by admin!', icon: 'error'})
        .then(() => {
          this.getPendingVerifications();
          this.selectedPendingUser = null;
        });
    });
  }

  async selectUser(user) {
    if (this.desktopPlatform) {
      this.selectedPendingUser = user;
    } else {
      const modal = await this.modalController.create({
        component: VerificationDetailPage,
        componentProps: {selectedPendingUser: user}
      });

      modal.onDidDismiss().then(overlayEventResult => {
        if (overlayEventResult.data) {
          this.getPendingVerifications();
        }
      });

      await modal.present();
    }
  }

  approveVerification(user) {
    this.apiService.updateUser(user.uid, {verifyStatus: 'verified'}).then(() => {
      Swal.fire({title: user?.username + ' is verified by admin!', icon: 'success'})
        .then(() => {
          this.getPendingVerifications();
          this.selectedPendingUser = null;
        });
    });
  }

  denyVerification(user) {
    this.apiService.updateUser(user.uid, {verifyStatus: 'denied'}).then(() => {
      Swal.fire({title: user?.username + ' is denied by admin!', icon: 'error'})
        .then(() => {
          this.getPendingVerifications();
          this.selectedPendingUser = null;
        });
    });
  }

}
