import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import Swal from 'sweetalert2';
import {ModalController, NavParams, Platform} from '@ionic/angular';
import {InAppBrowser, InAppBrowserOptions} from '@ionic-native/in-app-browser/ngx';

import {CacheService} from '../../../services/cache/cache.service';
import {ScrapeService} from '../../../services/scrape/scrape.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

import {AllScrapeSites} from '../../../app.constant';

const scrapeSegmentTiles__mobile = [
    {cols: 6, rows: 3},
    {cols: 3, rows: 2},
    {cols: 3, rows: 4},
    {cols: 3, rows: 2},
    {cols: 2, rows: 2},
    {cols: 4, rows: 2},
    {cols: 6, rows: 3},
    {cols: 2, rows: 2},
    {cols: 2, rows: 2},
    {cols: 2, rows: 2},
];

@Component({
    selector: 'app-scrape-view',
    templateUrl: './scrape-view.component.html',
    styleUrls: ['./scrape-view.component.scss'],
})
export class ScrapeViewComponent implements OnInit {

    site: any;

    notYet = true;

    siteItems: any = [];

    scrapeGroups: any = [];

    constructor(private sanitizer: DomSanitizer,
                private platform: Platform,
                private navParams: NavParams,
                public modalController: ModalController,
                private inAppBrowser: InAppBrowser,
                private cacheService: CacheService,
                private scrapeService: ScrapeService,
                private utilService: UtilService,
                private variableService: VariableService) {

        this.site = navParams.get('site');

        for (const item of this.scrapeService.scrapedSites) {
            if (item.siteId === this.site.siteId) {
                this.notYet = false;
                this.siteItems = item.data;
                if (item.data.length > 0) {
                    this.makeGroups__scrape(item.data, item.data.length);
                } else {
                    this.utilService.presentToast('No results in ' + this.scrapeService.address.city).then();
                }
            }
        }

        if (this.notYet) {
            this.utilService.presentToast('Currently Getting Data').then();
        }
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.platform.backButton.subscribeWithPriority(10, () => this.modalController.dismiss());
        });
    }

    makeGroups__scrape(scrapes, count) {

        this.scrapeGroups = [];

        for (let i = 0; i < count; i++) {
            const oneGroup = [];
            for (let j = 0; j < 10; j++) {
                if (i * 10 + j < scrapes.length) {
                    const temp = scrapes[i * 10 + j];
                    temp.cols = scrapeSegmentTiles__mobile[j].cols;
                    temp.rows = scrapeSegmentTiles__mobile[j].rows;
                    oneGroup.push(temp);
                } else {
                    oneGroup.push(scrapeSegmentTiles__mobile[j]);
                }
            }
            this.scrapeGroups.push(oneGroup);
        }
    }

    scrapeBackgroundStyle(scrape) {
        if (scrape.image) {
            return {'background-image': 'url(' + scrape.image + ')'};
        } else {
            return {'background-image': 'url(' + this.variableService.emptyImage + ')'};
        }
    }

    scrapeDetail(scrape) {
        Swal.fire({
            title: 'You are leaving GoShare360, bookings will be in ' + scrape.name,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ok',
            reverseButtons: true,
        }).then((result) => {
            if (result.value) {
                const target = '_blank';
                const options: InAppBrowserOptions = {
                    location: 'yes',
                    hidden: 'no',
                    clearcache: 'yes',
                    clearsessioncache: 'yes',
                    zoom: 'yes',
                    hardwareback: 'yes',
                    mediaPlaybackRequiresUserAction: 'no',
                    shouldPauseOnSuspend: 'no',
                    closebuttoncaption: 'Close',
                    disallowoverscroll: 'no',
                    toolbar: 'yes',
                    enableViewportScale: 'no',
                    allowInlineMediaPlayback: 'no',
                    presentationstyle: 'pagesheet',
                    fullscreen: 'yes',
                };
                this.inAppBrowser.create(scrape.url, target, options);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
        });
    }

    getScrapeCategory(scrape) {

        let category = '';

        AllScrapeSites.forEach((site: any) => {
            if (site.name === scrape.name) {
                category = site.category;
            }
        });

        return category;
    }

}
