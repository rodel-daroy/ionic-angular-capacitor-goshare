import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IncomingSharesPageRoutingModule } from './incoming-shares-routing.module';

import { IncomingSharesPage } from './incoming-shares.page';

import {MaterialModule} from '../../../utils/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IncomingSharesPageRoutingModule,

    MaterialModule
  ],
  declarations: [IncomingSharesPage]
})
export class IncomingSharesPageModule {}
