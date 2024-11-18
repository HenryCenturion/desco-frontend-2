import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserService} from '../../../business/services/user.service';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  signInForm: FormGroup;
  submitted = false;
  loginFailed = false;
  isFormVisible: boolean = true;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private router: Router) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  showForm(): void {
    this.isFormVisible = true;
  }

  onSubmit() {
    this.submitted = true;
    this.loginFailed = false;
    if (this.signInForm.valid) {
      const email = this.signInForm.get('email')?.value;
      const password = this.signInForm.get('password')?.value;
      this.userService.login(email, password).subscribe(
        success => {
          if (success) {
            this.router.navigate(['/home']);
          } else {
            this.loginFailed = true;
          }
        }
      );
    }
  }
}
