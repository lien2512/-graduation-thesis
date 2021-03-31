import { Injectable } from '@angular/core';
import firebase from 'firebase';
import * as valuesLd from 'lodash/values';
import { Account } from '../class/account';
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
  getRefById(ref, id) {
    return new Promise((resolve, reject) => {
      firebase.database().ref('/' + ref + '/' + id).once('value').then((snapshot) => {
        const detail = snapshot.val();
        resolve(detail);
      });
    });
  }

  async getRefById2(ref, id) {

    let snapshot = await firebase.database().ref('/' + ref + '/' + id).once('value');
    return snapshot.val()
  }
  getAllRef(ref) {
    return new Promise((resolve, reject) => {
      firebase.database().ref('/' + ref).on('value', (snapshot) => {
        const detail = valuesLd(snapshot.val());
        resolve(detail);
      });
    });
  }
  uploadLogo(logo, path) {
    const name = new Date().getTime();
    const ref = firebase.storage().ref(path + name);
    const uploadTask = ref.putString(logo.split(',')[1], 'base64');
    return new Promise((resolve, reject) => {
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (taskSnapshot) => {
        console.log(taskSnapshot);
      }, err => {
        console.log(err);
        reject(err);
      }, async () => {
        const logoUrl = await uploadTask.snapshot.ref.getDownloadURL();
        resolve(logoUrl);
      });
    });
  }
  updateLogo(collection, doc, logoUrl) {
    // return this.updateRef(collection, doc, { account : {logo: logoUrl} });
    return this.updateRef(collection, doc, {logo: logoUrl} );

  }
  updateUserInfo(user: any) {
    const userUpdateData = {
      displayName: user.displayName,
      uid: user.uid,
    id: user.id,
    role: user.role,
    gender: user.gender,
    birthday: user.birthday,
    email: user.email,
      lastupdate: firebase.firestore.Timestamp.fromDate(new Date())
    };
    return this.updateRef('users', user.uid, userUpdateData);
  }
  searchRef(ref, name, q) {
    return new Promise((resolve, reject) => {
      firebase.database().ref('/' + ref).on('value', (snapshot) => {
        let detail = valuesLd(snapshot.val());
        detail = detail.filter(d => d[name].toLowerCase().includes(q.toLowerCase()));
        resolve(detail);
      });
    });
  }
  getBee(uId) {
    return new Promise((resolve, reject) => {
      firebase.database().ref('users/').orderByChild('uId').equalTo(uId).on('value', (snapshot) => {
        const clients = valuesLd(snapshot.val());
        resolve(clients);
      });
    });
  }

}
