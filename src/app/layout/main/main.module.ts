import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { RouterModule } from '@angular/router';
import { BeeProfileComponent } from 'src/app/pages/bee-profile/bee-profile.component';
import { ListBeesComponent } from 'src/app/pages/list-bees/list-bees.component';
import { ComponentModule } from 'src/app/component/component.module';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { LoginComponent } from 'src/app/component/login/login.component';
import { AccSettingComponent } from 'src/app/pages/acc-setting/acc-setting.component';
import { PagesModule } from 'src/app/pages/pages.module';
import { BecomeBeeComponent } from 'src/app/pages/become-bee/become-bee.component';



@NgModule({
  declarations: [MainComponent,],
  imports: [
    CommonModule,
    ComponentModule,
    PagesModule,
    RouterModule.forChild([{
      path: '', component: MainComponent, children: [
        {path: 'login', component: LoginComponent},
        {path: '', component: DashboardComponent},
        {path: 'bee', component: BeeProfileComponent},
        {path: 'bees', component: ListBeesComponent},
        {path: 'account-setting', component: AccSettingComponent},
        {path: 'become-bee', component: BecomeBeeComponent}
      ]
    }])
  ]
})
export class MainModule { }
