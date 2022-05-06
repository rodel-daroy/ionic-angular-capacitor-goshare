import {NgModule} from '@angular/core';
import {BrowserModule, HammerModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import {HttpClientModule} from '@angular/common/http';

import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {environment} from '../environments/environment';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {ServiceWorkerModule} from '@angular/service-worker';

import {AgmCoreModule} from '@agm/core';
import {AgmJsMarkerClustererModule} from '@agm/js-marker-clusterer';

import {ImageCropperModule} from 'ngx-image-cropper';
import {NgMarqueeModule} from 'ng-marquee';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {WebcamModule} from 'ngx-webcam';

import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, SatDatepickerModule} from 'saturn-datepicker';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';

import {InAppPurchase2} from '@ionic-native/in-app-purchase-2/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {ImagePicker} from '@ionic-native/image-picker/ngx';

import {SideMenuUserComponent} from './components/app/side-menu-user/side-menu-user.component';

@NgModule({
  declarations: [AppComponent, SideMenuUserComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,

    HttpClientModule,

    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,

    BrowserAnimationsModule,
    HammerModule,

    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),

    AgmCoreModule.forRoot({
      apiKey: '',
      libraries: ['places']
    }),
    AgmJsMarkerClustererModule,

    ImageCropperModule,
    NgMarqueeModule,
    NgxMaterialTimepickerModule,
    WebcamModule,
    SatDatepickerModule
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    InAppPurchase2,
    SocialSharing,
    ImagePicker,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
