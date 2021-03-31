import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Account } from 'src/app/class/account';
import { PopUpConfirmComponent } from 'src/app/component/pop-up-confirm/pop-up-confirm.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HelperService } from 'src/app/services/helper.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-acc-setting',
  templateUrl: './acc-setting.component.html',
  styleUrls: ['./acc-setting.component.scss']
})
export class AccSettingComponent implements OnInit {
  mainTab = 'account';
  public formChangePassword: FormGroup;
  croppedImage: any = 'assets/images/default-image.png';
  public isRemoveLogo = false;
  private currentUser: Account;
  public fileData: File = null;
  resultFavorite: any;
  sameCurrentPass: boolean;
  public imageUrl: any;
  uploadGif: boolean = false;
  imageChangedEvent: any = '';
  listBlock: [];
  avatarDefault: string = '';
  favoriteSettings: any = {
    search : '',
    favoriteType: 'visitor',
    paginate: {
      id: 'fan',
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    }
  };
  blockListSetting: any = {
    search : '',
    paginate: {
      id: "block",
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    }
  }
  previewAvatar: any = [];
  email: '';
  isShowEmail: '';
  userProfile = {
    uid: '',
    id: '',
    displayName: '',
    role: '',
    bio: '',
    city: '',
    gender: '',
    birthday: '',
    email: '',
    emailVerified: false,
    avatar: '',
  } ;
  listFavorite: any;
  listAvatarDefault = [
    { id: '1', fullsrc: 'https://api.sparklepandas.uat4.pgtest.co/'+'images/avatar/avatar_01.jpg', src: 'images/avatar/avatar_01.jpg', selected: false },
    { id: '2', fullsrc: 'https://api.sparklepandas.uat4.pgtest.co/'+'images/avatar/avatar_02.jpg', src: 'images/avatar/avatar_02.jpg', selected: false },
    { id: '3', fullsrc: 'https://api.sparklepandas.uat4.pgtest.co/'+'images/avatar/avatar_03.jpg', src: 'images/avatar/avatar_03.jpg', selected: false },
    { id: '4', fullsrc: 'https://api.sparklepandas.uat4.pgtest.co/'+'images/avatar/avatar_04.jpg', src: 'images/avatar/avatar_04.jpg', selected: false },
  ]
  resultBlock: any;
  isShowPassOld = false;
  isShowPassNew = false;
  isShowPassNewRe= false;
  showMeeting: any;
  today = new Date;
  modalChooseAvatar: BsModalRef;
  modalCropImage: BsModalRef;
  maxUploadSize: number = 2000000; //max upload file size 2Mb
  @ViewChild('templateChooseAvatar') templateChooseAvatar: TemplateRef<any>;
  @ViewChild('templateUserCropImage') cropImageModal: TemplateRef<any>;
  @ViewChild('image', { static: false }) image: ElementRef;
  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private modalService: BsModalService,
    private helperService: HelperService

  ) {
    this.initForm();

   }

  async ngOnInit() {
    await this.getData();
  }
  selectTab(type) {
    this.mainTab = type;
  }
  initForm() {
    this.formChangePassword = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', Validators.required],
      newRePassword: ['', Validators.required],
    },
      {
        validator: [this.checkConfirmPassword, this.checkSamePassword, this.validatePassword]
      });

  }
  checkConfirmPassword(group: FormGroup) {
    const newPassword = group.get('newPassword').value;
    const newRePassword = group.get('newRePassword').value;

    return newPassword === newRePassword ? true : { invalidConfirmPassword: true };
  }

  checkSamePassword(group: FormGroup) {
    const newPassword = group.get('newPassword').value;
    const oldPassword = group.get('oldPassword').value;

    return newPassword != oldPassword ? true : { invalidSamePassword: true };
  }
  validatePassword(group: FormGroup) {
    const password = group.get('newPassword').value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    const validPass = regex.test(password);
    if (validPass) {
      return true;
    } else {
      return { invalidPassword: true };
    }
  }
  showPassword(id) {
    var typeInput = <HTMLInputElement>document.getElementById(id);
    if (id == 'oldPassword') {
      this.isShowPassOld = !this.isShowPassOld;
    }
    if (id == 'newPassword') {
      this.isShowPassNew = !this.isShowPassNew;
    }
    if (id == 'newRePassword') {
      this.isShowPassNewRe = !this.isShowPassNewRe;
    }
    if (typeInput.type === 'password') {
      typeInput.type = 'text';
    } else {
      typeInput.type = 'password';
    }
  }
  async getData() {

    this.currentUser = await this.authService.getCurrentUser();
    const res : any = await this.firebaseService.getRefById('users', this.currentUser.uid);
    console.log(res);
    this.userProfile = res.account;
    this.imageUrl = res.logo;

    // this.imageUrl = this.userProfile.logo;
    // this.email = this.userProfile.email;
    console.log(this.userProfile);
    
  }
  async updateBeeProfile() {
    this.firebaseService.updateRef('users', this.userProfile.uid, this.userProfile).then((res) => {

    }).catch(err => {

    })
  }
  initTabAccount() {

  }
  popupChooseAvatarDefault() {
    this.modalChooseAvatar = this.modalService.show(this.templateChooseAvatar, {
      class: 'modal-dialog-centered modal-dialog modal-lg modal-default',
      ignoreBackdropClick: true
    });
  }
  showEmail(type) {

  }
  async saveUserProfile() {
    let status = true;
    
    if (!this.userProfile.gender) {
      status = false;
    }
    if (!this.userProfile.birthday) {
      status = false;
    }
    if (status == false) {
      alert('Nhập đầy đủ thông tin');
    } else {
      if (this.fileData) {
        debugger;
        const avtUrl = await this.firebaseService.uploadLogo(this.imageUrl, 'userAvt/');
        this.firebaseService.updateLogo('users', this.userProfile.id, avtUrl );
      } else if (this.isRemoveLogo) {
        this.firebaseService.updateLogo('users', this.userProfile.id, '');
        this.isRemoveLogo = false;
      }
      // if (this.userProfile.avatar !== undefined && this.userProfile.avatar.length > 0  && this.avatarDefault == '') {
      //   if (this.uploadGif) {
      //     this.onSubmitImage(this.userProfile.avatar, 'avatar');
      //   } else {
      //     const _imageName = uuid.v4();
      //     const _blobImg = this.dataURItoBlob(this.croppedImage);
      //     const _imageFile = new File([_blobImg], _imageName + ".jpeg", {
      //       type: "'image/jpeg'"
      //     });
      //     this.onSubmitImage([_imageFile], 'avatar');
      //   }
      // } else if (this.avatarDefault){
      //   this.userProfile.avatarUrl = this.avatarDefault;
      // }
      this.firebaseService.updateRef('users', this.userProfile.id, {account: this.userProfile});
      alert("thành công rồi");
    }
  }
  initTabFavorite() {

  }
  searchPandas() {

  }
  favoriteTypeChange(type) {

  }
  unInteractivePanda(item) {

  }
  navigateToPandaProfile(name, id) {

  }
  getListBlock() {

  }
  searchAccBlocked() {

  }
  unBlockPanda(item) {}
  listBlockChange(type) {}
  initTabChangePassword() {

  }
  changePassword() {

  }
  initTabChangeOrder() {

  }
  openChatBox(item) {

  }
  favoritePageChange(event) {

  }
  changeInputCurrentPass() {

  }
  closeChooseAvatar() {
    this.modalChooseAvatar.hide();
  }
  chooseAvatar(e) {
    this.previewAvatar = [];
    this.userProfile.avatar = e.target.files;
    for (let i = 0; i < this.userProfile.avatar.length; i++) {
      this.previewImage(this.userProfile.avatar[i], () => {
        if (!this.uploadGif) {
          const _originAvatar = (this.previewAvatar[0].origin !== undefined && this.previewAvatar[0].origin) ? this.previewAvatar[0].origin : this.previewAvatar[0].url;
          this.previewAvatar = [
            { url: e, size: null, origin: _originAvatar }
          ];
          this.avatarDefault = '';
          this.fileChangeEvent(e);
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
  removeImage() {
    this.image.nativeElement.value = '';
    this.imageUrl = '../../../assets/img/blank-profile.png';
    this.userProfile.avatar = '';
    this.isRemoveLogo = true;
  }
  previewImage(file, callback: any = false, index = null) {
    // let mimeType = file.type;
    // if (mimeType.match(/image\/*/) == null) {
    //   this.helperService.showError('', 'Vui lòng chọn ảnh');
    //   return;
    // }

    // this.uploadGif = false;
    // if (mimeType == 'image/gif') {
    //   this.uploadGif = true;
    // }

    // let reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.onload = (_event) => {
    //   if (file.size >= this.maxUploadSize) {
    //     this.helperService.showError('', 'Dung lượng ảnh không vượt quá 2MB');
    //     this.userProfile.avatar = [];
    //   } else {
    //       this.previewAvatar = [];
    //       this.previewAvatar.push({ url: reader.result, size: file.size });
    //     if (callback !== undefined) {
    //       callback();
    //     }
    //   }
    // }
  }
  handleFileInput(fileInput: any) {
    this.fileData = fileInput.target.files[0] as File;
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (event) => {
      this.imageUrl = reader.result;
    };
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  setImagetoAvatar(){
    let url = this.listAvatarDefault.filter(x => x.selected).map(y => y.src);
    if (url.length > 0){
      this.previewAvatar = [];
      this.avatarDefault = url[0];
      this.previewAvatar.push({ url: `https://api.sparklepandas.uat4.pgtest.co/`+url, size: 0 });
      this.closeChooseAvatar();
    }
  }
  selectedImagetoAvatar(id){
    this.listAvatarDefault.forEach( i => {
      i.selected = false;
      if (i.id == id){
        i.selected = true;
      }
    });
  }
  cancelCropImage() {
    this.croppedImage = this.previewAvatar[0].origin;
    this.previewAvatar[0].url = this.croppedImage;
    this.modalCropImage.hide();
  }
  saveCropImage() {
    setTimeout(() => {
      this.modalCropImage.hide();
    }, 1000);
  }
  imageCropped(event: ImageCroppedEvent) {
    this.avatarDefault = '';
    this.croppedImage = event.base64;
    this.previewAvatar[0].url = this.croppedImage;
  }

}
