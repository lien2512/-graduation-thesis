import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccSettingComponent } from './acc-setting/acc-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ImageCropperModule } from 'ngx-image-cropper';
import { BecomeBeeComponent } from './become-bee/become-bee.component';
import { TagInputModule } from 'ngx-chips';


@NgModule({
  declarations: [AccSettingComponent, BecomeBeeComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    BsDatepickerModule.forRoot(),
    ImageCropperModule,
    TagInputModule

  ],
  exports: [AccSettingComponent, BecomeBeeComponent]
})
export class PagesModule { }