import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }
  getPandaByID(id) {
    const url = `https://api.sparklepandas.uat4.pgtest.co/panda/get-panda/${id}`;
    return this.httpClient.get(url);
  }
  getOrderListByDate(startDate, endDate, pandaId, getFullData: string = '', status: any = [], weekNumber?, isBooking?, isLimit?) {
    let statusParams = JSON.stringify(status);
    const url = `https://api.sparklepandas.uat4.pgtest.co/order/get-list?start_date=${startDate}&end_date=${endDate}&panda_id=${pandaId}&full_data=${getFullData}&status=${statusParams}&weekNumber=${weekNumber}&isBooking=${isBooking}&isLimit=${isLimit}`;
    return this.httpClient.get(url);
  }
  getAvailableTime(_s, _e, _w) {
    const url = `https://api.sparklepandas.uat4.pgtest.co/panda/available-time?s=` + _s + `&e=` + _e + `&w=` + _w;
    return this.httpClient.get(url);
  }
}
