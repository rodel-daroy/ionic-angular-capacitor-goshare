import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificationPageRoutingModule } from './verification-routing.module';

import { VerificationPage } from './verification.page';

import {MaterialModule} from '../../utils/material.module';
import {WebcamModule} from 'ngx-webcam';

import {WebcamComponent} from '../../components/utils/webcam/webcam.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificationPageRoutingModule,

    MaterialModule,
    WebcamModule
  ],
  declarations: [VerificationPage, WebcamComponent]
})
export class VerificationPageModule {}
