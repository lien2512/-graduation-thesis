import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeeBoxComponent } from './bee-box.component';

describe('BeeBoxComponent', () => {
  let component: BeeBoxComponent;
  let fixture: ComponentFixture<BeeBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeeBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeeBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
