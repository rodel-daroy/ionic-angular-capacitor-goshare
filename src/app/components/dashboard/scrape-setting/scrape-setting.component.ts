import {Component, OnInit} from '@angular/core';

import {ModalController, Platform} from '@ionic/angular';

import {VariableService} from '../../../services/data/variable.service';

import {ScrapeViewComponent} from '../scrape-view/scrape-view.component';

import {AllScrapeSites} from '../../../app.constant';

@Component({
    selector: 'app-scrape-setting',
    templateUrl: './scrape-setting.component.html',
    styleUrls: ['./scrape-setting.component.scss'],
})
export class ScrapeSettingComponent implements OnInit {

    scrapeLimit;

    allScrapeSites = [];
    selectedScrapeSites = [];

    constructor(private platform: Platform,
                public modalController: ModalController,
                private variableService: VariableService) {

        this.scrapeLimit = this.variableService.scrapeItemsLimit;
        this.selectedScrapeSites = this.variableService.selectedScrapeSites;

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

    ngOnInit() {
        this.platform.ready().then(() => {
            this.platform.backButton.subscribeWithPriority(10, () => this.modalController.dismiss());
        });
    }

    update() {
        this.variableService.scrapeItemsLimit = this.scrapeLimit;
    }

    async view(site) {

        const modal = await this.modalController.create({
            component: ScrapeViewComponent,
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

}
