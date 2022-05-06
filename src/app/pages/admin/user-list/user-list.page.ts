import {Component, OnInit} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';

import {ApiService} from '../../../services/firebase/api/api.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {

  users = [];

  constructor(private router: Router,
              private apiService: ApiService,
              private utilService: UtilService,
              public variableService: VariableService) {

    this.getUsers();
  }

  ngOnInit() {
  }


  getUsers() {
    this.utilService.presentLoading(3000).then();
    this.apiService.getUsers().then(resp => this.users = resp);
  }

  viewProfile(user) {

    const navigationExtras: NavigationExtras = {
      state: {user}
    };

    const underscoreUsername = user?.username.split(' ').join('_');

    this.router.navigate(['profile/' + underscoreUsername], navigationExtras).then();
  }

  banUser(user) {
    this.apiService.changeBanState(user.uid, {banned: true}).then(() => this.getUsers());
  }

  unBanUser(user) {
    this.apiService.changeBanState(user.uid, {banned: false}).then(() => this.getUsers());
  }

}
