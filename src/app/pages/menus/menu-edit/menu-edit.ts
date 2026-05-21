import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  NgModel,
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
import { Menu } from '../../../core/models/requests/menu.model';
import { MenuService } from '../../../core/services/menu.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormErrorService } from '../../../core/services/form-error.service';

@Component({
  selector: 'app-menu-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzSelectModule,
  ],
  templateUrl: './menu-edit.html',
  styleUrl: './menu-edit.scss',
  standalone: true,
})
export class MenuEditComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  id: number;

  validatingCode = false;

  menuCodeTypes = [
    { code: 'link', name: '管理节点' },
    { code: 'router', name: '本地应用' },
    { code: 'microapp', name: '微应用' },
  ];

  parentMenus: Menu[] = [];

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { menu: Menu; firstLevelMenus: Menu[] },
    private fb: FormBuilder,
    private menuService: MenuService,
    private msg: NzMessageService,
    private formErrorService: FormErrorService,
  ) {
    this.form = this.fb.group({
      name: [
        data?.menu?.name || '',
        { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(30)] },
      ],
      code: [
        data?.menu?.code || '',
        {
          validators: [Validators.required],
        },
      ],
      path: [data?.menu?.path || '', { validators: [this.pathValidator()] }],
      parentId: [data?.menu?.parentId || -1, { validators: [Validators.required] }],
      sortOrder: [
        data?.menu?.sortOrder || 0,
        { validators: [Validators.required, Validators.min(0)] },
      ],
    });
    this.isEdit = !!data.menu;
    this.id = data?.menu?.id || 0;
    this.parentMenus = [
      {
        id: -1,
        name: '根节点',
        code: 'root',
        path: '',
        parentId: -1,
        sortOrder: 0,
        isEnabled: true,
      },
      ...data.firstLevelMenus.filter((m) => m.id !== this.id), // 编辑时排除自己，避免选择自己作为父级
    ];
  }

  async ngOnInit() {}

  pathValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) {
        return null;
      }

      const menuType = formGroup.get('code')?.value;
      const pathValue: string = control.value;

      if (menuType !== 'link' && (!pathValue || pathValue.trim() === '')) {
        return { required: true };
      }

      return null;
    };
  }

  async onSubmit() {
    // 触发表单所有控件的验证，确保显示所有验证错误
    this.form.markAllAsTouched();

    if (this.form.valid) {
      try {
        const { name, code, path, parentId, sortOrder } = this.form.value;
        let res: boolean = false;
        if (this.isEdit) {
          res = await firstValueFrom(
            this.menuService.updateMenu({
              id: this.id,
              name,
              code,
              path,
              parentId,
              sortOrder,
            }),
          );
        } else {
          res = await firstValueFrom(
            this.menuService.createMenu({ name, code, path, parentId, sortOrder }),
          );
        }
        if (res === true) {
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
        this.msg.error('请输入菜单编码');
      }
    } else if (nameControl?.errors) {
      if (nameControl.errors['required']) {
        this.msg.error('请输入菜单名称');
      } else if (nameControl.errors['minlength']) {
        this.msg.error('菜单名称至少需要2个字符');
      } else if (nameControl.errors['maxlength']) {
        this.msg.error('菜单名称不能超过30个字符');
      }
    }
  }

  nameErrorTip(): string {
    const control = this.form.get('name');
    return this.formErrorService.getErrorTip(control!, '菜单名称');
  }
}
