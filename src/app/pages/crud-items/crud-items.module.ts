import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudItemsPageRoutingModule } from './crud-items-routing.module';

import { CrudItemsPage } from './crud-items.page';

import {MaterialModule} from '../../utils/material.module';
import {UtilsComponentsModule} from '../../utils/utilsComponents.module';
import {NgMarqueeModule} from 'ng-marquee';
import {SatDatepickerModule} from 'saturn-datepicker';

import {ContactSettingComponent} from '../../components/crud/contact-setting/contact-setting.component';
import {DetailComponent} from '../../components/crud/detail/detail.component';
import {SocialShareComponent} from '../../components/utils/social-share/social-share.component';
import {ConnectComponent} from '../../components/crud/connect/connect.component';
import {FlagComponent} from '../../components/crud/flag/flag.component';
import {ReportComponent} from '../../components/crud/report/report.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudItemsPageRoutingModule,

    MaterialModule,
    UtilsComponentsModule,
    ReactiveFormsModule,
    NgMarqueeModule,
    SatDatepickerModule
  ],
  declarations: [CrudItemsPage, ContactSettingComponent, SocialShareComponent,
    DetailComponent, ConnectComponent, FlagComponent, ReportComponent]
})
export class CrudItemsPageModule {
}
