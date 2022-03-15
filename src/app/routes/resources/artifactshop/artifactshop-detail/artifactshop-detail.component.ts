import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { STColumn, STData, STComponent, STChange } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FieldAuditService } from 'src/app/core/services/field-audit.service';
import { FieldAuditComponent } from '../../field-audit/field-audit.component';
import * as FileSaver from 'file-saver';
import { setAclAbility } from 'src/app/shared/utils/set-acl-ability';
import { SettingsService } from '@delon/theme';
import { ArtifactShopResourceService } from 'src/app/core/services/iartifactshop.service';
import { IArtifactShopResource } from 'src/app/domains/resources/iartifactshop-resource';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-artifactshop-detail',
  templateUrl: './artifactshop-detail.component.html',
  styles: []
})
export class ArtifactShopDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private acl: ACLService,
    private resourceService: ArtifactShopResourceService,
    private fieldAuditService: FieldAuditService,
    private message: NzMessageService,
    private settings: SettingsService,
  ) {}

  resourceForm!: FormGroup;
  @Input() resourceId?: number;
  @Output() dataChanged = new EventEmitter();
  @Output() auditModalClosed = new EventEmitter();

  fieldAuditServiceUrl = environment.fieldAuditServiceMap.get(environment.artifactShopResourceTypeClassName)!;
  resource?: IArtifactShopResource;

  selectedAuditIds: number[]  = [];
  fieldAudits: STData[] = [];

  // 已读状态更新订阅
  readSubscription?: Subscription;

  // 审核意见列表列配置
  auditColumns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    {
      title: '审核意见',
      index: 'content',
      type: 'link',
      width: 150,
      click: (record: STData, instance?: STComponent) => {
        this.showAudit(record.id);
      }
    },
    { title: '审核日期', index: 'auditDate', width: 150 },
    { title: '审核人', index: 'auditUserId', width: 150 }
  ];


  ngOnInit(): void {
    this.resourceForm = this.fb.group({
      sqdw: ['', [Validators.required]],
      faren: ['', [Validators.required]],
      csdz: ['', [Validators.required]],
      lxr: ['', [Validators.required]],
      sbxm: ['', [Validators.required]],
      lxdh: ['', [Validators.required]],
    });


    // 如果有resourceId则读取具体内容
    if (this.resourceId) {
      this.initDetail();
    } 
    // 初始化权限
    this.initOptButton();


    // 核查意见对话框关闭时
    this.auditModalClosed.subscribe({
      next: () => {
        this.getAudits();
      }
    });
  }

  // 初始化操作按钮
  initOptButton(): void {
    if(this.resource && this.resource.permissions) {
      setAclAbility(this.resource?.permissions, this.acl);
    }
  }



  // 初始化detail数据
  initDetail(): void {
    if (this.resourceId) {
      this.resourceService.findOne(this.resourceId).subscribe({
        next: data => {
          this.resource = data;
          this.fieldAudits = data.fieldAudits ? data.fieldAudits : [];

          this.resourceForm.controls.sqdw.setValue(data.sqdw);
          this.resourceForm.controls.faren.setValue(data.faren);
          this.resourceForm.controls.csdz.setValue(data.csdz);
          this.resourceForm.controls.lxr.setValue(data.lxr);
          this.resourceForm.controls.sbxm.setValue(data.sbxm);
          this.resourceForm.controls.lxdh.setValue(data.lxdh);

          // n秒后设置该资源为已读
          if(!this.resource.readed) {
            this.readSubscription = timer(environment.setReadSeconds).subscribe({
              next: ()=>{
                this.resourceService.read(this.resourceId!, this.settings.user.id).subscribe();
              }
            })
          }
        }
      });
    }
  }


  save(): void {
    if (this.resourceForm.valid) {
      if (this.resourceId) {
        // 如果是修改
        this.resource!.sqdw = this.resourceForm.controls.sqdw.value;
        this.resource!.faren = this.resourceForm.controls.faren.value;
        this.resource!.csdz = this.resourceForm.controls.csdz.value;
        this.resource!.lxr = this.resourceForm.controls.lxr.value;
        this.resource!.sbxm = this.resourceForm.controls.sbxm.value;
        this.resource!.lxdh = this.resourceForm.controls.lxdh.value;

        this.resourceService.update(this.resource!).subscribe({
          next: () => {
            this.dataChanged.emit();
            this.message.success('修改成功');
          }
        });

      } else {
        // 如果是新增
        this.resource = {
          sqdw: this.resourceForm.controls.sqdw.value,
          faren: this.resourceForm.controls.faren.value,
          csdz: this.resourceForm.controls.csdz.value,
          lxr: this.resourceForm.controls.lxr.value,
          sbxm: this.resourceForm.controls.sbxm.value,
          lxdh: this.resourceForm.controls.lxdh.value,
        };

        this.resourceService.add(this.resource!).subscribe({
          next: result => {
            this.resourceId = result.id;
            this.resource = result;
            this.dataChanged.emit();
            this.message.success('添加成功');
          }
        });
      }

      
    }
  }

  // 弹出现场审核意见对话框
  showAudit(auditId?:number): void {
    const modal = this.modal.create({
      nzTitle: '现场审核信息',
      nzContent: FieldAuditComponent,
      nzComponentParams: {
        resourceType: environment.artifactShopResourceTypeClassName,
        resourceId: this.resourceId,
        auditId: auditId ? auditId : 0,
        permissions: this.resource?.permissions,
      },
      nzAfterClose: this.auditModalClosed,
      nzFooter: [
        {
          label: '打印',
          onClick: (component?: any) => {
            this.resourceService.print(this.resourceId!, component.auditId).subscribe({
              next: (blob)=>{
                FileSaver.saveAs(blob.body);
              }
            })
          }
        },
        {
          label: '取消',
          onClick: () => {
            modal.destroy();
          }
        },
        {
          label: '确定',
          type: 'primary',
          show: ()=>{
            if(this.acl.canAbility("WRITE")) {
              return true;
            } 
            return false;
          },
          onClick: (component?: any) => {
            if (component.validate()) {
              component.save();
              // modal.destroy();
            }
          }
        }
      ]
    });
  }

  // 获取现场审核意见
  getAudits(): void {
    if(this.resourceId){
      this.fieldAuditService.findByResourceId(this.resourceId, this.fieldAuditServiceUrl).subscribe({
        next: result=> {
          this.fieldAudits = result;
          this.resource!.fieldAudits = result;
        }
      })
    }
  }
    

  // 删除现场审核意见
  removeAudits(): void {
    if(this.resourceId){
      this.fieldAuditService.deleteByResourceId(this.selectedAuditIds, this.resourceId, this.fieldAuditServiceUrl).subscribe({
        next: () => {
          this.selectedAuditIds = [];
          this.getAudits();
        }
      });
    }
  }

  // 现场审核意见表选择框改变时
  stChange(e: STChange): void {
    if (e.type === 'checkbox') {
      this.selectedAuditIds = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach(v => {
          this.selectedAuditIds.push(v.id);
        });
      }
    }
  }
}
