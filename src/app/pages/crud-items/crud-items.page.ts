import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';

import {AlertController, ModalController} from '@ionic/angular';

import {ApiService} from '../../services/firebase/api/api.service';
import {CacheService} from '../../services/cache/cache.service';
import {EventService} from '../../services/event/event.service';
import {UtilService} from '../../services/util/util.service';
import {VariableService} from '../../services/data/variable.service';

import {ContactSettingComponent} from '../../components/crud/contact-setting/contact-setting.component';
import {DetailComponent} from '../../components/crud/detail/detail.component';
import {SocialShareComponent} from '../../components/utils/social-share/social-share.component';
import {ChatComponent} from '../../components/connection/chat/chat.component';

@Component({
  selector: 'app-crud-items',
  templateUrl: './crud-items.page.html',
  styleUrls: ['./crud-items.page.scss'],
})
export class CrudItemsPage implements OnInit, OnDestroy {

  desktopPlatform: boolean;

  approvedCruds = [];
  pendingCruds = [];
  unListCruds = [];

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private alertController: AlertController,
              private modalController: ModalController,
              private apiService: ApiService,
              public cacheService: CacheService,
              private eventService: EventService,
              private utilService: UtilService,
              public variableService: VariableService) {

    if (this.cacheService.user) {
      this.getMyItems();
    } else {
      this.cacheService.getUser().then(resp => {
        if (resp) {
          this.getMyItems();
        } else {
          this.router.navigate(['login-new']).then();
        }
      });
    }

    this.eventService.getCreateCRUD().subscribe(resp => {
      if (JSON.parse(resp).submitFlag) {
        this.getMyItems();
      }
    });
  }

  ngOnInit() {
    this.desktopPlatform = window.innerWidth >= 600;
  }

  ngOnDestroy() {
    this.utilService.dismissLoading();
  }


  getMyItems() {
    this.utilService.presentLoading(10000).then(() => {
      this.apiService.myItems(this.cacheService.user.uid).then(resp => {
        this.approvedCruds = resp.approved;
        this.pendingCruds = resp.pending;
        this.unListCruds = resp.unList;
        this.utilService.dismissLoading();
      });
    });
  }

  editCRUD(item) {
    const navigationExtras: NavigationExtras = {
      state: {id: item.id, uid: item.uid}
    };

    this.router.navigate(['crud-new'], navigationExtras).then();
  }

  createNew() {
    this.router.navigate(['crud-new']).then();
  }

  crudBackgroundStyle(crud) {

    let bgStyle;

    if (crud.main_background !== '') {
      bgStyle = {'background-image': 'url(' + crud.main_background + ')'};
    } else {
      bgStyle = {'background-image': 'url(' + this.variableService.emptyImage + ')'};
    }

    return bgStyle;
  }

  displayPrice(crud): string {

    let price = '';

    if (crud.price.price_criteria === 'FREE') {
      price = 'Free';
    } else {
      if (crud.price.price_model === 'Hourly') {
        price = '$' + this.convertPrice(crud.price.price_detail.hourlyPrice).toFixed(2);
      } else if (crud.price.price_model === 'Half Day') {
        price = '$' + this.convertPrice(crud.price.price_detail.halfDayPrice).toFixed(2);
      } else if (crud.price.price_model === 'Full Day') {
        price = '$' + this.convertPrice(crud.price.price_detail.fullDayPrice).toFixed(2);
      } else if (crud.price.price_model === 'Guest') {
        for (const key in crud.price.price_detail) {
          if (crud.price.price_detail.hasOwnProperty(key) && key.includes('Price')) {
            price += '$' + this.convertPrice(crud.price.price_detail[key]).toFixed(2) + ' - ';
          }
        }
        if (price.length > 4) {
          price = price.slice(0, -3);
        }
      } else if (crud.price.price_model === 'Service') {
        price = '$' + this.convertPrice(crud.price.price_detail.servicePrice).toFixed(2);
      } else if (crud.price.price_model === 'Price Range') {
        price = '$' + this.convertPrice(crud.price.price_detail.priceRangeFrom).toFixed(2) + ' - ' + '$' + this.convertPrice(crud.price.price_detail.priceRangeTo).toFixed(2);
      } else if (crud.price.price_model === 'Weekly, Weekend, Nightly') {
        for (const key in crud.price.price_detail) {
          if (crud.price.price_detail.hasOwnProperty(key) && key.includes('Price')) {
            price += '$' + this.convertPrice(crud.price.price_detail[key]).toFixed(2) + ' - ';
          }
        }
        if (price.length > 4) {
          price = price.slice(0, -3);
        }
      }
    }

    return price;
  }

  convertPrice(price): number {
    if (price) {
      return parseFloat(price);
    } else {
      return parseFloat('0');
    }
  }

  async share(crud) {
    const modal = await this.modalController.create({
      component: SocialShareComponent,
      componentProps: {crud}
    });

    return await modal.present();
  }

  async preview(crud) {
    const modal = await this.modalController.create({
      component: DetailComponent,
      componentProps: {crud}
    });

    return await modal.present();
  }

  getRenterUser(book) {
    if (book && !book.renter) {
      this.apiService.getUser(book.uid).then(resp => {
        book.renter = resp;
      });
    }

    return book.renter;
  }

  async openContactSettings(crud, i) {
    const modal = await this.modalController.create({
      component: ContactSettingComponent,
      componentProps: {
        crud,
        role: 'host',
        index: i
      }
    });

    return await modal.present();
  }

  async chat(user) {
    const modal = await this.modalController.create({
      component: ChatComponent,
      componentProps: {receiver: user}
    });

    return await modal.present();
  }

  async ratingAlert() {
    const alert = await this.alertController.create({
      message: 'We are currently working on this feature.',
      buttons: ['OK']
    });

    await alert.present();
  }

  reActivate(crud) {
    this.utilService.presentLoading(3000).then();
    this.apiService.activeCrud(crud.id).then(() => this.eventService.createCRUDPublish(JSON.stringify({submitFlag: true})));
  }

}
