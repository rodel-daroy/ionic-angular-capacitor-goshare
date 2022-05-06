import { Component, OnInit } from '@angular/core';

import {ModalController, NavParams} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {UtilService} from '../../../services/util/util.service';

@Component({
  selector: 'app-request-report',
  templateUrl: './request-report.component.html',
  styleUrls: ['./request-report.component.scss'],
})
export class RequestReportComponent implements OnInit {

  request;
  reason = '';

  constructor(public modalController: ModalController,
              private navParams: NavParams,
              private apiService: ApiService,
              private cacheService: CacheService,
              private utilService: UtilService) {

    this.request = navParams.get('request');
  }

  ngOnInit() {}


  submit() {
    this.utilService.presentLoading(3000).then();
    this.apiService.reportRequest(this.request.id, {uid: this.cacheService.user.uid, reason: this.reason})
      .then(() => this.modalController.dismiss({action: 'submit'}));
  }

}
