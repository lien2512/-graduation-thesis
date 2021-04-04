import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpConfirmComponent } from './pop-up-confirm.component';

describe('PopUpConfirmComponent', () => {
  let component: PopUpConfirmComponent;
  let fixture: ComponentFixture<PopUpConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopUpConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
