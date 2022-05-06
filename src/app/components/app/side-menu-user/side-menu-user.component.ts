import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-side-menu-user',
  templateUrl: './side-menu-user.component.html',
  styleUrls: ['./side-menu-user.component.scss'],
})
export class SideMenuUserComponent implements OnInit, OnDestroy {

  @Input() currentUser: any;

  private unsubscribe$ = new Subject<void>();

  constructor() {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
