import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-list-bees',
  templateUrl: './list-bees.component.html',
  styleUrls: ['./list-bees.component.scss']
})
export class ListBeesComponent implements OnInit {
  listBeesOnline: any;
  listBee: any = [];
  param: any;
  constructor(
    private firebaseService: FirebaseService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((res) => {
      this.param = res.p;
      this.getListPanda();
    })
  
  // this.getListBeeOnline();
  
  }
  async getListPanda() {
    debugger;
    switch (this.param) {
      case '' || undefined: 
      this.listBee = await this.firebaseService.getListAcc('users');
      break;
      case 'online': 
      this.listBee = await this.firebaseService.getBeeByStatus('status', 'online');
      break
      default:
        this.listBee = await this.firebaseService.getBeeByService('service', this.param);
        break
    }
    
    console.log(this.listBee);
  }
  //  async getListBeeOnline() {
  //   this.listBeesOnline = await this.firebaseService.getBeeByStatus('status', 'online');
    
  //   console.log(this.listBeesOnline);
  // }

}
