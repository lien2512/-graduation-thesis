import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SubjectService } from 'src/app/services/subject.service';

@Component({
  selector: 'app-bee-profile',
  templateUrl: './bee-profile.component.html',
  styleUrls: ['./bee-profile.component.scss']
})
export class BeeProfileComponent implements OnInit {

  modalReport: BsModalRef;
  listItemDefault: any;
  listIMG: any = [];
  statusCall: any;
  beeProfile: any;
  userInfo: any;
  id: any;
  constructor(
    public modalService: BsModalService,
    private firebaseService: FirebaseService,
    private activatedRoute: ActivatedRoute,
    private subjectService: SubjectService,
    private cookie: CookieService

  ) { }

  ngOnInit(): void {
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
    this.statusCall = 'pending';
    let idCall = this.userInfo.id + '-' + this.id;
    let dataCall = {
      status: this.statusCall,
      time: '30',
      participant : [this.userInfo.id, this.id]
    }
   this.firebaseService.createCall(idCall, dataCall);
  }

}
