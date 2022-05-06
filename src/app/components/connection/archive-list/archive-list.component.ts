import {Component, OnInit} from '@angular/core';

import {ModalController, NavParams} from '@ionic/angular';

import {ApiService} from '../../../services/firebase/api/api.service';
import {CacheService} from '../../../services/cache/cache.service';
import {EventService} from '../../../services/event/event.service';
import {UtilService} from '../../../services/util/util.service';
import {VariableService} from '../../../services/data/variable.service';

@Component({
  selector: 'app-archive-list',
  templateUrl: './archive-list.component.html',
  styleUrls: ['./archive-list.component.scss'],
})
export class ArchiveListComponent implements OnInit {

  archivedUsers = [];

  constructor(private navParams: NavParams,
              public modalController: ModalController,
              private apiService: ApiService,
              public cacheService: CacheService,
              private eventService: EventService,
              private utilService: UtilService,
              public variableService: VariableService) {

    this.getArchivedUsers();
  }

  ngOnInit() {
  }


  getArchivedUsers() {
    this.utilService.presentLoading(3000).then();
    this.apiService.archivedUsers(this.cacheService.user.uid).then(resp => this.archivedUsers = resp.denied);

  }

  activate(user) {
    this.utilService.presentLoading(3000).then();
    this.apiService.activateUser(this.cacheService.user.uid, user.uid).then(() => {
      this.apiService.archivedUsers(this.cacheService.user.uid).then(resp => {
        this.archivedUsers = resp.denied;
        this.eventService.executedPublish({executed: true});
      });
    });
  }

}
