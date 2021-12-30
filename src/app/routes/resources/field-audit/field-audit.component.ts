import { Component, EventEmitter, Inject, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { STChange, STColumn, STData } from "@delon/abc/st";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { SettingsService } from "@delon/theme";
import { environment } from "@env/environment";
import { NzImage, NzImageService } from "ng-zorro-antd/image";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalService } from "ng-zorro-antd/modal";
import { AttachmentBagService } from "src/app/core/services/attachment-bag.service";
import { FieldAuditService } from "src/app/core/services/field-audit.service";
import { IAttachmentBag } from "src/app/domains/iattachment-bag";
import { ISignature } from "src/app/domains/isignature";
import { IFieldAudit } from "src/app/domains/resources/ifield-audit";
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
        private nzImageService: NzImageService,
        private fieldAuditService: FieldAuditService,
        private attachmentBagService: AttachmentBagService,
        private settings: SettingsService,
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
      // 场地负责人签名image url
      signImageUrl?: string;
      // 审查人签名
      auditorSignatures?: {imageSrc: string, imageAlt: string}[];
      // gps图片url
      gpsImageUrl = "data:image/png;base64,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";
      
      gpsTitle = "没有GPS信息";
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
              // 负责人签名图片
              if(this.fieldAudit && this.fieldAudit.fzrSignature) {
                this.signImageUrl = `data:image/${this.fieldAudit!.fzrSignature!.imageExtention};base64,${this.fieldAudit!.fzrSignature!.signBase64}`;
              }
              // 核查人签名
              this.auditorSignatures = this.fieldAudit.auditorSignatures?.map(signature=>{
                return {
                  imageSrc: `data:image/${signature.imageExtention};base64,${signature.signBase64}`,
                  imageAlt: signature.name
                }
              });
              // GPS信息
              if(this.fieldAudit && this.fieldAudit.gps) {
                this.gpsImageUrl = environment.fieldAuditGpsUrl + "?center=" + this.fieldAudit.gps.lat + "," + this.fieldAudit.gps.lng + "&size=" + environment.fieldAuditGpsWidth + "*" + environment.fieldAuditGpsHeight + "&key=" + environment.fieldAuditGpsKey + "&zoom=" + environment.fieldAuditGpsZoom + "&markers=" + this.fieldAudit.gps.lat + "," + this.fieldAudit.gps.lng;
                this.gpsTitle = this.fieldAudit.gps.title;
              }
              // 初始化附件包
              this.attachmentBags = fa.attachmentBags ? fa.attachmentBags : [];
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
    
      save(): void {
        if (this.validate()) {
          // 对日期格式进行处理
          const auditDate = new Date(this.formGroup.controls.auditDate.value);
          const auditDateString = auditDate.toISOString().split('T')[0];

          const myFieldAudit: IFieldAudit = {
            id: this.auditId,
            content: this.formGroup.controls.content.value,
            auditDate: auditDateString,
            auditDepartment: this.formGroup.controls.auditDepartment.value,
            auditUserId: this.settings.user.id,
            attachmentBags: this.fieldAudit?.attachmentBags,
          };
          if(this.auditId) {
            this.fieldAuditService.save(myFieldAudit).subscribe();
          } else {
            const serverUrl = environment.fieldAuditServiceMap.get(this.resourceType);
            if(serverUrl) {
              this.fieldAuditService.saveByResourceId(myFieldAudit, this.resourceId, serverUrl).subscribe({
                next: fieldAudit => {
                  this.fieldAudit = fieldAudit;
                  this.auditId = fieldAudit.id!;
                }
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
          next: bags => {
            this.attachmentBags = bags;
            this.fieldAudit!.attachmentBags = bags;
          }
        })
      }

      // 删除附件包
      removeAttachmentBag(): void {
        this.fieldAuditService.deleteAttachmentBags(this.selectedAttachmentBagIds, this.auditId).subscribe({
          next: ()=>this.getAttachmentBags(this.auditId)
        })
      }

      // 显示签名
      showSignature(): void {
        const signatureImage: NzImage[] = [{
          src: this.signImageUrl!,
          width: '180px',
          height: '320px',
        }];
        this.nzImageService.preview(signatureImage, { nzZoom: 1, nzRotate: -90 });
      }
}