import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FormErrorService {
  constructor() {}

  getErrorTip(control?: AbstractControl, fieldName?: string) {
    if (control?.hasError('required')) {
      return `${fieldName}为必填项`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `${fieldName}至少需要${requiredLength}个字符`;
    }
    if (control?.hasError('maxlength')) {
      const requiredLength = control.getError('maxlength').requiredLength;
      return `${fieldName}不能超过${requiredLength}个字符`;
    }
    if (control?.hasError('pattern')) {
      return `${fieldName}格式不正确`;
    }

    if (control?.hasError('alreadyExists')) {
      return `${fieldName}已存在，请使用其他${fieldName}`;
    }

    return `请输入正确的${fieldName}`;
  }
}
