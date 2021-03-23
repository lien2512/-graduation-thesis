import { Injectable } from '@angular/core';
import firebase from 'firebase';
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor() {}
  createUserInfo(uid, data) {
    return firebase.firestore().collection('users').doc(uid).set(data);
  }
  getUser() {
    return firebase.firestore().collection('users').get();
  }
  login() {

  }
  updateRef(req, id, body) {
    return firebase.database().ref(`/${req}/${id}`).update(body)
  }

}
