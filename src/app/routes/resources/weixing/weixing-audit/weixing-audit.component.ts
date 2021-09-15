import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { environment } from "@env/environment";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzUploadChangeParam, NzUploadFile } from "ng-zorro-antd/upload";
import { FieldAuditService } from "src/app/core/services/field-audit.service";
import { FileService } from "src/app/core/services/file.service";
import { WeixingFieldAuditService } from "src/app/core/services/weixing/weixing-field-audit.service";
import { IAttachment } from "src/app/domains/iattachment";
import { IFieldAudit } from "src/app/domains/ifield-audit";

@Component({
    selector: 'app-weixing-audit',
    templateUrl: './weixing-audit.component.html',
})
export class WeixingFieldAuditComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private msg: NzMessageService,
        private fileService: FileService,
        private fieldAuditService: FieldAuditService,
        private weixingFieldAuditService: WeixingFieldAuditService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
      ) {}
    
      @Input() auditId = 0;
      @Input() weixingId !: number;
      // @Output() dataChanged = new EventEmitter();
    
      fieldAudit?: IFieldAudit;
      formGroup !: FormGroup;
      // 签名image url
      signImageUrl?: string;
    
      attachments: NzUploadFile[] = [];
      // 文件上传地址
      fileUploadServiceURL = `${environment.serverUrl + environment.serverFileServiceURL}/upload`; 
    
      removeFile = (file: NzUploadFile) => {
        return this.fileService.removeFile(file.response.name);
      };
    
      ngOnInit(): void {
        this.formGroup = this.fb.group({
          content: ['', [Validators.required]],
          auditDate: [Date(), Validators.required],
          auditDepartment: [environment.defaultFieldAuditDepartment, Validators.required]
        });
        this.initAudit();
      }
    
      // 初始化现场审核信息
      initAudit(): void {
        if (this.auditId) {
          this.fieldAuditService.findOne(this.auditId).subscribe({
            next: fa => {
              this.fieldAudit = fa;
              this.formGroup.controls.content.setValue(this.fieldAudit?.content);
              this.formGroup.controls.auditDate.setValue(this.fieldAudit.auditDate);
              this.formGroup.controls.auditDepartment.setValue(this.fieldAudit.auditDepartment);
              // 签名图片
              if(this.fieldAudit && this.fieldAudit.signature) {
                this.signImageUrl = `data:image/${this.fieldAudit!.signature!.imageExtention};base64,${this.fieldAudit!.signature!.signBase64}`;
              }
              // 初始化附件
              this.attachments = [];
              fa.attachments?.forEach(attachment => {
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
          });
        }
      }
    
      handleChange(info: NzUploadChangeParam): void {
        // 处理上传列表
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
          if (this.fieldAudit?.id) {
            // 修改情况，修改后台数据
            this.save();
          }
          this.msg.success(`${info.file.name} uploaded`);
        } else if (info.file.status === 'error') {
          this.attachments = fileList;
          this.msg.error(`${info.file.name} upload failed.`);
        } else if (info.file.status === 'removed') {
          this.attachments = fileList;
          if (this.fieldAudit?.id) {
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
              path: attachment.response.name,
              date: attachment.response.date
            });
          });

          // 对日期格式进行处理
          const auditDate = new Date(this.formGroup.controls.auditDate.value);
          const auditDateString = auditDate.toISOString().split('T')[0];

          const myFieldAudit: IFieldAudit = {
            id: this.auditId,
            content: this.formGroup.controls.content.value,
            auditDate: auditDateString,
            auditDepartment: this.formGroup.controls.auditDepartment.value,
            auditUserId: this.tokenService.get()!.user.id,
            attachments: attachs,
          };
          // 如果是添加调用WeixingFieldAuditService，如果是变更调用FieldAuditService
          if(this.auditId) {
            this.fieldAuditService.save(myFieldAudit).subscribe();
          } else {
            this.weixingFieldAuditService.save(myFieldAudit, this.weixingId).subscribe();
          }
          
          // this.dataChanged.emit();
        }
      }
    
      validate(): boolean {
        // eslint-disable-next-line guard-for-in
        for (const i in this.formGroup.controls) {
          this.formGroup.controls[i].markAsDirty();
          this.formGroup.controls[i].updateValueAndValidity();
        }
        return this.formGroup.valid;
      }
}