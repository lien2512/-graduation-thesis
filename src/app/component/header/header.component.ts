import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { AgoraCallComponent } from 'src/app/pages/agora-call/agora-call.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SubjectService } from 'src/app/services/subject.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  userInfo: any;
  listBee: any;
  unreadNotification: any;
  unreadMessage: any = 1;
  showBecomePandaBtn = true;
  activeRow: any = 1;
  noResultFound: boolean = false;
  showSearchLoading: boolean = false;
  showResult: boolean = true;
  isSearch: boolean = false;
  searchKey: any;
  modalSignIn: BsModalRef;
  notiModalRef: BsModalRef;
  modalCall: BsModalRef;
  ringingAudio: any;
  notiModalShowing: boolean;
  timeOutNotiModal: any;
  connectingCall: boolean = false;
  statusCall: any;
  infoTheCall: any;
  @ViewChild('notificationCall') notificationCall: TemplateRef<any>;
  constructor(
    public modalService: BsModalService,
    private subjectService: SubjectService,
    private cookie: CookieService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subjectService.userInfo.subscribe((res) => {
      debugger;
      this.userInfo = res;
      if (
        !this.userInfo &&
        this.cookie.get('account_info') &&
        this.cookie.get('account_info') != ''
      ) {
        this.userInfo = JSON.parse(this.cookie.get('account_info'));
        this.userInfo.status = "online";
        firebase.firestore().collection("users").doc(this.userInfo.id).update('status', "online")
      }
      if (this.userInfo.role == 'bee') {
        this.showBecomePandaBtn = false;
      }
      console.log(this.userInfo);
      console.log(firebase.auth().currentUser);
    });
    this.ringingAudio = new Audio();
    this.ringingAudio.src = '/assets/audio/rings_call.wav';
    this.ringingAudio.load();
    this.ringingAudio.loop = true;
    this.handleCall();
  }
  redirectToUserSetting() {
    this.router.navigate(['/account-setting']);
  }
  redirectToBeeSetting() { }
  redirectToWallet() { }
  redirectToPayMent() { }
  redirectToTestDevice() { }
  signOut() {
    this.authService.logOut().then((res) => {
      document.cookie = `jwt_access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `account_info=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      localStorage.removeItem('user_data');
      this.cookie.delete('jwt_access_token', '/');
      this.cookie.delete('account_info', '/');
      this.subjectService.userInfo.next(null);
    });
  }
  toogleSearch() { }
  redirectBecomeBee() {
    this.router.navigate(['/become-bee']);
  }
  notificationShowed() { }
  openBoxChat() { }
  openLoginModal(event) {
    this.modalSignIn = this.modalService.show(LoginComponent, {
      class: 'modal-sign-in',
      ignoreBackdropClick: true,
    });
    this.modalSignIn.content.onClose.subscribe(() => {
      this.modalSignIn.hide();
    });
  }
  onClickResultDetail(result) { }
  shouldShowResults() { }
  onSearchBoxChange() { }
  onEnter() { }
  move(event) { }
  clickOutside() { }
  hideModalFilter() { }
  handleCall() {
    // let query = firebase.firestore().collection('call');

    firebase.firestore().collection('call').where('recipientCall', '==', this.userInfo.id)
      .onSnapshot((querySnapshot) => {
        let logs = [];
        let tempObject: any;
        querySnapshot.forEach((doc) => {
          tempObject = doc.data();
          tempObject.id = doc.id;
          logs.push(tempObject);
        });
        console.log(logs);
        this.infoTheCall = logs.find((item) => { return item.status == 'pending' });

        if (logs.find((item) => { return item.status == 'pending' })) {
          firebase.firestore().collection("users").doc(this.userInfo.id).update('status', 'pending');
          this.openCallingNotification(this.notificationCall);

        }
        if (logs.find((item) => { return item.status == 'cancel' })) {
          let info = logs.find((item) => { return item.status == 'cancel' })
          if (info.action == 'turn_off') {
            if (info.closeUser == 'caller') {
              this.hideNotiModal();
              this.deleteCollection(firebase.firestore(), 'call', info.idCall)
            }
          }
        }
      });
    firebase
      .firestore()
      .collection('call')
      .where('callee', '==', this.userInfo.id)
      .onSnapshot((querySnapshot) => {
        let logs = [];
        let tempObject: any;
        querySnapshot.forEach((doc) => {
          tempObject = doc.data();
          tempObject.id = doc.id;
          logs.push(tempObject);
        });
        console.log(logs);
        this.infoTheCall = logs.find((item) => { return item.status == 'cancel' })
        if (logs.find((item) => { return item.status == 'cancel' })) {
          let info = logs.find((item) => { return item.status == 'cancel' })
          if (info.action == 'turn_off') {
            if (info.closeUser == 'receiver') {
              alert("Người nghe từ chối");
              this.deleteCollection(firebase.firestore(), 'call', info.idCall)
            }
          }
        }
      });
  }
  openCallingNotification(template: TemplateRef<any>) {
    this.ringingAudio.play();
    this.notiModalRef = this.modalService.show(template, {
      backdrop: false,
      ignoreBackdropClick: true,
      class: 'modal-sm modal-noti',
    });
    this.notiModalShowing = true;
    this.timeOutNotiModal = setTimeout(() => {
      if (this.notiModalShowing) {
        this.hideNotiModal();

      }
    }, 120000);
  }
  hideNotiModal() {
    if (this.notiModalRef && this.notiModalRef != undefined) {
      this.notiModalRef.hide();
    }
    this.connectingCall = false;
    this.notiModalShowing = false;
    clearTimeout(this.timeOutNotiModal);
    this.ringingAudio.pause();
    this.ringingAudio.currentTime = 0;
  }
  pandaAcceptMeeting() {
    this.connectingCall = true;
    this.hideNotiModal();
    firebase.firestore().collection("call").doc(this.infoTheCall.idCall).update('status', 'calling');
    this.modalCall = this.modalService.show(AgoraCallComponent, {
      class: 'modal-default',
      initialState: {
        token: this.infoTheCall.token,
        chanel: this.infoTheCall.chanel,
      },
    });
    this.modalCall.content.onEndcall.subscribe(() => {
      this.modalCall.hide();
      firebase.firestore().collection("call").doc(this.infoTheCall.idCall).update("status", 'end_call');
    });
  }
  declineMeeting() {
    this.statusCall = 'cancel';
    this.hideNotiModal();
    firebase.firestore().collection("call").doc(this.infoTheCall.idCall).update('action', 'turn_off', 'closeUser', 'receiver', 'status', 'cancel');
    firebase.firestore().collection("users").doc(this.userInfo.id).update('status', 'online');

  }
  async deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }

  async deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    // process.nextTick(() => {
    //   this.deleteQueryBatch(db, query, resolve);
    // });
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    firebase.firestore().collection("users").doc(this.userInfo.id).update("status", "offline");
  }
  async createToken() {
    // firebase.functions().useEmulator("localhost", 5001); 


    const doCreateAgoraToken = firebase.app().functions().httpsCallable('doCreateAgoraToken');
    const tokenResult = await doCreateAgoraToken({channelName:'abcd'}); // chanel name chỗ này đặt random nhé, new Date().getTime() cũng đc
    console.log(tokenResult);
  }
}
