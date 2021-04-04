import { Component, OnInit } from '@angular/core';
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
  constructor(
    private firebaseService: FirebaseService
  ) { }

  ngOnInit(): void {
 
  this.getListPanda();
  this.getListBeeOnline();
  }
  async getListPanda() {
    this.listBee = await this.firebaseService.getListAcc('users');
    console.log(this.listBee);
  }
   async getListBeeOnline() {
    this.listBeesOnline = await this.firebaseService.getBeeByStatus('status', 'online');
    
    console.log(this.listBeesOnline);
  }

}
