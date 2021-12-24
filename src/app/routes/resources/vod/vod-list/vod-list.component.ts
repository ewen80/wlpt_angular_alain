import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STData, STComponent, STChange, STRequestOptions, STColumnTag } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { VodResourceService } from 'src/app/core/services/vod/vod.service';
import { WeixingResourceService } from 'src/app/core/services/weixing/weixing.service';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { Region } from 'src/app/domains/region';
import { setAclAbility } from 'src/app/shared/utils/set-acl-ability';
import { VodDetailComponent } from '../vod-detail/vod-detail.component';

@Component({
  selector: 'app-vod-list',
  templateUrl: './vod-list.component.html',
  styles: []
})
export class VodListComponent implements OnInit {
  constructor(private vodResourceService: VodResourceService, private settingService: SettingsService, private acl: ACLService) {}

  dataUrl = environment.serverVodResourceServiceURL;

  selectedTabIndex = 0;

  // 查询系统名称
  searchSysName = '';
  // 查询设备名称
  searchDeviceName = '';
  // 查询检测地点
  searchDetectLocation = '';

  qxs: Array<{ key: string; value: string }> = [];

  tabs: Array<{
    title: string;
    id: number | undefined;
  }> = [];

  readTag: STColumnTag = {
    false: { text: '未读', color: 'red' },
  };
  
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
    { title: '系统名称', index: 'sysName', width: 150 },
    { title: '设备名称', index: 'deviceName' },
    { title: '制造厂商', index: 'manufacturer' },
    { title: '检测地点', index: 'detectLocation' },
  ];


  selectedIds: number[] = []; // 选中id数组

  @ViewChild('st', { static: true })  st!: STComponent;
  @ViewChild('vodDetail')  vodDetail!: VodDetailComponent;

  ngOnInit(): void {
    this.initOptButton();
  }

  // 初始化新建删除等操作按钮
  initOptButton() {
    this.vodResourceService.getPermissions(this.settingService.user.currentRoleId).subscribe({
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
    this.vodResourceService.delete(this.selectedIds).subscribe({
      next: () => {
        this.selectedIds = [];
        this.st.reload();
      }
    });
  }

  closeTab({ index }: { index: number }): void {
    this.vodDetail.readSubscription?.unsubscribe();
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
    this.searchDetectLocation = '';
    this.searchDeviceName = '';
    this.searchSysName = '';
    this.search();
  }

  // 查询列表
  search(): void {
    let filterStr = '';

    if (this.searchSysName) {
      filterStr += `sysName:*${this.searchSysName}*,`;
    }

    if (this.searchDeviceName) {
      filterStr += `deviceName:*${this.searchDeviceName}*,`;
    }

    if (this.searchDetectLocation) {
      filterStr += `detectLocation:*${this.searchDetectLocation}*,`;
    }
    
    this.st.req.params = { filter: filterStr };
    this.st.reload();
  }

  // 列表绑定数据变更
  tableDataChanged(): void {
    this.st.reload();
  }
}
