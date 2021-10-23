import { Component, Input, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ApiService } from '../../services/api.service';
import * as moment from 'moment';
import { SubjectService } from '../../services/subject.service';
import { CookieService } from 'ngx-cookie-service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HelperService } from '../../services/helper.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PopUpConfirmComponent } from '../pop-up-confirm/pop-up-confirm.component';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-my-order',
  templateUrl: './my-order.component.html',
  styleUrls: ['./my-order.component.scss']
})
export class MyOrderComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private subjectService: SubjectService,
    private cookie: CookieService,
    private modalService: BsModalService,
    private helperService: HelperService,
    private firebaseService: FirebaseService
) { }
//
clickChatBox = false;
calendarEvent = [];
orderBy = 'orders.id';
flow = 'desc';
stateFilter = 'all';
searchString = '';
searchStringUpdate = new Subject<string>();
searchStringTip = '';
searchStringTipUpdate = new Subject<string>();
searchStringSub = '';
searchStringSubUpdate = new Subject<string>();
currentPage = 1;
currentPageTipTable = 1;
currentPageSubTable = 1;
itemPerPage = 10;
calendarData: any;
tableData = {
    items: [],
    totalItems: 0,
    currentPage: this.currentPage,
    itemsPerPage: this.itemPerPage,
    dataHeader: ['id_title', 'name', 'service', 'service_type', 'start_rent_time', 'unit_price', 'rent_duration','promo_code', 'promo_discount' , 'price', 'status'],
    id: 'spk-panda-orders',
    loading: false,
};
tableHeader = [
    { id: 'orders.id', name: 'ID', sort: 'DESC'},
    { id: 'users.name', name: 'Khách hàng', sort: 'DESC' },
    { id: 'orders.service', name: 'Dịch vụ', sort: 'DESC' },
    { id: 'orders.service_type', name: 'Lĩnh vực', sort: 'DESC' },
    { id: 'orders.start_rent_time', name: 'Thời gian', sort: 'DESC' },
    { id: 'orders.rent_duration', name: 'Thời lượng', sort: 'DESC' },
    { id: 'orders.status', name: 'Trạng thái' },
    { id: 'action', name: 'Hành động' }
];

moment = moment();
currentTimezone: string;
tableOrderData: any;
modalConfirmBoost: BsModalRef;
generatingCalendar: boolean = false;
@ViewChild('myOrderCalendar') fullcalendar: FullCalendarComponent;
@Input() userInfo: any;
@Input() showMeeting: any = null;
calendar = {
    // plugins: [interactionPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    events: [],
    editable: false,
    allDaySlot: false,
    slotDuration: '00:15',
    droppable: false,
    selectable: false,
    customButtons: {
        myCustomButton1: {
            text: '<',
            click: () => {
                this.goPrev(true);
            }
        },
        myCustomButton2: {
            text: '>',
            click: () => {
                this.goNext();
            }
        },
        today: {
            text: 'Hôm nay',
            click: () => {
                this.calendar.events = [];
                const calendarApi = this.fullcalendar.getApi();
                calendarApi.today();
                this.fillCalendar();
            }
        }
    },
    headerToolbar: {
        left: 'title',
        center: '',
        right: 'myCustomButton1 myCustomButton2 today'
    },
    height: 715,
    stickyHeaderDates: true,
    scrollTime: "09:00:00",
    eventDidMount: (info) => {
        if (info.event.groupId != 'availableForMeeting') {
            let _pr = '5px';
            if (info.event.backgroundColor == '#26ABE2') {
                var confirmNode = document.createElement("i");
                confirmNode.className = 'fa fa-check-circle icon-event-delete';
                confirmNode.setAttribute('aria-hidden', 'true');
                confirmNode.setAttribute('data-toggle', 'tooltip');
                confirmNode.setAttribute('title', 'Xác nhận');
                confirmNode.setAttribute('style', 'position: absolute; z-index: 9; top: 5px; right: 22px; color: #fff; cursor: pointer');
                info.el.appendChild(confirmNode);

                confirmNode.onclick = (e) => {
                    this._actionStatusOrder('CONFIRM', info.event.id);
                }

                var cancelNode = document.createElement("i");
                cancelNode.className = 'fa fa-times-circle icon-event-delete';
                cancelNode.setAttribute('aria-hidden', 'true');
                cancelNode.setAttribute('data-toggle', 'tooltip');
                cancelNode.setAttribute('title', 'Huỷ');
                cancelNode.setAttribute('style', 'position: absolute; z-index: 9; top: 5px; right: 5px; color: #333; cursor: pointer');
                info.el.appendChild(cancelNode);
                _pr = '39px';

                cancelNode.onclick = (e) => {
                    this._actionStatusOrder('CANCEL', info.event.id);
                }
                if (info.event.extendedProps.user_note) {
                    var noteNode = document.createElement("i");
                    noteNode.className = 'fa fa-sticky-note icon-event-delete';
                    noteNode.setAttribute('aria-hidden', 'true');
                    noteNode.setAttribute('data-toggle', 'tooltip');
                    noteNode.setAttribute('title', info.event.extendedProps.user_note);
                    noteNode.setAttribute('style', 'position: absolute; z-index: 9; top: 5px; right: 55px; color: #fff; cursor: pointer');
                    info.el.appendChild(noteNode);
                }
            }

            var userNode = document.createElement("i");
            userNode.className = 'fa fa-user icon-event-delete';
            userNode.setAttribute('aria-hidden', 'true');
            userNode.setAttribute('data-toggle', 'tooltip');
            userNode.setAttribute('title', info.event.extendedProps.user_name);
            userNode.setAttribute('style', 'position: absolute; z-index: 9; top: 5px; right: ' + _pr + '; color: #fff; cursor: pointer');
            info.el.appendChild(userNode);

            if (!info.event.extendedProps.user_private) {
                userNode.onclick = (e) => {
                    window.open('/user/' + info.event.extendedProps.user_name + '/' + info.event.extendedProps.user_id, '_blank');
                }
            } else {
                userNode.onclick = (e) => {
                    this.helperService.showError('', 'không ..');
                }
            }

        }
    }
};

ngOnInit(): void {
    const timeZone = moment.tz.guess();
    this.currentTimezone = timeZone;

    this.searchStringUpdate.pipe(
        debounceTime(500),
        distinctUntilChanged())
        .subscribe(value => {
            this.searchString = value;
            this.fillOrdertable();
        });

}

goPrev(callback = false) {
    if (!this.generatingCalendar) {
        this.generatingCalendar = true;
        this.calendar.events = [];
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
generateCalendar() {
    return this.fillCalendar();
}
fillCalendar() {
    const _status = [0, 1];
    this.calendarEvent = [];
    const calendarApi = this.fullcalendar.getApi();
    const currentRange = JSON.parse(JSON.stringify(calendarApi.getCurrentData().dateProfile.currentRange));
    const startDate = moment(moment(calendarApi.getCurrentData().dateProfile.currentRange.start).format('YYYY-MM-DD 00:00:00')).utc().format('YYYY-MM-DD HH:mm');
    const endDate = moment(moment(calendarApi.getCurrentData().dateProfile.currentRange.end).format('YYYY-MM-DD 00:00:00')).utc().format('YYYY-MM-DD HH:mm');
    const calendarStartDate = currentRange.start;
    const calendarEndDate = currentRange.end;
    const weekNumber = moment(calendarStartDate).format('YYYY') + moment(calendarEndDate).isoWeek();
    // this.apiService.getOrderListByDate(startDate, endDate, this.userInfo.id, 'true', _status, weekNumber, true, false).subscribe((response: any) => {
    //     if (response.code == 200) {
    //         const listOrder = response.data.order;
    //         listOrder.forEach(async (obj) => {
    //             obj.start_rent_time = moment.utc(obj.start_rent_time).local().format('YYYY-MM-DD HH:mm:ss');
    //             obj.end_rent_time = moment.utc(obj.end_rent_time).local().format('YYYY-MM-DD HH:mm:ss');
    //         });
    //         listOrder.forEach(obj => {
    //             let eBg = '#999';
    //             if (obj.status == 1) {
    //                 eBg = '#26ABE2';
    //             }
    //             this.calendarEvent.push({
    //                 start: obj.start_rent_time,
    //                 end: obj.end_rent_time,
    //                 allDay: false,
    //                 backgroundColor: eBg,
    //                 id: obj.id,
    //                 extendedProps: {
    //                     user_name: obj.name,
    //                     user_id: obj.user_id,
    //                     user_private: Number(obj.private),
    //                     user_note: obj.note
    //                 }
    //             });
    //         });

    //         // Available Time
    //         const availableRange = response.data.available_time;


    //         availableRange.forEach((available) => {
    //             let _sT = moment.utc(available.start_time).local().format('YYYY-MM-DD HH:mm');
    //             let _eT = moment.utc(available.end_time).local().format('YYYY-MM-DD HH:mm');

    //             if (_sT >= moment(calendarEndDate).format('YYYY-MM-DD 00:00')) {
    //                 _sT = moment(_sT).subtract(1, 'week').format('YYYY-MM-DD HH:mm');
    //                 _eT = moment(_eT).subtract(1, 'week').format('YYYY-MM-DD HH:mm');
    //             } else if (_eT <= moment(calendarStartDate).format('YYYY-MM-DD 00:00')) {
    //                 _sT = moment(_sT).add(1, 'week').format('YYYY-MM-DD HH:mm');
    //                 _eT = moment(_eT).add(1, 'week').format('YYYY-MM-DD HH:mm');
    //             }

    //             let index = this.calendarEvent.findIndex(d => (d.start === _sT && d.end === _eT));
    //             if (index < 0) {
    //                 this.calendarEvent.push(
    //                     {
    //                         groupId: 'availableForMeeting',
    //                         start: _sT,
    //                         end: _eT,
    //                         display: 'background',
    //                         backgroundColor: '#B953BF'
    //                     }
    //                 );
    //             }
    //         });
    //         this.calendar.events = this.calendarEvent;
    //         this.generatingCalendar = false;
    //     }
    // });
}



fillOrdertable() {
    this.tableData.loading = true;
    const startTime = moment(moment().startOf('year')).format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment(moment().endOf('year')).format('YYYY-MM-DD HH:mm:ss');
    // this.apiService.getAllOrder(startTime, endTime, this.userInfo.id, this.orderBy, this.flow, this.stateFilter, this.searchString, this.currentPage, this.itemPerPage).subscribe((response: any) => {
    //     let keyId = 0;
    //     this.tableData.items = response.data.order.data.map((order) => {
    //         if (order.status == null) {
    //             order.status = 0;
    //         }
    //         order.start_rent_time = moment.utc(order.start_rent_time).local().format('YYYY-MM-DD HH:mm:ss');
    //         order.end_rent_time = moment.utc(order.end_rent_time).local().format('YYYY-MM-DD HH:mm:ss');
    //         if (order.status == 0) {
    //             order.status = 'Waiting to confirm';
    //         } else if (order.status == 1) {
    //             order.status = 'Confirmed';
    //             const timeDiff = moment().diff(moment(order.start_rent_time), 'minutes');
    //             if (timeDiff <= 15 && timeDiff >= -5) { // before 5 mins and after 15 mins
    //                 order.status = 'Upcomming';
    //             }
    //         }
    //         else if (order.status == 2) {
    //             order.status = 'Completed';
    //         }
    //         else if (order.status == 3) {
    //             order.status = 'Rejected';
    //         }
    //         else if (order.status == 4) {
    //             order.status = 'Cancelled';
    //         }
    //         order.rent_duration = order.rent_duration;
    //         order.unit_price = (order.price / (order.rent_duration/60)).toFixed(2);

    //         // Translate status
    //         order.status = order.status.toUpperCase().replace(/\s/g, '');
    //         order.service = order.service.toUpperCase();
    //         order.service_type = order.service_type.toUpperCase();

    //         // Delete action - Confirm action
    //         order.deleteAble = false;
    //         order.confirmAble = false;
    //         order.price = order.price.toFixed(2);
    //         if (order.status == 'Waiting to confirm') {
    //             order.confirmAble = true;
    //         }

    //         // Split username
    //         order.name = (order.name.length > 25) ? order.name.slice(0, 20) + '...' : order.name;

    //         // Get user ID
    //         order.panda_id = order.user.id;
    //         if (order.role_users !== undefined && order.role_users.role_id != undefined) {
    //             order.role = order.role_users.role_id;
    //         }

    //         keyId++;
    //         order.id_title = keyId;
    //         return order;
    //     });
    //     this.tableData.items.forEach((item) => {
    //         let hour = Math.floor(item.rent_duration / 60);
    //         let minutes = item.rent_duration % 60;
    //       if (hour == 0) {
    //         item.rent_duration =  minutes + ' ' + 'phút';
    //       } else if (minutes == 0) {
    //         item.rent_duration = hour  + ' ' + 'giờ';
    //       } else
    //         item.rent_duration = hour  + ' ' + 'giờ' + minutes + ' ' + 'phút';
    //     })
    //     this.tableData.totalItems = response.data.order.total;
    //     this.tableData.currentPage = this.currentPage;
    //     this.tableData.loading = false;
    //     this.helperService.hideFullLoading();

    // }, (err: any) => {
    //     this.tableData.loading = false;
    //     this.helperService.hideFullLoading();
    // });
}




checkScrollToMeeting() {
    setTimeout(() => {
        if (this.showMeeting != null) {
            let tabOrder;
            tabOrder = document.getElementById('tab-order');
            if (tabOrder) {
                tabOrder.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, 0);
}
apllySort(header) {
    this.tableHeader.forEach(_h => {
        if (_h.id == header.id) {
            _h.sort = _h.sort == 'ASC' ? 'DESC' : 'ASC';
        }
    });
    if (this.orderBy == header.id) {
        this.switchFlow();
    } else {
        this.orderBy = header.id;
        this.flow = 'desc';
    }
    this.fillOrdertable();
}


switchFlow() {
    if (this.flow == 'asc') {
        this.flow = 'desc';
    } else {
        this.flow = 'asc';
    }
}
changePage(table, page) {
    table.items = [];
    switch (table) {
        case this.tableData:
            this.currentPage = page;
            this.fillOrdertable();
            break;
        default:
            break;
    }
}

selectTab(event) {
    this.stateFilter = event.id;
    this.currentPage = 1;
    this.tableData.items = [];
    this.tableData.totalItems = 0;
    this.tableData.currentPage = this.currentPage;

    this.tableHeader.forEach(header => {
        if (header.id == 'start_rent_time') {
            this.orderBy = header.id;
            if (event.id == 'upcoming') {
                this.flow = 'ASC';
            } else {
                this.flow = 'DESC';
            }
            header.sort = this.flow;
        }
    });

    this.fillOrdertable();
}

_actionStatusOrder(_action: string, id: number) {
    const _message = _action;
    this.modalConfirmBoost = this.modalService.show(PopUpConfirmComponent, {
        class: 'modal-default',
        initialState: {
            confirmText: _message,
            confirmButton: 'Có',
            cancelButton: 'Không',
            confirmTitle: 'có'
        }
    });
    this.modalConfirmBoost.content.onCancel.subscribe(() => {
        this.modalConfirmBoost.hide();
    });
    this.modalConfirmBoost.content.onConfirm.subscribe(() => {
        this.modalConfirmBoost.hide();
        this.helperService.showFullLoading();
        // this.apiService.updateStatusOrder(id, { action: _action }).subscribe((res: any) => {
        //     this.helperService.hideFullLoading();
        //     if (res.code == STATUS_CODE.SUCCESS) {
        //         this.fillCalendar();
        //         this.fillOrdertable();

        //         this.helperService.showSuccess('', this.transService.instant('ORDERS.' + _action + '_ORDER_SUCCESS'));
        //     }
        // }, (err: any) => {
        //     this.helperService.hideFullLoading();
        //     this.helperService.showError(this.transService.instant('MESSAGE.ERROR'), this.transService.instant('MESSAGE.UNKNOWN_ERROR'));
        // });
    });
}



deleteOrder(id) {
    this._actionStatusOrder('DELETE', id);
}

cancelOrder(id) {
    this._actionStatusOrder('CANCEL', id);
}

confirmOrder(id) {
    this._actionStatusOrder('CONFIRM', id);
}

ngOnDestroy() {
    this.searchStringUpdate.unsubscribe();
}

}


