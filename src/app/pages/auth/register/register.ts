// src/app/auth/register/register.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControlOptions,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  validateForm!: FormGroup;
  errorMessage: string | null = null;

  private navigateTimer?: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private msg: NzMessageService,
  ) {}

  ngOnDestroy(): void {
    if (this.navigateTimer) {
      window.clearTimeout(this.navigateTimer);
    }
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group(
      {
        username: [
          '',
          {
            validators: [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(20),
              Validators.pattern(/^[a-zA-Z0-9_]+$/),
            ],
          },
        ],
        email: ['', { validators: [Validators.required, Validators.email] }],
        nickname: [
          '',
          { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(10)] },
        ],
        password: ['', { validators: [Validators.required, Validators.minLength(6)] }],
        confirmPassword: ['', { validators: [Validators.required] }],
      },
      { validators: this.confirmPasswordValidator.bind(this) } as AbstractControlOptions,
    );
  }

  confirmPasswordValidator(control: AbstractControlOptions) {
    const form = control as FormGroup;
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getUsernameErrorTip(): string {
    const usernameControl = this.validateForm.get('username');
    if (usernameControl?.hasError('required')) {
      return '请输入用户名';
    } else if (usernameControl?.hasError('minlength')) {
      return '用户名至少需要3个字符';
    } else if (usernameControl?.hasError('maxlength')) {
      return '用户名不能超过20个字符';
    } else if (usernameControl?.hasError('pattern')) {
      return '用户名只能包含字母、数字和下划线';
    } else if (usernameControl?.hasError('alreadyExists')) {
      return '用户名已存在';
    }
    return '';
  }

  submitForm(): void {
    this.validateForm.markAllAsTouched();

    if (this.validateForm.valid) {
      const { username, nickname, email, password } = this.validateForm.value;

      this.authService.register({ username, nickname, email, password }).subscribe((res) => {
        this.msg.loading('注册成功, 3秒后返回到登录页面！', {
          nzDuration: 3000,
        });

        this.navigateTimer = window.setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
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

  get usernameControl(): AbstractControl {
    return this.validateForm.get('username')!;
  }
}
