import { Component, Inject, OnInit } from '@angular/core';
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
import { NzMessageService } from 'ng-zorro-antd/message';

import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

import { Role } from '../../../core/models/requests/role.model';
import { RoleService } from '../../../core/services/role.service';
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
  selector: 'app-role-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
  ],
  templateUrl: './role-edit.html',
  styleUrl: './role-edit.scss',
  standalone: true,
})
export class RoleEditComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  id: number;

  validatingCode = false;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { role: Role },
    private fb: FormBuilder,
    private roleService: RoleService,
    private msg: NzMessageService,
  ) {
    this.form = this.fb.group({
      name: [
        data?.role?.name || '',
        { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)] },
      ],
      code: [
        data?.role?.code || '',
        {
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z0-9_\-\s]+$/),
          ],
          asyncValidators: [this.uniqueCodeValidator()],
          updateOn: 'blur',
        },
      ],
    });
    this.isEdit = !!data.role;
    this.id = data?.role?.id || 0;
  }

  ngOnInit(): void {
    if (this.isEdit) {
      const codeControl = this.form.get('code');
      if (codeControl) {
        codeControl.valueChanges.pipe(distinctUntilChanged()).subscribe((newValue) => {
          if (newValue === this.data.role?.code) {
            codeControl.setErrors(null);
          }
        });
      }
    }

    this.form.get('code')?.statusChanges.subscribe((status) => {
      this.validatingCode = status === 'PENDING';
    });
  }

  private uniqueCodeValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (this.isEdit && control.value === this.data.role?.code) {
        return of(null);
      }

      // 检查基本验证是否通过, 如果控件无效或未修改，直接返回null，避免不必要的验证请求
      if (control.invalid || control.pristine) {
        return of(null);
      }

      const code = control.value?.trim();
      if (!code) {
        return of(null);
      }

      return of(code).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((codeValue) => {
          return this.roleService.checkCode(codeValue, this.id).pipe(
            map((isUnique) => (isUnique ? null : { codeNotUnique: true })),
            catchError(() => of(null)),
          );
        }),
        first(),
      );
    };
  }

  validateCode(): void {
    const codeControl = this.form.get('code');
    if (codeControl) {
      codeControl.markAsTouched();
      codeControl.updateValueAndValidity();
    }
  }

  async onSubmit() {
    // 触发表单所有控件的验证，确保显示所有验证错误
    this.form.markAllAsTouched();

    if (this.form.valid) {
      try {
        const codeControl = this.form.get('code');
        if (codeControl?.pending) {
          this.msg.warning('正在验证角色编码，请稍候...', { nzDuration: 3000 });
          return;
        }

        const { name, code } = this.form.value;
        let res: boolean = false;
        if (this.isEdit) {
          res = await firstValueFrom(this.roleService.updateRole(this.id, name, code));
        } else {
          res = await firstValueFrom(this.roleService.createRole(name, code));
        }
        if (res) {
          this.modalRef.close(this.form.value);
        } else {
          this.msg.error('操作失败');
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      this.showValidationErrors();
    }
  }

  cancel(): void {
    this.modalRef.destroy();
  }

  private showValidationErrors(): void {
    const codeControl = this.form.get('code');
    const nameControl = this.form.get('name');

    if (codeControl?.errors) {
      if (codeControl.errors['required']) {
        this.msg.error('请输入角色编码');
      } else if (codeControl.errors['minlength']) {
        this.msg.error('角色编码至少需要2个字符');
      } else if (codeControl.errors['maxlength']) {
        this.msg.error('角色编码不能超过30个字符');
      } else if (codeControl.errors['pattern']) {
        this.msg.error('角色编码只能包含字母、数字、下划线和短横线');
      } else if (codeControl.errors['codeNotUnique']) {
        this.msg.error('角色编码已存在，请使用其他编码');
      }
    } else if (nameControl?.errors) {
      if (nameControl.errors['required']) {
        this.msg.error('请输入角色名称');
      } else if (nameControl.errors['minlength']) {
        this.msg.error('角色名称至少需要2个字符');
      } else if (nameControl.errors['maxlength']) {
        this.msg.error('角色名称不能超过50个字符');
      }
    }
  }

  // 获取错误提示信息（用于模板）
  getCodeErrorTip(): string {
    const control = this.form.get('code');
    if (control?.errors) {
      if (control.errors['required']) {
        return '请输入角色编码';
      } else if (control.errors['minlength']) {
        return '角色编码至少需要2个字符';
      } else if (control.errors['maxlength']) {
        return '角色编码不能超过30个字符';
      } else if (control.errors['pattern']) {
        return '只能包含字母、数字、下划线和短横线';
      } else if (control.errors['codeNotUnique']) {
        return '角色编码已存在';
      }
    }
    return '';
  }

  get codeControl(): AbstractControl {
    return this.form.get('code')!;
  }
}
