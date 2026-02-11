// src/app/auth/register/register.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControlOptions,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
    NzSpinModule,
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent implements OnInit {
  validateForm!: FormGroup;
  errorMessage: string | null = null;

  validatingUsername = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private msg: NzMessageService,
    private userService: UserService,
  ) {}

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
            asyncValidators: [this.uniqueUsernameValidator()],
            updateOn: 'blur',
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

    this.validateForm.get('username')?.statusChanges.subscribe((status) => {
      this.validatingUsername = status === 'PENDING';
    });
  }

  confirmPasswordValidator(control: AbstractControlOptions) {
    const form = control as FormGroup;
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  private uniqueUsernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (control.invalid || control.pristine) {
        return of(null);
      }

      const username = control.value?.trim();
      if (!username) {
        return of(null);
      }
      return of(username).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((name) =>
          this.userService.checkUsername(name).pipe(
            map((isUnique) => (isUnique ? null : { notUnique: true })),
            catchError(() => of(null)),
          ),
        ),
        first(),
      );
    };
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
    } else if (usernameControl?.hasError('notUnique')) {
      return '用户名已存在';
    }
    return '';
  }

  submitForm(): void {
    this.validateForm.markAllAsTouched();

    if (this.validateForm.valid) {
      const usernameControl = this.validateForm.get('username');
      if (usernameControl?.pending) {
        this.msg.warning('正在校验用户名，请稍候...', { nzDuration: 3000 });
        return;
      }

      const { username, nickname, email, password } = this.validateForm.value;

      // 模拟注册（实际应调用 API）
      this.authService.register({ username, nickname, email, password }).subscribe((res) => {
        let countdown = 3;
        this.msg.loading(`注册成功, ${countdown}秒后返回到登录页面！`, {
          nzDuration: 3000,
        });

        setInterval(() => {
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
