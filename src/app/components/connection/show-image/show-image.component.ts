import { Component, OnInit } from '@angular/core';

import {ModalController, NavParams} from '@ionic/angular';

@Component({
  selector: 'app-show-image',
  templateUrl: './show-image.component.html',
  styleUrls: ['./show-image.component.scss'],
})
export class ShowImageComponent implements OnInit {

  imageSrc;

  constructor(private navParams: NavParams,
              public modalController: ModalController) {

    this.imageSrc = navParams.get('image');
  }

  ngOnInit() {}

}
