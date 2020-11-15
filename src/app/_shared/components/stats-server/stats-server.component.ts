import { Component, OnInit } from '@angular/core';

import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-stats-server',
  templateUrl: './stats-server.component.html',
  styleUrls: ['./stats-server.component.css']
})
export class StatsServerComponent implements OnInit {

  portalVer = '0x00000000';
  activeDdl = 1;
  visitor = 2;

  constructor(
    public gs: GlobalService
  ) {
  }

  ngOnInit(): void {
    if (this.gs.isBrowser) {
      //
    }
  }

}
