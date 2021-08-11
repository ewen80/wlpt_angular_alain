import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STColumn, STData, STComponent, STChange } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, ModalButtonOptions } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable } from 'rxjs';
import { FileService } from 'src/app/core/services/file.service';
import { MyResourceRoomService } from 'src/app/core/services/my-resource/my-resource-room.service';
import { MyResourceService } from 'src/app/core/services/my-resource/my-resource.service';
import { IAttachment } from 'src/app/domains/iattachment';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { IMyResource } from 'src/app/domains/my-resource/imy-resource';
import { Region } from 'src/app/domains/region';
import { IResourceCheckIn } from 'src/app/domains/resource/iresource-checkin';

import { MyResourceRoomDetailComponent } from '../my-resource-room-detail/my-resource-room-detail.component';

@Component({
  selector: 'app-my-resource-detail',
  templateUrl: './my-resource-detail.component.html',
  styles: []
})
export class MyResourceDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private modal: NzModalService,
    private acl: ACLService,
    private myResourceService: MyResourceService,
    private myResourceRoomService: MyResourceRoomService,
    private message: NzMessageService,
    private fileService: FileService
  ) {}

  myResource?: IMyResource;
  signBase64 = ''; // 签名图片base64数据

  resourceForm!: FormGroup;
  @Input() resourceId?: number;
  @Output() dataChanged = new EventEmitter();
  @Output() roomDetailClosed = new EventEmitter();

  qxs: Array<{ key: string; value: string }> = [];
  myResourceRomms: STData[] = [];

  selectedRoomIds: number[] = [];

  // 房间明细表
  stColumns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    {
      title: '房间名',
      index: 'name',
      type: 'link',
      width: 150,
      sort: true,
      click: (record: STData, instance?: STComponent) => {
        this.showRoom(record.id);
      }
    },
    { title: '描述', index: 'description', width: 150 },
    { title: '附件', render: 'attachments', width: 150 }
  ];

  // 文件上传相关
  fileDownloadRootUrl = environment.serverFileDownloadRootUrl;
  attachments: NzUploadFile[] = [];
  fileUploadServiceURL = `${environment.serverUrl + environment.serverFileServiceURL}/upload`; // 文件上传地址

  removeFile = (file: NzUploadFile) => {
    return this.fileService.removeFile(file.response.name);
  };

  ngOnInit(): void {
    this.resourceForm = this.fb.group({
      changdiName: ['', [Validators.required]],
      changdiAddress: ['', [Validators.required]],
      qxId: ['', [Validators.required]]
    });

    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });

    // 房间明细对话框关闭时
    this.roomDetailClosed.subscribe({
      next: () => {
        this.getRooms();
      }
    });

    if (this.resourceId) {
      this.initDetail();
      this.getRooms();
    } else {
      // 新增资源
      this.acl.attachAbility(['WRITE']);
    }
  }

  // 初始化保存按钮
  initSaveButton(): void {
    // 修改资源
    if (this.myResource?.permissions?.some(item => item.mask === Permission.WRITE)) {
      this.acl.attachAbility(['WRITE']);
    } else {
      this.acl.removeAbility(['WRITE']);
    }
  }

  // 初始化办结按钮
  initFinishButton(): void {
    if (!this.myResource?.resourceCheckIn?.finished && this.myResource?.permissions?.some(item => item.mask === Permission.FINISH)) {
      this.acl.attachAbility(['FINISH']);
    } else {
      this.acl.removeAbility(['FINISH']);
    }
  }

  // 初始化detail数据
  initDetail(): void {
    if (this.resourceId) {
      this.myResourceService.findOne(this.resourceId).subscribe({
        next: data => {
          this.myResource = data;
          if (this.myResource?.sign) {
            this.signBase64 = `data:image/${this.myResource.sign.imageExtention};base64,${this.myResource.sign.signBase64}`;
          }

          this.resourceForm.controls.changdiName.setValue(this.myResource.changdiName);
          this.resourceForm.controls.changdiAddress.setValue(this.myResource.changdiAddress);
          this.resourceForm.controls.qxId.setValue(this.myResource.qxId);

          this.initSaveButton();
          this.initFinishButton();
          this.initAttachments();
        }
      });
    }
  }

  // 初始化附件
  initAttachments(): void {
    this.attachments = [];
    this.myResource?.attachments?.forEach(attachment => {
      this.attachments.push({
        uid: attachment.id!,
        name: attachment.name,
        status: 'done',
        url: `${environment.serverFileDownloadRootUrl}\\${attachment.path}`,
        response: {
          name: attachment.path,
          date: attachment.date,
          status: 'done'
        }
      });
    });
  }

  save(): void {
    if (this.resourceForm.valid) {
      // 转换附件类型
      const attachs: IAttachment[] = [];
      this.attachments.forEach(attachment => {
        attachs.push({
          name: attachment.name,
          path: attachment.response.name,
          date: attachment.response.date
        });
      });
      if (this.resourceId) {
        // 如果是修改
        this.myResource!.changdiName = this.resourceForm.controls.changdiName.value;
        this.myResource!.changdiAddress = this.resourceForm.controls.changdiAddress.value;
        this.myResource!.qxId = this.resourceForm.controls.qxId.value;
        this.myResource!.attachments = attachs;
      } else {
        // 如果是新增
        this.myResource = {
          changdiName: this.resourceForm.controls.changdiName.value,
          changdiAddress: this.resourceForm.controls.changdiAddress.value,
          qxId: this.resourceForm.controls.qxId.value,
          attachments: attachs
        };
      }
      this.myResourceService.save(this.myResource!).subscribe({
        next: result => {
          this.resourceId = result.id;
          this.myResource = result;
          this.dataChanged.emit();
          this.message.success('保存成功');
        }
      });
    }
  }

  showRoom(roomId?: number): void {
    const roomModal = this.modal.create({
      nzTitle: '房间信息',
      nzContent: MyResourceRoomDetailComponent,
      nzComponentParams: {
        myResourceId: this.resourceId,
        roomId
      },
      nzAfterClose: this.roomDetailClosed,
      nzFooter: [
        {
          label: '取消',
          onClick: () => {
            // this.getRooms();
            roomModal.destroy();
          }
        },
        {
          label: '确定',
          type: 'primary',

          onClick: (component?: any) => {
            if (component.validate()) {
              component.save();
              roomModal.destroy();
            }
          }
        }
      ]
    });
  }

  getRooms(): void {
    if (this.resourceId) {
      this.myResourceRoomService.findByMyResourceId(this.resourceId).subscribe({
        next: rooms => {
          return (this.myResourceRomms = rooms);
        }
      });
    }
  }

  stChange(e: STChange): void {
    if (e.type === 'checkbox') {
      this.selectedRoomIds = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach(v => {
          this.selectedRoomIds.push(v.id);
        });
      }
    }
  }

  removeRoom(): void {
    this.myResourceRoomService.delete(this.selectedRoomIds).subscribe({
      next: () => {
        this.getRooms();
      }
    });
  }

  // 办结
  finish(): void {
    this.myResourceService.finish(this.resourceId!).subscribe({
      next: () => {
        this.message.success('办结成功');
      }
    });
  }

  // 处理上传列表
  handleChange(info: NzUploadChangeParam): void {
    const fileList: NzUploadFile[] = [];
    info.fileList.forEach(file => {
      if (file.status === 'done') {
        fileList.push(file);
      }
    });

    if (info.file.status === 'done') {
      fileList.map(file => {
        file.url = `${environment.serverFileDownloadRootUrl}\\${file.response.name}`;
      });
      this.attachments = fileList;
      if (this.myResource?.id) {
        // 修改情况，修改后台数据
        this.save();
      }
      this.msg.success(`${info.file.name} uploaded`);
    } else if (info.file.status === 'error') {
      this.attachments = fileList;
      this.msg.error(`${info.file.name} upload failed.`);
    } else if (info.file.status === 'removed') {
      this.attachments = fileList;
      if (this.myResource?.id) {
        // 修改情况，修改后台数据
        this.save();
      }
      this.msg.success(`${info.file.name} removed`);
    }
  }
}
