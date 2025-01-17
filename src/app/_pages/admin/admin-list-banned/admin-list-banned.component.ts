import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../../_shared/services/global.service';
import { AdminService } from '../../../_shared/services/admin.service';
import { BusyService } from '../../../_shared/services/busy.service';
import { DialogService } from '../../../_shared/services/dialog.service';
import { AuthService } from '../../../_shared/services/auth.service';

import { User } from '../../../_shared/models/User';
import { Role } from '../../../_shared/models/Role';

@Component({
  selector: 'app-admin-list-banned',
  templateUrl: './admin-list-banned.component.html',
  styleUrls: ['./admin-list-banned.component.css']
})
export class AdminListBannedComponent implements OnInit, OnDestroy {

  currentUser: User = null;

  subsBannedGet = null;
  subsBannedDelete = null;
  subsDialog = null;
  subsUser = null;

  count = 0;
  page = 1;
  row = 10;

  q = '';
  sort = '';
  order = '';

  bannedData = {
    column: ['Id', 'Korban', 'Alasan', 'Pelaku', 'Aksi'],
    row: []
  };

  constructor(
    private router: Router,
    public as: AuthService,
    private bs: BusyService,
    private ds: DialogService,
    public gs: GlobalService,
    public adm: AdminService
  ) {
    this.gs.bannerImg = null;
    this.gs.sizeContain = false;
    this.gs.bgRepeat = false;
  }

  ngOnInit(): void {
    if (this.gs.isBrowser) {
      this.subsUser = this.as.currentUser.subscribe({ next: user => this.currentUser = user });
      this.getBan();
    }
  }

  ngOnDestroy(): void {
    this.subsBannedGet?.unsubscribe();
    this.subsBannedDelete?.unsubscribe();
    this.subsDialog?.unsubscribe();
    this.subsUser?.unsubscribe();
  }

  getBan(): void {
    this.bs.busy();
    if (this.subsBannedGet) {
      this.subsBannedGet.unsubscribe();
      this.bs.idle();
    }
    this.subsBannedGet = this.adm.getAllBanned(
      this.q, this.page, this.row, this.sort, this.order
    ).subscribe({
      next: res => {
        this.gs.log('[BANNED_LIST_SUCCESS]', res);
        this.count = res.count;
        const bannedDataRow = [];
        let excludedRole = [];
        if (this.currentUser.role === Role.ADMIN) {
          excludedRole = [Role.ADMIN];
        }
        if (this.currentUser.role === Role.MODERATOR) {
          excludedRole = [Role.ADMIN, Role.MODERATOR];
        }
        for (const r of res.results) {
          bannedDataRow.push({
            Id: r.id,
            foto_korban: r.user_.image_url,
            foto_pelaku: (r.banned_by_?.image_url || '/favicon.ico'),
            Korban: r.user_.username,
            Pelaku: (r.banned_by_?.username || 'AUTO_BANNED'),
            Alasan: r.reason,
            Aksi: (r.user_.role.includesOneOf(excludedRole)) ? [] : [{
              type: 'button',
              icon: 'lock_open',
              name: 'UnBAN',
              id: r.id,
              username: r.user_.username,
              email: r.user_.email
            }]
          });
        }
        this.bannedData.row = bannedDataRow;
        this.bs.idle();
      },
      error: err => {
        this.gs.log('[BANNED_LIST_ERROR]', err);
        this.bs.idle();
      }
    });
  }

  unBan(data): void {
    this.gs.log('[BANNED_LIST_CLICK_UNBAN]', data);
    this.subsDialog = this.ds.openInfoDialog({
      data: {
        title: `UnBAN Akun -- '${data.username}' :: '${data.email}'`,
        htmlMessage: 'Apakah Yakin Dan Akun Telah Direview Sebelum UnBAN ?',
        confirmText: 'Ya, Un-BAN Akun',
        cancelText: 'Tidak, Batal'
      },
      disableClose: false
    }).afterClosed().subscribe({
      next: re => {
        this.gs.log('[INFO_DIALOG_CLOSED]', re);
        if (re === true) {
          this.bs.busy();
          this.subsBannedDelete = this.adm.unBan(data.id).subscribe({
            next: res => {
              this.gs.log('[BANNED_LIST_CLICK_UNBAN_SUCCESS]', res);
              this.bs.idle();
              this.getBan();
            },
            error: err => {
              this.gs.log('[BANNED_LIST_CLICK_UNBAN_ERROR]', err);
              this.bs.idle();
              this.getBan();
            }
          });
        } else if (re === false) {
          this.getBan();
        }
        this.subsDialog.unsubscribe();
      }
    });
  }

  onPaginatorClicked(data): void {
    this.gs.log('[BANNED_LIST_CLICK_PAGINATOR]', data);
    this.page = data.pageIndex + 1;
    this.row = data.pageSize;
    this.getBan();
  }

  onServerSideFilter(data: any): void {
    this.gs.log('[BANNED_LIST_ENTER_FILTER]', data);
    this.q = data;
    this.getBan();
  }

  onServerSideOrder(data: any): void {
    this.gs.log('[BANNED_LIST_CLICK_ORDER]', data);
    this.q = data.q;
    this.sort = data.active;
    this.order = data.direction;
    this.getBan();
  }

  openBan(data): void {
    this.gs.log('[BANNED_LIST_CLICK_BANNED]', data);
    this.router.navigateByUrl(`/user/${data.Korban}`);
  }

}
