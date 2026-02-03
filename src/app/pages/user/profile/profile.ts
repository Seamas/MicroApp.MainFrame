import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // 模拟从 API 获取用户数据
      this.profileForm = this.fb.group({
        username: [{ value: "", disabled: true }],
        nickname: ["", {validators:[Validators.required, Validators.minLength(4), Validators.maxLength(10)]}],
        email: ["", {validators:[Validators.required, Validators.email]}]
      });
    this.authService.profile()
    .subscribe(res => {
      this.profileForm.patchValue({
        username: res.username,
        nickname: res.nickname,
        email: res.email
      });    
    })
  }


  onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;

      const {nickname, email} = this.profileForm.value;
      this.authService.updateProfile({nickname, email})
      .pipe(
        finalize(() => 
          setTimeout(() => this.loading = false, 1000)
        )
      )
      .subscribe(res => {

        this.authService.nickname = res.nickname;
        this.profileForm.patchValue({
          username: res.username,
          nickname: res.nickname,
          email: res.email
        });

        this.msg.success("修改用户信息成功", {
          nzDuration: 3000
        })

      })
    }
  }
}