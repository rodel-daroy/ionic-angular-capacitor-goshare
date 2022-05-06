import { Component, OnInit } from '@angular/core';

import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {

  reason = '';

  constructor(public modalController: ModalController) { }

  ngOnInit() {}


  submit() {
    this.modalController.dismiss({reason: this.reason}).then();
  }

}
