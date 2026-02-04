// src/app/pages/user-management/user-edit-form.component.ts
import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { User } from '../../core/models/requests/user.model';

@Component({
  selector: 'app-user-edit-form',
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule],
})
export class UserEditFormComponent {
  form: FormGroup;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { user: User },
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      username: [
        { value: data?.user?.username || '', disabled: data?.user != null },
        { validators: [Validators.required, Validators.minLength(3)] },
      ],
      nickname: [
        data?.user?.nickname || '',
        { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(10)] },
      ],
      email: [data?.user?.email || '', { validators: [Validators.required, Validators.email] }],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.modalRef.close(this.form.value);
    }
  }

  cancel(): void {
    this.modalRef.destroy();
  }
}
