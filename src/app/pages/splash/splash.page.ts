import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {CacheService} from '../../services/cache/cache.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  constructor(private router: Router,
              private cacheService: CacheService) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    setTimeout(async () => {
      const autoLogin = await this.cacheService.getAutoLogin();
      if (autoLogin && autoLogin.state) {
        this.router.navigate(['dashboard']).then();
      } else {
        this.router.navigate(['welcome']).then();
      }
    }, 3000);
  }

}
