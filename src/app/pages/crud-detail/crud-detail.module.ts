import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrudDetailPageRoutingModule } from './crud-detail-routing.module';

import { CrudDetailPage } from './crud-detail.page';

import { MaterialModule } from '../../utils/material.module';
import { UtilsComponentsModule } from '../../utils/utilsComponents.module';
import { SatDatepickerModule } from 'saturn-datepicker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CrudDetailPageRoutingModule,

    MaterialModule,
    UtilsComponentsModule,
    SatDatepickerModule
  ],
  declarations: [CrudDetailPage]
})
export class CrudDetailPageModule {}
