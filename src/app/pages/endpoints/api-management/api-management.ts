// src/app/pages/user-management/user-management.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';

import { ApiEditComponent } from '../api-edit/api-edit';

import { firstValueFrom } from 'rxjs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ApiEndpointService } from '../../../core/services/endpoint.service';
import { ApiEndpoint } from '../../../core/models/api-endpoint.model';

@Component({
  selector: 'app-api-management',
  templateUrl: './api-management.html',
  styleUrls: ['./api-management.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSwitchModule,
    NzPaginationModule,
    NzModalModule,
    FormsModule,
    NzFormModule,
    NzSelectModule,
  ],
})
export class ApiManagementComponent implements OnInit {
  dataItems: ApiEndpoint[] = [];

  searchForm;

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private fb: FormBuilder,
    private endpointService: ApiEndpointService,
    private msg: NzMessageService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
  ) {
    this.searchForm = this.fb.group({
      url: [''],
      apiGroup: [''],
      description: [''],
      isEnabled: [null],
    });
  }

  ngOnInit() {
    this.loadData(1, this.pageSize);
  }

  onPageIndexChanged(pageIndex: number) {
    this.pageIndex = pageIndex;
    this.loadData();
  }

  onPageSizeChanged(pageSize: number) {
    this.pageSize = pageSize;
    // 计算最大页码
    const maxPage = Math.ceil(this.total / pageSize);
    // 重新计算页码，并且至少要确保页码为1
    this.pageIndex = Math.max(1, Math.min(this.pageIndex, maxPage));

    this.loadData();
  }

  loadData(pageIndex?: number, pageSize?: number) {
    const { url, apiGroup, description, isEnabled } = this.searchForm.value;

    this.endpointService
      .searchApiEndpoints({
        pageIndex: pageIndex || this.pageIndex,
        pageSize: pageSize || this.pageSize,
        url: url || '',
        apiGroup: apiGroup || '',
        description: description || '',
        isEnabled: isEnabled,
      })
      .subscribe((res) => {
        this.total = res.totalCount;
        this.dataItems = res.items;

        this.cdr.detectChanges();
      });
  }

  async openApiEndpointModal(id?: number) {
    let data: ApiEndpoint | null = null;
    try {
      if (id) {
        data = await firstValueFrom(this.endpointService.getApiEndpoint(id));
      }
    } catch (error) {
      this.msg.error('获取最新API端点信息出错', { nzDuration: 3000 });
      return;
    }

    const title = data != null ? '编辑API端点' : '新增API端点';

    const modalRef = this.modal.create({
      nzTitle: title,
      nzContent: ApiEditComponent,
      nzData: { endpoint: data || null },
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.msg.success(title + '成功!', { nzDuration: 3000 });
        this.loadData();
      }
    });
  }

  async toggleStatus(newValue: boolean, menu: ApiEndpoint) {
    const originalValue = menu.isEnabled;
    try {
      let res: boolean = false;
      if (newValue) {
        res = await firstValueFrom(this.endpointService.enableApiEndpoint(menu.id!));
      } else {
        res = await firstValueFrom(this.endpointService.disableApiEndpoint(menu.id!));
      }
      const message = newValue ? 'API端点启用成功' : 'API端点禁用成功';
      menu.isEnabled = newValue;
      this.msg.success(message, {
        nzDuration: 3000,
      });
    } catch (error) {
      menu.isEnabled = originalValue;

      this.msg.error('操作失败');
    }
    this.cdr.detectChanges();
  }

  deleteApiEndpoint(menu: ApiEndpoint) {
    this.modal.confirm({
      nzTitle: '确定要删除API端点吗?',
      nzContent: `API端点: ${menu.url}`,
      nzOnOk: async () => {
        try {
          const res = await firstValueFrom(this.endpointService.deleteApiEndpoint(menu.id!));
          if (res === true) {
            this.msg.success('API端点删除成功');
            this.loadData();
          } else {
            this.msg.error('删除API端点失败');
          }
        } catch (error) {
          this.msg.error('删除API端点失败');
        }
      },
    });
  }

  initApiEndpoints() {
    this.modal.confirm({
      nzTitle: '确定要初始化API端点吗?',
      nzContent:
        '此操作会扫描系统中所有的API端点，并将它们添加到数据库中。已存在的端点将被忽略，不存在的端点将被新增。',
      nzOnOk: async () => {
        try {
          const res = await firstValueFrom(this.endpointService.initApiEndpoints());
          if (res === true) {
            this.msg.success('API端点初始化成功');
            this.loadData();
          } else {
            this.msg.error('API端点初始化失败');
          }
        } catch (error) {
          this.msg.error('API端点初始化失败');
        }
      },
    });
  }
}
