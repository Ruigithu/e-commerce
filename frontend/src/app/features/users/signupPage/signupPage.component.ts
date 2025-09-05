import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {User} from './user.model';

@Component({
  selector: `signup-page`,
  template: `
    <div class="signup-page">
      <div class="signup-container">
        <div class="signup-header">
          <img src="assets/icons/shopper.png" alt="BuyBuy Logo" class="logo">
          <h1>Create Account</h1>
          <p>Join BuyBuy and start shopping today</p>
        </div>

        <form class="signup-form" [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label for="firstname">First Name</label>
              <div class="input-container">
                <i class="fa-solid fa-user"></i>
                <input
                  id="firstname"
                  formControlName="firstname"
                  type="text"
                  placeholder="Enter first name"
                  [class.error]="isFieldInvalid('firstname')"
                >
              </div>
              <div class="error-message" *ngIf="isFieldInvalid('firstname')">
                First name is required
              </div>
            </div>

            <div class="form-group">
              <label for="lastname">Last Name</label>
              <div class="input-container">
                <i class="fa-solid fa-user"></i>
                <input
                  id="lastname"
                  formControlName="lastname"
                  type="text"
                  placeholder="Enter last name"
                  [class.error]="isFieldInvalid('lastname')"
                >
              </div>
              <div class="error-message" *ngIf="isFieldInvalid('lastname')">
                Last name is required
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-container">
              <i class="fa-solid fa-at"></i>
              <input
                id="username"
                formControlName="username"
                type="text"
                placeholder="Choose a username"
                [class.error]="isFieldInvalid('username')"
              >
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('username')">
              Username is required
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-container">
              <i class="fa-solid fa-envelope"></i>
              <input
                id="email"
                formControlName="email"
                type="email"
                placeholder="Enter your email"
                [class.error]="isFieldInvalid('email')"
              >
            </div>
            <div class="error-message" *ngIf="signupForm.get('email')?.errors?.['required'] &&
                 signupForm.get('email')?.touched">
              Email is required
            </div>
            <div class="error-message" *ngIf="signupForm.get('email')?.errors?.['email'] &&
                 signupForm.get('email')?.touched">
              Please enter a valid email address
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <div class="input-container">
              <i class="fa-solid fa-phone"></i>
              <input
                id="phone"
                formControlName="phone"
                type="tel"
                placeholder="Enter your phone number"
                [class.error]="isFieldInvalid('phone')"
              >
            </div>
            <div class="error-message" *ngIf="signupForm.get('phone')?.errors?.['required'] &&
                 signupForm.get('phone')?.touched">
              Phone number is required
            </div>
            <div class="error-message" *ngIf="signupForm.get('phone')?.errors?.['pattern'] &&
                 signupForm.get('phone')?.touched">
              Please enter a valid phone number
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
                placeholder="Create your password"
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
            <div class="error-message" *ngIf="signupForm.get('password')?.errors?.['required'] &&
                 signupForm.get('password')?.touched">
              Password is required
            </div>
            <div class="error-message" *ngIf="signupForm.get('password')?.errors?.['minlength'] &&
                 signupForm.get('password')?.touched">
              Password must be at least 6 characters
            </div>
          </div>

          <div class="terms-checkbox">
            <input type="checkbox" id="terms" formControlName="terms">
            <label for="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
            <div class="error-message" *ngIf="signupForm.get('terms')?.errors?.['required'] &&
                 signupForm.get('terms')?.touched">
              You must agree to the terms to continue
            </div>
          </div>

          <button
            type="submit"
            class="signup-button"
            [disabled]="signupForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Create Account</span>
            <div *ngIf="isLoading" class="button-spinner"></div>
          </button>

          <div class="success-message" *ngIf="successMessage">
            <i class="fa-solid fa-check-circle"></i>
            {{successMessage}}
          </div>

          <div class="error-alert" *ngIf="errorMessage">
            <i class="fa-solid fa-circle-exclamation"></i>
            {{errorMessage}}
          </div>
        </form>

        <div class="signup-footer">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
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
    .signup-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9f9f9;
      padding: 2rem 1rem;
    }

    .signup-container {
      width: 100%;
      max-width: 600px;
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

    .signup-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      width: 60px;
      height: 60px;
      margin-bottom: 1rem;
    }

    .signup-header h1 {
      font-size: 1.8rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .signup-header p {
      color: #666;
      margin: 0;
    }

    .signup-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
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

    .terms-checkbox {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #666;
      position: relative;
      padding-bottom: 1rem;
    }

    .terms-checkbox a {
      color: #578E7E;
      text-decoration: none;
    }

    .terms-checkbox a:hover {
      text-decoration: underline;
    }

    .terms-checkbox .error-message {
      position: absolute;
      bottom: -4px;
      left: 0;
    }

    .signup-button {
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

    .signup-button:hover:not(:disabled) {
      background-color: #477a6c;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(87, 142, 126, 0.2);
    }

    .signup-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .signup-button:disabled {
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .success-message {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
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

    .signup-footer {
      margin-top: 2.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .signup-footer p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .signup-footer a {
      color: #578E7E;
      text-decoration: none;
      transition: color 0.2s;
    }

    .signup-footer a:hover {
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

    @media (max-width: 768px) {
      .signup-container {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .signup-button {
        padding: 0.75rem;
      }
    }
  `]
})
export class SignupPageComponent {
  signupForm: FormGroup;
  isLoading = false;
  showPassword = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.requiredTrue]
    });
  }

  isFieldInvalid(field: string): boolean {
    const formControl = this.signupForm.get(field);
    return !!formControl && formControl.invalid && (formControl.dirty || formControl.touched);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formData = {
        username: this.signupForm.value.username,
        firstname: this.signupForm.value.firstname,
        lastname: this.signupForm.value.lastname,
        password: this.signupForm.value.password,
        phone: this.signupForm.value.phone,
        email: this.signupForm.value.email,
      };

      this.http.post<User>('https://gateway-production-4c59.up.railway.app/users/signup', formData, {
        headers: new HttpHeaders({'Content-Type': 'application/json'}),
        withCredentials: true
      }).subscribe({
        next: (user: User) => {
          console.log('Signup successful:', user);

          // Create cart for the new user
          this.http.post('https://gateway-production-4c59.up.railway.app/orders/add-newCart', {
            userId: user.userId
          }).subscribe({
            next: () => {
              console.log('Cart created successfully');
              this.successMessage = "Account created successfully! You can now sign in.";
              this.isLoading = false;

              // Redirect to login page after 2 seconds
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            },
            error: (error) => {
              console.error('Error creating cart:', error);
              this.successMessage = "Account created, but there was an issue setting up your cart.";
              this.isLoading = false;
            }
          });
        },
        error: (error) => {
          console.error('Signup failed:', error);

          if (error.status === 409) {
            this.errorMessage = "Username or email already exists. Please try another.";
          } else {
            this.errorMessage = "Registration failed. Please try again later.";
          }

          this.isLoading = false;
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
