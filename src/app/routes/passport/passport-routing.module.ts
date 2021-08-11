// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';

// import { LayoutPassportComponent } from '../../layout/passport/passport.component';
// import { CallbackComponent } from './callback.component';
// import { UserLockComponent } from './lock/lock.component';
// import { UserLoginComponent } from './login/login.component';
// import { UserRegisterResultComponent } from './register-result/register-result.component';
// import { UserRegisterComponent } from './register/register.component';

// const routes: Routes = [
//   // passport
//   {
//     path: 'passport',
//     component: LayoutPassportComponent,
//     children: [
//       {
//         path: 'login',
//         component: UserLoginComponent,
//         data: { title: '登录', titleI18n: 'app.login.login' },
//       },
//       {
//         path: 'register',
//         component: UserRegisterComponent,
//         data: { title: '注册', titleI18n: 'app.register.register' },
//       },
//       {
//         path: 'register-result',
//         component: UserRegisterResultComponent,
//         data: { title: '注册结果', titleI18n: 'app.register.register' },
//       },
//       {
//         path: 'lock',
//         component: UserLockComponent,
//         data: { title: '锁屏', titleI18n: 'app.lock' },
//       },
//     ],
//   },
//   // 单页不包裹Layout
//   { path: 'passport/callback/:type', component: CallbackComponent },
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule],
// })
// export class PassportRoutingModule {}

// 由于passport目录下的组件同时被RoutesModule和PassportModule声明导致错误，所以passport模块暂时禁用 by wenliang 20210220
