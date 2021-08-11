// import { NgModule } from '@angular/core';
// import { SharedModule } from '@shared';

// import { CallbackComponent } from './callback.component';
// import { UserLockComponent } from './lock/lock.component';
// import { UserLoginComponent } from './login/login.component';
// import { PassportRoutingModule } from './passport-routing.module';
// import { UserRegisterResultComponent } from './register-result/register-result.component';
// import { UserRegisterComponent } from './register/register.component';

// const COMPONENTS = [UserLoginComponent, UserRegisterResultComponent, UserRegisterComponent, UserLockComponent, CallbackComponent];

// @NgModule({
//   imports: [SharedModule, PassportRoutingModule],
//   declarations: [...COMPONENTS],
// })
// export class PassportModule {}

// *****************************************************************************
// 暂时禁用，否则routes-routing.module.ts会报错，初步怀疑是UserLoginComponent, UserRegisterResultComponent, UserRegisterComponent, UserLockComponent,
// CallbackComponent组件同时被两个模块引用导致的。
// *****************************************************************************
