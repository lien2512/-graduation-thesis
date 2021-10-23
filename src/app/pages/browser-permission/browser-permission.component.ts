import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebcamInitError } from 'ngx-webcam';
import { SubjectService } from 'src/app/services/subject.service';
import { CookieService } from 'ngx-cookie-service';
declare var $: any;
@Component({
  selector: 'app-browser-permission',
  templateUrl: './browser-permission.component.html',
  styleUrls: ['./browser-permission.component.scss']
})
export class BrowserPermissionComponent implements OnInit {

  mainTab: any;
  microPhoneStatus: string;
  headPhoneStatus: string;
  cameraStatus: string;
  listInput = [];
  listOutput = [];
  listVideoInput = [];
  inputAudio = false;
  userInfo: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subjectService: SubjectService,
    private cookie: CookieService,
  ) { }

  ngOnInit(): void {
    this.subjectService.userInfo.subscribe((res: any) => {
      this.userInfo = res;
      if (!this.userInfo && this.cookie.get('account_info') && this.cookie.get('account_info') != '') {
        this.userInfo = JSON.parse(this.cookie.get('account_info'));
      } })
    this.activatedRoute.queryParams.subscribe(res => {
      this.mainTab = res.tab;
    });
    this._getAudioPermission(true);
    this._getVideoPermission(true);
  }

  _getVideoPermission(isGetList) {
    navigator.permissions.query({ name: 'camera' })
      .then((permission) => {
        this.cameraStatus = permission.state;
        if (permission.state === 'granted' && isGetList) {
          this.getListDevice(false);
        }
      }).catch((error) => {
        console.log('Got error :', error);
      });
  }

  _getAudioPermission(isGetList) {
    navigator.permissions.query({ name: 'microphone' })
      .then((permission) => {
        this.microPhoneStatus = permission.state;
        if (permission.state === 'granted' && isGetList) {
          this.inputAudio = true;
          this.getListDevice(true);
          this.checkInputAudioLevel();
        }
      }).catch((error) => {
        console.log('Got error :', error);
      });
  }

  checkInputAudioLevel() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        function colorPids(vol) {
          let all_pids = $('.pid');
          let amout_of_pids = Math.round(vol/10);
          let elem_range = all_pids.slice(0, amout_of_pids);
          for (var i = 0; i < all_pids.length; i++) {
            all_pids[i].style.backgroundColor="#e6e7e8";
          }
          for (var i = 0; i < elem_range.length; i++) {
            elem_range[i].style.backgroundColor="#69ce2b";
          }
        }
        var audioContext = new AudioContext();
        var analyser = audioContext.createAnalyser();
        var microphone = audioContext.createMediaStreamSource(stream);
        var javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
        javascriptNode.onaudioprocess = function() {
          var array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          var values = 0;

          var length = array.length;
          for (var i = 0; i < length; i++) {
            values += (array[i]);
          }
          var average = values / length;
          colorPids(average);
        };

      })
      .catch(function(err) {
        /* handle the error */
      });
  }

  changeActiveTab(tab) {
    this.router.navigate([], {
      queryParams: { tab },
    });
    if (tab === 'audio') {
      this._getAudioPermission(true);
    } else {
      this._getVideoPermission(true);
    }
  }

  async allowPermissionAudio() {
    if (this.microPhoneStatus !== 'prompt') { return; }
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        this.inputAudio = true;
        this.getListDevice(true);
        this.checkInputAudioLevel();
        this._getAudioPermission(false);
      } else {
        // Reload page
        window.location.reload();
      }
    } catch (err) {
      // Reload page
      window.location.reload();
    }
  }

  async allowPermissionVideo() {
    if (this.cameraStatus !== 'prompt') { return; }
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (stream) {
        this.getListDevice(false);
        this._getVideoPermission(false);
      } else {
        // Reload page
        window.location.reload();
      }
    } catch (err) {
      // Reload page
      window.location.reload();
    }
  }

  async getListDevice(isAudio) {
    const listDevice = await navigator.mediaDevices.enumerateDevices();
    this.listInput = listDevice.filter(x => x.kind === 'audiooutput');
    this.listOutput = listDevice.filter(x => x.kind === 'audioinput');
    this.listVideoInput = listDevice.filter(x => x.kind === 'videoinput');
  }

  public handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
      console.warn("Camera access was not allowed by user!");
    }
  }

}
