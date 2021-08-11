import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuGuard } from 'src/app/guards/menu.guard';
import { MenusComponent } from './resources/menus/menus.component';
import { ResourceListComponent } from './resources/resource-list/resource-list.component';
import { RolesListComponent } from './roles/role-list/roles-list.component';
import { UserlistComponent } from './users/user-list/user-list.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [MenuGuard],
    children: [
      { path: 'roles', component: RolesListComponent },
      { path: 'users', component: UserlistComponent },
      { path: 'resources', component: ResourceListComponent },
      { path: 'resources/menus', component: MenusComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
