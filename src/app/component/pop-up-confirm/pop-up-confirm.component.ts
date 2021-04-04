import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-pop-up-confirm',
  templateUrl: './pop-up-confirm.component.html',
  styleUrls: ['./pop-up-confirm.component.scss']
})
export class PopUpConfirmComponent implements OnInit {

  @Output() onConfirm = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onPending = new EventEmitter();
  @Input() loading: boolean = false;
  confirmText : string = '';
  showIconClose: boolean = true;
  textDetail : string;
  confirmShowGuide: boolean = false;
  confirmButton : string = 'OKE';
  cancelButton : string = 'HUỶ';
  confirmTitle : string = 'ĐỒNG Ý';
  anotherTimeButton : string = 'ne';
  isPaypalConfirm: boolean = false;
  disabled: boolean = false;
  paypalId: any = '';
  constructor(private modalService: BsModalService,
    ) { }

  ngOnInit(): void {
    if (this.isPaypalConfirm && !this.paypalId) {
      this.disabled = true;
    }

    if (this.paypalId) {
      this.disabled = false;
    }
  }

  confirm() {
    this.loading = true;
    if (this.paypalId) {
      this.onConfirm.emit(this.paypalId);
    } else {
      this.onConfirm.emit();
    }
  }

  cancel() {
    this.onCancel.emit();
  }
  anotherTime() {
    this.onPending.emit();
    // this.onCancel.emit();
  }

  checkPaypalID()
  {
    this.disabled = true;
    if (this.paypalId) {
      this.disabled = false;
    }
  }

}
