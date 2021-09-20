import { Component, EventEmitter, Inject, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { STChange, STColumn, STData } from "@delon/abc/st";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { environment } from "@env/environment";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalService } from "ng-zorro-antd/modal";
import { AttachmentBagService } from "src/app/core/services/attachment-bag.service";
import { FieldAuditService } from "src/app/core/services/field-audit.service";
import { IAttachmentBag } from "src/app/domains/iattachment-bag";
import { IFieldAudit } from "src/app/domains/resource/ifield-audit";
import { AttachmentBagComponent } from "../attachment-bag/attachment-bag.component";

@Component({
    selector: 'app-field-audit',
    templateUrl: './field-audit.component.html',
})
export class FieldAuditComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private msg: NzMessageService,
        private modal: NzModalService,
        private fieldAuditService: FieldAuditService,
        private attachmentBagService: AttachmentBagService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
      ) {}
    
      @Input() auditId = 0;
      // @Input() weixingId !: number;
      // 现场审核意见对应的资源类型
      @Input() resourceType = '';
      // 资源id
      @Input() resourceId = 0;
      // 附近包对话框关闭事件
      @Output() attachmentBagModalClosed = new EventEmitter();
    
      fieldAudit?: IFieldAudit;
      formGroup !: FormGroup;
      // 签名image url
      signImageUrl?: string;
      
      attachmentBags: IAttachmentBag[] = [];
      // 选中待删除附件包的ids
      selectedAttachmentBagIds: number[] =[]; 



      // 附件包表格列
      attachmentBagsColumn: STColumn[] = [
        { title: '', index: 'id', type: 'checkbox'},
        {
          title: '附件包名',  index: 'name', type: 'link',
          click: (bag: STData) => {
            this.showAttachmentBag(bag.id);
          }
        },
        { title: '备注信息', index: 'memo'},
        { title: '创建时间', index: 'createdAt'},
        { title: '附件数量', index: 'attachmentsCount'}
      ]
      // // 文件上传地址
      // fileUploadServiceURL = `${environment.serverUrl + environment.serverFileServiceURL}/upload`; 
    
      // removeFile = (file: NzUploadFile) => {
      //   return this.fileService.removeFile(file.response.name);
      // };
    
      ngOnInit(): void {
        this.formGroup = this.fb.group({
          content: ['', [Validators.required]],
          auditDate: [Date(), Validators.required],
          auditDepartment: [environment.defaultFieldAuditDepartment, Validators.required]
        });
        this.initAudit();

        // 订阅附件包对话框关闭事件，当对话框关闭时刷新附件包列表
        this.attachmentBagModalClosed.subscribe({
          next: () => this.getAttachmentBags(this.auditId)
        });
      }

      // 响应数据预处理
      resProcess(data: STData[], rawData?: any): STData[] {
        return data.map(row=>{
          row.attachmentsCount = row.attachments.length;
          return row;
        });
      }
    
      // 初始化现场审核信息
      initAudit(): void {
        if (this.auditId) {
          this.fieldAuditService.findId(this.auditId).subscribe({
            next: fa => {
              this.fieldAudit = fa;
              this.formGroup.controls.content.setValue(this.fieldAudit?.content);
              this.formGroup.controls.auditDate.setValue(this.fieldAudit.auditDate);
              this.formGroup.controls.auditDepartment.setValue(this.fieldAudit.auditDepartment);
              // 签名图片
              if(this.fieldAudit && this.fieldAudit.signature) {
                this.signImageUrl = `data:image/${this.fieldAudit!.signature!.imageExtention};base64,${this.fieldAudit!.signature!.signBase64}`;
              }
              // 初始化附件包
              this.attachmentBags = fa.attachmentBags ? fa.attachmentBags : [];

              // // 初始化附件包
              // this.attachmentBags = [];
              // fa.attachmentBags?.forEach(attachment => {
              //   this.attachments.push({
              //     uid: attachment.id!,
              //     name: attachment.name,
              //     status: 'done',
              //     url: `${environment.serverFileDownloadRootUrl}\\${attachment.path}`,
              //     response: {
              //       name: attachment.path,
              //       date: attachment.date,
              //       status: 'done'
              //     }
              //   });
              // });
            }
          });
        }
      }

      // 附件包选择改变时
      stChange(e: STChange): void {
        if (e.type === 'checkbox') {
          this.selectedAttachmentBagIds = [];
          if (e.checkbox !== undefined && e.checkbox.length > 0) {
            e.checkbox.forEach(v => {
              this.selectedAttachmentBagIds.push(v.id);
            });
          }
        }
      }
    
      // handleChange(info: NzUploadChangeParam): void {
      //   // 处理上传列表
      //   const fileList: NzUploadFile[] = [];
      //   info.fileList.forEach(file => {
      //     if (file.status === 'done') {
      //       fileList.push(file);
      //     }
      //   });
    
      //   if (info.file.status === 'done') {
      //     fileList.map(file => {
      //       file.url = `${environment.serverFileDownloadRootUrl}\\${file.response.name}`;
      //     });
      //     this.attachments = fileList;
      //     if (this.fieldAudit?.id) {
      //       // 修改情况，修改后台数据
      //       this.save();
      //     }
      //     this.msg.success(`${info.file.name} uploaded`);
      //   } else if (info.file.status === 'error') {
      //     this.attachments = fileList;
      //     this.msg.error(`${info.file.name} upload failed.`);
      //   } else if (info.file.status === 'removed') {
      //     this.attachments = fileList;
      //     if (this.fieldAudit?.id) {
      //       // 修改情况，修改后台数据
      //       this.save();
      //     }
      //     this.msg.success(`${info.file.name} removed`);
      //   }
      // }
    
      save(): void {
        if (this.validate()) {
          // // 转换附件类型
          // const attachs: IAttachment[] = [];
          // this.attachments.forEach(attachment => {
          //   attachs.push({
          //     name: attachment.name,
          //     path: attachment.response.name,
          //     date: attachment.response.date
          //   });
          // });

          // 对日期格式进行处理
          const auditDate = new Date(this.formGroup.controls.auditDate.value);
          const auditDateString = auditDate.toISOString().split('T')[0];

          const myFieldAudit: IFieldAudit = {
            id: this.auditId,
            content: this.formGroup.controls.content.value,
            auditDate: auditDateString,
            auditDepartment: this.formGroup.controls.auditDepartment.value,
            auditUserId: this.tokenService.get()!.user.id,
            // attachments: attachs,
          };
          // 如果是添加调用资源对应的FieldAuditService，如果是变更调用FieldAuditService
          if(this.auditId) {
            this.fieldAuditService.save(myFieldAudit).subscribe();
          } else {
            const serverUrl = environment.fieldAuditServiceMap.get(this.resourceType);
            if(serverUrl) {
              this.fieldAuditService.saveByResourceId(myFieldAudit, this.resourceId, serverUrl).subscribe({
                next: fieldAudit => this.auditId = fieldAudit.id!
              });
            }
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

      // 显示附件包界面
      showAttachmentBag(bagId?: number): void {
        const modal = this.modal.create({
          nzTitle: '附件包信息',
          nzContent: AttachmentBagComponent,
          nzComponentParams: {
            bagId: bagId ? bagId : 0,
            auditId: this.auditId,
          },
          nzAfterClose: this.attachmentBagModalClosed,
          nzFooter: [
            {
              label: '取消',
              onClick: () => {
                modal.destroy();
              }
            },
            {
              label: '确定',
              type: 'primary',
    
              onClick: (component?: any) => {
                if (component.validate()) {
                  component.save();
                  modal.destroy();
                }
              }
            }
          ]
        });
      }

      // 获取最新附件包信息
      getAttachmentBags(auditId: number): void {
        this.attachmentBagService.findByAuditId(auditId).subscribe({
          next: bags => this.attachmentBags = bags
        })
      }

      // 删除附件包
      removeAttachmentBag(): void {
        this.fieldAuditService.deleteAttachmentBags(this.selectedAttachmentBagIds, this.auditId).subscribe({
          next: ()=>this.getAttachmentBags(this.auditId)
        })
      }
}