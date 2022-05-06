import {Component, OnInit} from '@angular/core';

import {ModalController} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

import {CATEGORIES} from '../../../app.constant';
import {CrudDetailComponent} from '../crud-detail/crud-detail.component';

@Component({
    selector: 'gs360-crud-all',
    templateUrl: './crud-all.component.html',
    styleUrls: ['./crud-all.component.scss'],
})
export class CrudAllComponent implements OnInit {

    allCrud = [];
    filteredCrud = [];

    filterKeys = ['Newest', 'Distance', 'Category'];
    selectedFilterKey = 'Newest';

    categories = CATEGORIES;
    selectedCategory: string;

    constructor(public modalController: ModalController,
                private apiService: ApiService,
                private utilService: UtilService,
                public variableService: VariableService) {

        this.GetAllCrud();
    }

    ngOnInit() {
    }

    GetAllCrud() {
        this.utilService.presentLoading(10000).then(() => {
            this.apiService.allCrud().then(resp => {
                this.allCrud = resp;
                this.filteredCrud = resp.filter(item => !item.isDemo);
                this.utilService.dismissLoading();
            });
        });
    }

    selectFilterKey(filterKey: string) {
        this.selectedFilterKey = filterKey;
        this.filterCrud(filterKey);
    }

    filterCrud(filterKey: string) {

        if (filterKey === 'Newest') {
            this.filteredCrud = this.allCrud.sort((a, b) => {
                return this.dateSort(a, b);
            });
        } else if (filterKey === 'Distance') {
            this.filteredCrud = this.allCrud.sort((a, b) => {
                return this.distanceSort(a, b);
            });

        }
    }

    distanceSort(a, b): number {

        let result: number;

        if (a.address[0]) {
            if (b.address[0]) {
                if (this.calculateDistance(a.address[0].latLng, this.variableService.userLocation) > this.calculateDistance(b.address[0].latLng, this.variableService.userLocation)) {
                    result = 1;
                } else {
                    result = -1;
                }
            } else {
                result = -1;
            }
        } else {
            result = 1;
        }

        return result;
    }

    calculateDistance(latLng1, latLng2) {
        const R = 6378137;
        const dLat = this.rad(latLng2.lat - latLng1.lat);
        const dLong = this.rad(latLng2.lng - latLng1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.rad(latLng1.lat)) * Math.cos(this.rad(latLng2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    rad(x): number {
        return x * Math.PI / 180;
    }

    dateSort(a, b): number {

        let result: number;

        if (a.createdAt || a.updatedAt) {
            const dateA = a.createdAt || a.updatedAt;
            if (b.createdAt || b.updatedAt) {
                const dataB = b.createdAt || b.updatedAt;
                if (dateA < dataB) {
                    result = 1;
                } else {
                    result = -1;
                }
            } else {
                result = -1;
            }
        } else {
            result = 1;
        }

        return result;
    }

    selectCategory(category: string) {
        this.selectedCategory = category;
        this.filteredCrud = this.allCrud.filter(item => item.categories.includes(category));
    }

    async openCrudDetail(crud) {

        const modal = await this.modalController.create({
            component: CrudDetailComponent,
            componentProps: {crud}
        });

        return await modal.present();
    }

}
