import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBeesComponent } from './list-bees.component';

describe('ListBeesComponent', () => {
  let component: ListBeesComponent;
  let fixture: ComponentFixture<ListBeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListBeesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
