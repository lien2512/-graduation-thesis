import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BecomeBeeComponent } from './become-bee.component';

describe('BecomeBeeComponent', () => {
  let component: BecomeBeeComponent;
  let fixture: ComponentFixture<BecomeBeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BecomeBeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BecomeBeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
