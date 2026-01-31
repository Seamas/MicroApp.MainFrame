import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {

  validateForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.validateForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  submitForm(): void {
    if (this.validateForm.valid) {
      const { username, password } = this.validateForm.value;
      
      // 模拟登录（实际应调用 API）
      if (username === 'admin' && password === '123456') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        this.router.navigate(['/']);
      } else {
        this.errorMessage = '用户名或密码错误';
      }
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

    goToRegister() {
    this.router.navigate(['/register']);
  }

}
