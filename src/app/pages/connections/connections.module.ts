import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConnectionsPageRoutingModule } from './connections-routing.module';

import { ConnectionsPage } from './connections.page';

import {MaterialModule} from '../../utils/material.module';
import {AgmCoreModule} from '@agm/core';
import {UtilsComponentsModule} from '../../utils/utilsComponents.module';

import {ArchiveListComponent} from '../../components/connection/archive-list/archive-list.component';
import {ContactSettingComponent} from '../../components/connection/contact-setting/contact-setting.component';
import {ShareLocationComponent} from '../../components/connection/share-location/share-location.component';
import {ShowImageComponent} from '../../components/connection/show-image/show-image.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConnectionsPageRoutingModule,

    MaterialModule,
    AgmCoreModule,
    ReactiveFormsModule,
    UtilsComponentsModule
  ],
  declarations: [ConnectionsPage, ArchiveListComponent, ContactSettingComponent, ShareLocationComponent, ShowImageComponent]
})
export class ConnectionsPageModule {}
