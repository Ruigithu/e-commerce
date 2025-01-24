import {Component} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: `signup-page`,
  template: `
    <div class="signup-container">
      <form class="form-container" [formGroup]="signupForm" (ngSubmit)="onSubmit()">
        <label id="top"> username:
          <br/>
          <input class="signup-input" id="username"
                 type="text" formControlName="username"/>
        </label>

        <label>firstname:
          <br/>
          <input class="signup-input" id="firstname"
                 type="text" formControlName="firstname"/>
        </label>
        <label>lastname:
          <br/>
          <input class="signup-input" id="lastname"
                 type="text" formControlName="lastname"
          />
        </label>
        <label>password:
          <br/>
          <input class="signup-input" id="password"
                 type="password" formControlName="password"/>
        </label>
        <label>email:
          <br/>
          <input class="signup-input" id="email"
                 type="text" formControlName="email"
          />
        </label>
        <label>phone:
          <br/>
          <input class="signup-input" id="phone"
                 type="text" formControlName="phone"
          />
        </label>
        <button class="signup-submit" type="submit">Sign up</button>
      </form>

    </div>
  `,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  styles: `
    .form-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    #top {
      margin-top: 100px;
    }

    .signup-input {
      width: 300px;
      height: 30px;
      margin: 15px;
      border-radius: 8px;
      font-size: 16px;
    }

    .signup-submit {
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

    .signup-submit:hover {
      background-color: #4F8A8B;
    }
  `
})

export class SignupPageComponent{
  signupForm: FormGroup

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {

      this.http.post('http://localhost:8080/users/signup', {
        username: this.signupForm.value.username,
        firstname: this.signupForm.value.firstname,
        lastname: this.signupForm.value.lastname,
        password: this.signupForm.value.password,
        phone: this.signupForm.value.phone,
        email:this.signupForm.value.email,
      }, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
      }).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          // 处理登录成功的逻辑，例如跳转到首页

        },
        error: (error) => {
          console.error('Signup failed:', error);
          // 处理登录失败的逻辑，例如显示错误信息
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }

}
