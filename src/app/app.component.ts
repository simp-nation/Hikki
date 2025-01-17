import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouteConfigLoadStart, RouteConfigLoadEnd, NavigationStart } from '@angular/router';

import { onMainContentChange } from './_shared/animations/anim-side-menu';

import { environment } from '../environments/app/environment';

import { LeftMenuService } from './_shared/services/left-menu.service';
import { RightPanelService } from './_shared/services/right-panel.service';
import { PageInfoService } from './_shared/services/page-info.service';
import { AuthService } from './_shared/services/auth.service';
import { FabService } from './_shared/services/fab.service';
import { BusyService } from './_shared/services/busy.service';
import { GlobalService } from './_shared/services/global.service';
import { StatsServerService } from './_shared/services/stats-server.service';
import { WinboxService } from './_shared/services/winbox.service';
import { LocalStorageService } from './_shared/services/local-storage.service';
import { DialogService } from './_shared/services/dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [ onMainContentChange ]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  localStorageAturanTatibKeyName = `${environment.siteName}_AturanTatib`;

  @HostListener('document:click', ['$event']) documentClicked;
  @HostListener('window:beforeunload', ['$event']) windowBeforeUnloaded;

  @ViewChild('leftSideNav', { static: true }) leftSideNav: ElementRef;
  @ViewChild('rightSidePanel', { static: true }) rightSidePanel: ElementRef;
  @ViewChild('siteContent', { static: true }) siteContent;

  previousUrl = null;

  subsRouter = null;
  subsRouterChild = null;
  subsUrl = null;
  subsVerify = null;
  subsDialog = null;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private bs: BusyService,
    private pi: PageInfoService,
    private as: AuthService,
    private fs: FabService,
    private ls: LocalStorageService,
    public gs: GlobalService,
    public lms: LeftMenuService,
    public rps: RightPanelService,
    public ss: StatsServerService,
    private wb: WinboxService,
    private ds: DialogService
  ) {
    if (this.gs.isBrowser) {
      //
    }
  }

  ngOnDestroy(): void {
    this.subsRouter?.unsubscribe();
    this.subsRouterChild?.unsubscribe();
    this.subsUrl?.unsubscribe();
    this.subsVerify?.unsubscribe();
    this.subsDialog?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.lms.sideNav = this.leftSideNav;
    this.rps.sidePanel = this.rightSidePanel;
  }

  ngOnInit(): void {
    this.gs.log(`[APP_BUILD_STATUS] 💘 ${environment.siteName} :: ${environment.production ? 'Production' : 'Development'} With Logging Enabled 📌`);
    this.pi.updatePageMetaData(
      '「💤 Hikki」',
      '「✨ Di Kamar Saja!」',
      '「💤 Hikki」, 「🌞 Hikikomori」',
      '/favicon.ico'
    );
    this.subsRouter = this.router.events.subscribe({
      next: e1 => {
        if (e1 instanceof RouteConfigLoadStart) {
          if (this.gs.isBrowser) {
            this.bs.busy();
          }
        }
        else if (e1 instanceof RouteConfigLoadEnd) {
          if (this.gs.isBrowser) {
            this.bs.idle();
          }
        }
        else if (e1 instanceof NavigationStart) {
          if (this.gs.isBrowser) {
            if (e1.url) {
              const str = e1.url.split('/')[1];
              if (str) {
                const stringBadge = `badge${str[0].toUpperCase()}${str.slice(1)}`;
                if (this.ss[stringBadge]) {
                  this.ss[stringBadge] = [];
                  const mainMenu = this.lms.mainMenus.find(m => m.link === e1.url);
                  const contentMenu = this.lms.contentMenus.find(m => m.link === e1.url);
                  const miscMenu = this.lms.miscMenus.find(m => m.link === e1.url);
                  if (mainMenu) {
                    mainMenu.badge = null;
                  }
                  if (contentMenu) {
                    contentMenu.badge = null;
                  }
                  if (miscMenu) {
                    miscMenu.badge = null;
                  }
                }
              }
            }
          }
        }
        else if (e1 instanceof NavigationEnd) {
          let activatedRouteChild = this.route.firstChild;
          for (const aRC of activatedRouteChild.children) {
            activatedRouteChild = aRC;
          }
          this.subsRouterChild = activatedRouteChild.data.subscribe({
            next: e2 => {
              this.updateBackgroundImage();
              this.gs.routerData = e2;
              this.pi.updatePageMetaData(
                e2.title,
                e2.description,
                e2.keywords,
                (this.gs.bgImgUrl || '/favicon.ico')
              );
              this.fs.removeFab();
              if (this.gs.isBrowser) {
                this.siteContent.elementRef.nativeElement.scrollTop = 0;
                const nextUrl = e1.url.split('?')[0];
                this.ss.currentChatRoom = [];
                this.ss.socketLeaveAndJoinNewRoom(this.previousUrl, nextUrl);
                this.previousUrl = nextUrl;
              }
            }
          });
        }
      }
    });
    if (this.gs.isBrowser) {
      this.checkStorage();
      this.documentClicked = this.onDocumentClicked;
      this.windowBeforeUnloaded = this.onWindowBeforeUnloaded;
      const aturanTatib = this.ls.getItem(this.localStorageAturanTatibKeyName) === 'true';
      if (!aturanTatib) {
        setTimeout(() => {
          this.subsDialog = this.ds.openAturanTatibDialog().afterClosed().subscribe({
            next: re => {
              this.gs.log('[ATURAN_TATA_TERTIB_DIALOG_CLOSED]', re);
              if (typeof re === 'boolean') {
                this.ls.setItem(this.localStorageAturanTatibKeyName, JSON.stringify(re));
              }
              this.subsDialog.unsubscribe();
            }
          });
        }, 2000);
      }
    }
  }

  updateBackgroundImage(): void {
    const urlPath = this.router.url.substr(1).split('/')[0].split('?')[0];
    this.gs.bgImgUrl = urlPath ? `/assets/img/router/bg-${urlPath}.png` : '';
  }

  checkStorage(): void {
    this.bs.busy();
    this.subsVerify = this.as.verify(this.as.jwtToken).subscribe({
      next: success => {
        this.gs.log('[VERIFY_SUCCESS]', success);
        this.ss.socketLeaveAndJoinNewRoom(this.previousUrl, this.router.url);
        this.bs.idle();
      },
      error: error => {
        this.gs.log('[VERIFY_ERROR]', error);
        this.bs.idle();
        this.as.removeUser();
      }
    });
  }

  resetLoading(): void {
    this.bs.clear();
  }

  onDocumentClicked(ev): boolean {
    this.gs.log('[MOUSE_CLICK]', ev);
    const e = ev || window.event;
    const el = e.target || e.srcElement;
    if (el.tagName === 'A' || el.tagName === 'a') {
      const externalUri: string = el.getAttribute('href');
      if (externalUri) {
        if (
          this.gs.gridListBreakpoint >= 2 &&
          (externalUri as any).includesOneOf(['http', 'ftp', 'mailto']) &&
          !externalUri.includes(environment.baseUrl)
        ) {
          this.winboxOpenUri(externalUri);
          ev.preventDefault();
          ev.stopPropagation();
          return false;
        }
      }
    }
    return true;
  }

  onWindowBeforeUnloaded(ev): any {
    if (this.as.jwtToken) {
      this.gs.log('[BROWSER_EXIT_CLOSE_SAVE_JWT]', this.as.jwtToken);
      this.ls.setItem(this.gs.localStorageTokenKeyName, this.as.jwtToken);
    }
  }

  winboxOpenUri(uri: string): void {
    this.wb.winboxOpenUri(uri);
  }

}
