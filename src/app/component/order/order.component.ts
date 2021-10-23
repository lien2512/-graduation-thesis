import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable
import timeGridPlugin from '@fullcalendar/timegrid';
import * as moment from 'moment';
import 'moment-timezone';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { HelperService } from '../../services/helper.service';
import { SubjectService } from '../../services/subject.service';
import * as _ from "lodash";
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ApiService } from 'src/app/services/api.service';
import firebase from 'firebase';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'spkpandas-order',
  templateUrl: './order.component.html',
})
export class OrderComponent implements OnInit, AfterViewInit {

  // tslint:disable-next-line:max-line-length
  constructor(
    private modalService: BsModalService,
    private cookie: CookieService,
    private helperService: HelperService,
    private subjectService: SubjectService,
    private utilities: UtilitiesService,
    private apiService: ApiService,
    private firebaseService: FirebaseService

  ) { }
  @ViewChild('fullcalendar') fullcalendar: FullCalendarComponent;
  @ViewChild('external') external: ElementRef;
  @Output() onClose = new EventEmitter();
  
  modalRef: BsModalRef | null;
  message: string;
  bookStep: any = 1;
  pandaId: number = 797;
  pandaName: string;
  userBalance: number;
  startRentTime: any;
  endRentTime: any;
  rentHour: any;
  rentMin: number;
  rentPrice: number;
  servicePrice: number;
  serviceName: string;
  disableStep2Button = true;
  dataStep3: any;
  fullCalendarEvent: any = [];
  newEvent: any = [];
  serviceDataClone: any;
  pandaData: any = [];
  // apiUrl = `${environment.apiUrl}/`;
  userData: any;
  loading: boolean;
  bookedSlot: any = [];
  dateSelected: any;
  startTime: any;
  endTime: any;
  isPassTime: boolean = true;
  responseCode: any = null;
  request = {
    service: 'Game',
    service_type: '',
    user_id: 0,
    panda_id: 0,
    start_rent_time: '',
    end_rent_time: '',
    rent_duration: 0,
    timezone: '',
    note: '',
    status: 0
  };
  moment = moment();
  serviceData: any;
  serviceArray: any;
  service = 'Game';
  dateFormat = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  };
  beeId: any;
  beeName: any;
  currentTimezone: string;
  currentTimezoneCode: string;
  availableBookingTime: any = [];
  percentDiscount = 0;
  promo_id: any = null;
  orderData = {};
  generatingCalendar: boolean = false;
  calendarOptions = {
    // plugins: [interactionPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    
    events: [],
    editable: false,
    allDaySlot: false,
    slotDuration: '00:15:00',
    // slotLabelInterval: '00:15:00',
    selectable: false,
    droppable: true,
    dateClick: this.handleClickEvent.bind(this),
    selectAllow: (selectInfo) => {
      let selectAble = moment().diff(selectInfo.start) <= 0;
      if (selectAble) {
        selectAble = false;
        let events = this.convertTimeRangeToArray(selectInfo.start, selectInfo.end);
        let checkAll = true;
        events.forEach(event => {
          const _diff = events.filter(({ start_time: start_time1, end_time: end_time1 }) => !this.availableBookingTime.some(({ start_time: start_time2, end_time: end_time2 }) => (start_time2 === start_time1 && end_time2 === end_time1)));
          if (_diff.length > 0) {
            checkAll = false;
          }
        });

        selectAble = checkAll;
        return selectAble;
      } else {
        return false;
      }
    },
    select: this.handleSelect.bind(this),
    eventChange: this.handleUpdateEvent.bind(this),
    slotLaneDidMount: (arg) => {
      if (arg.isPast == true) {
        arg.el.style.background = '#00ffff';
      }
    },
    customButtons: {
      prev: {
        text: '<',
        click: () => {
          this.goPrev(true);
        }
      },
      next: {
        text: '>',
        click: () => {
          this.goNext();
        }
      },
      today: {
        text: 'today',
        click: () => {
          this.generatingCalendar = true;
          const calendarApi = this.fullcalendar.getApi();
          calendarApi.today();
          this.fillCalendar();
        }
      }
    },
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev next today'
    },
    eventClick: this.handleRemoveEvent.bind(this),
    validRange: {
      start: moment().startOf('week').format('YYYY-MM-DD')
    },
    stickyHeaderDates: true
  };
  promoCode: string = '';
  specialService: any;
  specialTimeSlot: any;
  backUpData: any;
  isApplyPromo: boolean = false;
  allServices = ['Game', 'Cosplay', 'Just chat'];
  calendar: any;
  ngOnInit(): void {
    const timeZone = moment.tz.guess();;
    this.currentTimezoneCode = timeZone;
    this.currentTimezone = timeZone;
    this.subjectService.userInfo.subscribe((res: any) => {
      this.userData = res;
      if (!this.userData && this.cookie.get('user_info')) {
        this.userData = JSON.parse(this.cookie.get('user_info'));
      }
      if (this.userData) {

      }
    });
  }

  ngAfterViewInit(): void {
    this.openStep1();
  }

  decline(): void {
    this.message = 'Declined!';
    this.modalRef.hide();
  }

  updateBookStep(step) {
    if (step == 1) {
      this.newEvent = [];
      this.fullCalendarEvent = [];
      this.resetBookForm();
    }
    this.bookStep = step;
  }

  openStep1(isGetData = false) {
    if (!isGetData) {
      this.fillCalendar();
    }
    this.apiService.getPandaByID(this.pandaId).subscribe((response: any) => {
      if (response.code == 200) {
        this.serviceArray = response.data.service;
        this.backUpData = response.data;
        this.service = this.serviceArray[0].service;
        if (this.serviceArray.length == 1) {
          this.request.service = this.service;
          this.serviceDataClone = { ...this.serviceArray[0] };
          this.serviceData = this.serviceArray[0];
        } else {
          this.serviceArray.forEach(obj => {
            if (obj.service == this.service) {
              this.serviceData = this.serviceDataClone = { ...obj };
            }
          });
        }
        const availableServices = this.serviceArray.map(el => el.service);
        const missingService = this.allServices.filter(x => !availableServices.includes(x));
        missingService.forEach(element => {
          this.serviceArray.push({ id : null, service : element});
        });
        this.specialService = response.data.special_service;
        this.pandaData = response.data.panda;
      } else {
        return false;
      }
    });
  }

 async fillCalendar() {
    const _status = [0, 1];
    this.fullCalendarEvent = [];
    this.newEvent.forEach(element => {
      this.fullCalendarEvent.push(element);
    });
    const calendarApi = this.fullcalendar.getApi();
    const currentRange = JSON.parse(JSON.stringify(calendarApi.getCurrentData().dateProfile.currentRange));
    const startDate = moment(moment(calendarApi.getCurrentData().dateProfile.currentRange.start).format('YYYY-MM-DD 00:00:00')).utc().format('YYYY-MM-DD HH:mm');
    const endDate = moment(moment(calendarApi.getCurrentData().dateProfile.currentRange.end).format('YYYY-MM-DD 00:00:00')).utc().format('YYYY-MM-DD HH:mm');
    const calendarStartDate = currentRange.start;
    const calendarEndDate = currentRange.end;
    const weekNumber = moment(calendarStartDate).format('YYYY') + moment(calendarEndDate).isoWeek();
    const dataBee: any = await this.firebaseService.getRefById('users',this.beeId);
    console.log(dataBee);
    this.calendar = dataBee.calendar;
        const listOrder = this.calendar.order;
        this.specialTimeSlot = this.calendar.special_service;
        listOrder.forEach(async (obj) => {
          obj.start_rent_time = moment.utc(obj.start_rent_time).local().format('YYYY-MM-DD HH:mm:ss');
          obj.end_rent_time = moment.utc(obj.end_rent_time).local().format('YYYY-MM-DD HH:mm:ss');
        });
        listOrder.forEach(obj => {
          let eBg = '#999';
          if (obj.user_id == this.userData.id) {
            eBg = '#26ABE2';
            if (obj.status == 0) {
              eBg = '#382F6C';
            }
          }
          this.fullCalendarEvent.push({
            start: obj.start_rent_time,
            end: obj.end_rent_time,
            allDay: false,
            backgroundColor: eBg,
            editable: false
          });
        });


        // Available Time
        if (true) {
          let availableRange = this.calendar.available_time2;
          const specialService = this.calendar.special_service;
          if (specialService.length) {
            for (const key in specialService) {
              if (Object.prototype.hasOwnProperty.call(specialService, key)) {
                const element = specialService[key];

                const _stUTC = moment.utc(`${element.start_time}`).format('YYYY-MM-DD');
                const _stLocal = moment.utc(`${element.start_time}`).local().format('YYYY-MM-DD');

                const _etUTC = moment.utc(`${element.end_time}`).format('YYYY-MM-DD');
                const _etLocal = moment.utc(`${element.end_time}`).local().format('YYYY-MM-DD');

                specialService[key].start_time =  moment.utc(`${element.start_time}`).local().format('YYYY-MM-DD HH:mm');
                specialService[key].end_time =  moment.utc(`${element.end_time}`).local().format('YYYY-MM-DD HH:mm');
                specialService[key].stDiff =  moment(_stLocal).diff(_stUTC, 'days');
                specialService[key].etDiff =  moment(_etLocal).diff(_etUTC, 'days');
              }
            }
          }
          if (availableRange.length < 1) {
            this.helperService.showError('', 'Không khả dụng');
          }

          availableRange.forEach((available) => {
            let isInSlot = false;

            let _sT = moment.utc(available.start_time).local().format('YYYY-MM-DD HH:mm');
            let _eT = moment.utc(available.end_time).local().format('YYYY-MM-DD HH:mm');

            if (_sT >= moment(calendarEndDate).format('YYYY-MM-DD 00:00')) {
              _sT = moment(_sT).subtract(1, 'week').format('YYYY-MM-DD HH:mm');
              _eT = moment(_eT).subtract(1, 'week').format('YYYY-MM-DD HH:mm');
            } else if (_eT <= moment(calendarStartDate).format('YYYY-MM-DD 00:00')) {
              _sT = moment(_sT).add(1, 'week').format('YYYY-MM-DD HH:mm');
              _eT = moment(_eT).add(1, 'week').format('YYYY-MM-DD HH:mm');
            }
            if (moment().diff(_sT) <= 0) {
              let _bg = '#B953BF';
              if (specialService.length) {
                for (const key in specialService) {
                  if (Object.prototype.hasOwnProperty.call(specialService, key)) {
                    const item = specialService[key];
                    let _sTLC = item.start_time;
                    let _eTLC = item.end_time;

                    if (_sT >= _sTLC && _eT <= _eTLC) {
                      isInSlot = true;
                    }

                    if (isInSlot) {
                      _bg = '#831a90';
                      isInSlot = false;
                    }
                  }
                }
              }

              let index = this.fullCalendarEvent.findIndex(d => (d.start === _sT && d.end === _eT));
              if (index < 0) {
                this.fullCalendarEvent.push(
                  {
                    groupId: 'availableForMeeting',
                    start: _sT,
                    end: _eT,
                    display: 'background',
                    backgroundColor: _bg
                  }
                );
              }
            }
          });

          let _availableTrunt = [];
          this.fullCalendarEvent.forEach(el => {
            if (el.groupId == 'availableForMeeting') {
              const _tmp = this.convertTimeRangeToArray(el.start, el.end);
              if (_tmp) {
                _tmp.forEach(e => {
                  _availableTrunt.push(e);
                });
              }
            }
          });
          this.availableBookingTime = _availableTrunt;
        }
        this.calendarOptions.events = this.fullCalendarEvent;
        this.calendarOptions.selectable = true;
        this.generatingCalendar = false;
  }

  chooseServiceType(serviceType, price) {
    this.request.service_type = serviceType;
    this.servicePrice = price;
  }

  goPrev(callback = false) {
    if (!this.generatingCalendar) {
      this.generatingCalendar = true;
      this.calendarOptions.events = [];
      const calendarApi = this.fullcalendar.getApi();
      if (callback) {
        calendarApi.prev(); // call a method on the Calendar object
      }
      this.fillCalendar();
    }
  }
  goNext() {
    if (!this.generatingCalendar) {
      this.generatingCalendar = true;
      const calendarApi = this.fullcalendar.getApi();
      calendarApi.next(); // call a method on the Calendar object
      this.fillCalendar();
    }
  }
  handleClickEvent(event) {
    const isMobile = false;
    // const isMobile = this.deviceService.isMobile();
    if (isMobile) {
      let _diff = moment().diff(event.date) <= 0;
      if (_diff) {
        let events = [
          {
            start_time: moment(event.date).format('YYYY-MM-DD HH:mm'),
            end_time: moment(event.date).add(15, 'minutes').format('YYYY-MM-DD HH:mm')
          }
        ];
        let _clickAble = true;
        events.forEach(event => {
          const _diff = events.filter(({ start_time: start_time1, end_time: end_time1 }) => !this.availableBookingTime.some(({ start_time: start_time2, end_time: end_time2 }) => (start_time2 === start_time1 && end_time2 === end_time1)));
          if (_diff.length > 0) {
            _clickAble = false;
          }
        });

        if (_clickAble) {
          this.disableStep2Button = false;
          this.getBookedTime(event.date);
          this.updateBookStep(2);
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  handleSelect(event) {
    this.disableStep2Button = false;
    this.getBookedTime(event.start);
    this.updateBookStep(2);
  }
  _addNewBooking(_e) {
    // Check existed bookingEvent
    if (this.newEvent.length >= 1) {
      const _book = this.newEvent[0];

      // Check start_time & end_time is match
      if (_book.start == _e.end) {
        _book.start = _e.start;
      } else if (_book.end == _e.start) {
        _book.end = _e.end;
      } else {
        // Check if need to delete
        if (_e.start >= _book.start && _e.end <= _book.end) {
          this.newEvent = [];
        } else {
          this.newEvent = [_e];
        }
      }
    } else {
      this.newEvent.push(_e);
    }

    this.fullCalendarEvent.forEach((booking, k) => {
      if (booking.groupId == 'bookingEvent') {
        this.fullCalendarEvent.splice(k, 1);
      }
    });

    this.newEvent.forEach(booking => {
      this.fullCalendarEvent.push(booking);
    });

    if (this.newEvent.length >= 1) {
      this.startRentTime = moment(this.newEvent[0].start).format('HH:mm, MMM DD');
      this.endRentTime = moment(this.newEvent[0].end).format('HH:mm, MMM DD');
      const rentTime = moment(this.newEvent[0].end).diff(this.newEvent[0].start, 'minutes');
      this.rentHour = Math.floor(rentTime / 60);
      this.rentPrice = this.servicePrice * this.rentHour;
      this.request.start_rent_time = moment(this.newEvent[0].start).utc().format('YYYY-MM-DD HH:mm:ss');
      this.request.end_rent_time = moment(this.newEvent[0].end).utc().format('YYYY-MM-DD HH:mm:ss');
      this.request.rent_duration = rentTime;
    } else {
      this.resetBookForm();
    }
    this.calendarOptions.events = [... this.fullCalendarEvent];
  }

  handleRemoveEvent(event) {
    if (this.newEvent.length >= 1) {
      let tmp = [];
      this.fullCalendarEvent.forEach((booking, k) => {
        if (booking.groupId != 'bookingEvent') {
          tmp.push(booking);
        }
      });

      this.fullCalendarEvent = tmp;
      this.calendarOptions.events = tmp;
      this.newEvent = [];
      this.resetBookForm();
    }
  }

  handleUpdateEvent(event) {
    this.handleSelect(event.event);
  }
  handleStep3() {
    // this.fullCalendarEvent = this.fullCalendarEvent.concat(this.newEvent);
    // this.newEvent = [];
    this.calendarOptions.events = this.fullCalendarEvent;
    this.updateBookStep(3);
  }
  
  chooseService() {
    this.request.service = this.service;
    this.serviceArray.forEach(obj => {
      if (obj.service == this.service) {
        this.serviceDataClone = _.cloneDeep(obj);
        this.request.service_type = obj.service;
        // set default service voice
        if (obj.video_price) {
          this.servicePrice = obj.video_price;
          this.request.service_type = 'video';
        } else {
          this.servicePrice = obj.voice_price;
          this.request.service_type = 'voice';
        }
      }
    });
  }
  createOrder() {
    if (!this.request?.service_type) {
      this.helperService.showError('', 'Chọn dịch vụ');
      return;
    }
    
    this.loading = true;
    this.request.user_id = this.userData.id;
    this.request.panda_id = this.pandaId;
    this.request.timezone = this.currentTimezone;
    this.calendar.order.push(this.request);
    firebase.firestore().collection('users').doc(this.beeId).update('users', this.calendar).then(() => {
      this.closeBookModal();
    }).catch(()=> {
      alert("erorr");
    })
    
    // this.apiService.createOrder(this.request).subscribe((response: any) => {
    //   this.loading = false;
    //   if (response.code == STATUS_CODE.SUCCESS) {
    //     this.closeBookModal();
    //     this.helperService.showSuccess('', this.transService.instant('MESSAGE.BOOK_SUCCESS'));
    //     this.gaService.emitEvent('booking_' + this.pandaName, 'booking');
    //   }
    // }, (error) => {
    //   this.loading = false;
    //   this.helperService.showError('', this.transService.instant('MESSAGE.UNKNOWN_ERROR'));
    // });
  }
  closeBookModal() {
    this.request = {
      service: 'Game',
      service_type: '',
      user_id: 0,
      panda_id: 0,
      start_rent_time: '',
      end_rent_time: '',
      rent_duration: 0,
      timezone: '',
      note: '',
      status: 0
    };
    // this.modalService._hideModal(1);
    this.onClose.emit();
  }

  resetBookForm() {
    this.disableStep2Button = true;
    this.rentHour = 0;
    this.rentMin = 0;
    this.rentPrice = 0;
    this.startRentTime = null;
    this.endRentTime = null;
  }


  convertTimeRangeToArray(start, end, format = 'YYYY-MM-DD HH:mm', duration = 15) {
    let res: any = [];
    let newStart: any;

    while (moment(start).diff(moment(end)) < 0) {
      newStart = moment(start).add(duration, 'minutes');
      res.push({
        start_time: moment(start).format(format),
        end_time: newStart.format(format),
        date: moment(start).format('YYYY-MM-DD')
      });
      start = newStart;
    }
    return res;
  }


  getBookedTime(startTime) {
    this.dateSelected = moment(startTime).format('MMM DD, YYYY');
    this.bookedSlot = this.utilities.orderTimeSlot(startTime, this.availableBookingTime);

    this.bookedSlot.forEach(sl => {
      if (moment(sl.start_time).diff(startTime) == 0) {
        this.startTime = sl.start_time;
        this.endTime = sl.end_time;
      }
    });

    // check startTime is Slot of special time.
    if (this.specialTimeSlot && this.specialTimeSlot.length) {
      const timeSelected = moment(this.startTime).format('YYYY-MM-DD HH:mm');
      const serviceArray = [...this.backUpData.service];
      this.updateService(timeSelected, serviceArray);
    } else {
       this.request.service_type = this.serviceData.video_price != null ?  'video' : 'voice';
       this.chooseServiceType(this.request.service_type, this.serviceData.video_price != null ? this.serviceData?.video_price : this.serviceData?.voice_price);
    }
  }

  updateService(timeSelected, serviceArray) {
    if (this.specialTimeSlot && this.specialTimeSlot.length !== 0) {
      let ServiceTimeSelected = null;
      this.specialTimeSlot.forEach((item, index) => {
        if (item.start_time <= timeSelected && timeSelected < item.end_time) {
          ServiceTimeSelected = this.specialTimeSlot[index];
        }
      });
      let listService = [];
      if (ServiceTimeSelected) {
        this.specialService.forEach(element => {
          if (element[0].group_id === ServiceTimeSelected.group_id) {
            for (const key in element) {
              if (Object.prototype.hasOwnProperty.call(element, key)) {
                const slot = element[key];
                listService.push(slot);
              }
            }
          }
        });
      }
      if (ServiceTimeSelected) {
        this.service = listService[0].service;
        if (listService.length == 1) {
          this.request.service = this.service;
          this.serviceData = {...listService[0]};
        } else {
          listService.forEach(obj => {
            if (obj.service == this.service) {
              this.serviceData = {...obj};
            }
          });
        }
      } else {
        this.service = serviceArray[0].service;
        this.request.service = this.service;
        this.serviceData = { ...serviceArray[0] };
      }
      this.serviceDataClone = _.cloneDeep(this.serviceData);
      this.request.service_type = this.serviceData.video_price != null ?  'video' : 'voice';
      this.chooseServiceType(this.request.service_type, this.serviceData.video_price != null ? this.serviceData?.video_price : this.serviceData?.voice_price);
      this.serviceArray = ServiceTimeSelected !== null ? listService : serviceArray;
      const availableServices = this.serviceArray.map(el => el.service);
      const missingService = this.allServices.filter(x => !availableServices.includes(x));
      missingService.forEach(element => {
        this.serviceArray.push({ id : null, service : element});
      });
    }
  }

  onStartTimeChange(value) {
    if (this.specialTimeSlot && this.specialTimeSlot.length) {
      const timeSelected = moment(value).format('YYYY-MM-DD HH:mm');
      const serviceArray = [...this.backUpData.service];
      this.updateService(timeSelected, serviceArray);
    }
    const startTimeStamp = (new Date(value.replace(/\s/, 'T')+'Z').getTime() / 1000);
    const endTimeStamp = (new Date(this.endTime.replace(/\s/, 'T')+'Z').getTime() / 1000);
    if (endTimeStamp <= startTimeStamp) {
      this.isPassTime = false;
      this.helperService.showError('', 'Vui lòng chọn khoảng khác');
      return;
    }
    this.isPassTime = true;
  }

  onEndTimeChange(value) {
    const startTimeStamp = (new Date(this.startTime.replace(/\s/, 'T')+'Z').getTime() / 1000);
    const endTimeStamp = (new Date(value.replace(/\s/, 'T')+'Z').getTime() / 1000);
    if (startTimeStamp >= endTimeStamp) {
      this.isPassTime = false;
      this.helperService.showError('', 'Chọn khoảng khác');
      return;
    }
    this.isPassTime = true;
  }

  formatDateSlot(str) {
    return str.split(' ')[1];
  }

  // apply promo
  
  
}
