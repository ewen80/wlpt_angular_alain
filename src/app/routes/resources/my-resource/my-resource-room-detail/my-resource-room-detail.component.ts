import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/environment';
import { FileService } from 'src/app/core/services/file.service';
import { IMyResourceRoom } from 'src/app/domains/my-resource/imy-resource-room';
import { MyResourceRoomService } from 'src/app/core/services/my-resource/my-resource-room.service';
import { IAttachment } from 'src/app/domains/iattachment';

@Component({
  selector: 'app-room-detail',
  templateUrl: './my-resource-room-detail.component.html',
  styles: [],
})
export class MyResourceRoomDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private fileService: FileService,
    private myResourceRoomService: MyResourceRoomService,
  ) {}

  @Input() roomId: number | undefined;
  @Input() myResourceId!: number;
  // @Output() dataChanged = new EventEmitter();

  room?: IMyResourceRoom;
  roomDetailForm!: FormGroup;

  attachments: NzUploadFile[] = [];
  fileUploadServiceURL = environment.serverUrl + environment.serverFileServiceURL + '/upload'; // 文件上传地址

  removeFile = (file: NzUploadFile) => {
    return this.fileService.removeFile(file.response.name);
  };

  ngOnInit(): void {
    this.roomDetailForm = this.fb.group({
      roomName: ['', [Validators.required]],
      roomDescription: [''],
    });
    this.initRoom();
  }

  initRoom(): void {
    if (this.roomId) {
      this.myResourceRoomService.findOne(this.roomId).subscribe({
        next: (room) => {
          this.room = room;
          this.roomDetailForm.controls.roomName.setValue(room.name);
          this.roomDetailForm.controls.roomDescription.setValue(room.description);
          // 初始化附件
          this.attachments = [];
          room.attachments.forEach((attachment) => {
            this.attachments.push({
              uid: attachment.id!,
              name: attachment.name,
              status: 'done',
              url: environment.serverFileDownloadRootUrl + '\\' + attachment.path,
              response: {
                name: attachment.path,
                date: attachment.date,
                status: 'done',
              },
            });
          });
        },
      });
    }
  }

  handleChange(info: NzUploadChangeParam): void {
    // 处理上传列表
    const fileList: NzUploadFile[] = [];
    info.fileList.forEach((file) => {
      if (file.status === 'done') {
        fileList.push(file);
      }
    });

    if (info.file.status === 'done') {
      fileList.map((file) => {
        file.url = environment.serverFileDownloadRootUrl + '\\' + file.response.name;
      });
      this.attachments = fileList;
      if (this.room?.id) {
        // 修改情况，修改后台数据
        this.save();
      }
      this.msg.success(`${info.file.name} uploaded`);
    } else if (info.file.status === 'error') {
      this.attachments = fileList;
      this.msg.error(`${info.file.name} upload failed.`);
    } else if (info.file.status === 'removed') {
      this.attachments = fileList;
      if (this.room?.id) {
        // 修改情况，修改后台数据
        this.save();
      }
      this.msg.success(`${info.file.name} removed`);
    }
  }

  save(): void {
    // this.validate();
    if (this.validate()) {
      // 转换附件类型
      const attachs: IAttachment[] = [];
      this.attachments.forEach((attachment) => {
        attachs.push({
          name: attachment.name,
          path: attachment.response.name,
          date: attachment.response.date,
        });
      });
      const myResourceRoom: IMyResourceRoom = {
        id: this.roomId,
        name: this.roomDetailForm.controls.roomName.value,
        description: this.roomDetailForm.controls.roomDescription.value,
        myResourceId: this.myResourceId,
        attachments: attachs,
      };
      this.myResourceRoomService.save(myResourceRoom).subscribe({
        next: (room) => {
          this.roomId = room.id;
        },
      });
      // this.dataChanged.emit();
    }
  }

  validate(): boolean {
    // eslint-disable-next-line guard-for-in
    for (const i in this.roomDetailForm.controls) {
      this.roomDetailForm.controls[i].markAsDirty();
      this.roomDetailForm.controls[i].updateValueAndValidity();
    }
    return this.roomDetailForm.valid;
  }
}
