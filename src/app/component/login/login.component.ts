import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import firebase from 'firebase';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper.service';
import { SubjectService } from 'src/app/services/subject.service';
import { CookieService } from 'ngx-cookie-service';
import { Account } from 'src/app/class/account';
import { stringify } from '@angular/compiler/src/util';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [FormBuilder]
})
export class LoginComponent implements OnInit {
  public emailPattern = '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$';
  public formLogin: FormGroup;
  public formSignUp: FormGroup;
  back= false;
  isShowPass = false
  @Output() onClose = new EventEmitter();
  @Output() onLoginSuccess = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private modalService: BsModalService,
    private router: Router,
    private helperService : HelperService,
    private subjectService: SubjectService,
    private cookie: CookieService,

  ) { }

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.formSignUp = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      c_password: ['', Validators.required],
     
    }, {
        validator: [this.checkConfirmPassword, this.validatePassword]
      });
  }
  validatePassword(group: FormGroup) {
    const password = group.get('password').value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
      const validPass = regex.test(password);
      if (validPass) {
        return true;
      } else {
        return { invalidPassword: true };
      }
    
  }
  checkConfirmPassword(group: FormGroup) {
    const password = group.get('password').value;
    const confirmPassword = group.get('c_password').value;

    return password === confirmPassword ? true : { invalidConfirmPassword: true };
  }
  closeLoginModal() {
    this.onClose.emit();
    this.modalService._hideModal(1);
  }
  login() {
    this.authService.login(this.formLogin.value).then((res: any) => {
        const user: firebase.User = res.user;
        // if (user.emailVerified) {
          const newUser: Account = {} as Account;
          newUser.displayName = user.displayName
          newUser.id = user.uid;
          newUser.email = this.formLogin.value.email;
          newUser.emailVerified = false;
          newUser.role = 'user';
          newUser.status = 'online';
          this.firebaseService.updateRef('users', user.uid,  newUser );
          localStorage.setItem('user_data', JSON.stringify({
            token: user.refreshToken,
            data: newUser
          }))
          this.cookie.set('jwt_access_token', user.refreshToken, 365, '/');
          this.cookie.set('account_info', JSON.stringify(newUser), 365, '/')
          debugger;
          this.subjectService.userInfo.next(newUser);
          
          // this.router.navigate(['/account-settings']);
  
        // } else {
        //   this.helperService.showError('error', "Đăng nhập thất bại");
        // }
        this.closeLoginModal();
      
    }).catch(err => {
      debugger
      switch (err.code) {
        case 'auth/user-not-found':
          this.helperService.showError('error', 'Tài khoản chưa được đăng ký');
          break;
        default:
          this.helperService.showError('error', "Đăng nhập thất bại");
          alert('Đăng nhập thất bại')
          break;
      }
    })

  }
  signUp() {
    this.authService.signup(this.formSignUp.value).then((res: any) => {
      const newUser: firebase.User = res.user;
      newUser.updateProfile({
        displayName: this.formSignUp.value.name
      });
      this.createUserInfo(newUser);
      newUser.sendEmailVerification();
      this.closeLoginModal();
      this.helperService.showSuccess('success', 'Đăng ký thành công');        
    }).catch(err => {
      this.helperService.showError('error', err.message);
    })
  }
  async sendEmailVerify() {
    firebase.auth().currentUser.sendEmailVerification().then((res) => {
      console.log('sended');
    })
  }
  showPassword() {

  }
  loginSuccess(res) {
    debugger;
    const accessToken = res.data.access_token;
    const userInfo = res.data.user_infos;
    localStorage.setItem('user_data', JSON.stringify({
      token: accessToken,
      data: userInfo
    }));
    this.cookie.set('jwt_access_token', accessToken, 365, '/');
    this.cookie.set('account_info', JSON.stringify(userInfo), 365, '/');
    this.onLoginSuccess.emit();
    this.closeLoginModal();
    this.helperService.showSuccess('', 'Đăng nhập thành công');
    setTimeout(() => {
      this.subjectService.userInfo.next(userInfo);
    }, 200);
  }
  createUserInfo(userInfo) {
    console.log(this.formSignUp);
    const user: Account = {} as Account;
    user.displayName = this.formSignUp.value.name;
    user.email = userInfo.email;
    user.emailVerified = false;
    this.firebaseService.createUserInfo(userInfo.uid,  user);
  }


}
