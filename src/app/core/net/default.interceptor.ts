import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponseBase } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { StartupService } from '../startup/startup.service';

const CODEMESSAGE: { [key: number]: string } = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  private refreshTokenType: 're-request' | 'auth-refresh' = 'auth-refresh';
  private refreshToking = false;
  private refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private injector: Injector, private startupSrv: StartupService, private settingSrv: SettingsService) {
    if (this.refreshTokenType === 'auth-refresh') {
      this.buildAuthRefresh();
    }
  }

  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN);
  }

  private get http(): _HttpClient {
    return this.injector.get(_HttpClient);
  }

  private goTo(url: string): void {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  private checkStatus(ev: HttpResponseBase): void {
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return;
    }

    const errortext = CODEMESSAGE[ev.status] || ev.statusText;
    this.notification.error(`请求错误 ${ev.status}: ${ev.url}`, errortext);
  }

  /**
   * 刷新 Token 请求
   */
  private refreshTokenRequest(): Observable<any> {
    // const model = this.tokenSrv.get();
    return this.http.put(environment.serverAuthRefreshURL, null, null, {});
  }

  // #region 刷新Token方式一：使用 401 重新刷新 Token

  private tryRefreshToken(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // 1、若请求为刷新Token请求，表示来自刷新Token可以直接跳转登录页
    if ([environment.serverAuthRefreshURL].some(url => req.url.includes(url))) {
      this.toLogin();
      return throwError(ev);
    }
    // 2、如果 `refreshToking` 为 `true` 表示已经在请求刷新 Token 中，后续所有请求转入等待状态，直至结果返回后再重新发起请求
    if (this.refreshToking) {
      return this.refreshToken$.pipe(
        filter(v => !!v),
        take(1),
        switchMap(() => next.handle(this.reAttachToken(req)))
      );
    }
    // 3、尝试调用刷新 Token
    this.refreshToking = true;
    this.refreshToken$.next(null);

    return this.refreshTokenRequest().pipe(
      switchMap(res => {
        // 通知后续请求继续执行
        this.refreshToking = false;
        this.refreshToken$.next(res);
        // 重新保存新 token
        this.tokenSrv.set(res);
        // 重新发起请求
        return next.handle(this.reAttachToken(req));
      }),
      catchError(err => {
        this.refreshToking = false;
        this.toLogin();
        return throwError(err);
      })
    );
  }

  /**
   * 重新附加新 Token 信息
   *
   * > 由于已经发起的请求，不会再走一遍 `@delon/auth` 因此需要结合业务情况重新附加新的 Token
   */
  private reAttachToken(req: HttpRequest<any>): HttpRequest<any> {
    // 以下示例是以 NG-ALAIN 默认使用 `SimpleInterceptor`
    const token = this.tokenSrv.get()?.token;
    return req.clone({
      setHeaders: {
        token: `Bearer ${token}`
      }
    });
  }

  // #endregion

  // #region 刷新Token方式二：使用 `@delon/auth` 的 `refresh` 接口

  private buildAuthRefresh(): void {
    this.tokenSrv.refresh
      .pipe(
        filter(() => !this.refreshToking),
        switchMap(() => {
          this.refreshToking = true;
          return this.refreshTokenRequest();
        })
      )
      .subscribe(
        () => {
          // 刷新服务器token后
          // 设置用户Token信息
          const authToken = this.tokenSrv.get();
          if (authToken) {
            authToken.expired = +new Date() + environment.tokenExpiredTime;
          }
          this.tokenSrv.set(authToken);
          this.refreshToking = false;

          // 刷新用户菜单
          this.startupSrv.loadMenu(this.settingSrv.user.currentRoleId);
        },
        err => {
          this.toLogin();
        }
      );
  }

  // #endregion

  private toLogin(): void {
    this.notification.error(`未登录或登录已过期，请重新登录。`, ``);
    this.goTo('/passport/login');
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.checkStatus(ev);
    // 业务处理：一些通用操作
    switch (ev.status) {
      case 200:
        // 业务层级错误处理，以下是假定restful有一套统一输出格式（指不管成功与否都有相应的数据格式）情况下进行处理
        // 例如响应内容：
        //  错误内容：{ status: 1, msg: '非法参数' }
        //  正确内容：{ status: 0, response: {  } }
        // 则以下代码片断可直接适用
        // if (ev instanceof HttpResponse) {
        //   const body = ev.body;
        //   if (body && body.status !== 0) {
        //     this.injector.get(NzMessageService).error(body.msg);
        //     // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
        //     // this.http.get('/').subscribe() 并不会触发
        //     return throwError({});
        //   } else {
        //     // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
        //     return of(new HttpResponse(Object.assign(ev, { body: body.response })));
        //     // 或者依然保持完整的格式
        //     return of(ev);
        //   }
        // }
        break;
      case 401:
        if (this.refreshTokenType === 're-request') {
          return this.tryRefreshToken(ev, req, next);
        }
        this.toLogin();
        break;
      case 403:
      case 404:
      case 500:
        this.goTo(`/exception/${ev.status}`);
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            '未可知错误，大部分是由于后端不支持跨域CORS或无效配置引起，请参考 https://ng-alain.com/docs/server 解决跨域问题',
            ev
          );
        }
        break;
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(ev);
    } else {
      return of(ev);
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 统一加上服务端前缀
    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = environment.serverUrl + url;
    }
    // 统一加上withCredentials: true,如果不加这个选项，浏览器不会保存服务器端发过来的cookie,同时也不会发送cookie到服务器
    // 头部统一加上 Accept:application/json
    const newReq = req.clone({
      url,
      withCredentials: true,
      setHeaders: {
        // Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // 告诉后台发送方是接口不是浏览器，不要弹出basic认证的窗口
      }
    });
    return next.handle(newReq).pipe(
      mergeMap(ev => {
        // 允许统一对请求错误处理
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        // 若一切都正常，则后续操作
        return of(ev);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next))
    );
  }
}
