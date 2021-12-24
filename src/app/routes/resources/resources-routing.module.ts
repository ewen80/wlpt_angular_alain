import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuGuard } from 'src/app/guards/menu.guard';
import { VodListComponent } from './vod/vod-list/vod-list.component';
import { WeixingListComponent } from './weixing/weixing-list/weixing-list.component';
import { YuleListComponent } from './yule/yule-list/yule-list.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [MenuGuard],
    children: [
      { path: 'weixings', component: WeixingListComponent },
      { path: 'yules', component: YuleListComponent},
      { path: 'vods', component: VodListComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule {}
