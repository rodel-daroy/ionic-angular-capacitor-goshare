import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';

import { MaterialModule } from '../../utils/material.module';
import { UtilsComponentsModule } from '../../utils/utilsComponents.module';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { NgMarqueeModule } from 'ng-marquee';
import { SatDatepickerModule } from 'saturn-datepicker';

import { DetailComponent } from '../../components/scrape/detail/detail.component';
import { HistoryComponent } from '../../components/scrape/history/history.component';
import { LocationComponent } from '../../components/scrape/location/location.component';
import { SettingComponent } from '../../components/scrape/setting/setting.component';
import { CrudDetailComponent } from '../../components/dashboard/crud-detail/crud-detail.component';
import { SizeOptionsComponent } from '../../components/dashboard/size-options/size-options.component';
import { SocialShareComponent } from '../../components/dashboard/social-share/social-share.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DashboardPageRoutingModule,

    MaterialModule,
    UtilsComponentsModule,
    AgmCoreModule,
    AgmJsMarkerClustererModule,
    NgMarqueeModule,
    SatDatepickerModule
  ],
  declarations: [DashboardPage, DetailComponent, HistoryComponent, LocationComponent, SettingComponent,
    CrudDetailComponent, SizeOptionsComponent, SocialShareComponent]
})
export class DashboardPageModule { }
