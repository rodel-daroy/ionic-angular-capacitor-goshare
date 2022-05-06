import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudNewPageRoutingModule } from './crud-new-routing.module';

import { CrudNewPage } from './crud-new.page';

import {MaterialModule} from '../../utils/material.module';
import {UtilsComponentsModule} from '../../utils/utilsComponents.module';
import {SatDatepickerModule} from 'saturn-datepicker';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import {AddressComponent} from '../../components/crud/address/address.component';
import {GpsComponent} from '../../components/crud/gps/gps.component';
import {TermsComponent} from '../../components/crud/terms/terms.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrudNewPageRoutingModule,

    MaterialModule,
    UtilsComponentsModule,
    SatDatepickerModule,
    ReactiveFormsModule,
    NgxMaterialTimepickerModule,
  ],
  declarations: [CrudNewPage, AddressComponent, GpsComponent, TermsComponent]
})
export class CrudNewPageModule {}
