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
import { Observable, Subscription, timer } from 'rxjs';
import { ValidateFunction } from 'ajv';
import { SettingsService } from '@delon/theme';
import { VodResourceService } from 'src/app/core/services/vod.service';
import { IVodResource } from 'src/app/domains/resources/ivod-resource';

@Component({
  selector: 'app-vod-detail',
  templateUrl: './vod-detail.component.html',
  styles: []
})
export class VodDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private acl: ACLService,
    private vodResourceService: VodResourceService,
    private fieldAuditService: FieldAuditService,
    private message: NzMessageService,
    private settings: SettingsService,
  ) {}

  resourceForm!: FormGroup;
  @Input() resourceId?: number;
  @Output() dataChanged = new EventEmitter();
  @Output() auditModalClosed = new EventEmitter();

  vodFieldAuditServiceUrl = environment.fieldAuditServiceMap.get(environment.vodResourceTypeClassName)!;
  vodResource?: IVodResource;

  qxs: Array<{ key: string; value: string }> = [];
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
      sysName: ['', [Validators.required]],
      deviceName: ['', [Validators.required]],
      manufacturer: ['', [Validators.required]],
      deviceModel: ['', [Validators.required]],
      samplingMethod: ['', [Validators.required]],
      detectLocation: ['', [Validators.required]],
      detectUnit: ['', [Validators.required]],
      sysExplanation: ['', [Validators.required]],
      detectBasis: ['', [Validators.required]],
      detectOverview: ['', [Validators.required]],
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
    if(this.vodResource && this.vodResource.permissions) {
      setAclAbility(this.vodResource?.permissions, this.acl);
    }
  }



  // 初始化detail数据
  initDetail(): void {
    if (this.resourceId) {
      this.vodResourceService.findOne(this.resourceId).subscribe({
        next: data => {
          this.vodResource = data;
          this.fieldAudits = data.fieldAudits ? data.fieldAudits : [];

          this.resourceForm.controls.sysName.setValue(data.sysName);
          this.resourceForm.controls.deviceName.setValue(data.deviceName);
          this.resourceForm.controls.manufacturer.setValue(data.manufacturer);
          this.resourceForm.controls.deviceModel.setValue(data.deviceModel);
          this.resourceForm.controls.samplingMethod.setValue(data.samplingMethod);
          this.resourceForm.controls.detectLocation.setValue(data.detectLocation);
          this.resourceForm.controls.detectUnit.setValue(data.detectUnit);
          this.resourceForm.controls.sysExplanation.setValue(data.sysExplanation);
          this.resourceForm.controls.detectBasis.setValue(data.detectBasis);
          this.resourceForm.controls.detectOverview.setValue(data.detectOverview);

          // n秒后设置该资源为已读
          if(!this.vodResource.readed) {
            this.readSubscription = timer(environment.setReadSeconds).subscribe({
              next: ()=>{
                this.vodResourceService.read(this.resourceId!, this.settings.user.id).subscribe();
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
        this.vodResource!.sysName = this.resourceForm.controls.sysName.value;
        this.vodResource!.deviceName = this.resourceForm.controls.deviceName.value;
        this.vodResource!.manufacturer = this.resourceForm.controls.manufacturer.value;
        this.vodResource!.deviceModel = this.resourceForm.controls.deviceModel.value;
        this.vodResource!.samplingMethod = this.resourceForm.controls.samplingMethod.value;
        this.vodResource!.detectLocation = this.resourceForm.controls.detectLocation.value;
        this.vodResource!.detectUnit = this.resourceForm.controls.detectUnit.value;
        this.vodResource!.sysExplanation = this.resourceForm.controls.sysExplanation.value;
        this.vodResource!.detectBasis = this.resourceForm.controls.detectBasis.value;
        this.vodResource!.detectOverview = this.resourceForm.controls.detectOverview.value;

        this.vodResourceService.update(this.vodResource!).subscribe({
          next: () => {
            this.dataChanged.emit();
            this.message.success('修改成功');
          }
        });

      } else {
        // 如果是新增
        this.vodResource = {
          sysName: this.resourceForm.controls.sysName.value,
          deviceName: this.resourceForm.controls.deviceName.value,
          manufacturer: this.resourceForm.controls.manufacturer.value,
          deviceModel: this.resourceForm.controls.deviceModel.value,
          samplingMethod: this.resourceForm.controls.samplingMethod.value,
          detectLocation: this.resourceForm.controls.detectLocation.value,
          detectUnit: this.resourceForm.controls.detectUnit.value,
          sysExplanation: this.resourceForm.controls.sysExplanation.value,
          detectBasis: this.resourceForm.controls.detectBasis.value,
          detectOverview: this.resourceForm.controls.detectOverview.value,

        };

        this.vodResourceService.add(this.vodResource!).subscribe({
          next: result => {
            this.resourceId = result.id;
            this.vodResource = result;
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
        resourceType: environment.vodResourceTypeClassName,
        resourceId: this.resourceId,
        auditId: auditId ? auditId : 0,
        permissions: this.vodResource?.permissions,
      },
      nzAfterClose: this.auditModalClosed,
      nzFooter: [
        {
          label: '打印',
          onClick: (component?: any) => {
            this.vodResourceService.print(this.resourceId!, component.auditId).subscribe({
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
      this.fieldAuditService.findByResourceId(this.resourceId, this.vodFieldAuditServiceUrl).subscribe({
        next: result=> {
          this.fieldAudits = result;
          this.vodResource!.fieldAudits = result;
        }
      })
    }
  }
    

  // 删除现场审核意见
  removeAudits(): void {
    if(this.resourceId){
      this.fieldAuditService.deleteByResourceId(this.selectedAuditIds, this.resourceId, this.vodFieldAuditServiceUrl).subscribe({
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
