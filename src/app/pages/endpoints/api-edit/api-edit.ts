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

import { firstValueFrom } from 'rxjs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormErrorService } from '../../../core/services/form-error.service';
import { ApiEndpointService } from '../../../core/services/endpoint.service';

@Component({
  selector: 'app-api-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzSelectModule,
  ],
  templateUrl: './api-edit.html',
  styleUrl: './api-edit.scss',
  standalone: true,
})
export class ApiEditComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  id: number;

  validatingCode = false;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { endpoint: ApiEndpoint },
    private fb: FormBuilder,
    private endpointService: ApiEndpointService,
    private msg: NzMessageService,
    private formErrorService: FormErrorService,
  ) {
    this.form = this.fb.group({
      url: [
        data?.endpoint?.url || '',
        { validators: [Validators.required, Validators.pattern('^/.+')] },
      ],
      apiGroup: [data?.endpoint?.apiGroup || ''],
      description: [data?.endpoint?.description || ''],
    });
    this.isEdit = !!data.endpoint;
    this.id = data?.endpoint?.id || 0;
  }

  async ngOnInit() {}

  async onSubmit() {
    // 触发表单所有控件的验证，确保显示所有验证错误
    this.form.markAllAsTouched();

    if (this.form.valid) {
      try {
        const { url, apiGroup, description } = this.form.value;
        let res: boolean = false;
        if (this.isEdit) {
          res = await firstValueFrom(
            this.endpointService.updateApiEndpoint({
              id: this.id,
              url,
              apiGroup,
              description,
            }),
          );
        } else {
          res = await firstValueFrom(
            this.endpointService.createApiEndpoint({ url, apiGroup, description }),
          );
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

  urlErrorTip(): string {
    const control = this.form.get('url');
    return this.formErrorService.getErrorTip(control!, '端点地址');
  }
}
