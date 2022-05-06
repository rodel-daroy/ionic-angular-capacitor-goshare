import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {ModalController, NavParams, Platform} from '@ionic/angular';

@Component({
    selector: 'app-connect',
    templateUrl: './connect.component.html',
    styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent implements OnInit {

    contactSettingsForm = new FormGroup({
        phoneNumberState: new FormControl(false),
        phoneNumber: new FormControl(''),
        emailState: new FormControl(false),
        email: new FormControl(''),
        chatState: new FormControl(true)
    });

    contactMessage = '';

    @Input() crud: any;

    constructor(private platform: Platform,
                private navParams: NavParams,
                public modalController: ModalController) {

        this.crud = navParams.get('crud');
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.platform.backButton.subscribeWithPriority(10, () => this.modalController.dismiss());
        });
    }

    changePhoneNumber(event) {
        if (event.checked) {
            this.contactSettingsForm.controls.phoneNumber.enable();
        } else {
            this.contactSettingsForm.controls.phoneNumber.disable();
        }
    }

    changeEmail(event) {
        if (event.checked) {
            this.contactSettingsForm.controls.email.enable();
        } else {
            this.contactSettingsForm.controls.email.disable();
        }
    }

    send() {
        this.modalController.dismiss({contactInfo: this.contactSettingsForm.value, contactMessage: this.contactMessage}).then();
    }

}
