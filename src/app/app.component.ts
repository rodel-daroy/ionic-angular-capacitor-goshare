import {Component} from '@angular/core';
import * as introJs from 'intro.js/intro';
import * as $ from 'jquery';

import {Platform} from '@ionic/angular';

import {AuthService} from './services/firebase/auth/auth.service';
import {CacheService} from './services/cache/cache.service';
import {FcmService} from './services/firebase/fcm/fcm.service';
import {LocationService} from './services/location/location.service';

import {Capacitor, PermissionType, Plugins} from '@capacitor/core';
import '@turnoutt/capacitor-firebase-dynamic-links';

const {SplashScreen, Permissions, Geolocation, CapacitorFirebaseDynamicLinks} = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  introJS = introJs();

  constructor(private platform: Platform,
              private authService: AuthService,
              public cacheService: CacheService,
              private fcmService: FcmService,
              private locationService: LocationService) {

    this.initializeApp();
    this.fcmService.initializePushNotification();
    this.cacheService.getUser().then();
    if (Capacitor.platform !== 'web') {
      this.dynamicLinksListener();
    }
  }

  initializeApp() {
    SplashScreen.hide().then();

    this.authService.authState().subscribe(resp => console.log('authState =====>', resp));

    this.locationService.getCurrentAddress().then();
  }

  dynamicLinksListener() {
    CapacitorFirebaseDynamicLinks.addListener('deepLinkOpen', (data: { url: string }) => {
      this.authService.signInWithEmailLink(data.url);
    });
  }


  startIntro() {
    if (this.platform.isLandscape()) {
      this.introJS.setOptions({
        steps: [
          {
            element: '#step1',
            intro: 'Here you can search keywords, or change the location of your search.'
          },
          {
            element: '#step2',
            intro: 'Our app automatically begins by looking for items near your current GPS position and displays the results in the Share Directory.'
          },
          {
            element: '#step3',
            intro: 'GOSHARE360 Is your one stop reference for all sharing sites allowing you to find anything from items to experiences to gig work.'
          }
        ],
        showProgress: true,
        overlayOpacity: 0.0001
      });
    } else {
      this.introJS.setOptions({
        steps: [
          {
            element: '#step01',
            intro: 'Here you can search keywords, or change the location of your search.'
          },
          {
            element: '#step02',
            intro: 'Our app automatically begins by looking for items near your current GPS position and displays the results in the Share Directory.'
          },
          {
            element: '#step03',
            intro: 'GOSHARE360 Is your one stop reference for all sharing sites allowing you to find anything from items to experiences to gig work.'
          }
        ],
        showProgress: true,
        overlayOpacity: 0.0001
      });
    }
    this.introJS.start();
    $('.introjs-tooltip').css({'background-color': 'rgb(13, 106, 212)', color: 'white'});
  }

  signOut() {
    this.authService.signOutUser();
  }

}
