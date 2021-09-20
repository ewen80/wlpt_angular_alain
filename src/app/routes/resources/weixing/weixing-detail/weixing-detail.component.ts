import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STColumn, STData, STComponent, STChange } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FieldAuditService } from 'src/app/core/services/field-audit.service';
import { WeixingResourceService } from 'src/app/core/services/weixing/weixing.service';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { Region } from 'src/app/domains/region';
import { IWeixingResource } from 'src/app/domains/weixing-resource/iweixing-resource';
import { FieldAuditComponent } from '../../field-audit/field-audit.component';

@Component({
  selector: 'app-weixing-detail',
  templateUrl: './weixing-detail.component.html',
  styles: []
})
export class WeixingDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private acl: ACLService,
    private weixingResourceService: WeixingResourceService,
    private fieldAuditService: FieldAuditService,
    private message: NzMessageService,
  ) {}

  resourceForm!: FormGroup;
  @Input() resourceId?: number;
  @Output() dataChanged = new EventEmitter();
  @Output() auditModalClosed = new EventEmitter();

  weixingFieldAuditServiceUrl = environment.fieldAuditServiceMap.get(environment.weixingResourceTypeClassName)!;
  weixingResource?: IWeixingResource;
  // signBase64 = ''; // 签名图片base64数据

  qxs: Array<{ key: string; value: string }> = [];
  selectedAuditIds: number[]  = [];
  fieldAudits: STData[] = [];

  // // 文件上传相关
  // fileDownloadRootUrl = environment.serverFileDownloadRootUrl;
  // fileUploadServiceURL = `${environment.serverUrl + environment.serverFileServiceURL}/upload`; // 文件上传地址
  // attachments: NzUploadFile[] = [];

  // 境内收视节目源选择
  jnssjmys = [
    { value: 'yxdslw', label: '有线电视联网' },
    { value: 'klxh', label: '开路信号' },
    { value: 'iptv', label: 'IPTV' },
    { value: 'other', label: '其他' }
  ];

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

  // removeFile = (file: NzUploadFile) => {
  //   return this.fileService.removeFile(file.response.name);
  // };

  ngOnInit(): void {
    this.resourceForm = this.fb.group({
      sqdw: ['', [Validators.required]],
      qxId: ['', [Validators.required]],
      sqlx: ['xb', [Validators.required]],
      azdz: ['', [Validators.required]],
      bgdh: ['', [Validators.required, Validators.pattern('(\\d)+')]],
      yzbm: ['', [Validators.required]],
      fzr: ['', [Validators.required]],
      fzrsj: ['', [Validators.required, Validators.pattern('1[3-9]\\d{9}')]],
      jfwz: ['', [Validators.required]],
      txwz: ['', [Validators.required]],
      txsl: ['', [Validators.required]],
      txlx: ['zk', [Validators.required]],
      jnssjmy: ['yxdslw', [Validators.required]],
      jnssjmy_other: [''],
      wxcsfs: ['twcs', [Validators.required]],
      xhtzfs: ['sz', [Validators.required]],
      ssnr: ['', [Validators.required]],
      sjazdwmc: ['', [Validators.required]],
      wxssazxkz: ['', [Validators.required]],
      lpm: ['', [Validators.required]],
      lc: ['', [Validators.required]],
      zds: ['', [Validators.required]],
      // hcrq: [Date(), [Validators.required]]
    });

    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });

    if (this.resourceId) {
      this.initDetail();
    } else {
      this.acl.attachAbility(['WRITE']);
    }

    // 核查意见对话框关闭时
    this.auditModalClosed.subscribe({
      next: () => {
        this.getAudits();
      }
    });
  }

  // 初始化保存按钮
  initSaveButton(): void {
    // 修改资源
    if (this.weixingResource?.permissions?.some(item => item.mask === Permission.WRITE)) {
      this.acl.attachAbility(['WRITE']);
    } else {
      this.acl.removeAbility(['WRITE']);
    }
  }

  // 初始化detail数据
  initDetail(): void {
    if (this.resourceId) {
      this.weixingResourceService.findOne(this.resourceId).subscribe({
        next: data => {
          this.weixingResource = data;
          this.fieldAudits = data.fieldAudits ? data.fieldAudits : [];
          // if (this.weixingResource?.sign) {
          //   this.signBase64 = `data:image/${this.weixingResource.sign.imageExtention};base64,${this.weixingResource.sign.signBase64}`;
          // }

          this.resourceForm.controls.qxId.setValue(data.qxId);
          this.resourceForm.controls.sqdw.setValue(data.sqdw);
          this.resourceForm.controls.sqlx.setValue(data.sqlx);
          this.resourceForm.controls.azdz.setValue(data.azdz);
          this.resourceForm.controls.bgdh.setValue(data.bgdh);
          this.resourceForm.controls.yzbm.setValue(data.yzbm);
          this.resourceForm.controls.fzr.setValue(data.fzr);
          this.resourceForm.controls.fzrsj.setValue(data.fzrsj);
          this.resourceForm.controls.jfwz.setValue(data.jfwz);
          this.resourceForm.controls.txwz.setValue(data.txwz);
          this.resourceForm.controls.txsl.setValue(data.txsl);
          this.resourceForm.controls.txlx.setValue(data.txlx);

          if (this.jnssjmys.find(item => item.value === data.jnssjmy)) {
            this.resourceForm.controls.jnssjmy.setValue(data.jnssjmy);
          } else {
            this.resourceForm.controls.jnssjmy.setValue('other');
            this.resourceForm.controls.jnssjmy_other.setValue(data.jnssjmy);
          }

          this.resourceForm.controls.wxcsfs.setValue(data.wxcsfs);
          this.resourceForm.controls.xhtzfs.setValue(data.xhtzfs);
          this.resourceForm.controls.ssnr.setValue(data.ssnr);
          this.resourceForm.controls.sjazdwmc.setValue(data.sjazdwmc);
          this.resourceForm.controls.wxssazxkz.setValue(data.wxssazxkzh);
          this.resourceForm.controls.lpm.setValue(data.lpm);
          this.resourceForm.controls.lc.setValue(data.lc);
          this.resourceForm.controls.zds.setValue(data.zds);
          // this.resourceForm.controls.hcrq.setValue(new Date(data.hcrq));

          // // 获取审核意见
          // this.getAudits();

          // // 初始化上传列表
          // this.initAttachments();

          // this.initSaveButton();
        }
      });
    }
  }

  // // 初始化附件
  // initAttachments(): void {
  //   this.attachments = [];
  //   this.weixingResource?.attachments?.forEach(attachment => {
  //     this.attachments.push({
  //       uid: attachment.id!,
  //       name: attachment.name,
  //       status: 'done',
  //       url: `${environment.serverFileDownloadRootUrl}\\${attachment.path}`,
  //       response: {
  //         name: attachment.path,
  //         date: attachment.date,
  //         status: 'done'
  //       }
  //     });
  //   });
  // }

  save(): void {
    if (this.resourceForm.valid) {
      // // 转换附件类型
      // const attachs: IAttachment[] = [];
      // this.attachments.forEach(attachment => {
      //   attachs.push({
      //     name: attachment.name,
      //     path: attachment.response.name,
      //     date: attachment.response.date
      //   });
      // });

      // const hcrq = new Date(this.resourceForm.controls.hcrq.value);
      // const hcrqString = hcrq.toISOString().split('T')[0];

      if (this.resourceId) {
        // 如果是修改
        this.weixingResource!.qxId = this.resourceForm.controls.qxId.value;
        this.weixingResource!.sqdw = this.resourceForm.controls.sqdw.value;
        this.weixingResource!.sqlx = this.resourceForm.controls.sqlx.value;
        this.weixingResource!.azdz = this.resourceForm.controls.azdz.value;
        this.weixingResource!.bgdh = this.resourceForm.controls.bgdh.value;
        this.weixingResource!.yzbm = this.resourceForm.controls.yzbm.value;
        this.weixingResource!.fzr = this.resourceForm.controls.fzr.value;
        this.weixingResource!.fzrsj = this.resourceForm.controls.fzrsj.value;
        this.weixingResource!.jfwz = this.resourceForm.controls.jfwz.value;
        this.weixingResource!.txwz = this.resourceForm.controls.txwz.value;
        this.weixingResource!.txsl = this.resourceForm.controls.txsl.value;
        this.weixingResource!.txlx = this.resourceForm.controls.txlx.value;

        if (this.resourceForm.controls.jnssjmy.value === 'other') {
          this.weixingResource!.jnssjmy = this.resourceForm.controls.jnssjmy_other.value;
        } else {
          this.weixingResource!.jnssjmy = this.resourceForm.controls.jnssjmy.value;
        }

        this.weixingResource!.wxcsfs = this.resourceForm.controls.wxcsfs.value;
        this.weixingResource!.xhtzfs = this.resourceForm.controls.xhtzfs.value;
        this.weixingResource!.ssnr = this.resourceForm.controls.ssnr.value;
        this.weixingResource!.sjazdwmc = this.resourceForm.controls.sjazdwmc.value;
        this.weixingResource!.wxssazxkzh = this.resourceForm.controls.wxssazxkz.value;
        this.weixingResource!.lpm = this.resourceForm.controls.lpm.value;
        this.weixingResource!.lc = this.resourceForm.controls.lc.value;
        this.weixingResource!.zds = this.resourceForm.controls.zds.value;
        // this.weixingResource!.hcrq = hcrqString;

        // this.weixingResource!.attachments = attachs;
      } else {
        // 如果是新增
        this.weixingResource = {
          qxId: this.resourceForm.controls.qxId.value,
          sqdw: this.resourceForm.controls.sqdw.value,
          sqlx: this.resourceForm.controls.sqlx.value,
          azdz: this.resourceForm.controls.azdz.value,
          bgdh: this.resourceForm.controls.bgdh.value,
          yzbm: this.resourceForm.controls.yzbm.value,
          fzr: this.resourceForm.controls.fzr.value,
          fzrsj: this.resourceForm.controls.fzrsj.value,
          jfwz: this.resourceForm.controls.jfwz.value,
          txwz: this.resourceForm.controls.txwz.value,
          txsl: this.resourceForm.controls.txsl.value,
          txlx: this.resourceForm.controls.txlx.value,
          jnssjmy:
            this.resourceForm.controls.jnssjmy.value === 'other'
              ? this.resourceForm.controls.jnssjmy_other.value
              : this.resourceForm.controls.jnssjmy.value,
          wxcsfs: this.resourceForm.controls.wxcsfs.value,
          xhtzfs: this.resourceForm.controls.xhtzfs.value,
          ssnr: this.resourceForm.controls.ssnr.value,
          sjazdwmc: this.resourceForm.controls.sjazdwmc.value,
          wxssazxkzh: this.resourceForm.controls.wxssazxkz.value,
          lpm: this.resourceForm.controls.lpm.value,
          lc: this.resourceForm.controls.lc.value,
          zds: this.resourceForm.controls.zds.value,
          // hcrq: hcrqString,

          // attachments: attachs
        };
      }

      this.weixingResourceService.save(this.weixingResource!).subscribe({
        next: result => {
          this.resourceId = result.id;
          this.weixingResource = result;
          this.dataChanged.emit();
          this.message.success('保存成功');
        }
      });
    }
  }

  // // 处理上传列表
  // handleChange(info: NzUploadChangeParam): void {
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
  //     if (this.weixingResource?.id) {
  //       // 修改情况，修改后台数据
  //       this.save();
  //     }
  //     this.message.success(`${info.file.name} uploaded`);
  //   } else if (info.file.status === 'error') {
  //     this.attachments = fileList;
  //     this.message.error(`${info.file.name} upload failed.`);
  //   } else if (info.file.status === 'removed') {
  //     this.attachments = fileList;
  //     if (this.weixingResource?.id) {
  //       // 修改情况，修改后台数据
  //       this.save();
  //     }
  //     this.message.success(`${info.file.name} removed`);
  //   }
  // }

  // 弹出现场审核意见对话框
  showAudit(auditId?:number): void {
    const modal = this.modal.create({
      nzTitle: '现场审核信息',
      nzContent: FieldAuditComponent,
      nzComponentParams: {
        resourceType: environment.weixingResourceTypeClassName,
        resourceId: this.resourceId,
        auditId: auditId ? auditId : 0,
      },
      nzAfterClose: this.auditModalClosed,
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
      this.fieldAuditService.findByResourceId(this.resourceId, this.weixingFieldAuditServiceUrl).subscribe({
        next: result=> this.fieldAudits = result,
      })
    }
  }
    

  // 删除现场审核意见
  removeAudits(): void {
    if(this.resourceId){
      this.fieldAuditService.deleteByResourceId(this.selectedAuditIds, this.resourceId, this.weixingFieldAuditServiceUrl).subscribe({
        next: ()=> this.getAudits()
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
