import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PopUpConfirmComponent } from './pop-up-confirm/pop-up-confirm.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { OrderComponent } from './order/order.component';
import { OrdersComponent } from './orders/orders.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    PopUpConfirmComponent,
    OrderComponent,
    OrdersComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    PopUpConfirmComponent,
    OrderComponent,
    OrdersComponent
  ]
})
export class ComponentModule { }
