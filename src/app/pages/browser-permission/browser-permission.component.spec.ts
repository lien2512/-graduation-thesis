import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserPermissionComponent } from './browser-permission.component';

describe('BrowserPermissionComponent', () => {
  let component: BrowserPermissionComponent;
  let fixture: ComponentFixture<BrowserPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
