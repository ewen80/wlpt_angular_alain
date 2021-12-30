import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';
import { ResourcesRoutingModule } from './resources-routing.module';
import { UploadComponent } from './upload/upload.component';
import { WeixingDetailComponent } from './weixing/weixing-detail/weixing-detail.component';
import { FieldAuditComponent } from './field-audit/field-audit.component';
import { WeixingListComponent } from './weixing/weixing-list/weixing-list.component';
import { AttachmentBagComponent } from './attachment-bag/attachment-bag.component';
import { YuleListComponent } from './yule/yule-list/yule-list.component';
import { YuleDetailComponent } from './yule/yule-detail/yule-detail.component';
import { YuleGwRoomComponent } from './yule/yule-gw-room-detail/yule-gw-room-detail.component';
import { YuleGwWcComponent } from './yule/yule-gw-wc-detail/yule-gw-wc-detail.component';
import { VodListComponent } from './vod/vod-list/vod-list.component';
import { VodDetailComponent } from './vod/vod-detail/vod-detail.component';
import { ArtifactShopListComponent } from './artifactshop/artifactshop-list/artifactshop-list.component';
import { ArtifactShopDetailComponent } from './artifactshop/artifactshop-detail/artifactshop-detail.component';

@NgModule({
  declarations: [
    UploadComponent,

    WeixingListComponent,
    WeixingDetailComponent,

    YuleListComponent,
    YuleDetailComponent, 
    YuleGwRoomComponent,
    YuleGwWcComponent,

    VodListComponent,
    VodDetailComponent,

    ArtifactShopListComponent,
    ArtifactShopDetailComponent,
    
    FieldAuditComponent,
    AttachmentBagComponent,
  ],
  imports: [SharedModule, ReactiveFormsModule, ResourcesRoutingModule]
})
export class ResourcesModule {}
