import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PreviewPageRoutingModule} from './preview-routing.module';

import {PreviewPage} from './preview.page';

import {MaterialModule} from '../../utils/material.module';
import {UtilsComponentsModule} from '../../utils/utilsComponents.module';
import {AgmCoreModule} from '@agm/core';
import {AgmJsMarkerClustererModule} from '@agm/js-marker-clusterer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreviewPageRoutingModule,

    MaterialModule,
    UtilsComponentsModule,
    AgmCoreModule,
    AgmJsMarkerClustererModule,
  ],
  declarations: [PreviewPage]
})
export class PreviewPageModule {
}
