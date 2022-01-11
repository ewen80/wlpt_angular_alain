import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STData, STComponent, STChange, STRequestOptions, STColumnTag } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { ArtifactShopResourceService } from 'src/app/core/services/iartifactshop.service';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { setAclAbility } from 'src/app/shared/utils/set-acl-ability';
import { ArtifactShopDetailComponent } from '../artifactshop-detail/artifactshop-detail.component';

@Component({
  selector: 'app-artifactshop-list',
  templateUrl: './artifactshop-list.component.html',
  styles: []
})
export class ArtifactShopListComponent implements OnInit {
  constructor(private artifactShopResourceService: ArtifactShopResourceService, private settingService: SettingsService, private acl: ACLService) {}

  dataUrl = environment.serverArtifactShopResourceServiceURL;

  selectedTabIndex = 0;

  // 查询申请单位
  searchSqdw = '';
  // 查询场所地址
  searchCsdz = '';
  // 查询申办项目
  searchSbxm = '';


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
    { title: '申请单位', index: 'sqdw', width: 150 },
    { title: '场所地址', index: 'csdz' },
    { title: '申办项目', index: 'sbxm' },
    { title: '法人', index: 'faren' },
  ];


  selectedIds: number[] = []; // 选中id数组

  @ViewChild('st', { static: true })  st!: STComponent;
  @ViewChild('artifactShopDetail')  artifactShopDetail!: ArtifactShopDetailComponent;

  ngOnInit(): void {
    this.initOptButton();
  }

  // 初始化新建删除等操作按钮
  initOptButton() {
    this.artifactShopResourceService.getPermissions(this.settingService.user.currentRoleId).subscribe({
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
    this.artifactShopResourceService.delete(this.selectedIds).subscribe({
      next: () => {
        this.selectedIds = [];
        this.st.reload();
      }
    });
  }

  closeTab({ index }: { index: number }): void {
    this.artifactShopDetail.readSubscription?.unsubscribe();
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
    this.searchCsdz = '';
    this.searchSbxm = '';
    this.searchSqdw = '';
    this.search();
  }

  // 查询列表
  search(): void {
    let filterStr = '';

    if (this.searchCsdz) {
      filterStr += `csdz:*${this.searchCsdz}*,`;
    }

    if (this.searchSbxm) {
      filterStr += `sbxm:*${this.searchSbxm}*,`;
    }

    if (this.searchSqdw) {
      filterStr += `sqdw:*${this.searchSqdw}*,`;
    }
    
    this.st.req.params = { filter: filterStr };
    this.st.reload();
  }

  // 列表绑定数据变更
  tableDataChanged(): void {
    this.st.reload();
  }
}
