import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SubjectService } from 'src/app/services/subject.service';
@Component({
  selector: 'app-bee-box',
  templateUrl: './bee-box.component.html',
  styleUrls: ['./bee-box.component.scss'],
})
export class BeeBoxComponent implements OnInit {
  @Input() info: any;
  userInfo: any;
  isFollowed: boolean =false;
  constructor(
    public router: Router,
    private subjectService: SubjectService,
    private cookie: CookieService,
    private firebaseService: FirebaseService
  ) {}

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
        this.userInfo.status = 'online';
      }
    });
    this.firebaseService
      .getRefById('users', this.info.id)
      .then((res: any) => {
        let listFollower = res.follow;
        console.log(listFollower.findIndex((item) => { item == this.userInfo.id}));
        if ( listFollower.findIndex((item) => { item == this.userInfo.id}) > -1
        ) {
          this.isFollowed = true;
          console.log(this.isFollowed);
        }
      })
      .catch((err) => {});
  }
  navigateDetail() {
    this.router.navigate(['bee', this.info.displayName, this.info.id]);
  }
  follow() {
    let listFollow = [];
    this.firebaseService
      .getRefById('users', this.userInfo.id)
      .then((res: any) => {
        listFollow = res.follow;
      })
      .catch((err) => {});
    listFollow.push(this.info.id);
    firebase
      .firestore()
      .collection('users')
      .doc(this.userInfo.id)
      .update('follow', listFollow);
    let listFollower = [];
    this.firebaseService
      .getRefById('users', this.info.id)
      .then((res: any) => {
        listFollower = res.follow;
      })
      .catch((err) => {});
    listFollower.push(this.userInfo.id);
    firebase
      .firestore()
      .collection('users')
      .doc(this.info.id)
      .update('follow', listFollower);
  }
}
