import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STComponent } from '@delon/abc/st';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RoleService } from 'src/app/core/services/role.service';
import { UserService } from 'src/app/core/services/user.service';
import { IRole } from 'src/app/domains/irole';
import { IUser } from 'src/app/domains/iuser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Md5 } from 'ts-md5';
import { Region } from 'src/app/domains/region';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styles: [],
})
export class UserdetailComponent implements OnInit {
  // 用户id
  @Input() userId: string | undefined;
  // 用户数据变化
  @Output() dataChanged = new EventEmitter();

  // 用户信息表
  userInfoForm!: FormGroup;

  // 角色列表
  roleList: IRole[] = [];
  roleId: string | undefined;

  passwordVisible = false;

  qxs: Array<{ key: string; value: string }> = [];

  constructor(private fb: FormBuilder, private userService: UserService, private roleService: RoleService, private msg: NzMessageService) {}

  ngOnInit(): void {
    this.userInfoForm = this.fb.group({
      userId: [
        '',
        {
          Validators: [Validators.required],
          asyncValidators: [this.uniqueUserIdValidator()],
          updateOn: 'blur',
        },
      ],
      userName: [null, [Validators.required]],
      roleId: [null, [Validators.required]],
      qxId: ['', [Validators.required]],
    });

    this.loadRole();

    if (this.userId) {
      this.loadUser(this.userId);
    }

    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });
  }

  // 读取角色列表
  loadRole(): void {
    this.roleService.findAll().subscribe({
      next: (roles: IRole[]) => {
        this.roleList = roles;
      },
    });
  }

  // 读取用户信息
  loadUser(userId: string): void {
    this.userInfoForm.controls.userId.disable(); // 有用户id则禁用userId输入框
    this.userService.findOne(userId).subscribe((user) => {
      this.userInfoForm.controls.userId.setValue(user.id);
      this.userInfoForm.controls.userName.setValue(user.name);
      this.userInfoForm.controls.roleId.setValue(user.roleId);
      this.userInfoForm.controls.qxId.setValue(user.qxId);
    });
  }

  // 异步用户id验证器
  uniqueUserIdValidator(): any {
    return (control: AbstractControl) => {
      if (control.value !== '') {
        return this.userService.checkIdExist(control.value).pipe(
          map((checkResult) => (checkResult ? { uniqueUserId: false } : null)),
          catchError(() => of({ uniqueUserId: false })),
        );
      }
      return of(null);
    };
  }

  // 保存用户
  submit(): void {
    if (this.userInfoForm.valid) {
      const user: IUser = {
        id: this.userInfoForm.controls.userId.value,
        name: this.userInfoForm.controls.userName.value,
        roleId: this.userInfoForm.controls.roleId.value,
        qxId: this.userInfoForm.controls.qxId.value,
      };
      this.userService.save(user).subscribe({
        next: (u) => {
          this.msg.success('用户保存成功');
          // 新增成功后，roleId字段不能再更新，刷新用户列表
          this.userInfoForm.controls.userId.disable();
          // 触发数据变化事件
          this.dataChanged.emit();
        },
      });
    }
  }
}
