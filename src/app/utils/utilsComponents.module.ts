import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {GoogleMapComponent} from '../components/utils/google-map/google-map.component';
import {RatingBarComponent} from '../components/utils/rating-bar/rating-bar.component';

@NgModule({
  declarations: [GoogleMapComponent, RatingBarComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [GoogleMapComponent, RatingBarComponent]
})
export class UtilsComponentsModule {
}
