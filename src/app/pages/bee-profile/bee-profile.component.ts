import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AgoraLocalComponent } from 'angular-agora-rtc';
import firebase from 'firebase';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from 'src/app/component/login/login.component';
import { PopUpConfirmComponent } from 'src/app/component/pop-up-confirm/pop-up-confirm.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HelperService } from 'src/app/services/helper.service';
import { SubjectService } from 'src/app/services/subject.service';
import { AgoraCallComponent } from '../agora-call/agora-call.component';

@Component({
  selector: 'app-bee-profile',
  templateUrl: './bee-profile.component.html',
  styleUrls: ['./bee-profile.component.scss'],
})
export class BeeProfileComponent implements OnInit {
  modalReport: BsModalRef;
  modalCall: BsModalRef | null;
  modalInputHours: BsModalRef | null;
  modalConfirmBlock: BsModalRef;
  modalLogin: BsModalRef;
  listItemDefault: any;
  listIMG: any = [];
  statusCall: any;
  pageNum: any;
  beeProfile: any = {
    avatar: '',
    avatarUrl: '',
    bio: '',
    birthday: '',
    city: '',
    displayName: '',
    email: '',
    emailVerified: false,
    follow: [],
    gender: '',
    id: '',
    imageMember: [],
    languages: [],
    logo: '',
    role: '',
    status: '',
    tags: [],
    uid: '',
    video: [],
    advise: [],
    review: [],
  };
  userInfo: any;
  connectingCall = false;
  id: any;
  infoTheCall: any;
  isFollowed: boolean;
  isBlock: boolean
  ageOfBee: any;
  @ViewChild('templateCall') callingModal: TemplateRef<any>;
  @ViewChild('templateInputHours') inputHoursModal: TemplateRef<any>;
  public formReport: FormGroup;
  public formMeetNow: FormGroup;
  modalCallingOpened: boolean = false;
  constructor(
    public modalService: BsModalService,
    private firebaseService: FirebaseService,
    private activatedRoute: ActivatedRoute,
    private subjectService: SubjectService,
    private cookie: CookieService,
    private fb: FormBuilder,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.formMeetNow = this.fb.group({
      bookType: ['video'],
      promoCode: [''],
    });
    this.formReport = this.fb.group({
      defaultReason: [''],
      reportContent: [''],
      imgReport: [''],
    });
    this.listItemDefault = [
      'Nội dung nhạy cảm',
      'Bạo lực',
      'Nội dung bị cấm',
      'Gây hiểu nhầm hoặc lừa đảo',
    ];
    this.activatedRoute.params.subscribe((res) => {
      if (res.id) {
        this.id = res.id;
        this.getBeeProfile();
      }
    });
    this.subjectService.userInfo.subscribe((res) => {
      this.userInfo = res;
      if (
        !this.userInfo &&
        this.cookie.get('account_info') &&
        this.cookie.get('account_info') != ''
      ) {
        this.userInfo = JSON.parse(this.cookie.get('account_info'));
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
        if (
          logs.find((item) => {
            return item.status == 'cancel';
          })
        ) {
          let info = logs.find((item) => {
            return item.status == 'cancel';
          });
          if (info.action == 'turn_off') {
            if (info.closeUser == 'receiver') {
              this.modalCall.hide();
            } else if (info.closeUser == 'caller') {
              alert('bạn đã huỷ cuộc gọi');
              // this.deleteCollection(firebase.firestore(),"call", this.userInfo.id + '-' + this.id)
            }
          }
        }
        if (
          logs.find((item) => {
            return item.status == 'calling';
          })
        ) {
          let info = logs.find((item) => {
            return item.status == 'calling';
          });
          this.modalCall = this.modalService.show(AgoraCallComponent, {
            class: 'modal-default',
            initialState: {
              token: info.token,
              chanel: info.chanel,
            },
          });
          this.modalCall.content.onEndcall.subscribe(() => {
            this.modalCall.hide();
            firebase
              .firestore()
              .collection('call')
              .doc(info.idCall)
              .update('status', 'end_call');
          });
        }
      });
     this.checkBlocked();
  }
  blockAccount(template: TemplateRef<any>) {
    this.modalReport = this.modalService.show(template, {
      class: 'modal-default',
    });
  }
  sendReport() {
    this.formReport.patchValue({ imgReport: this.listIMG });
    if (
      !this.formReport.get('defaultReason').value &&
      this.listIMG.length == 0 &&
      !this.formReport.get('reportContent').value
    ) {
      this.helperService.showError('', 'Nhập lý do báo cáo');
      return;
    }
    firebase
      .firestore()
      .collection('report')
      .doc(this.beeProfile.id)
      .set(this.formReport.value);
    this.modalReport.hide();

    setTimeout(() => {
      this.listIMG = [];
      this.formReport.reset();
    }, 6000);
  }
  cancelReport() {
    this.modalReport.hide();
    this.listIMG = [];
    this.formReport.reset();
  }

  getBeeProfile() {
    debugger;
    this.firebaseService
      .getRefById('users', this.id)
      .then((res: any) => {
        this.beeProfile = res;
        this.beeProfile.follower = res.follower;
        this.isFollowed = this.beeProfile.follower.findIndex((item) => item.id == this.userInfo.id) > -1;
        if (res.listBock.length > 0) {
          this.isBlock = res.listBock.findIndex((item) => item.id == this.userInfo.id) > -1;
        }
        this.ageOfBee = this.CalculateAge(new Date(res.birthday));
      })
      .catch((err) => {});
  }
  chooseImage(event) {}
  removeEachImage(oder, id) {}
  openModalBook() {}
  call() {
    this.openModalInputHours(this.inputHoursModal);
  }
  startBooking() {
    this.statusCall = 'pending';
    let idcall = this.userInfo.id + '-' + this.id;
    let dataCall = {
      idCall: idcall,
      status: this.statusCall,
      time: '30',
      participant: [this.userInfo.id, this.id],
      recipientCall: this.id,
      callee: this.userInfo.id,
      chanel: 'test1',
      // chanel: this.userInfo.displayName + '-' + this.beeProfile.displayName,
      token:
        '00668839fbf8dcc423f87c2f89fa52e975bIAB/I63YmJo4kaXwBHtsL8mPiX9p4n6Y9heP4OP7c0YhuOLcsooAAAAAEAAeXT+c54tqYAEAAQDni2pg',
    };
    this.firebaseService.createCall(idcall, dataCall);
    this.waitingForCall();
    this.closeModalInputHours();
  }
  waitingForCall() {
    this.openModalCalling(this.callingModal);
  }
  openModalCalling(template: TemplateRef<any>) {
    this.modalCall = this.modalService.show(template, {
      class: 'modal-sm popup-calling modal-dialog-centered ',
      backdrop: true,
      ignoreBackdropClick: true,
    });
    this.modalCallingOpened = true;
  }
  cancelCall() {
    this.modalCall.hide();
    this.modalCallingOpened = false;
    firebase
      .firestore()
      .collection('call')
      .doc(this.userInfo.id + '-' + this.id)
      .update('action', 'turn_off', 'closeUser', 'caller', 'status', 'cancel');
  }
  closeModalInputHours() {
    this.formMeetNow.reset();
    this.modalInputHours.hide();
  }
  openModalInputHours(template: TemplateRef<any>) {
    this.modalInputHours = this.modalService.show(template, {
      class: 'modal-sm popup-calling modal-dialog-centered',
      ignoreBackdropClick: true,
    });
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
  follow() {
    this.isFollowed = !this.isFollowed;
    if (this.isFollowed) {
      firebase.firestore().collection('users').doc(this.userInfo.id).update({
        follow: firebase.firestore.FieldValue.arrayUnion(this.beeProfile)
      });
      firebase.firestore().collection('users').doc(this.beeProfile.id).update({
        follower: firebase.firestore.FieldValue.arrayUnion(this.userInfo)
      });
    } else {
      firebase.firestore().collection('users').doc(this.userInfo.id).update({
        follow: firebase.firestore.FieldValue.arrayRemove(this.beeProfile)
      });
      firebase.firestore().collection('users').doc(this.beeProfile.id).update({
        follower: firebase.firestore.FieldValue.arrayRemove(this.userInfo)
      });
    }

  }
   blockPanda(id) {
    if (!this.userInfo) {
      this.openLoginModal();
      return false;
    } else {
      this.modalConfirmBlock = this.modalService.show(PopUpConfirmComponent, {
        class: 'modal-default',
        initialState: {
          confirmText: 'Chặn người dùng này',
          confirmButton: 'Đồng ý',
          cancelButton: 'Huỷ',
          confirmTitle: 'Block',
        },
      });
      this.modalConfirmBlock.content.onCancel.subscribe(() => {
        this.modalConfirmBlock.hide();
      });
      this.modalConfirmBlock.content.onConfirm.subscribe(() => {
        this.modalConfirmBlock.hide();
        firebase.firestore().collection('users').doc(this.userInfo.id).update({
          listBock: firebase.firestore.FieldValue.arrayUnion(this.beeProfile)
        });
        firebase.firestore().collection('users').doc(this.beeProfile.id).update({
          blockedBy: firebase.firestore.FieldValue.arrayUnion(this.userInfo)
        });
        // let listBlock = [];
        // this.firebaseService
        //   .getRefById('users', this.userInfo.id)
        //   .then((res: any) => {
        //     listBlock = res.listBock;
        //   })
        //   .catch((err) => {});
        // listBlock.push({id: this.beeProfile.id, logo: this.beeProfile.logo, displayName: this.beeProfile.displayName});
        // firebase
        //   .firestore()
        //   .collection('users')
        //   .doc(this.userInfo.id)
        //   .update('listBock', listBlock);
        this.isBlock = true;
      });
    }
  }
  openLoginModal() {
    this.modalLogin = this.modalService.show(LoginComponent, {
      class: 'modal-sign-in',
    });
    this.modalLogin.content.onClose.subscribe(() => {
      this.modalLogin.hide();
    });
  }
  CalculateAge(birthday) { // birthday is a date
    var diff_ms = Date.now() - birthday.getTime();
    var age_dt = new Date(diff_ms); 
  
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }
  async checkBlocked() {
    let res: any = await this.firebaseService.getRefById('users',this.userInfo.id);
    this.isBlock = res.listBock.findIndex((item) => {
      return item.id == this.beeProfile.id;
    }) > -1;
  }
}
