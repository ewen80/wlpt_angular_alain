import { Component, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { environment } from '@env/environment';
import { UserService } from 'src/app/core/services/user.service';
import { Region } from 'src/app/domains/region';

import { ChangePasswordComponent } from '../change-password/change-password.component';

@Component({
  selector: 'app-userlist',
  templateUrl: './user-list.component.html',
  styles: []
})
export class UserlistComponent implements OnInit {
  constructor(private userService: UserService) {}

  url = environment.serverUserServiceURL;

  searchUserId = '';
  searchUserName = '';
  searchRoleId = '';
  searchQxIds = [];

  selectedTabIndex = 0;

  tabs: Array<{
    title: string;
    userId: string | undefined;
  }> = [];

  removeButtonDisabled = true;
  selectedUserIds: string[] = []; // 选中用户id数组

  @ViewChild('st', { static: true })
  st!: STComponent;

  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    {
      title: '用户id',
      index: 'id',
      type: 'link',
      width: 150,
      sort: true,
      click: (record: STData, instance?: STComponent) => {
        this.add(record.id);
      }
    },
    { title: '用户名', index: 'name', width: 150, sort: true },
    { title: '所属角色id', index: 'roleId', sort: true },
    { title: '所属区', index: 'qxName' },
    {
      buttons: [
        {
          text: '修改密码',
          icon: 'key',
          type: 'modal',
          modal: {
            component: ChangePasswordComponent,
            size: 'md',
            params: (record: any) => {
              return { userId: record.id };
            }
          }
        }
      ]
    }
  ];
  selectedRows: STData[] = [];

  qxs: Array<{ key: string; value: string }> = [];

  ngOnInit(): void {
    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });
  }

  closeTab({ index }: { index: number }): void {
    this.tabs.splice(index - 1, 1);
  }

  // 查询用户
  search(): void {
    let filterStr = '';
    if (this.searchUserId) {
      filterStr += `id:*${this.searchUserId}*,`;
    }
    if (this.searchUserName) {
      filterStr += `name:*${this.searchUserName}*,`;
    }
    if (this.searchRoleId) {
      filterStr += `role.id:*${this.searchRoleId}*,`;
    }
    if (this.searchQxIds.length > 0) {
      filterStr += 'qxId()';
      this.searchQxIds.forEach(value => {
        filterStr += `${value}_`;
      });
      filterStr += ',';
    }

    this.st.req.params = { filter: filterStr };
    this.st.reload();
  }

  // 增加用户
  add(userId: string | undefined): void {
    this.tabs.push({
      title: userId === undefined ? '新建用户' : '用户信息',
      userId
    });
    this.selectedTabIndex = this.tabs.length;
  }

  // 删除用户
  remove(): void {
    this.userService.delete(this.selectedUserIds).subscribe({
      next: () => {
        this.st.reload();
      }
    });
  }

  stChange(e: STChange): void {
    if (e.type === 'checkbox') {
      this.selectedUserIds = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach(v => {
          this.selectedUserIds.push(v.id);
        });
      }
    }
  }

  reset(): void {
    this.searchUserId = this.searchUserName = this.searchRoleId = '';
    this.searchQxIds = [];
    this.search();
  }

  // 用户列表绑定数据变更
  userDataChanged(): void {
    this.st.reload();
  }

  // 返回数据预处理，qxId -> qxName
  dataProcess(data: STData[]): STData[] {
    return data.map(d => {
      d.qxName = Region.codes.get(d.qxId);
      return d;
    });
  }
}
