import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  loadGeneralAvailbility = new Subject<boolean>();
  fullLoading = new BehaviorSubject<boolean>(false);
  userInfo = new BehaviorSubject<any>(null);
  dataFilter = new BehaviorSubject<any>(null);
  userOnlineStatus = new BehaviorSubject<any>(null);
  checkAllLoad = new BehaviorSubject<boolean>(null);
  constructor() { }
}
