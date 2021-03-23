import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccSettingComponent } from './acc-setting.component';

describe('AccSettingComponent', () => {
  let component: AccSettingComponent;
  let fixture: ComponentFixture<AccSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
