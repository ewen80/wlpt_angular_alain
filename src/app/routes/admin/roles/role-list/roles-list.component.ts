import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { STChange, STColumn, STComponent, STData, STPage, STReq, STRequestOptions, STRes, STSingleSort } from '@delon/abc/st';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RoleService } from 'src/app/core/services/role.service';

import { RoleDetailComponent } from '../role-detail/role-detail.component';

@Component({
  selector: 'app-role-list',
  templateUrl: './roles-list.component.html'
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesListComponent {
  url = environment.serverRoleServiceURL;

  search_roleId = '';
  search_roleName = '';

  selectedTabIndex = 0;

  tabs: Array<{
    title: string;
    roleId: string | undefined;
  }> = [];

  removeButtonDisabled = true;
  selectedRoleIds: string[] = []; // 选中角色id数组

  @ViewChild('st', { static: true })
  st!: STComponent;

  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    {
      title: '角色id',
      index: 'id',
      type: 'link',
      width: 150,
      sort: true,
      click: (record: STData, instance?: STComponent) => {
        this.add(record.id);
      }
    },
    { title: '角色名', index: 'name', width: 150, sort: true },
    { title: '用户数', index: 'userIds.length' },
    { title: '描述', index: 'description' }
  ];
  selectedRows: STData[] = [];

  constructor(private roleService: RoleService) {}

  stChange(e: STChange): void {
    if (e.type === 'checkbox') {
      this.selectedRoleIds = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach(v => {
          this.selectedRoleIds.push(v.id);
        });
      }
    }
  }

  // 返回数据预处理，判断用户数是否为0，为0才能删除
  dataProcess(data: STData[]): STData[] {
    return data.map(v => {
      v.disabled = v.userIds.length !== 0;
      return v;
    });
  }

  // 删除角色
  remove(): void {
    // eslint-disable-next-line import/no-deprecated
    this.roleService.delete(this.selectedRoleIds).subscribe({
      next: () => {
        this.st.reload();
      }
    });
  }

  add(roleId: string | undefined): void {
    this.tabs.push({
      title: roleId === undefined ? '新建角色' : '角色信息',
      roleId
    });
    this.selectedTabIndex = this.tabs.length;
  }

  closeTab({ index }: { index: number }): void {
    this.tabs.splice(index - 1, 1);
  }

  reset(): void {
    this.search_roleId = this.search_roleName = '';
    this.submit();
  }

  submit(): void {
    let filterStr = '';
    if (this.search_roleId) {
      filterStr += `id:*${this.search_roleId}*,`;
    }
    if (this.search_roleName) {
      filterStr += `name:*${this.search_roleName}*,`;
    }

    this.st.req.params = { filter: filterStr };
    this.st.reload();
  }

  // 角色列表数据改变需要重新刷新
  roleDataChanged(): void {
    this.st.reload();
  }
}
