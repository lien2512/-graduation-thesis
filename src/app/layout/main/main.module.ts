import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { RouterModule } from '@angular/router';
import { BeeProfileComponent } from 'src/app/pages/bee-profile/bee-profile.component';
import { ListBeesComponent } from 'src/app/pages/list-bees/list-bees.component';
import { ComponentModule } from 'src/app/component/component.module';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { LoginComponent } from 'src/app/component/login/login.component';



@NgModule({
  declarations: [MainComponent,],
  imports: [
    CommonModule,
    ComponentModule,
    RouterModule.forChild([{
      path: '', component: MainComponent, children: [
        {path: 'login', component: LoginComponent},
        {path: '', component: DashboardComponent},
        {path: 'bee', component: BeeProfileComponent},
        {path: 'bees', component: ListBeesComponent}
      ]
    }])
  ]
})
export class MainModule { }
