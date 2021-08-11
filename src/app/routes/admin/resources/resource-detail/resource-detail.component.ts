import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupName, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { environment } from '@env/environment';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ResourceTypeService } from 'src/app/core/services/resource-type.service';
import { IResourceType } from 'src/app/domains/iresource-type';
import { IResourceRange } from 'src/app/domains/iresource-range';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { getLocaleExtraDayPeriodRules } from '@angular/common';
import { RoleService } from 'src/app/core/services/role.service';
import { IRole } from 'src/app/domains/irole';
import { ResourceRangeService } from 'src/app/core/services/ressource-range.service';
import { IResourceRangePermissionWrapper, Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { ResourceRangePermissionWrapperService } from 'src/app/core/services/resource-range-permission-wrapper.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.component.html',
  styles: [],
})
export class ResourceDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private resourceTypeService: ResourceTypeService,
    private modal: NzModalService,
    private roleService: RoleService,
    private resourceRangeService: ResourceRangeService,
    private permissionWrapperService: ResourceRangePermissionWrapperService,
    private message: NzMessageService,
  ) {}

  resourceTypeForm!: FormGroup;
  resourceRangeSearchForm!: FormGroup;
  resourceRangeDetailForm!: FormGroup;

  @Input() className: string | undefined;
  // 数据变化
  @Output() dataChanged = new EventEmitter();

  // 资源范围列表
  @ViewChild('resourceRangeList')
  resourceRangeList!: STComponent;

  roleList: IRole[] = [];

  // 资源范围表列
  resourceRangeColumn: STColumn[] = [
    { title: '', index: 'resourceRangeDTO.id', type: 'checkbox' },
    { title: 'className', index: 'resourceRangeDTO.resourceTypeClassName', width: 150 },
    { title: '角色id', index: 'resourceRangeDTO.roleId', width: 150, sort: true },
    { title: 'filter', index: 'resourceRangeDTO.filter' },
    { title: '全匹配', index: 'resourceRangeDTO.matchAll', sort: true },
    { title: '权限', index: 'permission' },
  ];

  permissions = [
    { label: '读', value: Permission.READ, checked: false },
    { label: '写', value: Permission.WRITE, checked: false },
    { label: '办结', value: Permission.FINISH, checked: false },
  ];

  selectedRanges: string[] = []; // 资源列表选中数组

  ngOnInit(): void {
    this.resourceTypeForm = this.fb.group({
      className: [
        '',
        {
          Validators: [Validators.required],
          asyncValidators: [this.uniqueClassNameValidator()],
          updateOn: 'blur',
        },
      ],
      name: ['', [Validators.required]],
      description: [''],
    });

    this.resourceRangeSearchForm = this.fb.group({
      roleId: [],
    });

    this.resourceRangeDetailForm = this.fb.group({
      resourceRangeFilter: [''],
      resourceRangeRoleId: [
        null,
        {
          Validators: [Validators.required],
          asyncValidators: [this.uniqueRangeRoleIdValidator()],
        },
      ],
      // permissions: [],
    });

    this.loadRole();

    if (this.className) {
      this.loadResourceType(this.className);
    }
  }

  // 异步className验证器
  uniqueClassNameValidator(): any {
    return (control: AbstractControl) => {
      if (control.value !== '') {
        return this.resourceTypeService.checkClassNameExist(control.value).pipe(
          map((checkResult) => (checkResult ? { uniqueResourceTypeClassName: false } : null)),
          catchError(() => of({ uniqueRoleId: false })),
        );
      }
      return of(null);
    };
  }

  searchRanges(): void {
    const searchRoleId = this.resourceRangeSearchForm.controls.roleId.value;
    this.loadResourceRange(this.className, searchRoleId);
  }

  // 读取type信息
  loadResourceType(className: string): void {
    this.resourceTypeForm.controls.className.disable(); // 有className则禁用className输入框
    this.resourceTypeService.findOne(className).subscribe((type) => {
      this.resourceTypeForm.controls.className.setValue(type.className);
      this.resourceTypeForm.controls.name.setValue(type.name);
      this.resourceTypeForm.controls.description.setValue(type.description);
      // 读取ranges信息
      this.loadResourceRange(className, undefined);
    });
  }

  // 读取ResourceRangePermission信息
  loadResourceRange(className: string | undefined, roleId: string | undefined): void {
    let filter = '';
    if (className) {
      filter = 'resourceType.className:' + className + ',';
    }
    if (roleId) {
      filter += 'role.id:*' + roleId + '*';
    }

    this.resourceRangeList.req.params = { filter };
    this.resourceRangeList.data = environment.serverPermissionServiceURL + '/wrappers';
    this.resourceRangeList.reload();
  }

  resetSearch(): void {
    this.resourceRangeSearchForm.controls.roleId.setValue('');
    this.loadResourceRange(this.className, undefined);
  }

  // 保存resourceType
  submit(): void {
    if (this.resourceTypeForm.valid) {
      const resourceType: IResourceType = {
        className: this.resourceTypeForm.controls.className.value,
        name: this.resourceTypeForm.controls.name.value,
        description: this.resourceTypeForm.controls.description.value,
      };
      this.resourceTypeService.save(resourceType).subscribe({
        next: (r) => {
          this.className = r.className;
          // 新增成功后，className字段不能再更新，刷新range列表
          this.resourceTypeForm.controls.className.disable(); // 有className则禁用className输入框
          // this.loadRange(r.className);
          // 触发数据变化事件
          this.dataChanged.emit();
        },
      });
    }
  }

  showAddRangesDialog(tpl: TemplateRef<any>, tplFooter: TemplateRef<any>): void {
    const modalRef = this.modal.create({
      nzTitle: '新增资源范围',
      nzContent: tpl,
      nzFooter: tplFooter,
    });
  }

  loadRole(): void {
    this.roleService.findAll().subscribe({
      next: (roles: IRole[]) => {
        this.roleList = roles;
      },
    });
  }

  // 资源范围角色唯一验证器
  uniqueRangeRoleIdValidator(): any {
    return (control: AbstractControl) => {
      if (this.className && control.value) {
        return this.resourceRangeService.checkExist(this.className, control.value).pipe(
          map((checkResult) => (checkResult ? { uniqueRangeRoleId: false } : null)),
          catchError(() => of({ uniqueRangeRoleId: false })),
        );
      } else {
        return of(null);
      }
    };
  }

  // 资源范围对话框字段重置
  rangeDetailReset(modalRef: NzModalRef): void {
    this.resourceRangeDetailForm.reset();
    this.resourceRangeDetailForm.controls.resourceRangeFilter.setValue('');
    this.permissions.map((permission) => {
      permission.checked = false;
    });
    modalRef.destroy();
  }

  // 资源范围对话框关闭
  rangeDetailOK(modalRef: NzModalRef): void {
    // 保存资源范围权限
    const wrapper: IResourceRangePermissionWrapper = {
      resourceRangeDTO: {
        id: 0,
        filter: this.resourceRangeDetailForm.controls.resourceRangeFilter.value,
        roleId: this.resourceRangeDetailForm.controls.resourceRangeRoleId.value,
        resourceTypeClassName: this.className as string,
      },
      permissions: this.permissions
        .filter((permission) => {
          return permission.checked;
        })
        .map((permission) => {
          return { mask: permission.value };
        }),
    };

    this.permissionWrapperService.save(wrapper).subscribe({
      next: () => {
        // 权限保存成功
        this.message.success('保存成功');
        this.loadResourceRange(this.className, undefined);
        this.rangeDetailReset(modalRef);
        // 刷新资源列表
        this.dataChanged.emit();
      },
      error: () => {
        // 权限保存失败
        this.message.error('权限保存失败');
      },
    });
  }

  // 对ResourceRange服务器返回数据的处理
  rangeListResponseProcess(data: STData[], rawData?: any): STData[] {
    return data.map((d) => {
      d.permission = '';
      const ps = d.permissions as { mask: Permission }[];
      ps.forEach((p) => {
        d.permission += Permission[p.mask] + '   ';
      });
      return d;
    });
  }

  // 资源列表选择改变
  rangeListChanged(e: STChange): void {
    if (e.type === 'checkbox') {
      this.selectedRanges = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach((v) => {
          this.selectedRanges.push(v.resourceRangeDTO.id);
        });
      }
    }
  }

  // 删除ResourceRange
  removeRanges(): void {
    this.permissionWrapperService.delete(this.selectedRanges.join(',')).subscribe({
      next: () => {
        this.message.success('删除成功');
        this.loadResourceRange(this.className, undefined);
        // 刷新资源列表
        this.dataChanged.emit();
      },
    });
  }
}
