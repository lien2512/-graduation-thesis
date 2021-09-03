import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase';
import moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Account } from 'src/app/class/account';
import { PopUpConfirmComponent } from 'src/app/component/pop-up-confirm/pop-up-confirm.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HelperService } from 'src/app/services/helper.service';
import { PresenceService } from 'src/app/services/presence.service';
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
    logo: '',
    advise: [],
    review: [],
    follow: [],
    follower: [],
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
  presence$: any;
  @ViewChild('templateChooseAvatar') templateChooseAvatar: TemplateRef<any>;
  @ViewChild('templateUserCropImage') cropImageModal: TemplateRef<any>;
  @ViewChild('image', { static: false }) image: ElementRef;
  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private modalService: BsModalService,
    private helperService: HelperService,
    private presence: PresenceService

  ) {
    this.initForm();

   }

  async ngOnInit() {
    await this.getData();
    console.log(this.userProfile.id);

  }
  selectTab(type) {
    this.mainTab = type;
    switch (type) {
      case 'block':
        this.getListBlock();
        break;
    }
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
    const doc = await firebase.firestore().collection('users').doc(this.currentUser.uid).get()
    const res = doc.data();
    console.log(res);
    this.userProfile.id = res.id;
    this.userProfile.logo = res.logo;
    this.userProfile.email = res.email;
    this.userProfile.displayName = res.displayName;
    this.userProfile.bio = res.bio ? res.bio : '';
    this.userProfile.gender = res.gender ;
    this.userProfile.birthday  = moment(res.birthday).format('DD-MM-YYYY');
    this.userProfile.follow = res.follow;
    this.userProfile.follower = res.follower;

    // this.userProfile.birthday = res.birthday;
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
    this.userProfile.birthday = moment(this.userProfile.birthday , 'DD/MM/YYYY').format('YYYY-MM-DD');
    console.log(this.userProfile.logo);
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
        const avtUrl = await this.firebaseService.uploadLogo(this.userProfile.logo, 'userAvt/');
        firebase.firestore().collection('users').doc(this.userProfile.id).update('logo', avtUrl);
        // this.firebaseService.updateLogo('users', this.userProfile.id, avtUrl );
        this.userProfile.logo = String(avtUrl)
      } else if (this.isRemoveLogo) {
        this.firebaseService.updateLogo('users', this.userProfile.id, '');
        this.isRemoveLogo = false;
      }
      let advise = {
        title: "Tip dưỡng da",
        content: 'Chăm sóc cho da nhạy cảm, với những kinh nghiệm từ chính bản thân mình'
      }
      this.userProfile.advise.push(advise);
      let review = {
        logo: '',
        idUser: 'DagOskGsz4bmgBmJJZJRF4SULQZ2',
        name: 'liennt1401@yopmail.com',
        reviewScore: 4,
        contentReview: "Cực kỳ nhiệt tình và thân thiện"
      }
      this.userProfile.review.push(review);
      console.log(this.userProfile.review);
      this.firebaseService.updateRef('users', this.userProfile.id,  this.userProfile);
      alert("thành công rồi");
      this.userProfile.birthday = moment(this.userProfile.birthday).format('DD-MM-YYYY');

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
  async getListBlock() {
    let res: any = await this.firebaseService.getRefById('users',this.userProfile.id);
    this.listBlock = res.listBock;
  }
  searchAccBlocked() {

  }
  async unBlockPanda(item) {
    firebase.firestore().collection('users').doc(this.userProfile.id).update({
      listBock: firebase.firestore.FieldValue.arrayRemove(item)
    });
    let beeInfo: any = await this.firebaseService.getRefById('users', item.id) ;
    let userInfo = beeInfo.blockedBy.find((item) => {return item.id == this.userProfile.id})
      firebase.firestore().collection('users').doc(item.id).update({
        blockedBy: firebase.firestore.FieldValue.arrayRemove(userInfo)
      });
    // let index = this.listBlock.findIndex((item: any) => {
    //   item.id == id
    // })
    // this.listBlock.splice(index, 1);
    // firebase.firestore().collection('users').doc(this.userProfile.id).update('listBock', this.listBlock);
    // let res: any = await this.firebaseService.getRefById('users', id);
    // let listBlocked = res.blockedBy;
    // let userBlock = listBlocked.findIndex((item: any) => {
    //   item.id == this.userProfile.id
    // })
    // listBlocked.splice(userBlock, 1);
    // firebase.firestore().collection('users').doc(id).update('blockedBy', listBlocked);

    this.getListBlock();
  }
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
    this.userProfile.logo = '../../../assets/img/blank-profile.png';
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
      this.userProfile.logo = String(reader.result);
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
  selectTabFavourite(type) {
    debugger;
    switch (type) {
      case 'follow':
        this.listFavorite = this.userProfile.follower;
        break
      case 'booked':
        this.listFavorite = [];
        break;
      case 'follower':
        this.listFavorite = this.userProfile.follow
    }
    console.log(this.listFavorite);
  }

}
