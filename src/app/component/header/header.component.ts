import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SubjectService } from 'src/app/services/subject.service';
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
  showBecomePandaBtn= true;
  activeRow: any = 1;
  noResultFound: boolean = false;
  showSearchLoading: boolean = false;
  showResult: boolean = true;
  isSearch: boolean = false;
  searchKey: any;
  modalSignIn: BsModalRef
  constructor(
    public modalService: BsModalService,
    private subjectService: SubjectService,
    private cookie: CookieService,
    private authService: AuthService,
    private router : Router

  ) { }

  ngOnInit(): void {
    this.subjectService.userInfo.subscribe((res) => {
      debugger;
      this.userInfo = res;
      if (!this.userInfo && this.cookie.get('account_info') && this.cookie.get('account_info') != '') {
        this.userInfo = JSON.parse(this.cookie.get('account_info'));
        
      }
      if (this.userInfo.role == 'bee') {
        this.showBecomePandaBtn = false;
      }
      console.log(this.userInfo)
    })
    console.log(this.userInfo);
  }
  redirectToUserSetting() {
    this.router.navigate(['/account-setting']);
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
    this.authService.logOut().then(res => {
      document.cookie = `jwt_access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `account_info=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    localStorage.removeItem('user_data');
    this.cookie.delete('jwt_access_token', '/');
    this.cookie.delete('account_info', '/');
    this.subjectService.userInfo.next(null);
    })
  }
  toogleSearch() {

  }
  redirectBecomeBee() {
    this.router.navigate(['/become-bee'])
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
