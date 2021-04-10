import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BeeBoxComponent } from './component/bee-box/bee-box.component';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { LeftNavComponent } from './component/left-nav/left-nav.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { BeeProfileComponent } from './pages/bee-profile/bee-profile.component';
import { ListBeesComponent } from './pages/list-bees/list-bees.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
// firebase
import firebase from 'firebase';
import { ToastrModule } from 'ngx-toastr';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TagInputModule } from 'ngx-chips';
import { AngularAgoraRtcModule, AgoraConfig } from 'angular-agora-rtc';
import { AngularFireModule } from '@angular/fire';
const firebaseConfig = {
  apiKey: 'AIzaSyAY0q9PonWzSoujGQh6GGsqQ6LufCglB30',
  authDomain: 'beauty-garden-5d096.firebaseapp.com',
  projectId: 'beauty-garden-5d096',
  storageBucket: 'beauty-garden-5d096.appspot.com',
  messagingSenderId: '215539765488',
  appId: '1:215539765488:web:a12127edb254f5e9cef235',
  measurementId: 'G-TR5ED9LLW9',
};
firebase.initializeApp(firebaseConfig);
const agoraConfig: AgoraConfig = {
  AppID: '68839fbf8dcc423f87c2f89fa52e975b',
};
@NgModule({
  declarations: [
    AppComponent,
    BeeBoxComponent,
    LeftNavComponent,
    ListBeesComponent,
    BeeProfileComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ModalModule.forRoot(),
    BrowserAnimationsModule,
    CommonModule,
    FullCalendarModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      preventDuplicates : true,
      countDuplicates : false
    }),
    NgxPaginationModule,
    BsDatepickerModule.forRoot(),
    ImageCropperModule,
    TagInputModule,
    AngularAgoraRtcModule.forRoot(agoraConfig),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
