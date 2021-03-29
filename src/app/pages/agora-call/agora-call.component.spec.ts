import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgoraCallComponent } from './agora-call.component';

describe('AgoraCallComponent', () => {
  let component: AgoraCallComponent;
  let fixture: ComponentFixture<AgoraCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgoraCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgoraCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
