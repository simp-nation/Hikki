import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global.service';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  constructor(
    public router: Router,
    public gs: GlobalService,
    public notif: NotificationsService
  ) {
    if (this.gs.isBrowser) {
      //
    }
  }

  ngOnInit(): void {
    if (this.gs.isBrowser) {
      //
    }
  }

  removeNotif(id): void {
    this.notif.removeNotif(id);
  }

}
