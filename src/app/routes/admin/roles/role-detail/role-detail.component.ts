import { Component, OnInit, ViewChild, Input, TemplateRef, Output, EventEmitter, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STColumn, STComponent } from '@delon/abc/st';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { NzTransferComponent, TransferItem } from 'ng-zorro-antd/transfer';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RoleService } from 'src/app/core/services/role.service';
import { UserService } from 'src/app/core/services/user.service';
import { IRole } from 'src/app/domains/irole';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styles: []
})
export class RoleDetailComponent implements OnInit {
  // 角色id
  @Input() roleId: string | undefined;
  // 角色数据变化
  @Output() dataChanged = new EventEmitter();

  // 用户表格
  @ViewChild('userList')
  userList!: STComponent;
  // 用户选择框
  @ViewChild('usersTransfer')
  usersTransfer!: NzTransferComponent;

  // 角色信息
  roleInfo?: IRole;
  // 角色信息表
  roleInfoForm!: FormGroup;
  // 用户列表查询表
  usersSearchForm!: FormGroup;

  // 角色用户选择穿梭框数据源
  usersTransferDataSource: TransferItem[] = [];

  // 用户表列
  usersColumn: STColumn[] = [
    // { title: '', index: 'id', type: 'checkbox' },
    { title: '用户id', index: 'id', width: 150, sort: true },
    { title: '用户名', index: 'name', width: 150, sort: true }
  ];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private userService: UserService,
    private modal: NzModalService,
    private message: NzMessageService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {}

  ngOnInit(): void {
    this.roleInfoForm = this.fb.group({
      roleId: [
        '',
        {
          Validators: [Validators.required],
          asyncValidators: [this.uniqueRoleIdValidator()],
          updateOn: 'blur'
        }
      ],
      roleName: ['', [Validators.required]],
      description: ['']
    });

    this.usersSearchForm = this.fb.group({
      userId: [''],
      userName: ['']
    });

    if (this.roleId) {
      this.loadRole(this.roleId);
    }
  }

  // 读取角色信息
  loadRole(roleId: string): void {
    this.roleInfoForm.controls.roleId.disable(); // 有角色id则禁用roleId输入框
    this.roleService.findOne(roleId).subscribe(role => {
      this.roleInfo = role;
      this.roleInfoForm.controls.roleId.setValue(role.id);
      this.roleInfoForm.controls.roleName.setValue(role.name);
      this.roleInfoForm.controls.description.setValue(role.description);
      this.userList.data = `${environment.serverUserServiceURL}/role/nopage/${role.id}`;
      this.userList.reload();
    });
  }

  // 保存角色
  submit(): void {
    if (this.roleInfoForm.valid) {
      const role: IRole = {
        id: this.roleInfoForm.controls.roleId.value,
        name: this.roleInfoForm.controls.roleName.value,
        description: this.roleInfoForm.controls.description.value,
        userIds: this.roleInfo?.userIds,
      };
      this.roleService.save(role).subscribe({
        next: r => {
          this.roleId = r.id;
          // 新增成功后，roleId字段不能再更新，刷新用户列表
          this.loadRole(r.id);
          // 触发数据变化事件
          this.dataChanged.emit();
        }
      });
    }
  }

  searchUsers(): void {
    let filterStr = '';
    const searchUserId = this.usersSearchForm.controls.userId.value;
    const searchUserName = this.usersSearchForm.controls.userName.value;
    if (searchUserId) {
      filterStr += `id:*${searchUserId}*`;
    }
    if (searchUserName) {
      filterStr += `name:*${searchUserName}*`;
    }

    this.userList.req.params = { filter: filterStr };
    this.userList.reload();
  }

  resetSearchUsers(): void {
    this.usersSearchForm.controls.userId.setValue('');
    this.usersSearchForm.controls.userName.setValue('');
    this.searchUsers();
  }

  // 异步角色id验证器
  uniqueRoleIdValidator(): any {
    return (control: AbstractControl) => {
      if (control.value !== '') {
        return this.roleService.checkIdExist(control.value).pipe(
          map(checkResult => (checkResult ? { uniqueRoleId: false } : null)),
          catchError(() => of({ uniqueRoleId: false }))
        );
      }
      return of(null);
    };
  }

  showAddUsersDialog(tpl: TemplateRef<any>): void {
    // 每次打开对话框刷新transfer数据源
    this.userService.findAll().subscribe({
      next: users => {
        const ti: TransferItem[] = [];

        users.forEach(user => {
          let dir: 'left' | 'right' = 'left';
          if(user.roleIds?.some(roleId => roleId===this.roleId)) {
            dir = 'right';
          }
          // if (user.roleId === this.roleId) {
          //   dir = 'right';
          // }
          ti.push({
            key: user.id,
            title: `${user.id}(${user.name})`,
            direction: dir
          });
        });
        this.usersTransferDataSource = ti;
      }
    });

    const modalRef = this.modal.create({
      nzTitle: '用户管理',
      nzContent: tpl,
      nzOnOk: () =>
        new Promise(resolve => {
          // 保存角色的用户成员
          if (this.roleId) {
            const userIds: string[] = [];
            this.usersTransfer.rightDataSource.forEach(user => {
              userIds.push(user.key);
            });
            this.roleService.setUsers(this.roleId, userIds).subscribe({
              next: () => {
                // 删除成功，关闭对话框
                this.message.success('保存成功');
                this.userList.reload();
                this.dataChanged.emit();
                resolve();
              },
              error: () => {
                this.message.error('保存失败');
                resolve(false);
              }
            });
          }
        })
    });
  }
}
