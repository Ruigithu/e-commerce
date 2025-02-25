import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {LoginResponse} from './loginresponse.model'

@Component({
  selector: `login-page`,
  template: `
    <div class="login-container">
      <form class="form-container" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <label id="css">username:
          <br/>
          <input class="signin-input" id="username" formControlName="username"
                 type="text">
        </label>
        <label >password:
          <br/>
          <input class="signin-input" id="password" formControlName="password"
                 type="password"/>
        </label>
        <button class="signin-submit" type="submit">Sign in</button>
        <br/>
        <div><a href="/signup">not have an account?click here to signup</a></div>
      </form>
    </div>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  styles: `
    body {
      background: #dddddd;
    }

    .form-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    #css {
      margin-top: 200px;
    }

    .signin-input {
      width: 300px;
      height: 30px;
      margin: 15px;
      border-radius: 8px;
      font-size: 16px;
    }

    .signin-submit {
      width: 300px;
      height: 35px;
      border-radius: 10px;
      background-color: cadetblue;
      color: white;
      font-size: 16px;
      border: none;
      margin-top: 30px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .signin-submit:hover {
      background-color: #4F8A8B;
    }
  `
})

export class LoginPageComponent {
  loginForm: FormGroup


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router // 注入 Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
    console.log(this.loginForm.value.username)
      this.http.post<LoginResponse>('http://localhost:8080/login', {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      }, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
        }).subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            const body = response.body; // 获取响应体
            if (body && body.userId !== undefined) {
              localStorage.setItem('userId', String(body.userId));
              console.log(localStorage.getItem('userId'));
              localStorage.setItem('userName',String(body.userName));
              console.log('Stored userName:', localStorage.getItem('userName'));

              localStorage.setItem('defaultAddress',JSON.stringify(body.defaultAddress));

            } else {
              console.error('User ID is missing in response');
            }
            if (localStorage.getItem('redirectAfterLogin')!==null){
              const redirectUrl = localStorage.getItem('redirectAfterLogin');
              if (redirectUrl) {
                try {
                  const url = new URL(redirectUrl);
                  // 只使用路径部分，不包括域名
                  this.router.navigate([url.pathname.substring(1)]);  // 移除开头的 '/'
                } catch {
                  // 如果不是完整 URL，直接使用
                  this.router.navigate([redirectUrl]);
                }
              }
            }else{
              this.router.navigate(['/home']);
            }

          },
          error: (error) => {
            console.error('Login failed:', error);
            // 处理登录失败的逻辑，例如显示错误信息
          }
        });
      } else {
        console.log('Form is invalid');
      }
    }
  }
