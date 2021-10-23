import { Injectable } from '@angular/core';
import { async } from '@angular/core/testing';
import * as moment from 'moment';
import { filter } from 'rxjs/operators';
import _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {
  constructor() { }

  convertArrayToObjectById(array, key) {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      };
    }, initialValue);
  }

  orderTimeSlot(startTime, availableTime, timeSlot = 900) {
    let count = 1;
    let group = null;
    let today = Date();
    const dateSelected = moment(startTime).format('YYYY-MM-DD');
    const timeSelected = moment(startTime).format('YYYY-MM-DD HH:mm');
    const timeStamp = new Date(timeSelected.replace(/\s/, 'T')+'Z').getTime() / 1000;
    const dateTimeStamp = Date.parse(today) / 1000;
    const dateAvailable = availableTime.filter(item => item.date == dateSelected);
    const listWithTimeStamp = dateAvailable.map(slot => ({
      ...slot,
      timeStampStart: (new Date(slot.start_time.replace(/\s/, 'T')+'Z').getTime() / 1000),
      timeStampEnd: (new Date(slot.end_time.replace(/\s/, 'T')+'Z').getTime() / 1000),
    })).sort((x, y) => x.timeStampStart - y.timeStampStart);
    let len = listWithTimeStamp.length;
    listWithTimeStamp.forEach((item, index) => {
      if (index < len) {
        if (item.timeStampStart === timeStamp) {
          group = count;
        }
        if (listWithTimeStamp[(index + 1) % len].timeStampEnd - item.timeStampEnd === timeSlot) {
          listWithTimeStamp[index]["group"] = count;
        } else {
          listWithTimeStamp[index]["group"] = count;
          count++;
        }
      }
    });
    return listWithTimeStamp.filter(item => (item.group === group && item.timeStampStart > dateTimeStamp));
  }

  dateRangeOverlaps(a_start, a_end, b_start, b_end) {
    if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
    if (a_start <= b_end && b_end <= a_end) return true; // b ends in a
    if (b_start <= a_start && a_end <= b_end) return true; // a in b
    return false;
  }

}
