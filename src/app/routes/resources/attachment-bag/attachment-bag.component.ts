import { formatDate } from "@angular/common";
import { Component, Inject, Input, LOCALE_ID, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { environment } from "@env/environment";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzUploadChangeParam, NzUploadFile } from "ng-zorro-antd/upload";
import { AttachmentBagService } from "src/app/core/services/attachment-bag.service";
import { FileService } from "src/app/core/services/file.service";
import { IAttachment } from "src/app/domains/iattachment";
import { IAttachmentBag } from "src/app/domains/iattachment-bag";

@Component({
    selector: 'app-attachment-bag',
    templateUrl: './attachment-bag.component.html',
})
export class AttachmentBagComponent implements OnInit {

    constructor(private fb: FormBuilder, 
        private attachmentBagService: AttachmentBagService, 
        private fileService: FileService,
        private msg: NzMessageService,
        @Inject(LOCALE_ID) private locale: string){    }

    @Input() bagId = 0;
    @Input() auditId = 0;

    bagForm !: FormGroup;
    bagInfo?: IAttachmentBag;
    attachments: NzUploadFile[] = [];
    // 文件上传地址
    fileUploadServiceURL = environment.serverUrl + environment.serverFileServiceURL + "/upload"; 

    // 上传图片预览参数
    previewVisible = false;
    previewImage?: string;

    ngOnInit(): void {
      this.bagForm = this.fb.group({
          name: ['', [Validators.required]],
          memo: [''],
        })
      this.initBag(this.bagId);
    }

    initBag(bagId: number): void {
        if(bagId) {
            this.attachmentBagService.findById(bagId).subscribe({
                next: (bag) => {
                    this.bagInfo = bag;
                    this.bagForm.controls.name.setValue(bag.name);
                    this.bagForm.controls.memo.setValue(bag.memo);
                    this.initAttachments();
                }
            })
        }
        
    }

    // 删除附件
    removeFile = (file: NzUploadFile) => {
        return this.fileService.removeFile(file.response.path);
    };

    // 清理无效附件
    clearAttachments():void {
      // 如果没有附件包id，且已经上传了附件则删除所有附件
      if(!this.bagId) {
        this.attachments.forEach(attachment=>{
          this.fileService.removeFile(attachment.response.path).subscribe();
        })
      }
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
            file.url = `${environment.serverFileDownloadRootUrl}\\${file.response.path}?name=${file.response.name}`;
          });
          this.attachments = fileList;
          if (this.bagInfo?.id) {
            // 修改情况，修改后台数据
            this.save();
          }
          this.msg.success(`${info.file.name} uploaded`);
        } else if (info.file.status === 'error') {
          this.attachments = fileList;
          this.msg.error(`${info.file.name} upload failed.`);
        } else if (info.file.status === 'removed') {
          this.attachments = fileList;
          if (this.bagInfo?.id) {
            // 修改情况，修改后台数据
            this.save();
          }
          this.msg.success(`${info.file.name} removed`);
        }
      }

      save(): void {
        if (this.validate()) {
          // 转换附件类型
          const attachs: IAttachment[] = [];
          this.attachments.forEach(attachment => {
            attachs.push({
              name: attachment.name,
              path: attachment.response.path,
              date: attachment.response.date
            });
          });

          const bagInfo: IAttachmentBag = {
            id: this.bagId,
            name: this.bagForm.controls.name.value,
            memo: this.bagForm.controls.memo.value,
            createdAt: formatDate(new Date(), "yyyy-MM-dd HH:mm:ss", this.locale),
            attachments: attachs,
          };

          this.attachmentBagService.saveByFieldAudit(bagInfo, this.auditId).subscribe();
        }
      }

      // 表单核验
      validate(): boolean {
        // eslint-disable-next-line guard-for-in
        for (const i in this.bagForm.controls) {
          this.bagForm.controls[i].markAsDirty();
          this.bagForm.controls[i].updateValueAndValidity();
        }
        return this.bagForm.valid;
      }

      // 初始化附件
      initAttachments(): void {
        this.attachments = [];
        this.bagInfo?.attachments?.forEach(attachment => {
          this.attachments.push({
            uid: attachment.id!,
            name: attachment.name,
            status: 'done',
            url: `${environment.serverFileDownloadRootUrl}\\${attachment.path}?name=${attachment.name}`,
            response: {
              name: attachment.name,
              path: attachment.path,
              date: attachment.date,
              status: 'done'
            }
          });
        });
      }

      // 图片预览处理
      handlePreview = async (file: NzUploadFile): Promise<void> => {
        this.previewImage = file.url;
        this.previewVisible = true;
      };
}