// src/app/pages/user-management/user-edit-form.component.ts
import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { User } from '../../../core/models/requests/user.model';
import { UserService } from '../../../core/services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-user-edit-form',
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
  ],
})
export class UserEditFormComponent {
  form: FormGroup;
  isEdit: boolean;
  id: number;

  validatingUsername = false;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { user: User },
    private fb: FormBuilder,
    private userService: UserService,
    private msg: NzMessageService,
  ) {
    this.form = this.fb.group({
      username: [
        { value: data?.user?.username || '', disabled: data?.user != null },
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
      nickname: [
        data?.user?.nickname || '',
        { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(10)] },
      ],
      email: [data?.user?.email || '', { validators: [Validators.required, Validators.email] }],
    });
    this.isEdit = !!data.user;
    this.id = data?.user?.id || 0;
  }

  async onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      try {
        const usernameControl = this.form.get('username');
        if (usernameControl?.pending) {
          this.msg.warning('正在校验用户名，请稍候...', { nzDuration: 3000 });
          return;
        }

        const { username, nickname, email } = this.form.value;
        let res: boolean = false;
        if (this.isEdit) {
          res = await firstValueFrom(this.userService.updateUser(this.id, nickname, email));
        } else {
          res = await firstValueFrom(this.userService.createUser(username, nickname, email));
        }
        if (res) {
          this.modalRef.close(this.form.value);
        } else {
          this.msg.error('操作失败');
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  cancel(): void {
    this.modalRef.destroy();
  }

  get usernameControl(): AbstractControl {
    return this.form.get('username')!;
  }

  getUsernameErrorTip(): string {
    const usernameControl = this.form.get('username');
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
}
