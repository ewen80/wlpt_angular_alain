import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from '@core';
// import { DelonMockModule } from '@delon/mock';
import { AlainThemeModule } from '@delon/theme';
import { AlainConfig, ALAIN_CONFIG } from '@delon/util/config';

// Please refer to: https://ng-alain.com/docs/global-config
// #region NG-ALAIN Config

import { DelonACLModule } from '@delon/acl';

const alainConfig: AlainConfig = {
  // 列表分页配置
  st: {
    modal: { size: 'lg' },
    ps: 20,
    req: {
      reName: {
        pi: 'pageIndex',
        ps: 'pageSize',
      },
      process: (ro: STRequestOptions) => {
        let params = new HttpParams();
        const roparams: any = ro.params;

        Object.keys(roparams).forEach((key) => {
          if (key === 'sort') {
            const sortStr = roparams[key];
            if (sortStr && sortStr.indexOf('.')) {
              const sortField = sortStr.split('.')[0];
              const sortDirection = sortStr.split('.')[1]; // === 'ascend' ? 'asc' : 'desc';

              params = params.append('sortField', sortField).append('sortDirection', sortDirection);
            }
          } else {
            params = params.append(key, roparams[key]);
          }
        });

        // if (!params.get('sort')) {
        //   // 没有sort参数，则手工加一个空值sort参数
        //   params = params.append('sort', '').append('sortDirection', 'ASC');
        // }
        // if (!params.get('filter')) {
        //   // 没有filter参数，则手工加一个空值filter参数
        //   params = params.append('filter', '');
        // }

        ro.params = params;

        return ro;
      },
    },
    res: {
      reName: {
        total: 'totalElements',
        list: 'content',
      },
    },
    page: {
      zeroIndexed: true,
      showSize: true,
      total: '共 {{total}} 条',
    },
    sortReName: {
      ascend: 'ASC',
      descend: 'DESC',
    },
    singleSort: {},
  },
  pageHeader: { homeI18n: 'home' },
  lodop: {
    license: `A59B099A586B3851E0F0D7FDBF37B603`,
    licenseA: `C94CEE276DB2187AE6B65D56B3FC2848`,
  },
  auth: {
    login_url: '/passport/login',
  },
};

// const alainModules = [AlainThemeModule.forRoot(), DelonACLModule.forRoot(), DelonMockModule.forRoot()];
const alainModules = [AlainThemeModule.forRoot(), DelonACLModule.forRoot()];
const alainProvides = [{ provide: ALAIN_CONFIG, useValue: alainConfig }];

// mock
// import { environment } from '@env/environment';
// import * as MOCKDATA from '../../_mock';
// if (!environment.production) {
//   alainConfig.mock = { data: MOCKDATA };
// }

// #region reuse-tab
/**
 * 若需要[路由复用](https://ng-alain.com/components/reuse-tab)需要：
 * 1、在 `shared-delon.module.ts` 导入 `ReuseTabModule` 模块
 * 2、注册 `RouteReuseStrategy`
 * 3、在 `src/app/layout/default/default.component.html` 修改：
 *  ```html
 *  <section class="alain-default__content">
 *    <reuse-tab #reuseTab></reuse-tab>
 *    <router-outlet (activate)="reuseTab.activate($event)"></router-outlet>
 *  </section>
 *  ```
 */
// import { RouteReuseStrategy } from '@angular/router';
// import { ReuseTabService, ReuseTabStrategy } from '@delon/abc/reuse-tab';
// alainProvides.push({
//   provide: RouteReuseStrategy,
//   useClass: ReuseTabStrategy,
//   deps: [ReuseTabService],
// } as any);

// #endregion

// #endregion

// Please refer to: https://ng.ant.design/docs/global-config/en#how-to-use
// #region NG-ZORRO Config

import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { DA_STORE_TOKEN, SessionStorageStore } from '@delon/auth';
import { STRequestOptions } from '@delon/abc/st';
import { HttpParams } from '@angular/common/http';

const ngZorroConfig: NzConfig = {};

const zorroProvides = [{ provide: NZ_CONFIG, useValue: ngZorroConfig }];

// #endregion

@NgModule({
  imports: [...alainModules],
})
export class GlobalConfigModule {
  constructor(@Optional() @SkipSelf() parentModule: GlobalConfigModule) {
    throwIfAlreadyLoaded(parentModule, 'GlobalConfigModule');
  }

  static forRoot(): ModuleWithProviders<GlobalConfigModule> {
    return {
      ngModule: GlobalConfigModule,
      providers: [
        ...alainProvides,
        ...zorroProvides,
        { provide: DA_STORE_TOKEN, useClass: SessionStorageStore }, // TOKEN存储在Session中，关闭浏览器TOKEN就失效。https://ng-alain.com/auth/set/zh
      ],
    };
  }
}
