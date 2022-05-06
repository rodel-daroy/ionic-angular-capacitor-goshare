import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificationDetailPageRoutingModule } from './verification-detail-routing.module';

import { VerificationDetailPage } from './verification-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificationDetailPageRoutingModule
  ],
  declarations: [VerificationDetailPage]
})
export class VerificationDetailPageModule {}
