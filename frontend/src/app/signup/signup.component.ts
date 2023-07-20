import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  signup(): void {
    if (this.signupForm.valid) {
      const { username, email, password } = this.signupForm.value;
  
      const userData = { username, email, password };
  
      this.http.post('/accounts/register/', userData).subscribe(
        (response) => {
          console.log('Signup success:', response);
          // Reset form after successful submission
          this.signupForm.reset();
        },
        (error) => {
          console.error('Signup error:', error);
          // Handle signup error
        }
      );
    } else {
      // Handle form validation errors
      this.markFormFieldsAsTouched();
    }
  }
  

  markFormFieldsAsTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.markAsTouched();
    });
  }
}
