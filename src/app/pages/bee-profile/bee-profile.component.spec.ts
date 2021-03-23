import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeeProfileComponent } from './bee-profile.component';

describe('BeeProfileComponent', () => {
  let component: BeeProfileComponent;
  let fixture: ComponentFixture<BeeProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeeProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
