import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePublicPageRoutingModule } from './profile-public-routing.module';

import { ProfilePublicPage } from './profile-public.page';

import {MaterialModule} from '../../utils/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePublicPageRoutingModule,

    MaterialModule
  ],
  declarations: [ProfilePublicPage]
})
export class ProfilePublicPageModule {}
