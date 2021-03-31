import { Component, OnInit } from '@angular/core';
// import { AngularAgoraRtcService } from 'angular-agora-rtc/lib/angular-agora-rtc.service';
import { Stream } from 'src/app/class/Stream';
import { AngularAgoraRtcService } from 'src/app/services/angular-agora-rtc.service';
import * as AgoraRTC from 'agora-rtc-sdk'
@Component({
  selector: 'app-agora-call',
  templateUrl: './agora-call.component.html',
  styleUrls: ['./agora-call.component.scss']
})
export class AgoraCallComponent implements OnInit {
  activeCall: boolean = false;
  audioEnabled: boolean = true;
  videoEnabled: boolean = true;
  client: any;
  remoteCalls: any = [];
  constructor(
    private agoraService: AngularAgoraRtcService
  ) {
    this.agoraService.createClient();
   }

  ngOnInit(): void {
    this.initAgora();
    this.client.on("stream-added", (evt: any) => {
      this.client.subscribe(evt.stream, this.handleError);
    });
    // Play the remote stream when it is subsribed
    this.client.on("stream-subscribed", (evt: any) => {
      let stream = evt.stream;
      let streamId = String(stream.getId());
      this.addVideoStream(streamId);
      stream.play(streamId);
    });
  }
  initAgora() {
    this.client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });
    this.client.init("68839fbf8dcc423f87c2f89fa52e975b", () => {
      console.log("client initialized");
    }, (err: any) => {
      console.log("client init failed ", err);
    });
  }
  join() {
    const token = '00668839fbf8dcc423f87c2f89fa52e975bIADCZrkZtVYMQsEmpQ73S5eYMkz4EDkrWFX2/0tRvAvBM2KDJSsAAAAAEAAeXT+cGc1lYAEAAQAZzWVg'
    const chanel = 'test-1'
    this.client.join(token, chanel, null, (uid: string) => {
      console.log('uid:', uid);
      this.localStream()
      // Create a local stream
    }, (err: any) => {
      console.log('error join:', err);
    });
  }
  localStream() {
    let localStream = AgoraRTC.createStream({
      audio: true,
      video: true,
    });
    // Initialize the local stream
    localStream.init(() => {
      console.log('localStream:',localStream);
      
      // Play the local stream
      localStream.play("me");
      // Publish the local stream
      this.client.publish(localStream, (err: any) => {
        console.log('error localStream:', err);
      });
    }, (err: any) => {
      console.log('error localStream:', err);
    });
  }
  // Handle errors.
  handleError(err: any) {
    console.log("Error: ", err);
  };

  // Add video streams to the container.
  addVideoStream(elementId: string) {
    // Query the container to which the remote stream belong.
    let remoteContainer: any = document.getElementById("remote-container");
    // Creates a new div for every stream
    let streamDiv = document.createElement("div");
    // Assigns the elementId to the div.
    streamDiv.id = elementId;
    // Takes care of the lateral inversion
    streamDiv.style.transform = "rotateY(180deg)";
    // Adds the div to the container.
    remoteContainer.appendChild(streamDiv);
  };

  // Remove the video stream from the container.
  removeVideoStream(elementId: string) {
    let remoteDiv: any = document.getElementById(elementId);
    if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
  };
  async endCall() {
    await this.client.leave();
  }

}
