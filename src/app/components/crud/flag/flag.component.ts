import { Component, OnInit } from '@angular/core';

import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-flag',
  templateUrl: './flag.component.html',
  styleUrls: ['./flag.component.scss'],
})
export class FlagComponent implements OnInit {

  reason = '';

  constructor(public modalController: ModalController) { }

  ngOnInit() {}


  submit() {
    this.modalController.dismiss({reason: this.reason}).then();
  }

}
