import { Component, EventEmitter, OnInit, Output } from '@angular/core';
// import { AngularAgoraRtcService } from 'angular-agora-rtc/lib/angular-agora-rtc.service';
import { Stream } from 'src/app/class/Stream';
import { AngularAgoraRtcService } from 'src/app/services/angular-agora-rtc.service';
import * as AgoraRTC from 'agora-rtc-sdk';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PopUpConfirmComponent } from 'src/app/component/pop-up-confirm/pop-up-confirm.component';
import { AgoraConfig } from 'src/app/class/AgoraConfig';
// import {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} from 'agora-access-token'
import { from } from 'rxjs';
import { SubjectService } from 'src/app/services/subject.service';
import { CookieService } from 'ngx-cookie-service';
import * as agoraToken from 'agora-access-token';
// const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')
// const agoraConfig: AgoraConfig = {
//   AppID: 'ksdfjlkdsjfklsdjf',
// };
@Component({
  selector: 'app-agora-call',
  templateUrl: './agora-call.component.html',
  styleUrls: ['./agora-call.component.scss'],
})
export class AgoraCallComponent implements OnInit {
  activeCall: boolean = false;
  audioEnabled: boolean = true;
  videoEnabled: boolean = true;
  modalAcceptCall: BsModalRef
  client: any;
  remoteCalls: any = [];;
  userInfo: any;
  appID = '68839fbf8dcc423f87c2f89fa52e975b';
  appCertificate = '03ba16b0e67f4334a597b7a5d10a5adc';
  token: any;
  chanel: any;
  role: number;
  @Output() onEndcall = new EventEmitter();
   expirationTimeInSeconds = 3600
 
 currentTimestamp = Math.floor(Date.now() / 1000)
 
 privilegeExpiredTs = this.currentTimestamp + this.expirationTimeInSeconds
  constructor(private agoraService: AngularAgoraRtcService,
    private modalService: BsModalService,
    private subjectService: SubjectService,
    private cookie: CookieService) {
    this.agoraService.createClient();
  }

  ngOnInit(): void {
    // this.role = RtcRole.PUBLISHER;
    this.subjectService.userInfo.subscribe((res) => {
      debugger;
      this.userInfo = res;
      if (!this.userInfo && this.cookie.get('account_info') && this.cookie.get('account_info') != '') {
        this.userInfo = JSON.parse(this.cookie.get('account_info'));
        
      }
    })
    
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.initAgora();
    this.client.on('stream-added', (evt: any) => {
      this.client.subscribe(evt.stream, this.handleError);
    });
    // Play the remote stream when it is subsribed
    this.client.on('stream-subscribed', (evt: any) => {
      let stream = evt.stream;
      let streamId = String(stream.getId());
      this.addVideoStream(streamId);
      stream.play(streamId);        
      
    });
    // Remove the corresponding view when a remote user unpublishes.
    this.client.on('stream-removed', function (evt) {
      console.log('1333');
      let stream = evt.stream;
      let streamId = String(stream.getId());
      stream.close();
      this.removeVideoStream(streamId);
    });
    // Remove the corresponding view when a remote user leaves the channel.
    this.client.on('peer-leave', function (evt) {
      console.log('13773');
      let stream = evt.stream;
      let streamId = String(stream.getId());
      stream.close();
      this.removeVideoStream(streamId);

    });
    
  }
  initAgora() {
    console.log(this.token);
    this.client = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'vp8',
    });
    this.client.init(
      this.token,
      () => {
        console.log('client initialized');
      },
      (err: any) => {
        console.log('client init failed ', err);
      }
    );
    // this.client.init(
    //   '68839fbf8dcc423f87c2f89fa52e975b',
    //   () => {
    //     console.log('client initialized');
    //   },
    //   (err: any) => {
    //     console.log('client init failed ', err);
    //   }
    // );
  }
  join() {
    // const chanel = this.generateChannelName();
    // const token = this.generateToken(chanel);
    // const token =
    //   '00668839fbf8dcc423f87c2f89fa52e975bIADCZrkZtVYMQsEmpQ73S5eYMkz4EDkrWFX2/0tRvAvBM2KDJSsAAAAAEAAeXT+cGc1lYAEAAQAZzWVg';
    //   const chanel = 'viet-1'
    console.log('token',this.token, '   chanhel', this.chanel)
      this.client.join(
        this.token,
      this.chanel,
      null,
      (uid: string) => {
        console.log('uid:', uid);
        this.localStream();
        // Create a local stream
      },
      (err: any) => {
        console.log('error join:', err);
      }
    );
  }
  localStream() {
    let localStream = AgoraRTC.createStream({
      audio: true,
      video: true,
    });
    // Initialize the local stream
    localStream.init(
      () => {
        console.log('localStream:', localStream);

        // Play the local stream
        localStream.play('me');
        // Publish the local stream
        this.client.publish(localStream, (err: any) => {
          console.log('error localStream:', err);
        });
      },
      (err: any) => {
        console.log('error localStream:', err);
      }
    );
  }
  // Handle errors.
  handleError(err: any) {
    console.log('Error: ', err);
  }

  // Add video streams to the container.
  addVideoStream(elementId: string) {
    // Query the container to which the remote stream belong.
    let remoteContainer: any = document.getElementById('remote-container');
    // Creates a new div for every stream
    let streamDiv = document.createElement('div');
    // Assigns the elementId to the div.
    streamDiv.id = elementId;
    // Takes care of the lateral inversion
    streamDiv.style.transform = 'rotateY(180deg)';
    // Adds the div to the container.
    remoteContainer.appendChild(streamDiv);
  }

  // Remove the video stream from the container.
  removeVideoStream(elementId: string) {
    let remoteDiv: any = document.getElementById(elementId);
    if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
  }
  async endCall() {
    console.log(11222);
    await this.client.leave();
    this.onEndcall.emit();

  }
  generateToken(chanel) {
    const tokenA = agoraToken.RtcTokenBuilder.buildTokenWithUid(this.appID, this.appCertificate, chanel, 2882341273,this.role, this.privilegeExpiredTs)
    // const tokenA = RtcTokenBuilder.buildTokenWithUid(this.appID, this.appCertificate, chanel, 2882341273,this.role, this.privilegeExpiredTs);
    // console.log("Token With Integer Number Uid: " + tokenA);
    return tokenA;
  }
  generateChannelName() {
    return 'a' + 'b';
  }
}
