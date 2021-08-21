import { NgModule, Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared';

import { AdminRoutingModule } from './admin-routing.module';
import { InitComponent } from './init/init.component';
import { MenusComponent } from './resources/menus/menus.component';
import { ResourceDetailComponent } from './resources/resource-detail/resource-detail.component';
import { ResourceListComponent } from './resources/resource-list/resource-list.component';
import { RoleDetailComponent } from './roles/role-detail/role-detail.component';
import { RolesListComponent } from './roles/role-list/roles-list.component';
import { ChangePasswordComponent } from './users/change-password/change-password.component';
import { UserdetailComponent } from './users/user-detail/user-detail.component';
import { UserlistComponent } from './users/user-list/user-list.component';

const COMPONENTS: Array<Type<void>> = [
  RolesListComponent,
  RoleDetailComponent,
  UserlistComponent,
  UserdetailComponent,
  ResourceListComponent,
  ResourceDetailComponent,
  ChangePasswordComponent,
  MenusComponent,
  InitComponent
];

@NgModule({
  imports: [SharedModule, AdminRoutingModule, ReactiveFormsModule, RouterModule],
  declarations: COMPONENTS
})
export class AdminModule {}
