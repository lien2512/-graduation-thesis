import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccSettingComponent } from './acc-setting/acc-setting.component';



@NgModule({
  declarations: [AccSettingComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class PagesModule { }