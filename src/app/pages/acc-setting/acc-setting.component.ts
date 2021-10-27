import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular';
import firebase from 'firebase';
import moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Account } from 'src/app/class/account';
import { OrdersComponent } from 'src/app/component/orders/orders.component';
import { PopUpConfirmComponent } from 'src/app/component/pop-up-confirm/pop-up-confirm.component';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HelperService } from 'src/app/services/helper.service';
import { PresenceService } from 'src/app/services/presence.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-acc-setting',
  templateUrl: './acc-setting.component.html',
  styleUrls: ['./acc-setting.component.scss'],
})
export class AccSettingComponent implements OnInit {
  mainTab = 'account';
  calendar = null;
  currentTimezone: string;
  public formChangePassword: FormGroup;
  croppedImage: any = 'assets/images/default-image.png';
  public isRemoveLogo = false;
  loading: boolean;
  private currentUser: Account;
  public fileData: File = null;
  resultFavorite: any;
  sameCurrentPass: boolean;
  public imageUrl: any;
  uploadGif: boolean = false;
  imageChangedEvent: any = '';
  listBlock: [];
  availableTime = [];
  avatarDefault: string = '';
  showAvailability: any;
  calendarEvent = [];
  favoriteSettings: any = {
    search: '',
    favoriteType: 'visitor',
    paginate: {
      id: 'fan',
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
    },
  };
  blockListSetting: any = {
    search: '',
    paginate: {
      id: 'block',
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
    },
  };
  previewAvatar: any = [];
  email: '';
  isShowEmail: '';
  userProfile = {
    uid: '',
    id: '',
    displayName: '',
    role: '',
    bio: '',
    city: '',
    gender: '',
    birthday: '',
    email: '',
    emailVerified: false,
    avatar: '',
    logo: '',
    advise: [],
    review: [],
    follow: [],
    follower: [],
  };
  listFavorite: any;
  listAvatarDefault = [
    {
      id: '1',
      fullsrc:
        'https://api.sparklepandas.uat4.pgtest.co/' +
        'images/avatar/avatar_01.jpg',
      src: 'images/avatar/avatar_01.jpg',
      selected: false,
    },
    {
      id: '2',
      fullsrc:
        'https://api.sparklepandas.uat4.pgtest.co/' +
        'images/avatar/avatar_02.jpg',
      src: 'images/avatar/avatar_02.jpg',
      selected: false,
    },
    {
      id: '3',
      fullsrc:
        'https://api.sparklepandas.uat4.pgtest.co/' +
        'images/avatar/avatar_03.jpg',
      src: 'images/avatar/avatar_03.jpg',
      selected: false,
    },
    {
      id: '4',
      fullsrc:
        'https://api.sparklepandas.uat4.pgtest.co/' +
        'images/avatar/avatar_04.jpg',
      src: 'images/avatar/avatar_04.jpg',
      selected: false,
    },
  ];
  resultBlock: any;
  isShowPassOld = false;
  isShowPassNew = false;
  isShowPassNewRe = false;
  disableCalendarBtn: boolean = true;
  showMeeting: any;
  today = new Date();
  calendarLoaded = false;
  modalChooseAvatar: BsModalRef;
  modalCropImage: BsModalRef;
  maxUploadSize: number = 2000000; //max upload file size 2Mb
  presence$: any;
  @ViewChild('templateChooseAvatar') templateChooseAvatar: TemplateRef<any>;
  @ViewChild('templateUserCropImage') cropImageModal: TemplateRef<any>;
  @ViewChild('image', { static: false }) image: ElementRef;
  @ViewChild('fullcalendarPandaProfileSetting')
  fullcalendar: FullCalendarComponent;
  @ViewChild('UserOrder') UserOrders: OrdersComponent;
  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private modalService: BsModalService,
    private helperService: HelperService,
    private presence: PresenceService,
    private router: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    this.initForm();
  }

  async ngOnInit() {
    await this.getData();
    const timeZone = moment.tz.guess();
    this.currentTimezone = timeZone;
    this.activatedRoute.queryParams.subscribe((res) => {
      this.mainTab = res.tab;
    });
  }
  selectTab(type) {
    this.mainTab = type;
    this.router.navigate([], { queryParams: { tab: type } });
    switch (type) {
      case 'block':
        this.getListBlock();
        break;
      case 'myOrder':
        this.UserOrders.generateCalendar();
        break;
      case 'calendar':
        this.getAvailableTime();
        break;
    }
  }
  initForm() {
    this.formChangePassword = this.fb.group(
      {
        oldPassword: ['', [Validators.required, Validators.minLength(8)]],
        newPassword: ['', Validators.required],
        newRePassword: ['', Validators.required],
      },
      {
        validator: [
          this.checkConfirmPassword,
          this.checkSamePassword,
          this.validatePassword,
        ],
      }
    );
  }
  checkConfirmPassword(group: FormGroup) {
    const newPassword = group.get('newPassword').value;
    const newRePassword = group.get('newRePassword').value;

    return newPassword === newRePassword
      ? true
      : { invalidConfirmPassword: true };
  }

  checkSamePassword(group: FormGroup) {
    const newPassword = group.get('newPassword').value;
    const oldPassword = group.get('oldPassword').value;

    return newPassword != oldPassword ? true : { invalidSamePassword: true };
  }
  validatePassword(group: FormGroup) {
    const password = group.get('newPassword').value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    const validPass = regex.test(password);
    if (validPass) {
      return true;
    } else {
      return { invalidPassword: true };
    }
  }
  showPassword(id) {
    var typeInput = <HTMLInputElement>document.getElementById(id);
    if (id == 'oldPassword') {
      this.isShowPassOld = !this.isShowPassOld;
    }
    if (id == 'newPassword') {
      this.isShowPassNew = !this.isShowPassNew;
    }
    if (id == 'newRePassword') {
      this.isShowPassNewRe = !this.isShowPassNewRe;
    }
    if (typeInput.type === 'password') {
      typeInput.type = 'text';
    } else {
      typeInput.type = 'password';
    }
  }
  async getData() {
    this.currentUser = await this.authService.getCurrentUser();
    const doc = await firebase
      .firestore()
      .collection('users')
      .doc(this.currentUser.uid)
      .get();
    const res = doc.data();
    console.log(res);
    this.userProfile.id = res.id;
    this.userProfile.logo = res.logo;
    this.userProfile.email = res.email;
    this.userProfile.displayName = res.displayName;
    this.userProfile.bio = res.bio ? res.bio : '';
    this.userProfile.gender = res.gender;
    this.userProfile.birthday = moment(res.birthday).format('DD-MM-YYYY');
    this.userProfile.follow = res.follow;
    this.userProfile.follower = res.follower;

    // this.userProfile.birthday = res.birthday;
  }
  async updateBeeProfile() {
    this.firebaseService
      .updateRef('users', this.userProfile.uid, this.userProfile)
      .then((res) => {})
      .catch((err) => {});
  }
  initTabAccount() {}
  popupChooseAvatarDefault() {
    this.modalChooseAvatar = this.modalService.show(this.templateChooseAvatar, {
      class: 'modal-dialog-centered modal-dialog modal-lg modal-default',
      ignoreBackdropClick: true,
    });
  }
  showEmail(type) {}
  getAvailableTime() {
    this.mainTab = 'calendar';
    // this.router.navigate([], {
    //   queryParams: {tab: 'calendar'},
    // });
    if (!this.calendarLoaded) {
      setTimeout(() => {
        this.calendar = {
          // plugins: [interactionPlugin, timeGridPlugin],
          initialView: 'timeGridWeek',
          displayEventTime: false,
          slotDuration: '00:15',
          events: [],
          allDaySlot: false,
          eventOverlap: false,
          slotEventOverlap: false,
          eventDidMount: (info) => {
            var node = document.createElement('i');
            node.className = 'fa fa-trash-o icon-event-delete';
            node.setAttribute('aria-hidden', 'true');
            node.setAttribute(
              'style',
              'position: absolute; z-index: 9; top: 5px; bottom: 5px; right: 5px; color: #fff; cursor: pointer'
            );
            info.el.appendChild(node);

            node.onclick = (e) => {
              if (confirm('Bạn chắc chắn muốn xoá nó')) {
                this.calendarEvent.forEach((el, k) => {
                  if (el.id == info.event.id) {
                    this.calendarEvent.splice(k, 1);
                  }
                });
                info.event.remove();
                this.calendar.events = this.calendarEvent;
                if (this.calendar.events.length) {
                  this.disableCalendarBtn = false;
                } else {
                  this.disableCalendarBtn = true;
                }
              }
            };
          },
          dateClick: this.handleClickEvent.bind(this),
          select: this.handleSelect.bind(this),
          eventChange: this.handleUpdateEvent.bind(this),
          customButtons: {
            prev: {
              text: '<',
              click: () => {
                this.goPrev(true);
              },
            },
            next: {
              text: '>',
              click: () => {
                this.goNext();
              },
            },
            today: {
              text: 'Ngày hôm nay',
              click: () => {
                this.calendar.events = [];
                const calendarApi = this.fullcalendar.getApi();
                calendarApi.today();
                this._loadAvailableTime();
              },
            },
          },
          headerToolbar: {
            left: 'title',
            center: '',
            right: 'prev next today',
          },
          defaultView: 'agendaDay',
          selectable: true,
          validRange: {
            start: moment().format('YYYY-MM-DD'),
          },
          stickyHeaderDates: true,
        };
      }, 0);

      this.calendarLoaded = true;
    }

    // Load available time
    this._loadAvailableTime();
  }
  goPrev(callback = false) {
    this.calendar.events = [];
    const calendarApi = this.fullcalendar.getApi();
    if (callback) {
      calendarApi.prev(); // call a method on the Calendar object
    }
    this._loadAvailableTime();
  }

  goNext() {
    const calendarApi = this.fullcalendar.getApi();
    calendarApi.next(); // call a method on the Calendar object
    this._loadAvailableTime();
  }
  handleUpdateEvent(event) {
    this.handleSelect(event.event);
  }
  handleSelect(event) {
    this.disableCalendarBtn = false;
    this.calendar.events = [];
    if (this.calendarEvent.length > 0) {
      let pushEvent = true;
      let checkDuplicateEvent = false;
      let sameEventId = -1;
      const eventStartTime = moment(event.start).format('X');
      const eventEndTime = moment(event.end).format('X');
      const eventStartDate = moment(event.start).format('DD');
      for (let index = 0; index < this.calendarEvent.length; index++) {
        const elementStartTime = moment(this.calendarEvent[index].start).format(
          'X'
        );
        const elementEndTime = moment(this.calendarEvent[index].end).format(
          'X'
        );
        const elementStartDate = moment(this.calendarEvent[index].start).format(
          'DD'
        );
        if (
          eventStartTime >= elementStartTime &&
          eventStartTime < elementEndTime
        ) {
          if (eventStartDate == elementStartDate) {
            if (sameEventId != -1) {
              this.calendarEvent[sameEventId].start = moment(
                this.calendarEvent[index].start
              ).format('YYYY-MM-DD HH:mm:ss');
              this.calendarEvent.splice(index, 1);
              index--;
            } else {
              this.calendarEvent[index].end = moment(event.end).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              sameEventId = index;
            }
          }
          checkDuplicateEvent = true;
          pushEvent = false;
        } else if (eventStartTime == elementEndTime) {
          if (sameEventId != -1) {
            this.calendarEvent[sameEventId].start = moment(
              this.calendarEvent[index].start
            ).format('YYYY-MM-DD HH:mm:ss');
            this.calendarEvent.splice(index, 1);
            index--;
            continue;
          }
          if (
            eventStartTime == elementStartTime &&
            eventEndTime < elementEndTime
          ) {
            this.calendarEvent[index].end = moment(event.end).format(
              'YYYY-MM-DD HH:mm:ss'
            );
            pushEvent = false;
          }
          if (
            eventEndTime > elementEndTime &&
            eventStartDate == elementStartDate
          ) {
            if (sameEventId != -1) {
              this.calendarEvent[sameEventId].start = moment(
                this.calendarEvent[index].start
              ).format('YYYY-MM-DD HH:mm:ss');
              this.calendarEvent.splice(index, 1);
              index--;
            } else {
              this.calendarEvent[index].end = moment(event.end).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              sameEventId = index;
            }
          }
          checkDuplicateEvent = true;
          pushEvent = false;
        } else if (eventStartTime < elementStartTime) {
          if (eventEndTime > elementEndTime) {
            if (checkDuplicateEvent == false) {
              this.calendarEvent[index].end = moment(event.end).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              this.calendarEvent[index].start = moment(event.start).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              checkDuplicateEvent = true;
              pushEvent = false;
            } else {
              this.calendarEvent.splice(index, 1);
              index--;
            }
            sameEventId = index;
          }
          if (
            eventEndTime >= elementStartTime &&
            eventEndTime <= elementEndTime
          ) {
            if (sameEventId == -1) {
              this.calendarEvent[index].start = moment(event.start).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              sameEventId = index;
              pushEvent = false;
              checkDuplicateEvent = true;
            } else {
              this.calendarEvent[sameEventId].end = moment(
                this.calendarEvent[index].end
              ).format('YYYY-MM-DD HH:mm:ss');
              this.calendarEvent.splice(index, 1);
              index--;
            }
          }
        }
      }
      if (pushEvent == true) {
        this.calendarEvent.push({
          start: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
          end: moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
          allDay: false,
          backgroundColor: '#B953BF',
          id: uuid.v4(),
          editable: true,
        });
      }
    } else {
      this.calendarEvent.push({
        start: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
        end: moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
        allDay: false,
        backgroundColor: '#B953BF',
        id: uuid.v4(),
        editable: true,
      });
    }

    setTimeout(() => {
      this._generateCalendar();
    });
  }
  _generateCalendar() {
    const _events = this.calendarEvent;
    this.calendarEvent = [];
    _events.forEach((element) => {
      const dayStart = Number(moment(element.start).format('e'));
      const dayEnd = Number(moment(element.end).format('e'));
      if (
        dayStart != dayEnd ||
        (moment(element.start).format('DD') !=
          moment(element.end).format('DD') &&
          dayStart == dayEnd)
      ) {
        const _start = moment(element.start).format('YYYY-MM-DD');
        const _end = moment(element.end).format('YYYY-MM-DD');
        const dayDiff = Number(moment(_end).diff(moment(_start), 'days'));
        this.calendarEvent.push({
          start: moment(element.start).format('YYYY-MM-DD HH:mm:ss'),
          end: moment(element.start)
            .add(1, 'days')
            .format('YYYY-MM-DD 00:00:00'),
          allDay: false,
          backgroundColor: '#B953BF',
          id: uuid.v4(),
          editable: true,
        });

        if (dayDiff == 1) {
          const _startTime = moment(element.start)
            .add(1, 'days')
            .format('YYYY-MM-DD 00:00:00');
          const _endTime = moment(element.end).format('YYYY-MM-DD HH:mm:ss');

          if (_startTime != _endTime) {
            this.calendarEvent.push({
              start: _startTime,
              end: _endTime,
              allDay: false,
              backgroundColor: '#B953BF',
              id: uuid.v4(),
              editable: true,
            });
          }
        } else {
          for (let i = 1; i <= dayDiff; i++) {
            let _endTime = moment(element.start)
              .add(i + 1, 'days')
              .format('YYYY-MM-DD 00:00:00');
            const _startTime = moment(element.start)
              .add(i, 'days')
              .format('YYYY-MM-DD 00:00:00');
            if (i == dayDiff) {
              _endTime = moment(element.end).format('YYYY-MM-DD HH:mm:ss');
            }

            if (_startTime != _endTime) {
              this.calendarEvent.push({
                start: _startTime,
                end: _endTime,
                allDay: false,
                backgroundColor: '#B953BF',
                id: uuid.v4(),
                editable: true,
              });
            }
          }
        }
      } else {
        this.calendarEvent.push({
          start: moment(element.start).format('YYYY-MM-DD HH:mm:ss'),
          end: moment(element.end).format('YYYY-MM-DD HH:mm:ss'),
          allDay: false,
          backgroundColor: '#B953BF',
          id: uuid.v4(),
          editable: true,
        });
      }
    });

    setTimeout(() => {
      this._generateCalendarTitle(() => {
        this.calendar.events = this.calendarEvent;
        this.disableCalendarBtn = false;
      });
    }, 0);
  }
  async _loadAvailableTime() {
    const dataPRofile: any = await this.firebaseService.getRefById(
      'users',
      this.userProfile.id
    );
    this.helperService.showFullLoading();
    setTimeout(() => {
      this.calendar.events = [];
      this.calendarEvent = [];
      const calendarApi = this.fullcalendar.getApi();
      const currentRange = JSON.parse(
        JSON.stringify(calendarApi.getCurrentData().dateProfile.currentRange)
      );
      const startDate = moment(
        moment(
          calendarApi.getCurrentData().dateProfile.currentRange.start
        ).format('YYYY-MM-DD 00:00:00')
      )
        .utc()
        .format('YYYY-MM-DD HH:mm');
      const endDate = moment(
        moment(
          calendarApi.getCurrentData().dateProfile.currentRange.end
        ).format('YYYY-MM-DD 00:00:00')
      )
        .utc()
        .format('YYYY-MM-DD HH:mm');
      const calendarStartDate = currentRange.start;
      const calendarEndDate = currentRange.end;
      const weekNumber =
        moment(calendarStartDate).format('YYYY') +
        moment(calendarEndDate).isoWeek();
      let calendar = dataPRofile.calendar;
      // this.apiService.getAvailableTime(startDate, endDate, weekNumber).subscribe((response: any) => {
      //   if (response.code == 200) {
      const availableRange = calendar.available_time1;
      const availableRangeOrigin = JSON.parse(
        JSON.stringify(calendar.available_time1)
      );

      let _finalEvents = [];
      const _currentWeek = moment(
        calendarApi.getCurrentData().dateProfile.currentRange.start
      ).week();
      const _currentYear = moment(
        calendarApi.getCurrentData().dateProfile.currentRange.end
      ).year();

      availableRange.forEach((available) => {
        if (available.type == 1) {
          const _dowS = Number(moment(available.start_time).format('e'));
          const _dowE = Number(moment(available.end_time).format('e'));
          available.start_time = moment(String(_currentYear))
            .week(_currentWeek)
            .weekday(_dowS)
            .format(
              'YYYY-MM-DD ' + moment(available.start_time).format('HH:mm')
            );
          available.end_time = moment(String(_currentYear))
            .week(_currentWeek)
            .weekday(_dowE)
            .format('YYYY-MM-DD ' + moment(available.end_time).format('HH:mm'));

          if (available.start_time > available.end_time) {
            available.start_time = moment(available.start_time)
              .subtract(1, 'week')
              .format('YYYY-MM-DD HH:mm');
          }
        }
      });

      let _rmEls = [];
      availableRange.forEach((el) => {
        const _yS = moment.utc(el.start_time).local().format('YYYY-MM-DD');
        const _yE = moment.utc(el.end_time).local().format('YYYY-MM-DD');

        availableRangeOrigin.forEach((elOrigin, index1) => {
          if (el.id != elOrigin.id) {
            if (
              _yS == _yE &&
              el.start_time != elOrigin.start_time &&
              el.end_time == elOrigin.start_time
            ) {
              el.end_time = elOrigin.end_time;
              availableRange.splice(index1, 1);
            } else if (
              el.start_time <= elOrigin.start_time &&
              el.end_time >= elOrigin.end_time
            ) {
              _rmEls.push(
                availableRange.filter((_el) => _el.id == elOrigin.id)[0].id
              );
            }
          }
        });
      });

      availableRange.forEach((available) => {
        if (!_rmEls.includes(available.id)) {
          let _sT = moment
            .utc(available.start_time)
            .local()
            .format('YYYY-MM-DD HH:mm');
          let _eT = moment
            .utc(available.end_time)
            .local()
            .format('YYYY-MM-DD HH:mm');

          if (_sT > moment(calendarEndDate).format('YYYY-MM-DD HH:mm')) {
            _sT = moment(_sT).subtract(1, 'week').format('YYYY-MM-DD HH:mm');
            _eT = moment(_eT).subtract(1, 'week').format('YYYY-MM-DD HH:mm');
          } else if (
            _eT < moment(calendarStartDate).format('YYYY-MM-DD HH:mm')
          ) {
            _sT = moment(_sT).add(1, 'week').format('YYYY-MM-DD HH:mm');
            _eT = moment(_eT).add(1, 'week').format('YYYY-MM-DD HH:mm');
          }

          _finalEvents.push({
            start: _sT,
            end: _eT,
            backgroundColor: '#B953BF',
            allDay: false,
            id: available.id,
            editable: true,
          });
        }
      });

      let rmId = [];
      const _finalEventsOrigin = JSON.parse(JSON.stringify(_finalEvents));
      _finalEvents.forEach((el) => {
        if (
          moment(el.start).format('YYYY-MM-DD') ==
          moment(el.end).format('YYYY-MM-DD')
        ) {
          _finalEventsOrigin.forEach((subEl, index) => {
            if (
              el.start != subEl.start &&
              el.end >= subEl.start &&
              el.start <= subEl.start
            ) {
              el.end = subEl.end;
              rmId.push(subEl.id);
              //_finalEventsOrigin.splice(index, 1);
            }
          });
        }
        _finalEventsOrigin.forEach((subEl) => {
          if (el.start < subEl.start && el.end > subEl.end) {
            rmId.push(subEl.id);
          }
        });
      });

      rmId.forEach((id) => {
        let index = _finalEvents.findIndex((d) => d.id === id);
        if (index >= 0) _finalEvents.splice(index, 1);
      });

      this.calendarEvent = _finalEvents;
      this._generateCalendarTitle(() => {
        this.calendar.events = this.calendarEvent;
        this.helperService.hideFullLoading();
      });
      //   }
      // }, err => {
      //   this.helperService.hideFullLoading();
      // });
    }, 0);
  }
  _generateCalendarTitle(next) {
    this.calendarEvent.map((evt) => {
      let _title;
      if (
        (moment(evt.start).format('DD') != moment(evt.end).format('DD') &&
          moment(evt.start).format('HH:mm') == '00:00') ||
        (moment(evt.start).format('HH:mm') == '00:00' &&
          moment(evt.end).format('HH') == '23')
      ) {
        _title = 'Cả ngày';
      } else {
        let _st = moment(evt.start).format('HH:mm');
        _title = _st + ' - ' + moment(evt.end).format('HH:mm');
      }
      evt.title = _title;
      return evt;
    });

    setTimeout(() => {
      if (next) {
        next();
      }
    }, 0);
  }
  async saveUserProfile() {
    this.userProfile.birthday = moment(
      this.userProfile.birthday,
      'DD/MM/YYYY'
    ).format('YYYY-MM-DD');
    console.log(this.userProfile.logo);
    let status = true;

    if (!this.userProfile.gender) {
      status = false;
    }
    if (!this.userProfile.birthday) {
      status = false;
    }
    if (status == false) {
      alert('Nhập đầy đủ thông tin');
    } else {
      if (this.fileData) {
        debugger;
        const avtUrl = await this.firebaseService.uploadLogo(
          this.userProfile.logo,
          'userAvt/'
        );
        firebase
          .firestore()
          .collection('users')
          .doc(this.userProfile.id)
          .update('logo', avtUrl);
        // this.firebaseService.updateLogo('users', this.userProfile.id, avtUrl );
        this.userProfile.logo = String(avtUrl);
      } else if (this.isRemoveLogo) {
        this.firebaseService.updateLogo('users', this.userProfile.id, '');
        this.isRemoveLogo = false;
      }
      let advise = {
        title: 'Tip dưỡng da',
        content:
          'Chăm sóc cho da nhạy cảm, với những kinh nghiệm từ chính bản thân mình',
      };
      this.userProfile.advise.push(advise);
      let review = {
        logo: '',
        idUser: 'DagOskGsz4bmgBmJJZJRF4SULQZ2',
        name: 'liennt1401@yopmail.com',
        reviewScore: 4,
        contentReview: 'Cực kỳ nhiệt tình và thân thiện',
      };
      this.userProfile.review.push(review);
      console.log(this.userProfile.review);
      this.firebaseService.updateRef(
        'users',
        this.userProfile.id,
        this.userProfile
      );
      alert('thành công rồi');
      this.userProfile.birthday = moment(this.userProfile.birthday).format(
        'DD-MM-YYYY'
      );
    }
  }
  handleClickEvent(e) {
    const isMobile = false;
    if (isMobile) {
      let event = {
        start: null,
        end: null,
      };
      event.start = moment(e.date);
      event.end = moment(e.date).add(15, 'minutes');
    }
  }
  clearCalendar() {
    this.disableCalendarBtn = false;
    this.calendarEvent = [];
    this.calendar.events = [];
  }
  async updateAvailableTime() {
    this.loading = true;
    this.availableTime = [];
    this.calendarEvent.forEach((element) => {
      this.availableTime.push({
        start_time: moment
          .utc(moment(element.start))
          .format('YYYY-MM-DD HH:mm'),
        end_time: moment.utc(moment(element.end)).format('YYYY-MM-DD HH:mm'),
      });
    });

    const calendarApi = this.fullcalendar.getApi();
    const weekNumber =
      moment().format('YYYY') +
      moment(
        calendarApi.getCurrentData().dateProfile.currentRange.start
      ).week();
    console.log(this.availableTime);
    let timer = [];
    this.availableTime.forEach((item) => {
      let a = moment(item.end_time);
      let b = moment(item.start_time);
      var duration = moment.duration(a.diff(b));
      var hours = duration.asMinutes() / 15;
      var start = moment(item.start_time);
      for (let i = 0; i < hours; i++) {
        moment(start, 'YYYY-MM-DD HH:mm')
          .add(15, 'minutes')
          .format('YYYY-MM-DD HH:mm');
        let end = moment(start, 'YYYY-MM-DD HH:mm').add(15, 'minutes');
        let duration = {
          start_time: moment.utc(moment(start)).format('YYYY-MM-DD HH:mm'),
          end_time: moment.utc(end).format('YYYY-MM-DD HH:mm'),
        };
        timer.push(duration);
        start = end;
      }
    });
    console.log(timer);
    let data: any = await this.firebaseService.getRefById(
      'users',
      this.userProfile.id
    );
    let calendar = data.calendar;
    this.availableTime.forEach((item) => {
      item.id = new Date(item.start_time).getTime();
      item.type = 0;
    });
    calendar.available_time1 = this.availableTime;
    calendar.available_time2 = timer;
    console.log(calendar);
    firebase
      .firestore()
      .collection('users')
      .doc(this.userProfile.id)
      .update('calendar', calendar);

    // this.apiService.setAvailableTime({ timer: this.availableTime, tz: this.currentTimezone, weekNumber: weekNumber, show_availability: this.showAvailability }).subscribe((response: any) => {
    //   if (response.code == STATUS_CODE.SUCCESS) {
    //     this.helperService.showSuccess(this.transService.instant('MESSAGE.SUCCESS'), this.transService.instant('MESSAGE.SAVED_AVAILABLE'));
    //     this.loading = false;
    //   }
    // }, (err) => {
    //   this.helperService.showError('err', 'Đã xảy ra lỗi');
    // });
  }
  initTabFavorite() {}
  searchPandas() {}
  favoriteTypeChange(type) {}
  unInteractivePanda(item) {}
  navigateToPandaProfile(name, id) {}
  async getListBlock() {
    let res: any = await this.firebaseService.getRefById(
      'users',
      this.userProfile.id
    );
    this.listBlock = res.listBock;
  }
  searchAccBlocked() {}
  async unBlockPanda(item) {
    firebase
      .firestore()
      .collection('users')
      .doc(this.userProfile.id)
      .update({
        listBock: firebase.firestore.FieldValue.arrayRemove(item),
      });
    let beeInfo: any = await this.firebaseService.getRefById('users', item.id);
    let userInfo = beeInfo.blockedBy.find((item) => {
      return item.id == this.userProfile.id;
    });
    firebase
      .firestore()
      .collection('users')
      .doc(item.id)
      .update({
        blockedBy: firebase.firestore.FieldValue.arrayRemove(userInfo),
      });
    // let index = this.listBlock.findIndex((item: any) => {
    //   item.id == id
    // })
    // this.listBlock.splice(index, 1);
    // firebase.firestore().collection('users').doc(this.userProfile.id).update('listBock', this.listBlock);
    // let res: any = await this.firebaseService.getRefById('users', id);
    // let listBlocked = res.blockedBy;
    // let userBlock = listBlocked.findIndex((item: any) => {
    //   item.id == this.userProfile.id
    // })
    // listBlocked.splice(userBlock, 1);
    // firebase.firestore().collection('users').doc(id).update('blockedBy', listBlocked);

    this.getListBlock();
  }
  listBlockChange(type) {}
  initTabChangePassword() {}
  changePassword() {}
  initTabChangeOrder() {}
  toggleAvailableTime(event) {
    if (this.showAvailability) {
      this.calendar.selectable = true;
    } else {
      this.calendar.selectable = false;
    }
  }
  openChatBox(item) {}
  favoritePageChange(event) {}
  changeInputCurrentPass() {}
  closeChooseAvatar() {
    this.modalChooseAvatar.hide();
  }
  chooseAvatar(e) {
    this.previewAvatar = [];
    this.userProfile.avatar = e.target.files;
    for (let i = 0; i < this.userProfile.avatar.length; i++) {
      this.previewImage(this.userProfile.avatar[i], () => {
        if (!this.uploadGif) {
          const _originAvatar =
            this.previewAvatar[0].origin !== undefined &&
            this.previewAvatar[0].origin
              ? this.previewAvatar[0].origin
              : this.previewAvatar[0].url;
          this.previewAvatar = [{ url: e, size: null, origin: _originAvatar }];
          this.avatarDefault = '';
          this.fileChangeEvent(e);
          // Open crop modal
          this.modalCropImage = this.modalService.show(this.cropImageModal, {
            class: 'modal-dialog-centered modal-dialog modal-lg modal-default',
            ignoreBackdropClick: true,
          });
        }
      });
    }
    this.closeChooseAvatar();
  }
  removeImage() {
    this.image.nativeElement.value = '';
    this.userProfile.logo = '../../../assets/img/blank-profile.png';
    this.userProfile.avatar = '';
    this.isRemoveLogo = true;
  }
  previewImage(file, callback: any = false, index = null) {
    // let mimeType = file.type;
    // if (mimeType.match(/image\/*/) == null) {
    //   this.helperService.showError('', 'Vui lòng chọn ảnh');
    //   return;
    // }
    // this.uploadGif = false;
    // if (mimeType == 'image/gif') {
    //   this.uploadGif = true;
    // }
    // let reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.onload = (_event) => {
    //   if (file.size >= this.maxUploadSize) {
    //     this.helperService.showError('', 'Dung lượng ảnh không vượt quá 2MB');
    //     this.userProfile.avatar = [];
    //   } else {
    //       this.previewAvatar = [];
    //       this.previewAvatar.push({ url: reader.result, size: file.size });
    //     if (callback !== undefined) {
    //       callback();
    //     }
    //   }
    // }
  }
  handleFileInput(fileInput: any) {
    this.fileData = fileInput.target.files[0] as File;
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (event) => {
      this.userProfile.logo = String(reader.result);
    };
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  setImagetoAvatar() {
    let url = this.listAvatarDefault
      .filter((x) => x.selected)
      .map((y) => y.src);
    if (url.length > 0) {
      this.previewAvatar = [];
      this.avatarDefault = url[0];
      this.previewAvatar.push({
        url: `https://api.sparklepandas.uat4.pgtest.co/` + url,
        size: 0,
      });
      this.closeChooseAvatar();
    }
  }
  selectedImagetoAvatar(id) {
    this.listAvatarDefault.forEach((i) => {
      i.selected = false;
      if (i.id == id) {
        i.selected = true;
      }
    });
  }
  cancelCropImage() {
    this.croppedImage = this.previewAvatar[0].origin;
    this.previewAvatar[0].url = this.croppedImage;
    this.modalCropImage.hide();
  }
  saveCropImage() {
    setTimeout(() => {
      this.modalCropImage.hide();
    }, 1000);
  }
  imageCropped(event: ImageCroppedEvent) {
    this.avatarDefault = '';
    this.croppedImage = event.base64;
    this.previewAvatar[0].url = this.croppedImage;
  }
  selectTabFavourite(type) {
    debugger;
    switch (type) {
      case 'follow':
        this.listFavorite = this.userProfile.follower;
        break;
      case 'booked':
        this.listFavorite = [];
        break;
      case 'follower':
        this.listFavorite = this.userProfile.follow;
    }
    console.log(this.listFavorite);
  }
}
