import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STData, STComponent, STChange, STRequestOptions, STColumnTag } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { YuleResourceService } from 'src/app/core/services/yule/yule.service';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { Region } from 'src/app/domains/region';
import { setAclAbility } from 'src/app/shared/utils/set-acl-ability';
import { YuleDetailComponent } from '../yule-detail/yule-detail.component';

@Component({
  selector: 'app-yule-list',
  templateUrl: './yule-list.component.html',
  styles: []
})
export class YuleListComponent implements OnInit {
  constructor(private yuleService: YuleResourceService, private settingService: SettingsService, private acl: ACLService) {}

  dataUrl = environment.serverYuleResourceBaseServiceURL;

  selectedTabIndex = 0;

  // 查询申请单位
  searchSqdw = '';
  // 查询区
  searchQxIds = [];

  qxs: Array<{ key: string; value: string }> = [];

  readTag: STColumnTag = {
    false: { text: '未读', color: 'red' },
  };

  tabs: Array<{
    title: string;
    id: number | undefined;
  }> = [];

  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    { title: '', index: 'readed', type: 'tag', tag: this.readTag, width: 80},
    {
      title: '编号',
      index: 'bh',
      type: 'link',
      width: 150,
      sort: true,
      click: (record: STData, instance?: STComponent) => {
        this.showDetail(record.id);
      }
    },
    { title: '单位名称', index: 'dwmc', width: 150 },
    { title: '申办项目', index: 'sbxm', sort: true },
    { title: '所属区', index: 'qxName', sort: 'qxId' },
    { title: '场所地址', index: 'csdz' },
  ];

  stRes = {
    process: (data: STData[], rawData?: any) => {
      return data.map(d => {
        d.qxName = Region.codes.get(d.qxId);
        return d;
      });
    }
  };

  selectedIds: number[] = []; // 选中id数组

  @ViewChild('st', { static: true }) st!: STComponent;
  @ViewChild('yuleDetail')  weixingDetail!: YuleDetailComponent;

  ngOnInit(): void {
    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });
    this.initOptButton();
  }

  // 初始化新建删除等操作按钮
  initOptButton() {
    this.yuleService.getPermissions(this.settingService.user.currentRoleId).subscribe({
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
    this.yuleService.delete(this.selectedIds).subscribe({
      next: () => {
        this.selectedIds = [];
        this.st.reload();
      }
    });
  }

  closeTab({ index }: { index: number }): void {
    this.weixingDetail.readSubscription?.unsubscribe();
    this.tabs.splice(index - 1, 1);
    this.st.reload();
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
    this.searchSqdw = '';
    this.searchQxIds = [];
    this.search();
  }

  // 查询列表
  search(): void {
    let filterStr = '';

    if (this.searchSqdw) {
      filterStr += `dwmc:*${this.searchSqdw}*,`;
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

  // 列表绑定数据变更
  tableDataChanged(): void {
    this.st.reload();
  }
}
