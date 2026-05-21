import { Component, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';

import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-change-password',
  templateUrl: './changepwd.html',
  styleUrls: ['./changepwd.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
  ],
})
export class ChangepwdComponent implements OnInit {
  passwordForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.confirmPasswordValidator.bind(this) } as AbstractControlOptions,
    );
  }

  confirmPasswordValidator(control: AbstractControlOptions) {
    const form = control as FormGroup;
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  get passwordMismatch() {
    return this.passwordForm.hasError('mismatch');
  }

  async onSubmit() {
    if (this.passwordForm.valid && !this.passwordMismatch) {
      this.loading = true;

      const { oldPassword, newPassword } = this.passwordForm.value;
      try {
        await firstValueFrom(this.authService.changePassword({ oldPassword, newPassword }));
        this.passwordForm.reset();
        this.msg.success('修改密码成功', {
          nzDuration: 3000,
        });
      } catch (err: any) {
        this.errorMessage = err.message || '修改密码失败';
      } finally {
        setTimeout(() => (this.loading = false), 1000);
      }
    }
  }
}
