import { TestBed } from '@angular/core/testing';

import { AngularAgoraRtcService } from './angular-agora-rtc.service';

describe('AngularAgoraRtcService', () => {
  let service: AngularAgoraRtcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularAgoraRtcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
