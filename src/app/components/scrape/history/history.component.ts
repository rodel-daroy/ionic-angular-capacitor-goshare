import {Component, OnInit} from '@angular/core';
import * as moment from 'moment';

import {ModalController, Platform} from '@ionic/angular';

import {CacheService} from '../../../services/cache/cache.service';
import {UtilService} from '../../../services/util/util.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {

  searchHistories = [];

  constructor(private platform: Platform,
              public modalController: ModalController,
              private cacheService: CacheService,
              private utilService: UtilService) {

    this.getHistories();
  }

  ngOnInit() {
  }


  getHistories() {
    this.utilService.presentLoading(1000).then();
    this.cacheService.getScrapeHistory().then(resp => this.searchHistories = resp);
  }

  clearAll() {
    this.cacheService.removeScrapeHistory().then(() => this.getHistories());
  }

  formatDate(date) {
    return moment(date).format('MMM DD YYYY');
  }

  scrapeHistoryView(history) {
    this.modalController.dismiss(history).then();
  }

  deleteHistory(index) {
    this.cacheService.removeScrapeHistoryItem(index).then(() => this.searchHistories.splice(index, 1));
  }

}
