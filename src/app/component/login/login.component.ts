import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import firebase from 'firebase';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper.service';
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
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private modalService: BsModalService,
    private router: Router,
    private helperService : HelperService
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
        console.log(res);
        const user: firebase.User = res.user;
        this.helperService.showSuccess('', 'Đăng nhập thành công');
        this.closeLoginModal();
        if (user.emailVerified) {
        this.firebaseService.updateRef('users', user.uid, {emailVeried: true});
        this.router.navigate(['/account-setting']);
        }
      
    }).catch(err => {
      switch (err.code) {
        case 'auth/user-not-found':
          this.helperService.showError('error', 'Tài khoản chưa được đăng ký');
          break;
        default:
          this.helperService.showError('error', err.message);
          break;
      }
    })

  }
  signUp() {
    this.authService.signup(this.formSignUp.value).then((res: any) => {
      console.log(res);
        this.firebaseService.createUserInfo(res.user.uid, this.formSignUp.value);
        this.sendEmailVerify();
        this.closeLoginModal();
      
       
        
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


}
