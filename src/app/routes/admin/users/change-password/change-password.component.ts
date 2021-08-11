import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { UserService } from 'src/app/core/services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styles: [],
})
export class ChangePasswordComponent implements OnInit {
  @Input()
  userId: string | undefined;

  changePasswordForm!: FormGroup;

  constructor(private fb: FormBuilder, private modal: NzModalRef, private userService: UserService, private msg: NzMessageService) {}

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      password: ['', [Validators.required]],
      rePassword: ['', [Validators.required, this.passwordConfirmValidator()]],
    });
  }

  passwordConfirmValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (this.changePasswordForm) {
        return this.changePasswordForm.controls.password.value === control.value ? null : { passwordConfirm: false };
      } else {
        return null;
      }
    };
  }

  cancel(): void {
    this.modal.destroy();
  }

  ok(): void {
    if (this.userId) {
      this.userService.setPasssword(this.userId, this.changePasswordForm.controls.password.value).subscribe({
        next: () => {
          this.msg.success('修改成功');
          this.modal.destroy();
        },
        error: () => {
          this.msg.error('修改失败');
        },
      });
    }
  }
}
