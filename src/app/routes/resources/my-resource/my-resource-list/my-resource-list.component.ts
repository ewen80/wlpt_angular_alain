import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STData, STComponent, STChange } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { MyResourceService } from 'src/app/core/services/my-resource/my-resource.service';
import { ResourceRangePermissionWrapperService } from 'src/app/core/services/resource-range-permission-wrapper.service';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { Region } from 'src/app/domains/region';
import { IResourceCheckIn } from 'src/app/domains/resource/iresource-checkin';
import { setAclAbility } from 'src/app/shared/utils/set-acl-ability';

@Component({
  selector: 'app-my-resource-list',
  templateUrl: './my-resource-list.component.html',
  styles: []
})
export class MyResourceListComponent implements OnInit {
  constructor(private myResourceService: MyResourceService, private settingService: SettingsService, private acl: ACLService) {}

  dataUrl = environment.serverMyResourceServiceURL;

  selectedTabIndex = 0;

  searchChangdiName = '';
  searchChangdiAddress = '';
  searchQxIds = [];
  searchFinished = 'all';

  qxs: Array<{ key: string; value: string }> = [];

  tabs: Array<{
    title: string;
    id: number | undefined;
  }> = [];

  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    {
      title: 'id',
      index: 'id',
      type: 'link',
      width: 150,
      sort: true,
      click: (record: STData, instance?: STComponent) => {
        this.showDetail(record.id);
      }
    },
    { title: '场地名称', index: 'changdiName', width: 150, sort: true },
    { title: '场地地址', index: 'changdiAddress', sort: true },
    { title: '是否办结', index: 'finish' },
    { title: '所属区', index: 'qxName', sort: 'qxId' }
  ];

  stRes = {
    process: (data: STData[], rawData?: any) => {
      return data.map(d => {
        d.qxName = Region.codes.get(d.qxId);
        d.finish = d.resourceCheckIn?.finish ? '是' : '否';
        return d;
      });
    }
  };

  selectedIds: number[] = []; // 选中id数组

  @ViewChild('st', { static: true })
  st!: STComponent;

  ngOnInit(): void {
    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });
    this.initOptButton();
  }

  // 初始化新建删除等操作按钮
  initOptButton() {
    this.myResourceService.getPermissions(this.settingService.user.roleId).subscribe({
      next: (permissions: Array<{ mask: Permission }>) => {
        setAclAbility(permissions, this.acl);
      }
    });
  }

  // 展示详情
  showDetail(id: number | undefined): void {
    this.tabs.push({
      title: id === undefined ? '新建记录' : '查看信息',
      id
    });
    this.selectedTabIndex = this.tabs.length;
  }

  // 删除
  remove(): void {
    this.myResourceService.delete(this.selectedIds).subscribe({
      next: () => {
        this.st.reload();
      }
    });
  }

  closeTab({ index }: { index: number }): void {
    this.tabs.splice(index - 1, 1);
  }

  stChange(e: STChange): void {
    if (e.type === 'checkbox') {
      this.selectedIds = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach(v => {
          this.selectedIds.push(v.id);
        });
      }
    }
  }

  reset(): void {
    this.searchChangdiName = this.searchChangdiAddress = '';
    this.searchQxIds = [];
    this.search();
  }

  // 查询列表
  search(): void {
    let filterStr = '';

    if (this.searchChangdiName) {
      filterStr += `changdiName:*${this.searchChangdiName}*,`;
    }
    if (this.searchChangdiAddress) {
      filterStr += `changdiAddress:*${this.searchChangdiAddress}*,`;
    }
    if (this.searchQxIds.length > 0) {
      filterStr += 'qxId()';
      this.searchQxIds.forEach(value => {
        filterStr += `${value}_`;
      });
      filterStr += ',';
    }
    if (this.searchFinished !== 'all') {
      if (this.searchFinished === 'finished') {
        filterStr += 'resourceCheckIn.finished:true,';
      } else if (this.searchFinished === 'unFinished') {
        filterStr += 'resourceCheckIn.finished:false,';
      }
    }

    this.st.req.params = { filter: filterStr };
    this.st.reload();
  }

  // 列表绑定数据变更
  tableDataChanged(): void {
    this.st.reload();
  }

  // 过滤是否办结
  searchFinishedChanged(filterStr: string): void {
    this.searchFinished = filterStr;
    this.search();
  }
}
