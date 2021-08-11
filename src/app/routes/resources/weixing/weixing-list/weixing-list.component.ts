import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STData, STComponent, STChange, STRequestOptions } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { WeixingResourceService } from 'src/app/core/services/weixing/weixing.service';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { Region } from 'src/app/domains/region';

@Component({
  selector: 'app-weixing-list',
  templateUrl: './weixing-list.component.html',
  styles: [],
})
export class WeixingListComponent implements OnInit {
  constructor(private weixingResourceService: WeixingResourceService, private settingService: SettingsService, private acl: ACLService) {}

  dataUrl = environment.serverWeixingResourceServiceURL;

  selectedTabIndex = 0;

  // 查询申请单位
  searchSqdw = '';
  // 查询区
  searchQxIds = [];

  qxs: Array<{ key: string; value: string }> = [];

  tabs: {
    title: string;
    id: number | undefined;
  }[] = [];

  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    {
      title: '编号',
      index: 'bh',
      type: 'link',
      width: 150,
      sort: true,
      click: (record: STData, instance?: STComponent) => {
        this.showDetail(record.id);
      },
    },
    { title: '申请单位', index: 'sqdw', width: 150 },
    { title: '申请类型', index: 'sqlxName', sort: true },
    { title: '所属区', index: 'qxName', sort: 'qxId' },
    { title: '安装地址', index: 'azdz' },
    { title: '核查日期', index: 'hcrq', sort: true },
  ];

  stRes = {
    process: (data: STData[], rawData?: any) => {
      return data.map((d) => {
        d.qxName = Region.codes.get(d.qxId);
        switch (d.sqlx) {
          case 'xb':
            d.sqlxName = '新办';
            break;
          case 'bg':
            d.sqlxName = '变更';
            break;
        }
        return d;
      });
    },
  };

  selectedIds: number[] = []; // 选中id数组

  @ViewChild('st', { static: true })
  st!: STComponent;

  ngOnInit(): void {
    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });
    this.initNewButton();
  }

  // 初始化新建按钮
  initNewButton() {
    this.weixingResourceService.getPermissions(this.settingService.user.roleId).subscribe({
      next: (permissions: { mask: Permission }[]) => {
        if (permissions.some((item) => item.mask === Permission.WRITE)) {
          this.acl.attachAbility(['NEW']);
        } else {
          this.acl.removeAbility(['NEW']);
        }
      },
    });
  }

  // 展示详情
  showDetail(id: number | undefined): void {
    this.tabs.push({
      title: id === undefined ? '新建记录' : '查看信息',
      id,
    });
    this.selectedTabIndex = this.tabs.length;
  }

  // 删除
  remove(): void {
    this.weixingResourceService.delete(this.selectedIds).subscribe({
      next: () => {
        this.st.reload();
      },
    });
  }

  closeTab({ index }: { index: number }): void {
    this.tabs.splice(index - 1, 1);
  }

  stChange(e: STChange): void {
    if (e.type === 'checkbox') {
      this.selectedIds = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach((v) => {
          this.selectedIds.push(v.id);
        });
      }
    }
  }

  reset(): void {
    this.searchSqdw = '';
    this.searchQxIds = [];
    this.search();
  }

  // 查询列表
  search(): void {
    let filterStr = '';

    if (this.searchSqdw) {
      filterStr += 'sqdw:*' + this.searchSqdw + '*,';
    }
    if (this.searchQxIds.length > 0) {
      filterStr += 'qxId()';
      this.searchQxIds.forEach((value) => {
        filterStr += value + '_';
      });
      filterStr += ',';
    }

    this.st.req.params = { filter: filterStr };
    this.st.reload();
  }

  // 列表绑定数据变更
  tableDataChanged(): void {
    this.st.reload();
  }
}
