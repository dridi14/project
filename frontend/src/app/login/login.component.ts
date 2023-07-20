import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showLoginForm: boolean = true;
  loginError: string = '';
  loginSuccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  toggleForm(): void {
    this.showLoginForm = !this.showLoginForm;
    this.loginError = '';
    this.loginSuccess = false;
    this.loginForm.reset();
  }

  login(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      const loginData = { username, password };

      this.http.post('/api/accounts/login/', loginData).subscribe(
        {
          next: (response: any) => {
              this.loginSuccess = true;
              this.loginError = '';
              console.log('Login success:', response);
              // Reset form after successful submission
              this.loginForm.reset();
              this.authService.setAccessToken(response.access)
              // Redirect to the home page
              this.router.navigate(['/home']);
            },
          error: (error: HttpErrorResponse) => {
              this.loginSuccess = false;
              if (error.status === 401) {
                this.loginError = 'Invalid username or password.';
              } else {
                this.loginError = 'An error occurred. Please try again later.';
              }
              console.error('Login error:', error);
          }
        }
      );
    } else {
      // Handle form validation errors
      this.markLoginFormFieldsAsTouched();
    }
  }

  markLoginFormFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}
