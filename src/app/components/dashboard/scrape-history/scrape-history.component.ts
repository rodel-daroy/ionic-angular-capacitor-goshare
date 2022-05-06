import {Component, OnDestroy, OnInit} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import * as moment from 'moment';

import {ModalController, Platform} from '@ionic/angular';

import {CacheService} from '../../../services/cache/cache.service';
import {UtilService} from '../../../services/util/util.service';

@Component({
    selector: 'app-scrape-history',
    templateUrl: './scrape-history.component.html',
    styleUrls: ['./scrape-history.component.scss'],
})
export class ScrapeHistoryComponent implements OnInit, OnDestroy {

    searchHistories = [];

    backButtonSubscription: Subscription;

    constructor(private platform: Platform,
                public modalController: ModalController,
                private cacheService: CacheService,
                private utilService: UtilService) {

        this.getHistories();
    }

    ngOnInit() {

        const event = fromEvent(document, 'backbutton');

        this.backButtonSubscription = event.subscribe(async () => {
            const modal = await this.modalController.getTop();
            if (modal) {
                await modal.dismiss();
            }
        });
    }

    ngOnDestroy() {
        this.backButtonSubscription.unsubscribe();
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
