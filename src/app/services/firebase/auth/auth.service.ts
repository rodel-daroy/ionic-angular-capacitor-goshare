import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';

import {Platform} from '@ionic/angular';

import {ApiService} from '../api/api.service';
import {CacheService} from '../../cache/cache.service';
import {UtilService} from '../../util/util.service';
import {VariableService} from '../../data/variable.service';

import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router,
              private angularFireAuth: AngularFireAuth,
              private platform: Platform,
              private apiService: ApiService,
              private cacheService: CacheService,
              private utilService: UtilService,
              private variableService: VariableService) {
  }

  authState() {
    return this.angularFireAuth.authState;
  }

  sendSignInLinkToEmail(email: string, href: string): Promise<any> {
    return new Promise(resolve => {

      const actionCodeSettings = {
        url: href.includes('localhost:8100') ? 'http://localhost:8100/welcome' : 'https://goshare360.web.app/welcome',
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.goshare360.app'
        },
        android: {
          packageName: 'com.goshare360.app',
          installApp: true,
          minimumVersion: '12'
        },
        dynamicLinkDomain: 'gs360.page.link'
      };

      this.angularFireAuth.sendSignInLinkToEmail(email, actionCodeSettings)
        .then(() => resolve(window.localStorage.setItem('gs360_emailForSignIn', email)))
        .catch(err => this.utilService.showToast(err.message));
    });
  }

  signInWithEmailLink(link?: string) {
    this.angularFireAuth.isSignInWithEmailLink(link ? link : window.location.href)
      .then(result => {
        if (result) {

          let email = window.localStorage.getItem('gs360_emailForSignIn');
          if (!email) {
            email = window.prompt('Please provide your email for confirmation');
          }

          this.angularFireAuth.signInWithEmailLink(email, link ? link : window.location.href)
            .then(userCredential => {
              this.apiService.getUser(userCredential.user.uid)
                .then(resp => {
                    if (resp.hasOwnProperty('username')) {
                      this.cacheService.setUser(resp).then(() => this.router.navigate(['dashboard'], {replaceUrl: true}));
                      this.cacheService.setAutoLogin({state: true}).then();
                    } else {
                      this.emailSignInAddNewUser(userCredential.user.uid, email);
                    }
                  }
                )
                .catch(err => console.log('signInWithEmailLink catch =====>', err));
            })
            .catch(err => this.utilService.showToast(err.message));
        }
      })
      .catch(err => console.log('signInWithEmailLink =====>', err));
  }

  emailSignInAddNewUser(uid, email) {
    if (this.variableService.userAddress.city) {
      this.variableService.userAddress = {
        country: '',
        state: '',
        city: '',
        zipCode: ''
      };
    }
    const newUser = {
      username: email,
      email,
      address: this.variableService.userAddress,
      membership: 'free-trial',
      verifyStatus: 'unverified',
      createdAt: firebase.default.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.default.database.ServerValue.TIMESTAMP,
      uid
    };
    this.apiService.addNewUser(newUser)
      .then(() => {
        this.cacheService.setUser(newUser).then(() => this.router.navigate(['dashboard'], {replaceUrl: true}));
        this.cacheService.setAutoLogin({state: true}).then();
      });
  }

  signOutUser() {

    this.variableService.scrapingState = false;

    this.angularFireAuth.signOut()
      .then(() => this.cacheService.clearCache().then(() => this.router.navigate(['welcome'], {replaceUrl: true})));

    this.cacheService.setAutoLogin({state: false}).then();
  }

}
