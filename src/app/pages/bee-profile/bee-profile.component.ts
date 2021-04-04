import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AgoraLocalComponent } from 'angular-agora-rtc';
import firebase from 'firebase';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SubjectService } from 'src/app/services/subject.service';
import { AgoraCallComponent } from '../agora-call/agora-call.component';

@Component({
  selector: 'app-bee-profile',
  templateUrl: './bee-profile.component.html',
  styleUrls: ['./bee-profile.component.scss']
})
export class BeeProfileComponent implements OnInit {

  modalReport: BsModalRef;
  modalCall: BsModalRef | null;
  modalInputHours: BsModalRef | null;
  listItemDefault: any;
  listIMG: any = [];
  statusCall: any;
  beeProfile: any;
  userInfo: any;
  connectingCall = false;
  id: any;
  infoTheCall: any;
  @ViewChild('templateCall') callingModal: TemplateRef<any>;
  @ViewChild('templateInputHours') inputHoursModal: TemplateRef<any>;
  public formMeetNow: FormGroup;
  modalCallingOpened: boolean = false;
  constructor(
    public modalService: BsModalService,
    private firebaseService: FirebaseService,
    private activatedRoute: ActivatedRoute,
    private subjectService: SubjectService,
    private cookie: CookieService,
    private fb: FormBuilder,

  ) { }

  ngOnInit(): void {
    this.formMeetNow = this.fb.group({
      bookType: ['video'],
      promoCode: [''],
  });
    this.listItemDefault = [{
      checked: false,
      reason: 'Spam'
    },
    {
      checked: false,
      reason: 'Nội dung nhạy cảm'
    },
    {
      checked: false,
      reason: 'Bạo lực'
    },
    {
      checked: false,
      reason: 'Nội dung bị cấm'
    },
    {
      checked: false,
      reason: 'Gây hiểu nhầm hoặc lừa đảo'
    }]
    this.activatedRoute.params.subscribe(res => {
      if (res.id) {
          this.id = res.id;
          this.getBeeProfile();
      }})
      this.subjectService.userInfo.subscribe((res) => {
        this.userInfo = res;
        if (!this.userInfo && this.cookie.get('account_info') && this.cookie.get('account_info') != '') {
          this.userInfo = JSON.parse(this.cookie.get('account_info'));
          
        }
      })
      firebase.firestore()
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
        if (logs.find((item) => { return item.status == 'cancel'})) {
          let info = logs.find((item) => { return item.status == 'cancel'});
          if (info.action == 'turn_off') {
            if (info.closeUser == 'receiver')
            {
              this.modalCall.hide();
            } else if (info.closeUser == 'caller') {
              alert("bạn đã huỷ cuộc gọi");
              // this.deleteCollection(firebase.firestore(),"call", this.userInfo.id + '-' + this.id)
            }
          }
        }
        if (logs.find((item) => { return item.status == 'calling'})) {
          let info = logs.find((item) => { return item.status == 'calling'});
         this.modalCall =  this.modalService.show(AgoraCallComponent, {
            class: 'modal-default',
            initialState: {
              token: info.token,
              chanel: info.chanel,
            },
          });
          this.modalCall.content.onEndcall.subscribe(() => {
            this.modalCall.hide();
            firebase.firestore().collection("call").doc(info.idCall).update("status", 'end_call')
        });
        }
      });
  }
  blockAccount(template: TemplateRef<any>) {
    this.modalReport = this.modalService.show(template, {
      class: 'modal-default',
    })
  }
  getBeeProfile() {
    this.firebaseService.getRefById('users', this.id).then((res) => {
      this.beeProfile = res;
      console.log(this.beeProfile);
    }).catch(err => {});
  }
  chooseImage(event) {

  }
  removeEachImage(oder, id) {

  }
  openModalBook() {
  }
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
      participant : [this.userInfo.id, this.id],
      recipientCall : this.id,
      callee: this.userInfo.id,
      chanel: 'test1',
      // chanel: this.userInfo.displayName + '-' + this.beeProfile.displayName,
      token: '00668839fbf8dcc423f87c2f89fa52e975bIAB/I63YmJo4kaXwBHtsL8mPiX9p4n6Y9heP4OP7c0YhuOLcsooAAAAAEAAeXT+c54tqYAEAAQDni2pg'
    }
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
  firebase.firestore().collection("call").doc(this.userInfo.id + '-' + this.id).update('action', 'turn_off', 'closeUser', 'caller', 'status', 'cancel');
}
closeModalInputHours() {
  this.formMeetNow.reset();
  this.modalInputHours.hide();
}
openModalInputHours(template: TemplateRef<any>) {
  this.modalInputHours = this.modalService.show(template, { class: 'modal-sm popup-calling modal-dialog-centered', ignoreBackdropClick: true });
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

}
