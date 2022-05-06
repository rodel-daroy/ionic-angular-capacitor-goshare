import {Component, OnInit} from '@angular/core';

import {ItemReorderEventDetail} from '@ionic/core';
import {ModalController} from '@ionic/angular';

import {CacheService} from '../../../services/cache/cache.service';
import {VariableService} from '../../../services/data/variable.service';

import {DetailComponent} from '../detail/detail.component';

import {AllScrapeSites} from '../../../app.constant';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {

  scrapeLimit;

  allScrapeSites = [];
  selectedScrapeSites = [];

  constructor(public modalController: ModalController,
              private cacheService: CacheService,
              private variableService: VariableService) {

    this.scrapeLimit = this.variableService.scrapeItemsLimit;
    this.selectedScrapeSites = this.variableService.selectedScrapeSites;

    this.cacheService.getSites().then(resp => {
      if (resp) {
        resp.map((site: any) => {
          if (this.selectedScrapeSites.some((item) => item.siteId === site.siteId)) {
            this.allScrapeSites.push({
              siteId: site.siteId,
              name: site.name,
              logo: site.logo,
              siteURL: site.siteURL,
              category: site.category,
              data: site.data,
              size: site.size,
              checked: true
            });
          } else {
            this.allScrapeSites.push({
              siteId: site.siteId,
              name: site.name,
              logo: site.logo,
              siteURL: site.siteURL,
              category: site.category,
              data: site.data,
              size: site.size,
              checked: false
            });
          }
        });
      } else {
        AllScrapeSites.map((site: any) => {
          if (this.selectedScrapeSites.some((item) => item.siteId === site.siteId)) {
            this.allScrapeSites.push({
              siteId: site.siteId,
              name: site.name,
              logo: site.logo,
              siteURL: site.siteURL,
              category: site.category,
              data: site.data,
              size: site.size,
              checked: true
            });
          } else {
            this.allScrapeSites.push({
              siteId: site.siteId,
              name: site.name,
              logo: site.logo,
              siteURL: site.siteURL,
              category: site.category,
              data: site.data,
              size: site.size,
              checked: false
            });
          }
        });
      }
    });
  }

  ngOnInit() {
  }


  update() {
    this.variableService.scrapeItemsLimit = this.scrapeLimit;
  }

  async view(site) {

    const modal = await this.modalController.create({
      component: DetailComponent,
      componentProps: {site}
    });

    return await modal.present();
  }

  ionChange(site, event) {
    site.checked = event.checked;
  }

  save() {

    this.selectedScrapeSites = [];

    this.allScrapeSites.map((item) => {
      if (item.checked === true) {
        this.selectedScrapeSites.push({
          siteId: item.siteId,
          name: item.name,
          logo: item.logo,
          siteURL: item.siteURL,
          category: item.category,
          data: item.data,
          size: item.size
        });
      }
    });

    this.variableService.selectedScrapeSites = this.selectedScrapeSites;

    this.modalController.dismiss().then();
  }

  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    const draggedSites = this.moveArrayItemToNewIndex(this.allScrapeSites, ev.detail.from, ev.detail.to);
    this.cacheService.setSites(draggedSites).then();
    ev.detail.complete();
  }

  moveArrayItemToNewIndex(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      let k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }

}
