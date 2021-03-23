import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-acc-setting',
  templateUrl: './acc-setting.component.html',
  styleUrls: ['./acc-setting.component.scss']
})
export class AccSettingComponent implements OnInit {
  mainTab = 'account';
  previewAvatar: any = [];
  email: '';
  isShowEmail: '';
  userProfile: any;
  constructor() { }

  ngOnInit(): void {
  }
  initTabAccount() {

  }
  popupChooseAvatarDefault() {

  }
  showEmail() {

  }

}
