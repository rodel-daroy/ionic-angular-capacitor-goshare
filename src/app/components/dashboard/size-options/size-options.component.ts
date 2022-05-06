import {Component, OnInit} from '@angular/core';

import {ModalController, NavParams} from '@ionic/angular';

import {UtilService} from '../../../services/util/util.service';

@Component({
  selector: 'gs360-size-options',
  templateUrl: './size-options.component.html',
  styleUrls: ['./size-options.component.scss'],
})
export class SizeOptionsComponent implements OnInit {

  type: string;

  sizeOption = {
    small: false,
    medium: false,
    large: false
  };

  viewMode = 'Horizontal';

  constructor(public modalController: ModalController,
              private navParams: NavParams,
              private utilService: UtilService) {

    this.type = navParams.get('type');
    this.viewMode = navParams.get('view');

    switch (navParams.get('size')) {
      case  'small':
        this.sizeOption = {
          small: true,
          medium: false,
          large: false
        };
        break;
      case 'medium':
        this.sizeOption = {
          small: false,
          medium: true,
          large: false
        };
        break;
      case 'large':
        this.sizeOption = {
          small: false,
          medium: false,
          large: true
        };
        break;
    }
  }

  ngOnInit() {
  }

  changeSizeOptions(event, selected: string) {
    if (event.checked) {
      switch (selected) {
        case 'small':
          this.sizeOption = {
            small: true,
            medium: false,
            large: false
          };
          break;
        case 'medium':
          this.sizeOption = {
            small: false,
            medium: true,
            large: false
          };
          break;
        case 'large':
          this.sizeOption = {
            small: false,
            medium: false,
            large: true
          };
          break;
      }
    }
  }

  changeViewMode(event) {
    switch (event.checked) {
      case true:
        this.viewMode = 'Vertical';
        break;
      case false:
        this.viewMode = 'Horizontal';
        break;
    }
  }

  apply() {

    let valid = false;

    for (const key in this.sizeOption) {
      if (this.sizeOption.hasOwnProperty(key)) {
        if (this.sizeOption[key]) {
          valid = true;
        }
      }
    }

    if (valid) {
      this.modalController.dismiss({sizeOption: this.sizeOption, viewMode: this.viewMode}).then();
    } else {
      this.utilService.showToast('Size option is not selected').then();
    }
  }

}
