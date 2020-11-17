import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DateAgoPipe } from '../../pipes/date-ago.pipe';

import { SharedMaterialModule } from '../../helpers/shared-material.module';

import { MaterialTableComponent } from './material-table.component';
import { MaterialChipModule } from '../material-chip/material-chip.module';

@NgModule({
  declarations: [
    MaterialTableComponent,
    DateAgoPipe
  ],
  imports: [
    CommonModule,
    SharedMaterialModule,
    MaterialChipModule,
    FormsModule
  ],
  exports: [MaterialTableComponent]
})
export class MaterialTableModule { }
