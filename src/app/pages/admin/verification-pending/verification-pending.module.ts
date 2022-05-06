import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificationPendingPageRoutingModule } from './verification-pending-routing.module';

import { VerificationPendingPage } from './verification-pending.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificationPendingPageRoutingModule
  ],
  declarations: [VerificationPendingPage]
})
export class VerificationPendingPageModule {}
