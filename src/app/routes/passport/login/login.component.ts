import { HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnDestroy, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { DA_SERVICE_TOKEN, ITokenService, SocialOpenType, SocialService } from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabChangeEvent } from 'ng-zorro-antd/tabs';
import { IUser } from 'src/app/domains/iuser';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService]
})
export class UserLoginComponent implements OnDestroy {
  // #region fields

  get userId(): AbstractControl {
    return this.form.controls.userId;
  }
  get password(): AbstractControl {
    return this.form.controls.password;
  }
  get mobile(): AbstractControl {
    return this.form.controls.mobile;
  }
  get captcha(): AbstractControl {
    return this.form.controls.captcha;
  }
  form: FormGroup;
  error = '';
  type = 0;

  // #region get captcha

  count = 0;
  interval$: any;

  // #endregion

  constructor(
    fb: FormBuilder,
    private router: Router,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    public msg: NzMessageService
  ) {
    this.form = fb.group({
      userId: [null, [Validators.required]],
      password: [null, [Validators.required]],
      mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required]],
      remember: [true]
    });
  }

  switch({ index }: NzTabChangeEvent): void {
    this.type = index!;
  }

  getCaptcha(): void {
    if (this.mobile.invalid) {
      this.mobile.markAsDirty({ onlySelf: true });
      this.mobile.updateValueAndValidity({ onlySelf: true });
      return;
    }
    this.count = 59;
    this.interval$ = setInterval(() => {
      this.count -= 1;
      if (this.count <= 0) {
        clearInterval(this.interval$);
      }
    }, 1000);
  }

  // #endregion

  submit(): void {
    this.error = '';
    if (this.type === 0) {
      this.userId.markAsDirty();
      this.userId.updateValueAndValidity();
      this.password.markAsDirty();
      this.password.updateValueAndValidity();
      if (this.userId.invalid || this.password.invalid) {
        return;
      }
    } else {
      this.mobile.markAsDirty();
      this.mobile.updateValueAndValidity();
      this.captcha.markAsDirty();
      this.captcha.updateValueAndValidity();
      if (this.mobile.invalid || this.captcha.invalid) {
        return;
      }
    }

    // ????????????????????????HTTP?????????????????? [??????](https://ng-alain.com/auth/getting-started) ?????? Token
    // ??????????????????????????????????????????????????????????????????URL?????????`/login?_allow_anonymous=true` ????????????????????? Token ??????
    const passwordMD5 = Md5.hashStr(this.password.value).toString().toUpperCase(); // ???????????????MD5???????????????????????????
    const token = window.btoa(`${this.userId.value}:${passwordMD5}`); // Basic????????????
    this.http
      .get(`${environment.serverUserServiceURL}/${this.userId.value}?_allow_anonymous=true`, null, {
        headers: new HttpHeaders({ Authorization: `Basic ${token}` })
      })
      .subscribe({
        next: resp => {
          const user = resp as IUser;
          // ????????????????????????
          this.reuseTabService.clear();
          // ????????????Token??????
          const authToken = {
            // user: resp,
            token: this.userId.value,
            expired: +new Date() + environment.tokenExpiredTime
          };
          this.tokenService.set(authToken);

          if (!user.avatar) {
            user.avatar = environment.defaultAvatar;
          }
          this.settingsService.setUser(user);

          // ???????????? StartupService ???????????????????????????????????????????????????????????????????????????????????????
          this.startupSrv.load().then(() => {
            let url = this.tokenService.referrer!.url || '/';
            if (url.includes('/passport')) {
              url = '/';
            }
            this.router.navigateByUrl(url);
          });
        }
      });
  }

  // #region social

  // open(type: string, openType: SocialOpenType = 'href'): void {
  //   let url = ``;
  //   let callback = ``;
  //   // eslint-disable-next-line
  //   if (environment.production) {
  //     callback = `https://ng-alain.github.io/ng-alain/#/passport/callback/${type}`;
  //   } else {
  //     callback = `http://localhost:4200/#/passport/callback/${type}`;
  //   }
  //   switch (type) {
  //     case 'auth0':
  //       url = `//cipchk.auth0.com/login?client=8gcNydIDzGBYxzqV0Vm1CX_RXH-wsWo5&redirect_uri=${decodeURIComponent(callback)}`;
  //       break;
  //     case 'github':
  //       url = `//github.com/login/oauth/authorize?client_id=9d6baae4b04a23fcafa2&response_type=code&redirect_uri=${decodeURIComponent(
  //         callback
  //       )}`;
  //       break;
  //     case 'weibo':
  //       url = `https://api.weibo.com/oauth2/authorize?client_id=1239507802&response_type=code&redirect_uri=${decodeURIComponent(callback)}`;
  //       break;
  //   }
  //   if (openType === 'window') {
  //     this.socialService
  //       .login(url, '/', {
  //         type: 'window'
  //       })
  //       .subscribe(res => {
  //         if (res) {
  //           this.settingsService.setUser(res);
  //           this.router.navigateByUrl('/');
  //         }
  //       });
  //   } else {
  //     this.socialService.login(url, '/', {
  //       type: 'href'
  //     });
  //   }
  // }

  // #endregion

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
