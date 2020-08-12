import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ChartsModule } from 'ng2-charts';

import { AuthGuard } from '../../_shared/helpers/auth-guard';

import { Role } from '../../_shared/models/Role';

import { SharedMaterialModule } from '../../_shared/helpers/shared-material.module';
import { MaterialTabModule } from '../../_shared/components/material-tab/material-tab.module';
import { MaterialChipModule } from 'src/app/_shared/components/material-chip/material-chip.module';
import { NotificationsModule } from '../../_shared/components/notifications/notifications.module';
import { MaterialExpansionPanelModule } from '../../_shared/components/material-expansion-panel/material-expansion-panel.module';

import { FansubListComponent } from './fansub-list/fansub-list.component';
import { FansubDetailComponent } from './fansub-detail/fansub-detail.component';
import { FansubCreateComponent } from './fansub-create/fansub-create.component';
import { FansubEditComponent } from './fansub-edit/fansub-edit.component';

const routes: Routes = [
  {
    path: '',
    component: FansubListComponent
  },
  {
    path: 'create',
    component: FansubCreateComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Fansub - Buat Baru',
      description: 'Halaman Menambahkan Fansub Baru',
      keywords: 'Create Fansub',
      roles: [Role.ADMIN, Role.FANSUBBER, Role.MODERATOR, Role.USER]
    }
  },
  {
    path: ':fansubId/edit',
    component: FansubEditComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Fansub - Ubah Data',
      description: 'Halaman Pembaharuan Data Fansub',
      keywords: 'Ubah Fansub',
      roles: [Role.ADMIN, Role.FANSUBBER, Role.MODERATOR, Role.USER]
    }
  },
  {
    path: ':fansubId',
    component: FansubDetailComponent
  }
];

@NgModule({
  declarations: [
    FansubListComponent,
    FansubDetailComponent,
    FansubCreateComponent,
    FansubEditComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedMaterialModule,
    MaterialTabModule,
    MaterialExpansionPanelModule,
    MaterialChipModule,
    ChartsModule,
    NotificationsModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class FansubModule { }
