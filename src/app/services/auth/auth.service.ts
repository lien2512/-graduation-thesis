import { Injectable } from '@angular/core';
import firebase from 'firebase'
import { FirebaseService } from '../firebase.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private firebaseService: FirebaseService
  ) { }
  async signup(req) {
    debugger
    return new Promise(async (resolve, reject) => {
      try {
        const res = await firebase.auth().createUserWithEmailAndPassword(req.email, req.password);
        resolve(res);
      } catch (error) {
        reject(error);
      }
    });
  }
  login(req) {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await firebase.auth().signInWithEmailAndPassword(req.email, req.password);
          const uId = res.user.uid;
          this.firebaseService.updateRef('user', uId, { lastJoin: firebase.firestore.Timestamp.fromDate(new Date())});
          resolve(res);
        }
        catch(error) {
          reject(error)
        }
      })
  }
  logOut(): Promise<any> {
    return new Promise((resolve, reject) => {
      firebase.auth().signOut().then(res => {
        resolve(res);
      }).catch(error => {
        reject(error)
      })
    })
  }
  getCurrentUser() {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          resolve(user);
        } else {
          reject('No user logged in');
        }
      });
    });
    // firebase.auth().onAuthStateChanged().;
  }
}
