import {Component, OnInit} from '@angular/core';

import {ModalController, Platform} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';

import {CrudDetailComponent} from '../crud-detail/crud-detail.component';

@Component({
    selector: 'app-save-list',
    templateUrl: './save-list.component.html',
    styleUrls: ['./save-list.component.scss'],
})
export class SaveListComponent implements OnInit {

    favourites = [];

    constructor(private platform: Platform,
                public modalController: ModalController,
                private apiService: ApiService,
                private cacheService: CacheService) {

        this.apiService.getFavourite(this.cacheService.user.uid).then(resp => this.favourites = resp);
    }

    ngOnInit() {
    }

    async openDetail(crud) {

        const modal = await this.modalController.create({
            component: CrudDetailComponent,
            componentProps: {crud}
        });

        return await modal.present();
    }

    deleteFavourite(i) {
        this.apiService.deleteFavourite(this.cacheService.user.uid, i).then(() => this.favourites.splice(i, 1));
    }

}
