import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userInfo: any;
  listBee: any;
  unreadNotification: any;
  unreadMessage: any = 1;
  showBecomePandaBtn: false;
  activeRow: any = 1;
  noResultFound: boolean = false;
  showSearchLoading: boolean = false;
  showResult: boolean = true;
  isSearch: boolean = false;
  searchKey: any;
  modalSignIn: BsModalRef
  constructor(
    public modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.userInfo = {
      role: 'bee',
      name: "ANna"
    }
  }
  redirectToUserSetting() {

  }
  redirectToBeeSetting() {

  }
  redirectToWallet() {

  }
  redirectToPayMent() {

  }
  redirectToTestDevice() {

  }
  signOut() {

  }
  toogleSearch() {

  }
  redirectBecomeBee() {

  }
  notificationShowed() {

  }
  openBoxChat() {

  }
  openLoginModal(event) {
    this.modalSignIn = this.modalService.show(LoginComponent, {
      class : 'modal-sign-in',
      ignoreBackdropClick: true
    })
    this.modalSignIn.content.onClose.subscribe(() => {
      this.modalSignIn.hide();
    })
  }
  onClickResultDetail(result) {

  }
  shouldShowResults() {

  }
  onSearchBoxChange() {

  }
  onEnter() {

  }
  move(event) {

  }
  clickOutside() {

  }
  hideModalFilter() {
    
  }
}
