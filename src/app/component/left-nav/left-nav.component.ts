import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase';
import { CookieService } from 'ngx-cookie-service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SubjectService } from 'src/app/services/subject.service';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss']
})
export class LeftNavComponent implements OnInit {
  recommended_bee: any = [];
  follower_bee: any = [];
  userInfo: any;
  db = firebase.firestore()
  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private subjectService: SubjectService,
    private cookie: CookieService,
  ) { }

  ngOnInit(): void {
    this.subjectService.userInfo.subscribe((res: any) => {
      this.userInfo = res;
      if (!this.userInfo && this.cookie.get('account_info') && this.cookie.get('account_info') != '') {
        this.userInfo = JSON.parse(this.cookie.get('account_info'));
      };
    });
    this.getListBee();
  }
  navigateToDetail(name, id) {
    this.router.navigate(['/bee', name, id]);
  }
  async getListBee() {
   this.follower_bee = await this.firebaseService.getBeeByService('follow', this.userInfo.id);
   console.log(this.follower_bee);
   this.recommended_bee = await this.firebaseService.getRecomnendBee();
   console.log(this.recommended_bee);
  }

}
