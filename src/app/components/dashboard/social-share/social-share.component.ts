import {Component, OnInit} from '@angular/core';
import {Meta} from '@angular/platform-browser';

import {ModalController, NavParams, Platform} from '@ionic/angular';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.scss'],
})
export class SocialShareComponent implements OnInit {

  crud;

  link: string;

  constructor(private meta: Meta,
              public platform: Platform,
              private navParams: NavParams,
              public modalController: ModalController,
              private socialSharing: SocialSharing) {

    this.crud = navParams.get('crud');
    const underscoreUsername = this.crud.user?.username.split(' ').join('_');
    this.link = 'https://goshare360.web.app/profile/' + underscoreUsername;
    this.meta.updateTag({name: 'image', content: this.crud.main_background});
    this.meta.updateTag({property: 'og:image', content: this.crud.main_background});
  }

  ngOnInit() {
    this.platform.ready().then(() => this.platform.backButton.subscribe(() => this.modalController.dismiss()));
  }


  ShareFacebook() {
    // this.socialSharing.shareViaFacebook(this.crud.title, this.crud.main_background, this.link);
    this.socialSharing.shareViaFacebookWithPasteMessageHint(this.crud.title, this.crud.main_background, null /* url */, 'GoShare360!')
      .then(resp => console.log('shareViaFacebook 1 =====>', resp))
      .catch(err => console.log('shareViaFacebook 2 =====>', err));
  }

  ShareWhatsapp() {
    this.socialSharing.shareViaWhatsApp(this.crud.title, this.crud.main_background, this.link)
      .then(resp => console.log('shareViaWhatsApp 1 =====>', resp))
      .catch(err => console.log('shareViaWhatsApp 2 =====>', err));
  }

  SendTwitter() {
    this.socialSharing.shareViaTwitter(this.crud.title, this.crud.main_background, this.link)
      .then(resp => console.log('shareViaTwitter 1 =====>', resp))
      .catch(err => console.log('shareViaTwitter 2 =====>', err));
  }

  SendInstagram() {
    this.socialSharing.shareViaInstagram(this.crud.title, this.crud.main_background)
      .then(resp => console.log('shareViaInstagram 1 =====>', resp))
      .catch(err => console.log('shareViaInstagram 2 =====>', err));
  }

}
