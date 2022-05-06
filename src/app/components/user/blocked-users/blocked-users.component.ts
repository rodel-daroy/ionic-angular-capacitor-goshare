import {Component, OnInit} from '@angular/core';

import {ModalController} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {VariableService} from '../../../services/data/variable.service';

@Component({
  selector: 'app-blocked-users',
  templateUrl: './blocked-users.component.html',
  styleUrls: ['./blocked-users.component.scss'],
})
export class BlockedUsersComponent implements OnInit {

  blockedUsers: any[];

  constructor(public modalController: ModalController,
              private apiService: ApiService,
              private cacheService: CacheService,
              public variableService: VariableService) {

    this.getBlockedUsers();
  }

  ngOnInit() {
  }


  getBlockedUsers() {
    this.apiService.getBlockedUsers(this.cacheService.user.uid).then(resp => this.blockedUsers = resp);
  }

  unBlock(user) {
    this.apiService.unBlockUser(this.cacheService.user.uid, user.uid).then(() => this.getBlockedUsers());
  }

}
