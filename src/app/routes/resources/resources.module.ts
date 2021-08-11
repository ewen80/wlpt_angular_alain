import { NgModule } from '@angular/core';

import { ResourcesRoutingModule } from './resources-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';
import { MyResourceListComponent } from './my-resource/my-resource-list/my-resource-list.component';
import { MyResourceDetailComponent } from './my-resource/my-resource-detail/my-resource-detail.component';
import { UploadComponent } from './upload/upload.component';
import { MyResourceRoomDetailComponent } from './my-resource/my-resource-room-detail/my-resource-room-detail.component';
import { WeixingListComponent } from './weixing/weixing-list/weixing-list.component';
import { WeixingDetailComponent } from './weixing/weixing-detail/weixing-detail.component';

@NgModule({
  declarations: [
    MyResourceListComponent,
    MyResourceDetailComponent,
    MyResourceRoomDetailComponent,
    UploadComponent,

    WeixingListComponent,
    WeixingDetailComponent,
  ],
  imports: [SharedModule, ReactiveFormsModule, ResourcesRoutingModule],
})
export class ResourcesModule {}
