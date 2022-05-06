import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import Swal from 'sweetalert2';
import {ModalController, NavParams} from '@ionic/angular';

import {CacheService} from '../../../services/cache/cache.service';
import {ScrapeService} from '../../../services/scrape/scrape.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

import {AllScrapeSites} from '../../../app.constant';

import {Plugins} from '@capacitor/core';

const {Browser} = Plugins;

const scrapeSegmentTiles = [
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
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {

  site;

  notYet = true;

  siteItems = [];

  scrapeGroups = [];

  constructor(private sanitizer: DomSanitizer,
              private navParams: NavParams,
              public modalController: ModalController,
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
          this.makeGroupsScrape(item.data, item.data.length);
        } else {
          this.utilService.showToast('No results in ' + this.variableService.scrapeAddress.city).then();
        }
      }
    }

    if (this.notYet) {
      this.utilService.showToast('Currently Getting Data').then();
    }
  }

  ngOnInit() {
  }


  makeGroupsScrape(scrapes, count) {

    this.scrapeGroups = [];

    for (let i = 0; i < count; i++) {
      const oneGroup = [];
      for (let j = 0; j < 10; j++) {
        if (i * 10 + j < scrapes.length) {
          const temp = scrapes[i * 10 + j];
          temp.cols = scrapeSegmentTiles[j].cols;
          temp.rows = scrapeSegmentTiles[j].rows;
          oneGroup.push(temp);
        } else {
          oneGroup.push(scrapeSegmentTiles[j]);
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
    }).then(async (result) => {
      if (result.value) {
        await Browser.open({url: scrape.url});
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
