import { Component, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { environment } from '@env/environment';
import { ResourceTypeService } from 'src/app/core/services/resource-type.service';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styles: [],
})
export class ResourceListComponent {
  constructor(private resourceTypeService: ResourceTypeService) {}

  url = environment.serverResourceTypeServiceURL;

  search_className = '';
  search_name = '';

  selectedTabIndex = 0;

  selectedResourceTypeClassNames: string[] = []; // 选中资源数组

  tabs: {
    title: string;
    className: string | undefined;
  }[] = [];

  @ViewChild('st', { static: true })
  st!: STComponent;

  columns: STColumn[] = [
    { title: '', index: 'className', type: 'checkbox' },
    {
      title: '类名',
      index: 'className',
      type: 'link',
      // width: 350,
      sort: true,
      click: (record: STData, instance?: STComponent) => {
        this.add(record.className);
      },
    },
    { title: '资源名', index: 'name', width: 150, sort: true },
    { title: '描述', index: 'description', sort: true },
    { title: '关联资源范围数量', index: 'resourceRanges.length' },
  ];

  // 返回数据预处理，判断资源范围数是否为0，为0才能删除
  dataProcess(data: STData[]): STData[] {
    return data.map((v) => {
      v.disabled = v.resourceRanges.length !== 0;
      return v;
    });
  }

  closeTab({ index }: { index: number }): void {
    this.tabs.splice(index - 1, 1);
  }

  submit(): void {
    let filterStr = '';
    if (this.search_className) {
      filterStr += 'className:*' + this.search_className + '*,';
    }
    if (this.search_name) {
      filterStr += 'name:*' + this.search_name + '*,';
    }

    this.st.req.params = { filter: filterStr };
    this.st.reload();
  }

  reset(): void {
    this.search_className = this.search_name = '';
    this.submit();
  }

  add(className: string | undefined): void {
    this.tabs.push({
      title: className === undefined ? '新建资源' : '资源信息',
      className,
    });
    this.selectedTabIndex = this.tabs.length;
  }

  resourceTypeDataChanged(): void {
    // 重新刷新数据
    this.st.reload();
  }

  // 删除资源
  remove(): void {
    this.resourceTypeService.delete(this.selectedResourceTypeClassNames).subscribe({
      next: () => {
        this.st.reload();
      },
    });
  }

  stChange(e: STChange): void {
    if (e.type === 'checkbox') {
      this.selectedResourceTypeClassNames = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach((v) => {
          this.selectedResourceTypeClassNames.push(v.className);
        });
      }
    }
  }
}
