import { HttpClient } from '@angular/common/http';
import { ReturnStatement } from '@angular/compiler';
import { Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, MenuService, SettingsService, TitleService, Menu } from '@delon/theme';
import { environment } from '@env/environment';
import { NzIconService } from 'ng-zorro-antd/icon';
import { throwError, zip } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { IUser } from 'src/app/domains/iuser';

import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: HttpClient,
    private injector: Injector
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  // private viaHttp(resolve: any, reject: any): void {
  //   this.httpClient
  //     .get('assets/tmp/app-data.json')
  //     .pipe(
  //       catchError((res) => {
  //         console.warn(`StartupService.load: Network request failed`, res);
  //         resolve(null);
  //         return [];
  //       }),
  //     )
  //     .subscribe(
  //       (appData) => {
  //         // Application data
  //         const res: any = appData;
  //         // Application information: including site name, description, year
  //         this.settingService.setApp(res.app);
  //         // User information: including name, avatar, email address
  //         this.settingService.setUser(res.user);
  //         // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
  //         this.aclService.setFull(true);
  //         // Menu data, https://ng-alain.com/theme/menu
  //         this.menuService.add(res.menu);
  //         // Can be set page suffix title, https://ng-alain.com/theme/title
  //         this.titleService.suffix = res.app.name;
  //       },
  //       () => {},
  //       () => {
  //         resolve(null);
  //       },
  //     );
  // }

  // private viaMock(resolve: any, reject: any): void {
  //   // const tokenData = this.tokenService.get();
  //   // if (!tokenData.token) {
  //   //   this.injector.get(Router).navigateByUrl('/passport/login');
  //   //   resolve({});
  //   //   return;
  //   // }
  //   // mock
  //   const app: any = {
  //     name: `ng-alain`,
  //     description: `Ng-zorro admin panel front-end framework`,
  //   };
  //   const user: any = {
  //     name: 'Admin',
  //     avatar: './assets/tmp/img/avatar.jpg',
  //     email: 'cipchk@qq.com',
  //     token: '123456789',
  //   };
  //   // Application information: including site name, description, year
  //   this.settingService.setApp(app);
  //   // User information: including name, avatar, email address
  //   this.settingService.setUser(user);
  //   // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
  //   this.aclService.setFull(true);
  //   // Menu data, https://ng-alain.com/theme/menu
  //   this.menuService.add([
  //     {
  //       text: 'Main',
  //       group: true,
  //       children: [
  //         {
  //           text: 'Dashboard',
  //           link: '/dashboard',
  //           icon: { type: 'icon', value: 'appstore' },
  //         },
  //       ],
  //     },
  //   ]);
  //   // Can be set page suffix title, https://ng-alain.com/theme/title
  //   this.titleService.suffix = app.name;

  //   resolve({});
  // }

  // 从Session中获取配置
  private viaSession(resolv: any, reject: any): void {
    const app: any = {
      name: environment.appName,
      description: environment.appDescription
    };
    // Application information: including site name, description, year
    this.settingService.setApp(app);

    const sessionUser = sessionStorage.getItem('_token');
    if (sessionUser == null) {
      resolv({});
    }

    const userObj = JSON.parse(sessionUser as string);
    const user: IUser = {
      id: userObj.user.id,
      name: userObj.user.name,
      token: userObj.token,
      avatar: userObj.user.avater,
      roleId: userObj.user.roleId,
      qxId: userObj.user.qxId
    };
    if (!user.avatar) {
      user.avatar = environment.defaultAvatar;
    }
    // User information: including name, avatar, email address
    this.settingService.setUser(user);
    resolv({});

    // 读取菜单信息
    this.loadMenu(user.id);
  }

  // 读取菜单信息
  private loadMenu(userId: string) {
    const menuUrl = `${environment.serverMenuServiceURL}/${userId}`;
    this.httpClient.get(menuUrl).subscribe({
      next: (resp: any) => {
        const menus: Menu[] = new Array<Menu>();
        resp.forEach((menu: any) => {
          menus.push(this.getChildMenu(menu));
        });
        this.menuService.add(menus);
      }
    });
  }

  // 递归生成菜单
  private getChildMenu(obj: any): Menu {
    const menu: Menu = {
      text: obj.name,
      link: obj.path,
      key: obj.id,
      icon: {
        type: 'icon',
        value: obj.iconClass
      },
      children: []
    };

    // 判断是否有子菜单,如果是叶子节点就返回上级菜单
    if (!obj.children || !obj.children.length) {
      menu.group = false;
      return menu;
    }

    obj.children.forEach((child: any) => {
      menu.children?.push(this.getChildMenu(child));
    });
    return menu;
  }

  load(): Promise<any> {
    // only works with promises
    // https://github.com/angular/angular/issues/15088
    return new Promise((resolve, reject) => {
      // http
      // this.viaHttp(resolve, reject);
      // mock：请勿在生产环境中这么使用，viaMock 单纯只是为了模拟一些数据使脚手架一开始能正常运行
      // this.viaMock(resolve, reject);
      this.viaSession(resolve, reject);
    });
  }
}
