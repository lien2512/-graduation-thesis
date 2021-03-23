import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-bee-box',
  templateUrl: './bee-box.component.html',
  styleUrls: ['./bee-box.component.scss']
})
export class BeeBoxComponent implements OnInit {
  @Input() info: any;
  constructor(
    public router: Router
  ) { }

  ngOnInit(): void {
  }
  navigateDetail() {
    this.router.navigate(['bee']);
  }
  follow() {
    alert('heheheh');
  }

}
