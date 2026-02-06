// src/app/pages/user-management/user-edit-form.component.ts
import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { User } from '../../core/models/requests/user.model';
import { UserService } from '../../core/services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-edit-form',
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule],
})
export class UserEditFormComponent {
  form: FormGroup;
  isEdit: boolean;
  id: number;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { user: User },
    private fb: FormBuilder,
    private userService: UserService,
    private msg: NzMessageService
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
    this.isEdit = !! data.user;
    this.id = data?.user?.id || 0;
  }

  async onSubmit() {
    if (this.form.valid) {
      try {
        const {username, nickname, email} = this.form.value; 
        let res: boolean = false;
        if (this.isEdit) {
          res = await firstValueFrom(this.userService.updateUser(this.id, nickname, email));
        } else {
          res = await firstValueFrom(this.userService.createUser(username, nickname, email));
        }
        if (res) {
          this.modalRef.close(this.form.value);
        } else {
          this.msg.error("操作失败")
        }
      }
      catch( error) {
        console.log(error);
      }

    }
  }

  cancel(): void {
    this.modalRef.destroy();
  }
}
