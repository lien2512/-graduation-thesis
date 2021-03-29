import { Component, OnInit } from '@angular/core';
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
    this.listBeesOnline = [{
      avatar: 'assets/images/images.png',
      name: 'Anna',
      audio: 'true',
      video: 'true',
      followers: '15',
      online: '1',
      type: 'skin',
      tag: 'happy',
    },
    {
      avatar: 'assets/images/images.png',
      name: 'Anna',
      audio: 'true',
      video: 'true',
      followers: '15',
      online: '0',
      type: 'skin',
      tag: 'happy',
    },
    {
      avatar: 'assets/images/avatar-default.jpg',
      name: 'Anna',
      audio: 'true',
      video: 'true',
      followers: '15',
      online: '2',
      type: 'skin',
      tag: 'happy',
    },
    {
      avatar: 'assets/images/avatar-default.jpg',
      name: 'Anna',
      audio: 'true',
      video: 'true',
      followers: '15',
      online: '1',
      type: 'skin',
      tag: 'happy',
    },
    {
      avatar: 'assets/images/avatar-default.jpg',
      name: 'Anna',
      audio: 'true',
      video: 'true',
      followers: '15',
      online: '1',
      type: 'skin',
      tag: 'happy',
    }
  ]
  }
  getListPanda() {
    this.firebaseService.getAllRef('users').then((res) => {

    }).catch(err => {
      
    })
  }

}
