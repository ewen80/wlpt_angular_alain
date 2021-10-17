import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuGuard } from 'src/app/guards/menu.guard';

import { MyResourceListComponent } from './my-resource/my-resource-list/my-resource-list.component';
import { WeixingListComponent } from './weixing/weixing-list/weixing-list.component';
import { YuleListComponent } from './yule/yule-list/yule-list.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [MenuGuard],
    children: [
      { path: 'myresources', component: MyResourceListComponent },
      { path: 'weixings', component: WeixingListComponent },
      { path: 'yules', component: YuleListComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule {}
