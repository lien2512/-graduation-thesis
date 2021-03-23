import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-bee-profile',
  templateUrl: './bee-profile.component.html',
  styleUrls: ['./bee-profile.component.scss']
})
export class BeeProfileComponent implements OnInit {

  modalReport: BsModalRef;
  listItemDefault: any;
  listIMG: any = [];
  constructor(
    public modalService: BsModalService,
  ) { }

  ngOnInit(): void {
    this.listItemDefault = [{
      checked: false,
      reason: 'Spam'
    },
    {
      checked: false,
      reason: 'Nội dung nhạy cảm'
    },
    {
      checked: false,
      reason: 'Bạo lực'
    },
    {
      checked: false,
      reason: 'Nội dung bị cấm'
    },
    {
      checked: false,
      reason: 'Gây hiểu nhầm hoặc lừa đảo'
    }]
  }
  blockAccount(template: TemplateRef<any>) {
    this.modalReport = this.modalService.show(template, {
      class: 'modal-default',
    })
  }
  chooseImage(event) {

  }
  removeEachImage(oder, id) {

  }
  openModalBook() {
  }

}
