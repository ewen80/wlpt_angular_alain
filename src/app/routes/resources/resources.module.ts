import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';

import { MyResourceDetailComponent } from './my-resource/my-resource-detail/my-resource-detail.component';
import { MyResourceListComponent } from './my-resource/my-resource-list/my-resource-list.component';
import { MyResourceRoomDetailComponent } from './my-resource/my-resource-room-detail/my-resource-room-detail.component';
import { ResourcesRoutingModule } from './resources-routing.module';
import { UploadComponent } from './upload/upload.component';
import { WeixingDetailComponent } from './weixing/weixing-detail/weixing-detail.component';
import { FieldAuditComponent } from './field-audit/field-audit.component';
import { WeixingListComponent } from './weixing/weixing-list/weixing-list.component';
import { AttachmentBagComponent } from './attachment-bag/attachment-bag.component';

@NgModule({
  declarations: [
    MyResourceListComponent,
    MyResourceDetailComponent,
    MyResourceRoomDetailComponent,
    UploadComponent,

    WeixingListComponent,
    WeixingDetailComponent,
    FieldAuditComponent,
    AttachmentBagComponent,
  ],
  imports: [SharedModule, ReactiveFormsModule, ResourcesRoutingModule]
})
export class ResourcesModule {}
