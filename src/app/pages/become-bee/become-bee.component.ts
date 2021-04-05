import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { HelperService } from 'src/app/services/helper.service';
import { SubjectService } from 'src/app/services/subject.service';
import {BLOCK_TIME} from 'src/app/class/contants'
import * as uuid from 'uuid';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-become-bee',
  templateUrl: './become-bee.component.html',
  styleUrls: ['./become-bee.component.scss']
})
export class BecomeBeeComponent implements OnInit {
  @ViewChild('templateCropImage') cropImageModal: TemplateRef<any>;
  @ViewChild('templateChooseAvatar') templateChooseAvatar: TemplateRef<any>;
  loading = false;
  maxUploadSize = 5000000; //max upload file size 2Mb
  maxUploadVideoSize = 50000000; //max upload video size 50Mb
  self_introduction = {
    en: '',
    zh: ''
  };
  beeProfile = {
    displayName: '',
    id: '',
    uid: '',
    video: [],
    avatar: [],
    avatarUrl: '',
    imageMember: [],
    birthday: '',
    tags: [],
    languages: [],
    bio: [],
    gender: 'Select Gender',
    role: ''
  };
  fromPage = '';
  previewAvatar: any = [];
  uploadGif = false;
  statusUpVideo: boolean;
  statusUpdate: boolean;
  moment = moment();
  userInfo: any;
  blockTime = BLOCK_TIME;
  imageChangedEvent: any = '';
  avatarDefault = '';
  modalCropImage: BsModalRef | null;
  modalChooseAvatar: BsModalRef;
  previewVideo: any = [];
  today = new Date;
  previewMember = [];
  previewNonMember: any = [];
  cropLoading = false;
  croppedImage: any = '';
  imageType = {
    banner: 'banner',
    avatar: 'avatar',
    imageNonMember: 'membership',
    imageMember: 'non-membership'
  };
  modalConfirmDeleteImage: BsModalRef;
  listAvatarDefault = [
    { id: '1', fullsrc: 'https://api.sparklepandas.uat4.pgtest.co/'+'images/avatar/avatar_01.jpg', src: 'images/avatar/avatar_01.jpg', selected: false },
    { id: '2', fullsrc: 'https://api.sparklepandas.uat4.pgtest.co/'+'images/avatar/avatar_02.jpg', src: 'images/avatar/avatar_02.jpg', selected: false },
    { id: '3', fullsrc: 'https://api.sparklepandas.uat4.pgtest.co/'+'images/avatar/avatar_03.jpg', src: 'images/avatar/avatar_03.jpg', selected: false },
    { id: '4', fullsrc: 'https://api.sparklepandas.uat4.pgtest.co/'+'images/avatar/avatar_04.jpg', src: 'images/avatar/avatar_04.jpg', selected: false },
  ]
  tags: any = [];
  tagsEN = ['Fun', 'Pretty', 'Cute', 'Sweet Voice', 'Epic Gamer', 'Cosplay', 'Asian', 'Blonde', 'Talents'];
  autocompleteTags = this.tagsEN;




  constructor(
    private helperService: HelperService,
    public router: Router,
    private cookie: CookieService,
    private modalService: BsModalService,
    private subjectService: SubjectService,
    private activatedRoute: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.fromPage = this.router.getCurrentNavigation().extras.state.from_page ? this.router.getCurrentNavigation().extras.state.from_page : '';
    }
  }

  ngOnInit(): void {
    this.subjectService.userInfo.subscribe((res: any) => {
      this.userInfo = res;
      if (!this.userInfo && this.cookie.get('account_info') && this.cookie.get('account_info') != '') {
        this.userInfo = JSON.parse(this.cookie.get('account_info'));
      };
      if (!this.userInfo)
        this.router.navigate(['']);
    });
    this.getRegisterInfo();
  }

  async getRegisterInfo() {
    this.previewAvatar = [];
    let res: any = await this.firebaseService.getRefById('users',this.userInfo.id);
    this.beeProfile.displayName = res.displayName;
    this.beeProfile.gender = res.gender;
    this.beeProfile.birthday = res.gender;
    this.beeProfile.id = res.id;
    this.beeProfile.bio = res.bio;
    this.previewAvatar.push({url: res.logo });
    // console.log(await this.firebaseService.getRefById('users',this.userInfo.id));
  }

  popupChooseAvatarDefault() {
    this.modalChooseAvatar = this.modalService.show(this.templateChooseAvatar, {
      class: 'modal-dialog-centered modal-dialog modal-lg modal-default chooseAvatar',
      ignoreBackdropClick: true
    });
  };

  chooseImageAvatar(e, type) {
    this.beeProfile.avatar = e.target.files;
    if (this.beeProfile.avatar.length > 0) {
      this.previewAvatar = [];
    }
    for (let i = 0; i < this.beeProfile.avatar.length; i++) {
      this.previewImage(this.beeProfile.avatar[i], type, () => {
        if (!this.uploadGif) {
          this.imageChangedEvent = e;
          const _originAvatar = (this.previewAvatar[0].origin !== undefined && this.previewAvatar[0].origin) ? this.previewAvatar[0].origin : this.previewAvatar[0].url;
          this.previewAvatar = [
            { url: e, size: null, origin: _originAvatar }
          ];
          this.avatarDefault = '';
          // Open crop modal
          this.modalCropImage = this.modalService.show(this.cropImageModal, {
            class: 'modal-dialog-centered modal-dialog modal-lg modal-default',
            ignoreBackdropClick: true
          });
        }
      });
    }
    this.closeChooseAvatar();
  }

  closeChooseAvatar() {
    this.modalChooseAvatar.hide();
  }

  previewImage(file, type, callback, index = null) {
    let mimeType = file?.type;
    if(!mimeType || mimeType == undefined ) return;
    if (mimeType.match(/image\/*/) == null) {
      this.helperService.showError('', "Vui lòng chọn ảnh");
      return;
    }

    this.uploadGif = false;
    if (mimeType == 'image/gif') {
      this.uploadGif = true;
    }

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      if (file.size >= this.maxUploadSize) {
        this.helperService.showError('', 'CHọn ảnh có dung lượng nhỏ hơn 2MB');
        this.beeProfile.avatar = [];
      } else {
        if (type == this.imageType.avatar){
          this.previewAvatar = [];
          this.previewAvatar.push({ url: reader.result, size: file.size });
        }
        if (type == this.imageType.imageMember)
          this.previewMember.push({ url: reader.result, size: file.size });
        if (callback !== undefined) {
          callback();
        }
      }
    };
  }

  setImagetoAvatar(){
    let url = this.listAvatarDefault.filter(x => x.selected).map(y => y.src);
    if (url.length > 0){
      this.previewAvatar = [];
      this.avatarDefault = url[0];
      this.previewAvatar.push({ url: ``+url, size: 0 });
      this.closeChooseAvatar();
    }
  }

  dataURItoBlob(dataURI) {

    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  imageCropped(event: ImageCroppedEvent, type, image) {
    image = '';
    this.croppedImage = event.base64;
    type[0].url = this.croppedImage;
  }
  cancelCropImage(type: any) {
    this.croppedImage = type[0].origin;
    type[0].url = this.croppedImage;
    this.modalCropImage.hide();
  }
  saveCropImage() {
    this.cropLoading = true;
    setTimeout(() => {
      this.cropLoading = false;
      this.modalCropImage.hide();
    }, 1000);
  };

  setGender(gender) {
    this.beeProfile.gender = gender;
  }

  onTagAdded($event) {
    this.tags.push($event.value);
  }

  onTagRemoved($event){
    let index = this.tags.indexOf($event);
    this.tags.splice(index, 1);
  }

  chooseImage(e: any, type): void {
    let fileData = e.target.files;
    let previewImgCount = (type == this.imageType.imageNonMember ? this.previewNonMember.length : this.previewMember.length);
    let count = 10 - previewImgCount;
    for (let i = 0; i < count; i++) {
      if (i >= 10) {
        fileData.splice(i, 1); //remove
      } else {
        this.previewImage(fileData[i], type, () => { });
      }
    }
    
  }

  removeEachImage(index, type, idImg?) {
    
      
        this.previewMember.splice(index, 1);
      if (idImg) {
        // this.apiService.removeEachImage(idImg).subscribe(response => {
        //   if (response['code'] == STATUS_CODE.SUCCESS) {
        //   }
        // });
      }

  }

  previewVideos(file) {
    let mimeType = file.type;
    if (mimeType.match(/video\/*/) == null) {
      this.helperService.showError('', "Vui lòng chọn ảnh");
      return;
    }

    if (file) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        if (file.size >= this.maxUploadVideoSize) {
          this.helperService.showError('', "Dung lượng tối đa 5MB");
        } else {
          this.previewVideo = (<FileReader>event.target).result;
        }
      }
    }
  }

  chooseVideo(e) {
    this.beeProfile.video = e.target.files;
    for (let i = 0; i < this.beeProfile.video.length; i++) {
      this.previewVideos(this.beeProfile.video[i]);
    }
  }

  removeVideo() {
    this.previewVideo = [];
    this.beeProfile.video = [];
  }

  async updateBeeProfile() {
    debugger;
    this.beeProfile.tags = this.tags;
    this.beeProfile.imageMember = this.previewMember;
    if (this.beeProfile.imageMember.length > 0) {
      let avtUrls = [];
      this.beeProfile.imageMember.forEach(async (item) => {
        console.log(item);
        let avtUrl = await this.firebaseService.uploadLogo(item.url, 'userAvt/');
        avtUrls.push(avtUrl);
      })
      this.beeProfile.imageMember = avtUrls;
    }
    this.beeProfile.avatar = this.previewAvatar;
    let status = true;
    if (!this.beeProfile.bio ){
      this.helperService.showError('Fail!', "Vui lòng giới thiệu bản thân");
      status = false;
    }
    if (this.beeProfile.tags.length == 0){
      this.helperService.showError('Fail!', "Vui lòng chọn hastag");
      status = false;
    }
    if (!this.beeProfile.birthday){
      this.helperService.showError('Fail!', "Vui lòng nhập ngày sinh");
      status = false;
    }
    
    if (this.beeProfile.gender == 'Select Gender'){
      this.helperService.showError('Fail!', "Vui lòng chọn giới tính");
      status = false;
    }
    if (this.beeProfile.avatar.length == 0 && this.avatarDefault == '') {
      this.helperService.showError('Fail!', "Hãy chọn ảnh đại diện");
      status = false;
    }
    if (this.beeProfile.imageMember.length == 0) {
      this.helperService.showError('Fail!', "Hãy tải một ảnh nào đó");
      status = false;
    }
    if (status == false) return false;
    this.beeProfile.birthday = moment(this.beeProfile.birthday , 'DD/MM/YYYY').format('YYYY-MM-DD');
    this.helperService.showFullLoading();
    
    // var id = setInterval(() => {
    //   if ((this.beeProfile.video.length == 0 || this.statusUpVideo) && this.statusUpdate) {
    //     clearInterval(id);
    //     this.helperService.hideFullLoading();
    //     let userInfo = JSON.parse(this.cookie.get('account_info'));
    //     this.cookie.set('account_info', JSON.stringify(null));
    //     userInfo.role = 'bee';
    //     this.cookie.set('account_info', JSON.stringify(userInfo));
    //     this.subjectService.userInfo.next(userInfo);
    //   }
    // }, 200);
    // if (this.beeProfile.video.length > 0) {
    //   this.onSubmitVideo(this.beeProfile.video);
    // }
    //upload avatar
    if (this.beeProfile.avatar.length > 0 && this.avatarDefault == '') {
      if (this.uploadGif) {
        this.onSubmitImage(this.beeProfile.avatar, 'avatar');
      } else {
        // const _imageName = uuid.v4();
        // const _blobImg = this.dataURItoBlob(this.croppedImage);
        // const _imageFile = new File([_blobImg], _imageName + ".jpeg", {
        //   type: "'image/jpeg'"
        // });
        // this.onSubmitImage([_imageFile], 'avatar');
      }
    } else if (this.avatarDefault){
      this.beeProfile.avatarUrl = this.avatarDefault;
    }
    this.beeProfile.role = 'bee';
    this.beeProfile.displayName = this.userInfo.displayName;
    this.beeProfile.video = []
    console.log(1111, this.beeProfile);
    this.firebaseService.updateRef('users',this.userInfo.id,  this.beeProfile);
      alert("thành công");
      this.subjectService.userInfo.next(this.beeProfile);
      this.router.navigate(['/account-setting'])

  }

  onSubmitVideo(fileData) {
    let myFormData = new FormData();
    for (let i = 0; i < fileData.length; i++) {
      myFormData.append('video', fileData[i]);
    }
    
  }

  onSubmitImage(fileData, type) {
    let myFormData = new FormData();
    for (let i = 0; i < fileData.length; i++) {
      myFormData.append('image[]', fileData[i]);
    }
    myFormData.append('type', type);

    
  }
}
function PopupConfirmComponent(PopupConfirmComponent: any, arg1: { class: string; initialState: { confirmText: any; }; }): any {
  throw new Error('Function not implemented.');
}

