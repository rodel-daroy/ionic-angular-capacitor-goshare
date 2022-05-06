import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';

import {MaterialModule} from '../../utils/material.module';
import {ImageCropperModule} from 'ngx-image-cropper';

import {BlockedUsersComponent} from '../../components/user/blocked-users/blocked-users.component';
import {SettingComponent} from '../../components/user/setting/setting.component';
import {ImageCropperComponent} from '../../components/utils/image-cropper/image-cropper.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ProfilePageRoutingModule,

        MaterialModule,
        ImageCropperModule
    ],
  declarations: [ProfilePage, BlockedUsersComponent, SettingComponent, ImageCropperComponent]
})
export class ProfilePageModule {}
