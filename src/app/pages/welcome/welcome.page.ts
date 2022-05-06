import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {MenuController, Platform} from '@ionic/angular';

import {AuthService} from '../../services/firebase/auth/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(private router: Router,
              public platform: Platform,
              private menuController: MenuController,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.menuController.enable(false).then();
  }

  ionViewDidEnter() {
    this.authService.signInWithEmailLink();
  }

}
