import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaterialFileInputModule } from 'ngx-material-file-input';

import { SharedMaterialModule } from '../../helpers/shared-material.module';

import { MaterialDialogInfoComponent } from './material-dialog-info/material-dialog-info.component';
import { MaterialDialogDmakComponent } from './material-dialog-dmak/material-dialog-dmak.component';
import { MaterialDialogEdictComponent } from './material-dialog-edict/material-dialog-edict.component';
import { MaterialDialogBelajarComponent } from './material-dialog-belajar/material-dialog-belajar.component';
import { MaterialDialogBanComponent } from './material-dialog-ban/material-dialog-ban.component';

@NgModule({
  declarations: [
    MaterialDialogInfoComponent,
    MaterialDialogDmakComponent,
    MaterialDialogEdictComponent,
    MaterialDialogBelajarComponent,
    MaterialDialogBanComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialFileInputModule
  ],
  exports: [
    MaterialDialogInfoComponent,
    MaterialDialogDmakComponent,
    MaterialDialogEdictComponent,
    MaterialDialogBelajarComponent
  ]
})
export class MaterialDialogModule { }
