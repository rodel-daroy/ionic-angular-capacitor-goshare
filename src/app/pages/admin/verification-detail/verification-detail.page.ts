import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';

import {ModalController, NavParams} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {VariableService} from '../../../services/data/variable.service';

@Component({
  selector: 'app-verification-detail',
  templateUrl: './verification-detail.page.html',
  styleUrls: ['./verification-detail.page.scss'],
})
export class VerificationDetailPage implements OnInit {

  selectedPendingUser;

  constructor(public modalController: ModalController,
              private navParams: NavParams,
              private apiService: ApiService,
              public variableService: VariableService) {

    this.selectedPendingUser = navParams.get('selectedPendingUser');
  }

  ngOnInit() {
  }


  approveVerification() {
    this.apiService.updateUser(this.selectedPendingUser.uid, {verifyStatus: 'verified'}).then(() => {
      Swal.fire({
        title: this.selectedPendingUser?.username + 'is verified by admin!',
        icon: 'success'
      }).then(() => this.modalController.dismiss({verifyStatus: 'verified'}));
    });
  }

  denyVerification() {
    this.apiService.updateUser(this.selectedPendingUser.uid, {verifyStatus: 'denied'}).then(() => {
      Swal.fire({
        title: this.selectedPendingUser?.username + 'is unverified by admin!',
        icon: 'error'
      }).then(() => this.modalController.dismiss({verifyStatus: 'denied'}));
    });
  }

}
