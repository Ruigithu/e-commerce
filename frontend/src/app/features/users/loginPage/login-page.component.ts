import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {LoginResponse} from './loginresponse.model';
import {CommonModule} from '@angular/common';
import {environment} from '../../../../environments/environment.prod';

@Component({
  selector: `login-page`,
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <img src="assets/icons/shopper.png" alt="BuyBuy Logo" class="logo">
          <h1>Welcome Back</h1>
          <p>Sign in to your BuyBuy account</p>
        </div>

        <form class="login-form" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-container">
              <i class="fa-solid fa-user"></i>
              <input
                id="username"
                formControlName="username"
                type="text"
                placeholder="Enter your username"
                [class.error]="isFieldInvalid('username')"
              >
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('username')">
              Username is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-container">
              <i class="fa-solid fa-lock"></i>
              <input
                id="password"
                formControlName="password"
                [type]="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                [class.error]="isFieldInvalid('password')"
              >
              <button
                type="button"
                class="toggle-password"
                (click)="togglePasswordVisibility()"
              >
                <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              Password is required
            </div>
          </div>

          <div class="form-options">
            <div class="remember-me">
              <input type="checkbox" id="remember">
              <label for="remember">Remember me</label>
            </div>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>

          <button
            type="submit"
            class="login-button"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Sign In</span>
            <div *ngIf="isLoading" class="button-spinner"></div>
          </button>

          <div class="error-alert" *ngIf="errorMessage">
            <i class="fa-solid fa-circle-exclamation"></i>
            {{errorMessage}}
          </div>
        </form>

        <div class="login-footer">
          <p>Don't have an account? <a routerLink="/signup">Sign up</a></p>
          <a routerLink="/home" class="back-to-home">
            <i class="fa-solid fa-arrow-left"></i>
            Back to home
          </a>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule
  ],
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9f9f9;
      padding: 2rem 1rem;
    }

    .login-container {
      width: 100%;
      max-width: 420px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      width: 60px;
      height: 60px;
      margin-bottom: 1rem;
    }

    .login-header h1 {
      font-size: 1.8rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .login-header p {
      color: #666;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      color: #555;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-container i {
      position: absolute;
      left: 1rem;
      color: #666;
    }

    input {
      width: 100%;
      padding: 0.9rem 1rem 0.9rem 2.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #578E7E;
      box-shadow: 0 0 0 2px rgba(87, 142, 126, 0.2);
    }

    input.error {
      border-color: #ff5252;
      background-color: rgba(255, 82, 82, 0.05);
    }

    input.error:focus {
      box-shadow: 0 0 0 2px rgba(255, 82, 82, 0.2);
    }

    .error-message {
      color: #ff5252;
      font-size: 0.8rem;
      margin-top: 0.5rem;
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .remember-me input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .forgot-password {
      color: #578E7E;
      text-decoration: none;
      transition: color 0.2s;
    }

    .forgot-password:hover {
      color: #477a6c;
      text-decoration: underline;
    }

    .login-button {
      background-color: #578E7E;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .login-button:hover:not(:disabled) {
      background-color: #477a6c;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(87, 142, 126, 0.2);
    }

    .login-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .login-button:disabled {
      background-color: #97b3ac;
      cursor: not-allowed;
    }

    .button-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .error-alert {
      background-color: rgba(255, 82, 82, 0.1);
      color: #ff5252;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .login-footer {
      margin-top: 2.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .login-footer p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .login-footer a {
      color: #578E7E;
      text-decoration: none;
      transition: color 0.2s;
    }

    .login-footer a:hover {
      color: #477a6c;
      text-decoration: underline;
    }

    .back-to-home {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 1.5rem;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .login-button {
        padding: 0.75rem;
      }
    }
  `]
})
export class LoginPageComponent {
  private apiBaseUrl = environment.apiUrl;
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  isFieldInvalid(field: string): boolean {
    const formControl = this.loginForm.get(field);
    return !!formControl && formControl.invalid && (formControl.dirty || formControl.touched);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = null;

      this.http.post<LoginResponse>(`${this.apiBaseUrl}/login`, {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      }, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
      }).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          const body = response.body;

          if (body && body.userId !== undefined) {
            // Store user info
            localStorage.setItem('userId', String(body.userId));
            localStorage.setItem('userName', String(body.userName));
            localStorage.setItem('isMerchant',String(body.isMerchant));

            if (body.defaultAddress) {
              localStorage.setItem('defaultAddress', JSON.stringify(body.defaultAddress));
            }

            // Navigate based on redirect URL or to home
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
              localStorage.removeItem('redirectAfterLogin');

              try {
                const url = new URL(redirectUrl);
                this.router.navigate([url.pathname.substring(1)]);
              } catch {
                this.router.navigate([redirectUrl]);
              }
            } else {
              this.router.navigate(['/home']);
            }
          } else {
            console.error('User ID is missing in response');
            this.errorMessage = "Login failed. Please try again.";
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.errorMessage = "Invalid username or password. Please try again.";
          this.isLoading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
