import { Component, OnInit, ViewChild, ElementRef, NgZone, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
// import Peer from 'peerjs';
// import * as Peer from 'peerjs';
import Peer from 'peerjs';
import { PopUpConfirmComponent } from 'src/app/component/pop-up-confirm/pop-up-confirm.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SubjectService } from 'src/app/services/subject.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent implements OnInit {
  private peer: any;
  peerIdShare: string;
  peerId: string;
  private lazyStream: any;
  currentPeer: any;
  userInfo: any;
  private peerList: Array<any> = [];
  isAccept: boolean;
  notiModalRef: BsModalRef;
  @ViewChild('notificationCall') notificationCall: TemplateRef<any>;
  constructor(
    private subjectService: SubjectService,
    private cookie: CookieService,
    private authService: AuthService,
    private modalService: BsModalService
  ) {
    this.peer = new Peer() }

  ngOnInit(): void {
    this.subjectService.userInfo.subscribe((res) => {
      this.userInfo = res;
      if (!this.userInfo && this.cookie.get('account_info') && this.cookie.get('account_info') != '') {
        this.userInfo = JSON.parse(this.cookie.get('account_info'));
      }
    })
    this.getPeerId();
  }

  private getPeerId = () => {
    this.peer.on('open', (id) => {
      // this.peerId = id;
      this.peerId = '598b2502-7786-4947-a93b-' + this.userInfo.id.slice(16,30);
      // this.peerId = this.userInfo.id;
    });

    this.peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then((stream) => {
        this.lazyStream = stream;

        call.answer(stream);
        call.on('stream', (remoteStream) => {
          debugger;
          if (!this.peerList.includes(call.peer)) {
            debugger;
            if (document.getElementsByClassName('calling').length < 1) {
              this.notiModalRef = this.modalService.show(PopUpConfirmComponent, {
                class: 'modal-default calling',
                initialState: {
                  confirmText: 'Chấp nhận cuộc gọi',
                  confirmButton: 'Đồng ý',
                  cancelButton: "Huỷ",
                  confirmTitle: "Cuộc gọi đến"
                }
              });
              this.notiModalRef.content.onCancel.subscribe(() => {
                this.notiModalRef.hide();
                stream.getTracks().map(t => t.kind == 'video' && t.stop());
                stream.getTracks().map(t => t.kind == 'audio' && t.stop());
                // alert('từ chối');
                return;
              });
              this.notiModalRef.content.onConfirm.subscribe(() => {
                this.notiModalRef.hide();
                this.streamRemoteVideo(remoteStream);
              this.currentPeer = call.peerConnection;
              this.peerList.push(call.peer);
              })
            }
            
            
            
            
          }
        });
        call.on('close', function () {
          alert("The videocall has finished");
          document.getElementById("online-viceo").remove();
          stream.getTracks().map(t => t.kind == 'video' && t.stop());
          stream.getTracks().map(t => t.kind == 'audio' && t.stop());

      });
      }).catch(err => {
        console.log(err + 'Unable to get media');
      });
      console.log(navigator.mediaDevices);
    });
  }

  connectWithPeer(): void {
    this.callPeer(this.peerIdShare);
  }

  private callPeer(id: string): void {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      let pc = new RTCPeerConnection();
      
      this.lazyStream = stream;
      console.log(stream);
      debugger;
      const call = this.peer.call(id, stream);
      call.on('stream', (remoteStream) => {
        debugger;
        if (!this.peerList.includes(call.peer)) {
          this.streamRemoteVideo(remoteStream);
          this.currentPeer = call.peerConnection;
          this.peerList.push(call.peer);
          console.log(this.currentPeer);
          console.log(stream);
        }
      });
      call.on('close', function () {
        alert("The videocall has finished");
        document.getElementById("online-viceo").remove();
        stream.getTracks().map(t => t.kind == 'video' && t.stop());
        stream.getTracks().map(t => t.kind == 'audio' && t.stop());
        // this.lazyStream.active = false;
    });
    }).catch(err => {
      console.log(err + 'Unable to connect');
    });
    console.log(navigator.mediaDevices);
  }
  endPeer(id) {
    this.peer.destroy();
  }

  private streamRemoteVideo(stream: any): void {
    const video = document.createElement('video');
    video.classList.add('video');
    video.id = "online-viceo";
    video.srcObject = stream;
    video.play();

    document.getElementById('remote-video').append(video);
  }

  screenShare(): void {
    this.shareScreen();
  }

  private shareScreen(): void {
    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then(stream => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      const sender = this.currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
    }).catch(err => {
      console.log('Unable to get display media ' + err);
    });
  }

  private stopScreenShare(): void {
    const videoTrack = this.lazyStream.getVideoTracks()[0];
    const sender = this.currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }
  declineMeeting() {
    this.isAccept = false;
  }
  pandaAcceptMeeting() {
    this.isAccept = true;
  }
  openCallingNotification(template: TemplateRef<any>) {
    // this.ringingAudio.play();
    
  }
  test() {
    this.notiModalRef = this.modalService.show(PopUpConfirmComponent, {
      class: 'modal-default',
      initialState: {
        confirmText: 'Chấp nhận cuộc gọi',
        confirmButton: 'Đồng ý',
        cancelButton: "Huỷ",
        confirmTitle: "Cuộc gọi đến"
      }
    });
    this.notiModalRef.content.onCancel.subscribe(() => {
      this.notiModalRef.hide();
      
      // alert('từ chối');
      return;
    });
    this.notiModalRef.content.onConfirm.subscribe(() => {
      this.notiModalRef.hide();
    })
  }


}

