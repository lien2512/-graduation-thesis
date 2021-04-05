import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import firebase from 'firebase';
// import * as firebase from 'firebase/app';
import { tap, map, switchMap, first } from 'rxjs/operators';
import { of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PresenceService {
//   uid: any;
//   userStatusDatabaseRef;
//   constructor() {
//     this.onUserStatusChanged();
//     console.log(firebase.auth().currentUser);
//     this.getUid();
//   }
//   getUid() {
//     firebase.auth().onAuthStateChanged(function(user) {
//       if (user) {
//         // User is signed in.
//         this.uid = user.uid;
//         this.userStatusDatabaseRef = firebase.database().ref('/status/' + this.uid);
//         console.log(this.uid);
//       } else {
//       }
//     });
//   }
//  isOfflineForDatabase = {
//     state: 'offline',
//     last_changed: firebase.database.ServerValue.TIMESTAMP,
// };

//  isOnlineForDatabase = {
//     state: 'online',
//     last_changed: firebase.database.ServerValue.TIMESTAMP,
// };

// onUserStatusChanged() {
//     firebase.database().ref('.info/connected').on('value', function(snapshot) {
//     if (snapshot.val() == false) {
//         return;
//     };

//     this.userStatusDatabaseRef.onDisconnect().set(this.isOfflineForDatabase).then(function() {
//         this.userStatusDatabaseRef.set(this.isOnlineForDatabase);
//     });
// });
// }

  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase) {
    console.log('presence');
    this.updateOnUser().subscribe();
    this.updateOnDisconnect().subscribe();
    this.updateOnAway();
  }

  getPresence(uid: string) {
    return this.db.object(`status/${uid}`).valueChanges();
  }

  getUser() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }


  async setPresence(status: string) {
    const user = await this.getUser();
    if (user) {
      return this.db.object(`status/${user.uid}`).update({ status, timestamp: this.timestamp });
    }
  }

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  updateOnUser() {
      const connection = this.db.object('.info/connected').valueChanges().pipe(
        map(connected => connected ? 'online' : 'offline')
      );

      return this.afAuth.authState.pipe(
        switchMap(user =>  user ? connection : of('offline')),
        tap(status => this.setPresence(status))
      );
  }


  updateOnAway() {
    document.onvisibilitychange = (e) => {

      if (document.visibilityState === 'hidden') {
        this.setPresence('away');
      } else {
        this.setPresence('online');
      }
    };
  }
  updateOnDisconnect() {
    return this.afAuth.authState.pipe(
      tap(user => {
        if (user) {
          this.db.object(`status/${user.uid}`).query.ref.onDisconnect()
            .update({
              status: 'offline',
              timestamp: this.timestamp
          });
        }
      })
  );

  }

}
