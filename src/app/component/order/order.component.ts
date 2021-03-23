import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable
import timeGridPlugin from '@fullcalendar/timegrid';
import * as moment from 'moment';
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  availableBookingTime: any = [];
  fullCalendarEvent: any = [];
  newEvent: any = [];
  generatingCalendar: boolean = false;
  specialTimeSlot: any;
  startRentTime: any;
  endRentTime: any;
  rentHour: any;
  rentMin: number;
  rentPrice: number;
  disableStep2Button = true;
  calendarOptions = {
    plugins: [interactionPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    locales: [{ code: 'en-us' }],
    events: [],
    editable: false,
    allDaySlot: false,
    slotDuration: '00:15:00',
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
    // select: this.handleSelect.bind(this),
    // eventChange: this.handleUpdateEvent.bind(this),
    slotLaneDidMount: (arg) => {
      if (arg.isPast == true) {
        arg.el.style.background = '#00ffff';
      }
    },
    customButtons: {
      prev: {
        text: '<',
        click: () => {
          // this.goPrev(true);
        }
      },
      next: {
        text: '>',
        click: () => {
          // this.goNext();
        }
      },
      today: {
        text: 'Today',
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
  

  @ViewChild('fullcalendar') fullcalendar: FullCalendarComponent;
  constructor() { }

  ngOnInit(): void {
  }
  fillCalendar() {
    const _status = ['Create', 'Confirm'];
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
    // this.apiService.getOrderListByDate(startDate, endDate, this.pandaId, '', _status, weekNumber, true, true).subscribe((response: any) => {
    //   if (response.code == '200') {
    //     const listOrder = response.data.order;
    //     this.specialTimeSlot = response.data.special_service;
    //     listOrder.forEach(async (obj) => {
    //       obj.start_rent_time = moment.utc(obj.start_rent_time).local().format('YYYY-MM-DD HH:mm:ss');
    //       obj.end_rent_time = moment.utc(obj.end_rent_time).local().format('YYYY-MM-DD HH:mm:ss');
    //     });
    //     listOrder.forEach(obj => {
    //       let eBg = '#999';
    //       if (obj.user_id == this.userData.id) {
    //         eBg = '#26ABE2';
    //         if (obj.status == ORDER.STATUS.CREATED) {
    //           eBg = '#382F6C';
    //         }
    //       }
    //       this.fullCalendarEvent.push({
    //         start: obj.start_rent_time,
    //         end: obj.end_rent_time,
    //         allDay: false,
    //         backgroundColor: eBg,
    //         editable: false
    //       });
    //     });


    //     if (true) {
    //       let availableRange = response.data.available_time;
    //       const specialService = response.data.special_service;
    //       if (specialService.length) {
    //         for (const key in specialService) {
    //           if (Object.prototype.hasOwnProperty.call(specialService, key)) {
    //             const element = specialService[key];

    //             const _stUTC = moment.utc(`${element.start_time}`).format('YYYY-MM-DD');
    //             const _stLocal = moment.utc(`${element.start_time}`).local().format('YYYY-MM-DD');

    //             const _etUTC = moment.utc(`${element.end_time}`).format('YYYY-MM-DD');
    //             const _etLocal = moment.utc(`${element.end_time}`).local().format('YYYY-MM-DD');

    //             specialService[key].start_time =  moment.utc(`${element.start_time}`).local().format('YYYY-MM-DD HH:mm');
    //             specialService[key].end_time =  moment.utc(`${element.end_time}`).local().format('YYYY-MM-DD HH:mm');
    //             specialService[key].stDiff =  moment(_stLocal).diff(_stUTC, 'days');
    //             specialService[key].etDiff =  moment(_etLocal).diff(_etUTC, 'days');
    //           }
    //         }
    //       }
    //       if (availableRange.length < 1) {
    //         // this.helperService.showError('', 'Không khả dụng');
    //       }

    //       availableRange.forEach((available) => {
    //         let isInSlot = false;

    //         let _sT = moment.utc(available.start_time).local().format('YYYY-MM-DD HH:mm');
    //         let _eT = moment.utc(available.end_time).local().format('YYYY-MM-DD HH:mm');

    //         if (_sT >= moment(calendarEndDate).format('YYYY-MM-DD 00:00')) {
    //           _sT = moment(_sT).subtract(1, 'week').format('YYYY-MM-DD HH:mm');
    //           _eT = moment(_eT).subtract(1, 'week').format('YYYY-MM-DD HH:mm');
    //         } else if (_eT <= moment(calendarStartDate).format('YYYY-MM-DD 00:00')) {
    //           _sT = moment(_sT).add(1, 'week').format('YYYY-MM-DD HH:mm');
    //           _eT = moment(_eT).add(1, 'week').format('YYYY-MM-DD HH:mm');
    //         }
    //         if (moment().diff(_sT) <= 0) {
    //           let _bg = '#B953BF';
    //           if (specialService.length) {
    //             for (const key in specialService) {
    //               if (Object.prototype.hasOwnProperty.call(specialService, key)) {
    //                 const item = specialService[key];
    //                 let _sTLC = item.start_time;
    //                 let _eTLC = item.end_time;

    //                 if (_sT >= _sTLC && _eT <= _eTLC) {
    //                   isInSlot = true;
    //                 }

    //                 if (isInSlot) {
    //                   _bg = '#831a90';
    //                   isInSlot = false;
    //                 }
    //               }
    //             }
    //           }

    //           let index = this.fullCalendarEvent.findIndex(d => (d.start === _sT && d.end === _eT));
    //           if (index < 0) {
    //             this.fullCalendarEvent.push(
    //               {
    //                 groupId: 'availableForMeeting',
    //                 start: _sT,
    //                 end: _eT,
    //                 display: 'background',
    //                 backgroundColor: _bg
    //               }
    //             );
    //           }
    //         }
    //       });

    //       let _availableTrunt = [];
    //       this.fullCalendarEvent.forEach(el => {
    //         if (el.groupId == 'availableForMeeting') {
    //           const _tmp = this.convertTimeRangeToArray(el.start, el.end);
    //           if (_tmp) {
    //             _tmp.forEach(e => {
    //               _availableTrunt.push(e);
    //             });
    //           }
    //         }
    //       });
    //       this.availableBookingTime = _availableTrunt;
    //     }
    //     this.calendarOptions.events = this.fullCalendarEvent;
    //     this.calendarOptions.selectable = true;
    //     this.generatingCalendar = false;
    //   }
    // });
  }
  handleClickEvent(event) {
    // const isMobile = this.deviceService.isMobile();
    const isMobile = true;
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
          // this.getBookedTime(event.date);
          // this.updateBookStep(2);
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
  resetBookForm() {
    this.disableStep2Button = true;
    this.rentHour = 0;
    this.rentMin = 0;
    this.rentPrice = 0;
    this.startRentTime = null;
    this.endRentTime = null;
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

}
