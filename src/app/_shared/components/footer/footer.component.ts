import { Component, OnInit } from '@angular/core';

import { environment } from '../../../../environments/app/environment';

import { GlobalService } from '../../services/global.service';
import { StatsServerService } from '../../services/stats-server.service';
import { WinboxService } from '../../services/winbox.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(
    public gs: GlobalService,
    public ss: StatsServerService,
    private wb: WinboxService
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

  get discordUrl(): string {
    return environment.discordUrl;
  }

  get author(): string {
    return environment.author;
  }

  get siteName(): string {
    return environment.siteName;
  }

  openGithub(): void {
    this.wb.winboxOpenUri(`https://github.com/${this.author}/${this.siteName}`);
  }

}
