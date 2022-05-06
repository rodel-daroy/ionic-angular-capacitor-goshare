import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {AlertController, NavController} from '@ionic/angular';

import {AuthService} from '../../services/firebase/auth/auth.service';
import {UtilService} from '../../services/util/util.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm = new FormGroup({
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ]))
  });

  constructor(private router: Router,
              private alertController: AlertController,
              private navController: NavController,
              private authService: AuthService,
              private utilService: UtilService) {
  }

  ngOnInit() {
  }

  login() {
    if (this.loginForm.valid) {
      this.authService.sendSignInLinkToEmail(this.loginForm.value.email, window.location.href).then(() => this.presentAlert());
    } else {
      this.utilService.showToast('Email is not valid').then();
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Check your email',
      subHeader: 'Login link sent',
      message: 'Please check your email and follow the link to login.',
      buttons: [{
        text: 'OK',
        handler: () => this.navController.navigateBack('welcome')
      }]
    });

    await alert.present();

    setTimeout(() => {
      alert.dismiss();
      this.navController.navigateBack('welcome');
    }, 5000);
  }

}
