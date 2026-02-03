// src/app/auth/register/register.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControlOptions } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  validateForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      username: ['', {validators: [Validators.required, Validators.minLength(3)]}],
      email: ['', {validators:[Validators.required, Validators.email]}],
      nickname: ['', {validators:[Validators.required, Validators.minLength(4), Validators.maxLength(10)]}],
      password: ['', {validators:[Validators.required, Validators.minLength(6)]}],
      confirmPassword: ['', {validators:[Validators.required]}]
    }, { validators: this.confirmPasswordValidator.bind(this) } as AbstractControlOptions);
  }

  confirmPasswordValidator(control: AbstractControlOptions) {
    const form = control as FormGroup;
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const { username, nickname, email, password } = this.validateForm.value;
      
      // 模拟注册（实际应调用 API）
      this.authService.register({username, nickname, email, password})
      .subscribe(res => {
        this.router.navigate(['/login']);
      })
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}