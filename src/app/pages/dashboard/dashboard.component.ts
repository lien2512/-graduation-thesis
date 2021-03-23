import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  listImgBanner: any = [];
  listHightlightBees: any = [];
  constructor() {}

  ngOnInit(): void {
    this.listImgBanner = [
      {
        btn_text: null,
        description: null,
        image: 'assets/images/banner2.jpg',
        type: 'banner',
      },
      {
        btn_text: null,
        description: null,
        image: 'assets/images/banner3.jpg',
        status: 0,
        type: 'banner',
      },
      {
        btn_text: null,
        description: null,
        image: 'assets/images/banner1.jpg',
        status: 0,
        type: 'banner',
      },
    ];
    this.listHightlightBees = [
      {
        avatar:
          'assets/images/bee1.png',
        date_of_birth: '1989-10-14',
        followed: false,
        followed_count: 10,
        gender: 'male',
        id: 529,
        name: 'YooyooBaby',
        online_status: 0,
        review_score: 4.5,
        tag_name: ['yolo', 'stayfoolish', 'stay hungry'],
      },
      {
        avatar:
        'assets/images/bee2.png',
        date_of_birth: '2001-01-25',
        followed: false,
        followed_count: 10,
        gender: 'female',
        id: 583,
        name: 'Ninh PT diojap',
        online_status: 0,
        review_score: 4.5,
        tag_name: ['Fun'],
      },
      {
        avatar:
        'assets/images/bee3.png',
        date_of_birth: '2002-11-30',
        followed: false,
        followed_count: 5,
        gender: 'female',
        id: 628,
        name: 'SilverWings',
        online_status: 0,
        review_score: null,
        tag_name: ['Sweet Voice'],
      },
    ];
  }
}
