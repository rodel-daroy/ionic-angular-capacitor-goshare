import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import * as introJs from 'intro.js/intro';
import * as moment from 'moment';
import * as $ from 'jquery';

import {AlertController, ModalController, NavController, Platform, ToastController} from '@ionic/angular';

import {ApiService} from '../../services/firebase/api/api.service';
import {CacheService} from '../../services/cache/cache.service';
import {EventService} from '../../services/event/event.service';
import {LocationService} from '../../services/location/location.service';
import {ScrapeService} from '../../services/scrape/scrape.service';
import {UtilService} from '../../services/util/util.service';
import {VariableService} from '../../services/data/variable.service';

import {SettingComponent} from '../../components/scrape/setting/setting.component';
import {LocationComponent} from '../../components/scrape/location/location.component';
import {SizeOptionsComponent} from '../../components/dashboard/size-options/size-options.component';

import {AddressModel} from '../../models/model';

import {AllScrapeSites, CATEGORIES, StaticSites} from '../../app.constant';
import {PermissionType, Plugins} from '@capacitor/core';

const sampleTiles = [
  {cols: 6, rows: 3},
  {cols: 3, rows: 2},
  {cols: 3, rows: 4},
  {cols: 3, rows: 2},
  {cols: 2, rows: 2},
  {cols: 4, rows: 2},
  {cols: 6, rows: 3},
  {cols: 2, rows: 2},
  {cols: 2, rows: 2},
  {cols: 2, rows: 2}
];

const {Permissions, Browser} = Plugins;

@Component({
  selector: 'app-preview',
  templateUrl: './preview.page.html',
  styleUrls: ['./preview.page.scss'],
})
export class PreviewPage implements OnInit, AfterViewInit, OnDestroy {

  locationPermissionState = true;

  skipMap: boolean;
  mapShowing: boolean;
  staticSitesShowing: boolean;
  showingSize0: boolean;

  walkingLoader = 0;

  scrapeAddress: AddressModel;
  searchKeyword: string;
  scrapeTime: string;
  markerLabel: string;


  filteredScrapedSites = [];
  filteredScrapes = [];

  scrapeMarkers = [];

  mapOptions: google.maps.MapOptions;
  mouseoverState = false;
  circleShowing = false;

  scrollCategory;
  scrollName;
  scrollLogo;
  scrollSize;

  initScrapeSites = AllScrapeSites;
  staticSites = StaticSites;
  categories = CATEGORIES;

  introJS = introJs();


  crudViewMode = 'Horizontal';
  crudSizeOption = '';

  crudCategory = '';
  crudCategorySize = 0;

  allCrud = [];
  filteredCrud = [];
  requests = [];
  filteredRequests = [];

  crudMarkers = [];

  focusIndex = 0;
  focusTitle = '';

  crudGroups = [];

  scrapeSizeOption = '';
  scrapeViewMode = 'Horizontal';


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public platform: Platform,
    private alertController: AlertController,
    private modalController: ModalController,
    private navController: NavController,
    private toastController: ToastController,
    private apiService: ApiService,
    private cacheService: CacheService,
    private eventService: EventService,
    private locationService: LocationService,
    private scrapeService: ScrapeService,
    private utilService: UtilService,
    public variableService: VariableService) {

    this.skipMap = false;
    this.mapShowing = false;
    this.staticSitesShowing = true;
    this.showingSize0 = false;

    this.searchKeyword = '';
    this.markerLabel = '';


    this.scrapeAddress = this.variableService.scrapeAddress;
    this.mapOptions = {
      zoom: 11,
      center: this.variableService.userLocation,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      panControl: false
    };

    this.eventService.getGeolocationState().subscribe(resp => {
      if (resp.success === true) {
        this.scrapeAddress = this.variableService.scrapeAddress;
        if (!this.variableService.scrapingState) {
          this.scrapingSites();
          this.utilService.presentLoading(5000).then(() => {
            this.apiService.guestPreviewInfos().then(resp1 => {
              this.allCrud = resp1.crud;
              this.requests = resp1.request;
              this.crudDefaultFilter();
              this.filterRequests();
              this.utilService.dismissLoading();
            });
          });
        }
      } else {
        if (resp.error === 'geocoder') {
          this.locationService.getCurrentAddress();
        }
      }
    });

    this.eventService.getScrapeStep().subscribe(resp => {
      if (this.variableService.scrapingState) {
        this.defaultFilterScrape();
        this.displayScrapeMarkersOnAgmMap(resp.one);
      } else {
        if (this.searchKeyword !== '') {
          this.staticSitesShowing = true;
        }
      }
    });
  }

  ngOnInit() {
    this.previewCheckPermissions();

    this.platform.resume.subscribe(() => this.previewCheckPermissions());

    this.initViewMode();
  }

  ionViewWillEnter() {
    this.walkingLoader = Math.floor(Math.random() * 3);
  }

  ionViewDidEnter() {
    this.startIntro();
  }

  ngAfterViewInit() {
    this.platform.ready().then(() => this.startPreviewLoading());
  }

  ngOnDestroy() {
    this.utilService.dismissLoading();
  }


  previewCheckPermissions() {
    Permissions.query({name: PermissionType.Geolocation})
      .then((hasPermission) => {
        switch (hasPermission.state) {
          case 'granted':
            this.locationPermissionState = true;
            break;
          case 'prompt':
          case 'denied':
            this.utilService.showPrompt('GeoLocation', 'Permission is not granted');
            break;
        }
      });
  }

  previewRequestAccess() {
  }

  startPreviewLoading() {
    if (this.scrapeAddress) {
      this.scrapingSites();
      this.utilService.presentLoading(5000).then(() => {
        this.apiService.guestPreviewInfos().then(resp => {
          this.allCrud = resp.crud;
          this.requests = resp.request;
          this.crudDefaultFilter();
          this.filterRequests();
          this.utilService.dismissLoading();
        });
      });
    }
  }

  async startIntro() {
    if (this.platform.isLandscape()) {
      this.introJS.setOptions({
        steps: [
          {
            element: '#step1',
            intro: 'GOSHARE360 Is your one stop reference for all sharing sites. Our app allows you to find anything from shared items to experiences and gig work',
            position: 'auto'
          },
          {
            element: '#step2',
            intro: 'Our app automatically begins by looking for items near your current GPS position and displays the results in the Share Directory.'
          },
          {
            element: '#step3',
            intro: 'Here you can discover websites that offer sharing services'
          }
        ],
        showProgress: true,
        overlayOpacity: 0.0001
      });
    } else {
      this.introJS.setOptions({
        steps: [
          {
            element: '#step1',
            intro: 'GOSHARE360 Is your one stop reference for all sharing sites. Our app allows you to find anything from shared items to experiences and gig work',
            position: 'auto'
          },
          {
            element: '#step02',
            intro: 'Our app automatically begins by looking for items near your current GPS position and displays the results in the Share Directory.'
          },
          {
            element: '#step03',
            intro: 'Here you can discover websites that offer sharing services'
          }
        ],
        showProgress: true,
        overlayOpacity: 0.0001
      });
    }

    const tourState = await this.cacheService.getTour();
    if (tourState !== 'done') {
      this.introJS.start();
      $('.introjs-tooltip').css({'background-color': 'white', color: 'black'});
    }
    this.introJS.onexit(() => this.cacheService.setTour('done'));
    this.introJS.oncomplete(() => this.cacheService.setTour('done'));
  }


  async openScrapingSetting() {
    const modal = await this.modalController.create({component: SettingComponent});

    return await modal.present();
  }

  showAlert() {
    this.utilService.showToast('Login is required for this feature').then();
  }

  async reset() {
    await this.cacheService.removeScrapeHistory();
    window.location.reload();
  }

  async chooseLocation() {

    const modal = await this.modalController.create({component: LocationComponent});

    modal.onDidDismiss().then(resp => {
      if (resp.data) {
        this.variableService.scrapeAddress = resp.data.scrapeAddress;
        this.variableService.scrapeLocation = resp.data.scrapeLocation;
        this.variableService.scrapePlaceId = resp.data.scrapePlaceId;
        this.scrapeAddress = this.variableService.scrapeAddress;
        this.scrapingSites();
      }
    });

    await modal.present();
  }

  submitWebsite() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSfXEXTlE3qiB2dy_NInj4Jg6HtVJr7KLwNRnY0lVEL7jFaDBA/viewform', '_blank', 'location=yes');
  }

  enterSearchKeyword() {

    this.filteredScrapedSites = [];
    this.filteredScrapes = [];
    this.staticSitesShowing = false;

    if (this.variableService.scrapingState) {
      this.variableService.scrapingState = false;
      this.changeDetectorRef.detectChanges();
      setTimeout(() => this.scrapingSites(), 3000);
    } else {
      this.scrapingSites();
    }
  }

  clearSearchKeyword() {

    this.searchKeyword = '';
    this.staticSitesShowing = true;
    this.variableService.scrapingState = false;
    this.cacheService.getScrapeHistory().then((scrapeHistory: any[]) => {
      if (scrapeHistory.length > 0) {
        this.scrapeAddress = scrapeHistory[scrapeHistory.length - 1].address;
        this.filteredScrapedSites = scrapeHistory[scrapeHistory.length - 1].data;
        this.filteredScrapes = [];
        this.filteredScrapedSites.forEach(item => {
          this.filteredScrapes = this.filteredScrapes.concat(item.data);
        });
        this.markerLabel = this.filteredScrapes.length + ' Shared items near you';
        this.showScrapesOnMap();
      } else {
        this.scrapingSites();
      }
    });
  }


  scrapingSites() {
    this.scrapeService.keyword = this.searchKeyword;
    this.scrapeService.address = this.scrapeAddress;
    this.scrapeTime = moment().format('YYYY-MM-DD hh:mm');
    this.variableService.scrapingState = true;
    this.markerLabel = 'Searching';
    this.scrapeService.startScraping();
  }

  stopScraping() {
    this.staticSitesShowing = true;
    this.variableService.scrapingState = false;
    this.scrapeService.stopScraping();
  }

  defaultFilterScrape() {
    this.filteredScrapedSites = this.scrapeService.scrapedSites;
    this.filteredScrapes = JSON.parse(JSON.stringify(this.scrapeService.scrapedItems));
    this.markerLabel = this.filteredScrapes.length + ' Shared items near you';
  }

  categoryFilterScrape(category) {

    this.filteredScrapedSites = [];
    this.filteredScrapes = [];

    for (const site of this.scrapeService.scrapedSites) {
      if (site.category === category) {
        if (site.size > 0) {
          this.filteredScrapedSites.push(site);
          this.filteredScrapes = this.filteredScrapes.concat(site.data);
        }
      }
    }
  }

  scrapeImageSource(scrape) {
    if (scrape.image) {
      if (scrape.image.toString().includes('data:image')) {
        return this.variableService.emptyImage;
      } else {
        return scrape.image;
      }
    } else {
      return this.variableService.emptyImage;
    }
  }

  scrapeBackgroundStyle(scrape) {
    if (scrape.image) {
      return {'background-image': 'url(' + scrape.image + ')'};
    } else {
      return {'background-image': 'url(' + this.variableService.emptyImage + ')'};
    }
  }

  showScrapesOnMap() {
    this.clearScrapeMarkers();
    this.displayScrapeMarkersOnAgmMap(this.filteredScrapes);
  }

  clearScrapeMarkers() {
    this.scrapeMarkers = [];
  }

  displayScrapeMarkersOnAgmMap(scrapes) {

    if (this.platform.isLandscape() || this.mapShowing) {
      scrapes.forEach(item => {

        let latSign: number;
        let lngSign: number;

        if (Math.random() > 0.5) {
          latSign = 1;
        } else {
          latSign = -1;
        }
        if (Math.random() > 0.5) {
          lngSign = 1;
        } else {
          lngSign = -1;
        }

        const randomLat = latSign * (Math.floor(1000 + Math.random() * 9000)) / 100000;
        const randomLng = lngSign * (Math.floor(1000 + Math.random() * 9000)) / 100000;

        const randomPosition = {
          lat: (this.variableService.scrapeLocation.lat + randomLat),
          lng: (this.variableService.scrapeLocation.lng + randomLng)
        };

        const marker = {
          position: randomPosition,
          icon: {url: this.scrapeImageSource(item), scaledSize: {width: 30, height: 30}},
          data: item
        };

        this.scrapeMarkers.push(marker);
      });
    }
  }

  scrapeDetail(scrape) {
    Swal.fire({
      title: 'You are leaving GoShare360, bookings will be in ' + scrape.name,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      reverseButtons: true,
    }).then(async (sweetAlertResult) => {
      if (sweetAlertResult.value) {
        await Browser.open({url: scrape.url});
      } else if (sweetAlertResult.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  howItWorks(card, site) {
    Swal.fire({
      title: 'You are leaving GoShare360, bookings will be in ' + site.name,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      reverseButtons: true,
    }).then(async (sweetAlertResult) => {
      if (sweetAlertResult.value) {
        await Browser.open({url: card.link});
      } else if (sweetAlertResult.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }


  zoomChange(event) {
    if (this.platform.isLandscape()) {
      this.circleShowing = event <= 9;
    } else {
      this.circleShowing = event <= 8;
    }
  }

  mouseOut() {
    this.mouseoverState = false;
  }

  onMouseOver(infoWindow) {
    infoWindow.open();
  }

  onMouseOut(infoWindow) {
    infoWindow.close();
  }

  skipDesktopMap() {
    this.skipMap = !this.skipMap;
  }


  mapShowingOpen() {

    this.mapShowing = true;
    this.scrollCategory = '';
    this.scrollName = 'GoShare360';
    this.scrollLogo = 'assets/logo/original.svg';
    this.scrollSize = this.filteredCrud.length;

    setTimeout(() => {
      this.showScrapesOnMap();
    }, 1000);
  }

  mapShowingClose() {
    this.mapShowing = false;
  }

  getScrollCategory() {

    let ii = 0;
    let jj = 0;

    $('.category-large-container').each(function() {
      if ($(this).position().left < 100) {
        ii++;
      }
    });
    $('.category-small-container').each(function() {
      if ($(this).position().left < 100) {
        jj++;
      }
    });

    if (ii > 1) {
      this.scrollCategory = this.categories[ii - 2];
      for (let k = 0; k < ii - 2; k++) {
        const categorySites = this.ScrapeFilterByCategory(this.categories[ii - 3 - k]);
        jj -= categorySites.length;
      }
      const scrollCategorySites = this.ScrapeFilterByCategory(this.scrollCategory);
      this.scrollName = scrollCategorySites[jj - 2].name;
      this.scrollLogo = scrollCategorySites[jj - 2].logo;
      this.scrollSize = scrollCategorySites[jj - 2].size;
    } else {
      this.scrollCategory = '';
      this.scrollName = 'GoShare360';
      this.scrollLogo = 'assets/logo/original.svg';
      this.scrollSize = this.filteredCrud.length;
    }
  }

  ScrapeFilterByCategory(category) {

    const filteredSites = [];

    this.filteredScrapedSites.forEach(site => {
      if (site.category.length > 0) {
        if (site.category.includes(category)) {
          filteredSites.push(site);
        }
      }
    });

    return filteredSites;
  }

  scrapeFilterBySize() {
    return this.filteredScrapedSites.filter(item => item.size > 0);
  }

  scrapeFilterBySize0() {
    return this.filteredScrapedSites.filter(item => item.size === 0);
  }


  initViewMode() {
    this.crudSizeOption = 'large';
    this.scrapeSizeOption = 'medium';
  }

  changeCrudCardSize(mode) {
    this.crudSizeOption = mode;
  }

  crudViewModeChange(event) {
    if (event.checked) {
      this.crudViewMode = 'Vertical';
    } else {
      this.crudViewMode = 'Horizontal';
    }
  }

  crudDetail() {
    this.needToLogin();
  }

  async needToLogin() {
    const alert = await this.alertController.create({
      header: 'Please login for full access to features',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        },
        {
          text: 'Login',
          handler: () => this.navController.navigateBack('login-new')
        }
      ]
    });

    await alert.present();
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
        price = '$' + this.convertPrice(crud.price.price_detail.hourlyPrice).toFixed(2) + '/hour';
      } else if (crud.price.price_model === 'Half Day') {
        price = '$' + this.convertPrice(crud.price.price_detail.halfDayPrice).toFixed(2) + '/half day';
      } else if (crud.price.price_model === 'Full Day') {
        price = '$' + this.convertPrice(crud.price.price_detail.fullDayPrice).toFixed(2) + '/day';
      } else if (crud.price.price_model === 'Guest') {
        for (const key in crud.price.price_detail) {
          if (crud.price.price_detail.hasOwnProperty(key) && key.includes('Price')) {
            if (key === 'adultPrice') {
              price += '$' + this.convertPrice(crud.price.price_detail[key]).toFixed(2) + '/adult - ';
            } else if (key === 'childPrice') {
              price += '$' + this.convertPrice(crud.price.price_detail[key]).toFixed(2) + '/child - ';
            } else if (key === 'infantPrice') {
              price += '$' + this.convertPrice(crud.price.price_detail[key]).toFixed(2) + '/infant - ';
            }
          }
        }
        if (price.length > 4) {
          price = price.slice(0, -3);
        }
      } else if (crud.price.price_model === 'Service') {
        price = '$' + this.convertPrice(crud.price.price_detail.servicePrice).toFixed(2) + '/service';
      } else if (crud.price.price_model === 'Price Range') {
        price = '$' + this.convertPrice(crud.price.price_detail.priceRangeFrom).toFixed(2) + ' - ' + '$' + this.convertPrice(crud.price.price_detail.priceRangeTo).toFixed(2) + '/range';
      } else if (crud.price.price_model === 'Weekly, Weekend, Nightly') {
        for (const key in crud.price.price_detail) {
          if (crud.price.price_detail.hasOwnProperty(key) && key.includes('Price')) {
            if (key === 'weeklyPrice') {
              price += '$' + this.convertPrice(crud.price.price_detail[key]).toFixed(2) + '/week - ';
            } else if (key === 'weekendPrice') {
              price += '$' + this.convertPrice(crud.price.price_detail[key]).toFixed(2) + '/weekend - ';
            } else if (key === 'nightlyPrice') {
              price += '$' + this.convertPrice(crud.price.price_detail[key]).toFixed(2) + '/night - ';
            }
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

  requestDetail() {
    this.needToLogin();
  }

  async openSizeOptions(type: string) {
    const modal = await this.modalController.create({
      component: SizeOptionsComponent,
      componentProps: {
        type,
        size: type === 'GoShare' ? this.crudSizeOption : this.scrapeSizeOption,
        view: type === 'GoShare' ? this.crudViewMode : this.scrapeViewMode,
      }
    });

    modal.onDidDismiss().then(overlayEventResult => {
      if (overlayEventResult.data) {
        if (type === 'GoShare') {
          this.crudViewMode = overlayEventResult.data.viewMode;
          let valid = '';
          for (const key in overlayEventResult.data.sizeOption) {
            if (overlayEventResult.data.sizeOption.hasOwnProperty(key)) {
              if (overlayEventResult.data.sizeOption[key]) {
                valid = key;
              }
            }
          }
          this.crudSizeOption = valid;
        } else if (type === 'Scrape') {
          this.scrapeViewMode = overlayEventResult.data.viewMode;
          let valid = '';
          for (const key in overlayEventResult.data.sizeOption) {
            if (overlayEventResult.data.sizeOption.hasOwnProperty(key)) {
              if (overlayEventResult.data.sizeOption[key]) {
                valid = key;
              }
            }
          }
          this.scrapeSizeOption = valid;
        }
      }
    });

    return await modal.present();
  }


  crudDefaultFilter() {
    this.currentLocationFilter();
  }

  currentLocationFilter() {

    const filteredByRadius = [];

    this.allCrud.forEach(crud => {
      if (crud.isDemo && crud.isDemo === true) {
        filteredByRadius.push(crud);
      } else {
        if (crud.address[0] && crud.address[0].latLng) {
          if (this.variableService.scrapeLocation?.lat) {
            const filterRadius = crud.radius ? crud.radius : this.variableService.radius;
            if (this.variableService.scrapeLocation && this.getDistanceFromLatLonInMile(this.variableService.scrapeLocation.lat, this.variableService.scrapeLocation.lng, crud.address[0].latLng.lat, crud.address[0].latLng.lng) <= filterRadius) {
              filteredByRadius.push(crud);
            }
          } else {
            if (crud.address[0].address?.city === this.variableService.scrapeAddress?.city) {
              filteredByRadius.push(crud);
            }
          }
        }
      }
    });

    filteredByRadius.sort((a, b) => (b.isDemo && b.isDemo === true) ? -1 : 1);

    this.filteredCrud = filteredByRadius.filter(crud => crud.title.toLowerCase().includes(this.searchKeyword.toLowerCase()) || crud.description.toLowerCase().includes(this.searchKeyword.toLowerCase()));

    this.filteredCrud = this.filteredCrud.sort((a, b) => this.dateSort(a, b));

    this.filteredCrud.sort((a, b) => (a.isDemo && !b.isDemo) ? 1 : -1);

    this.crudCategory = '';
    this.crudCategorySize = this.filteredCrud.length;

    this.crudMakeGroups(this.filteredCrud, Math.ceil(filteredByRadius.length / 10));

    this.showCrudsOnMap();
  }

  getDistanceFromLatLonInMile(lat1, lon1, lat2, lon2): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d / 1.6;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
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

  crudMakeGroups(cruds, count) {

    this.crudGroups = [];

    for (let i = 0; i < count; i++) {
      const oneGroup = [];
      for (let j = 0; j < 10; j++) {
        if (i * 10 + j < cruds.length) {
          const temp = cruds[i * 10 + j];
          temp.cols = sampleTiles[j].cols;
          temp.rows = sampleTiles[j].rows;
          oneGroup.push(temp);
        } else {
          oneGroup.push(sampleTiles[j]);
        }
      }
      this.crudGroups.push(oneGroup);
    }
  }

  showCrudsOnMap() {
    this.clearCrudMarkers();
    this.displayCRUDMarkersOnAgmMap(this.filteredCrud);
  }

  clearCrudMarkers() {
    this.crudMarkers = [];
  }

  displayCRUDMarkersOnAgmMap(cruds) {
    if (this.platform.isPortrait() || this.mapShowing) {
      cruds.forEach(crud => {
        if (crud.address[0] && crud.address[0].latLng && crud.address[0].latLng.lat) {
          const marker = {
            position: crud.address[0].latLng,
            icon: {url: this.iconUrl(crud), scaledSize: {width: 30, height: 30}},
            data: crud
          };

          this.crudMarkers.push(marker);
        }
      });
    }
  }

  iconUrl(crud) {

    let iconUrl;

    if (crud.address[0] && crud.address[0].icon) {
      iconUrl = crud.address[0].icon;
    } else if (crud.main_background !== '') {
      iconUrl = crud.main_background;
    }

    return iconUrl;
  }

  filterRequests() {

    this.filteredRequests = [];

    this.requests.forEach(request => {
      if (request.allCities) {
        this.filteredRequests.push(request);
      } else {
        if (request.cities.includes(this.scrapeAddress?.city)) {
          this.filteredRequests.push(request);
        }
      }
    });
  }

}

