import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService, User, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { IUser } from 'src/app/domains/iuser';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'header-user',
  template: `
    <div class="alain-default__nav-item d-flex align-items-center px-sm" nz-dropdown nzPlacement="bottomRight" [nzDropdownMenu]="userMenu">
      <nz-avatar [nzSrc]="user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
      {{ user.name }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-sm">
        <div nz-menu-item>
          <div nz-dropdown [nzDropdownMenu]="roleMenu" nzPlacement="bottomLeft">
          <i nz-icon nzType="user" class="mr-sm"></i>切换角色
          <i nz-icon nzType="down"></i>
          </div>
        </div>
        <div
          nz-menu-item
          (click)="showUpdatePasswordModal(updatePasswordModalTitle, updatePasswordModalContent, updatePasswordModalFooter)"
        >
          <i nz-icon nzType="key" class="mr-sm"></i>
          修改密码
        </div>
        <!-- <div nz-menu-item routerLink="/pro/account/center">
          <i nz-icon nzType="user" class="mr-sm"></i>
          个人中心
        </div>
        <div nz-menu-item routerLink="/pro/account/settings">
          <i nz-icon nzType="setting" class="mr-sm"></i>
          个人设置
        </div>
        <div nz-menu-item routerLink="/exception/trigger">
          <i nz-icon nzType="close-circle" class="mr-sm"></i>
          触发错误
        </div>
        <li nz-menu-divider></li> -->
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          注销
        </div>
      </div>
    </nz-dropdown-menu>
    <nz-dropdown-menu #roleMenu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item *ngFor="let roleId of user.roleIds" [nzSelected]="roleId === user.currentRoleId" (click)="changeCurrentRole(roleId)">
          {{ roleId }}
        </li>
      </ul>
    </nz-dropdown-menu>
    <ng-template #updatePasswordModalTitle>
      <span>修改密码</span>
    </ng-template>
    <ng-template #updatePasswordModalContent>
      <form nz-form [formGroup]="updatePasswordForm" se-container="1">
        <se label="原密码" labelWidth="120" [error]="{ required: '不能为空', checkOldPassword: '密码不正确' }">
          <input nz-input type="password" formControlName="oldPassword" required />
        </se>
        <se label="新密码" labelWidth="120" [error]="{ required: '不能为空', checkNewPassword: '新密码不能与原密码相同' }">
          <input nz-input type="password" formControlName="newPassword" required />
        </se>
        <se label="确认新密码" labelWidth="120" [error]="{ required: '不能为空', checkReNewPassword: '确认密码与新密码不同' }">
          <input nz-input type="password" formControlName="reNewPassword" required />
        </se>
      </form>
    </ng-template>
    <ng-template #updatePasswordModalFooter>
      <button nz-button (click)="closeUpdatePasswordModal()">取消</button>
      <button nz-button nzType="primary" [disabled]="!updatePasswordForm.valid" (click)="updatePassword()">确定</button>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderUserComponent implements OnInit {
  get user(): User {
    return this.settings.user;
  }

  private userId = '';

  updatePasswordForm!: FormGroup;

  updatePasswordModalRef!: NzModalRef<any, any>;

  constructor(
    private settings: SettingsService,
    private startupSrv: StartupService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: _HttpClient,
    private modal: NzModalService,
    private fb: FormBuilder,
    private userService: UserService,
    private msg: NzMessageService
  ) {
    this.updatePasswordForm = this.fb.group({
      oldPassword: [
        '',
        {
          Validators: [Validators.required],
          asyncValidators: [this.oldPasswordValidator()],
          updateOn: 'blur'
        }
      ],
      newPassword: ['', [Validators.required, this.newPasswordValidator()]],
      reNewPassword: ['', [Validators.required, this.newPasswordConfirmValidator()]]
    });
  }
  ngOnInit(): void {
    this.userId = this.settings.user.id;
  }

  // 异步密码验证器
  oldPasswordValidator(): any {
    return (control: AbstractControl) => {
      if (control.value) {
        const passwordMD5 = Md5.hashStr(control.value).toString().toUpperCase();
        return this.userService.checkPassword(this.userId, passwordMD5).pipe(
          map(result => {
            if (result) {
              return null;
            } else {
              return { checkOldPassword: false };
            }
          })
        );
      }
      return of(null);
    };
  }

  // 同步验证新密码不能和旧密码相同
  newPasswordValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.value && control.value === this.updatePasswordForm.controls.oldPassword.value) {
        return { checkNewPassword: false };
      } else {
        return null;
      }
    };
  }

  // 同步验证确认密码是否与新密码相同
  newPasswordConfirmValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.value && this.updatePasswordForm.controls.newPassword.value) {
        return control.value === this.updatePasswordForm.controls.newPassword.value ? null : { checkReNewPassword: false };
      } else {
        return null;
      }
    };
  }

  logout(): void {
    // 调用服务器端退出
    this.httpClient
      .get(environment.serverLogoutURL, null, {
        observe: 'response'
      })
      .subscribe({
        next: resp => {
          // 如果服务器成功退出返回200
          if (resp.status === 200) {
            this.tokenService.clear();
            this.router.navigateByUrl(this.tokenService.login_url!);
          }
        }
      });
  }

  showUpdatePasswordModal(modalTitle: TemplateRef<any>, modalContent: TemplateRef<any>, modalFooter: TemplateRef<any>): void {
    this.updatePasswordForm.reset();
    this.updatePasswordModalRef = this.modal.create({
      nzTitle: modalTitle,
      nzContent: modalContent,
      nzFooter: modalFooter
    });
  }

  closeUpdatePasswordModal(): void {
    this.updatePasswordForm.reset();
    this.updatePasswordModalRef.destroy();
  }

  // 更新密码
  updatePassword(): void {
    this.userService.setPasssword(this.userId, this.updatePasswordForm.controls.newPassword.value).subscribe({
      next: () => {
        this.msg.success('修改成功');
        this.logout();
      },
      error: () => this.msg.error('修改失败')
    });
  }

  // 变更用户当前角色
  changeCurrentRole(roleId:string) {
     

    this.userService.changeCurrentRole(this.userId, roleId).subscribe({
      next: () => {
        // 修改settingsService中的当前用户信息
        const user = this.settings.user;
        user.currentRoleId = roleId;
        this.settings.setUser(user);
        this.startupSrv.loadMenu(roleId);
        this.router.navigateByUrl("/");
        
        this.msg.success("当前角色已变更");
      }
    })
  }
}
