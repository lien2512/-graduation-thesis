import { isNgTemplate } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { async } from '@angular/core/testing';
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
  createCall(uid, data) {
    return firebase.firestore().collection('call').doc(uid).set(data);
    // return firebase.database().ref('call/' + uid).set(data);
  }
  getUser() {
    return firebase.firestore().collection('users').get();
  }
  login() {

  }
  updateRef(req, id, body) {
    return firebase.firestore().collection(req).doc(id).update(body);
    // return firebase.database().ref(`/${req}/${id}`).update(body)
  }
  getRefById(ref, id) {
    return new Promise((resolve, reject) => {

      firebase.firestore().collection(ref).doc(id).get().then((snapshot) => {
        const detail = snapshot.data();
        resolve(detail);
      });
    });
    // return firebase.firestore().collection(ref).doc(id).get();
  }
   getBeeByStatus(attribute, status) {
    let listBee = [];
    return new Promise((resolve, reject) => {
      firebase.firestore().collection("users").where("role", "==", "bee").where(attribute, "==", status).get().then((snapshot) => {
        snapshot.forEach((doc) => {
          listBee.push(doc.data())
        })
        resolve(listBee);
      })
    })
 }
 getBeeByService(attribute, status) {
  let listBee = [];
  return new Promise((resolve, reject) => {
    firebase.firestore().collection("users")
    .where(attribute, "array-contains",status).get().then((snapshot) => {
      snapshot.forEach((doc) => {
        listBee.push(doc.data())
      })
      resolve(listBee);
    })
  })
}
getRecomnendBee() {
  let listBee = [];
  return new Promise((resolve, reject) => {
    firebase.firestore().collection('users').orderBy('follow_count').limit(10).get().then((snapshot) => {
      snapshot.forEach((doc) => {
        listBee.push(doc.data())
      })
      resolve(listBee);
    })
  })
}
 getListAcc(document) {
   let listBee = []
  return new Promise((resolve, reject) => {
    firebase.firestore().collection("users")
    .where("role", "==", "bee").get().then((snapshot) => {
      snapshot.forEach((doc) => {
        listBee.push(doc.data())
      })
      resolve(listBee);
    })
  })
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
    // return this.updateRef(collection, doc, 'logo': logoUrl );
    firebase.firestore().collection('users').doc(doc).update('logo', logoUrl)

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
  updateStatus(status, userId) {
    const updates = {};
    updates[`users/${userId}/account/status`] = status;
    return firebase.database().ref().update(updates);
  }

}
