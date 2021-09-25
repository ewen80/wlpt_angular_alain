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

  qxs: Array<{ key: string; value: string }> = [];
  selectedAuditIds: number[]  = [];
  fieldAudits: STData[] = [];


  // 境内收视节目源选择
  jnssjmys = [
    { value: '有线电视联网', label: '有线电视联网' },
    { value: '开路信号', label: '开路信号' },
    { value: 'IPTV', label: 'IPTV' },
    { value: '其他', label: '其他' }
  ];

  // 收视内容选择框
  ssnrCheckGroupOptions = [
    {label: 'CCTV-法语', value: 'CCTV-法语', checked: false},
    {label: 'CCTV-西班牙语', value: 'CCTV-西班牙语'},
    {label: 'CCTV-阿拉伯语', value: 'CCTV-阿拉伯语'},
    {label: 'CCTV-俄语', value: 'CCTV-俄语'},
    {label: 'CNN', value: 'CNN'},
    {label: 'AXN', value: 'AXN'},
    {label: 'CNBC', value: 'CNBC'},
    {label: 'HBO', value: 'HBO'},
    {label: 'TV5', value: 'TV5'},
    {label: 'CINEMAX', value: 'CINEMAX'},
    {label: 'DISCOVERY', value: 'DISCOVERY'},
    {label: 'NHK', value: 'NHK'},
    {label: 'TVB', value: 'TVB'},
    {label: 'NGC', value: 'NGC'},
    {label: 'NOW', value: 'NOW'},
    {label: '[V]音乐台', value: '[V]音乐台'},
    {label: '韩国KBS', value: '韩国KBS'},
    {label: '卫视体育台', value: '卫视体育台'},
    {label: '卫视国际电影台', value: '卫视国际电影台'},
    {label: '澳亚卫视中文台', value: '澳亚卫视中文台'},
    {label: '凤凰卫视电影台', value: '凤凰卫视电影台'},
    {label: '凤凰卫视中文台', value: '凤凰卫视中文台'},
    {label: '凤凰卫视资讯台', value: '凤凰卫视资讯台'}, 
    {label: '卫视体育台2', value: '卫视体育台2'},
    {label: '星空卫视', value: '星空卫视'},
    {label: '亚洲新闻台国际', value: '亚洲新闻台国际'},
    {label: '古巴视野国际频道', value: '古巴视野国际频道'},
    {label: '俄罗斯环球频道', value: '俄罗斯环球频道'},
    {label: '今日俄罗斯', value: '今日俄罗斯'},
    {label: '喀秋莎', value: '喀秋莎'},
  ]

  // 选中的收视内容
  ssnr = '';

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
      qxId: ['', [Validators.required]],
      sqlx: ['新办', [Validators.required]],
      azdz: ['', [Validators.required]],
      bgdh: ['', [Validators.required, Validators.pattern('(\\d)+')]],
      yzbm: ['', [Validators.required]],
      fzr: ['', [Validators.required]],
      fzrsj: ['', [Validators.required, Validators.pattern('1[3-9]\\d{9}')]],
      jfwz: ['', [Validators.required]],
      txwz: ['', [Validators.required]],
      txsl: ['', [Validators.required]],
      txlx: ['正馈', [Validators.required]],
      jnssjmy: ['有线电视联网', [Validators.required]],
      jnssjmy_other: [],
      wxmc: ['亚太六号', [Validators.required]],
      wxcsfs: ['同网传输', [Validators.required]],
      xhtzfs: ['数字', [Validators.required]],
      sjazdwmc: ['', [Validators.required]],
      wxssazxkz: ['', [Validators.required]],
      ssdwlx: ['酒店', [Validators.required]],
      lpm: ['', [Validators.required]],
      lc: ['', [Validators.required]],
      zds: ['', [Validators.required]],
      ssnr: ['']
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
            this.resourceForm.controls.jnssjmy.setValue('其他');
            this.resourceForm.controls.jnssjmy_other.setValue(data.jnssjmy);
          }

          this.resourceForm.controls.wxmc.setValue(data.wxmc);
          this.resourceForm.controls.wxcsfs.setValue(data.wxcsfs);
          this.resourceForm.controls.xhtzfs.setValue(data.xhtzfs);
          this.resourceForm.controls.sjazdwmc.setValue(data.sjazdwmc);
          this.resourceForm.controls.wxssazxkz.setValue(data.wxssazxkzh);
          this.resourceForm.controls.ssdwlx.setValue(data.ssdwlx);
          this.resourceForm.controls.lpm.setValue(data.lpm);
          this.resourceForm.controls.lc.setValue(data.lc);
          this.resourceForm.controls.zds.setValue(data.zds);
          // 初始化收视内容
          this.initSsnrCheckbox(data.ssnr);
        }
      });
    }
  }

  // 初始化收视内容选择框
  initSsnrCheckbox(ssnr: string) {
    const arrSsnr = ssnr.split(',');
    this.ssnrCheckGroupOptions.forEach(option=>{
      if(arrSsnr.indexOf(option.value) > -1){
        option.checked = true;
      }
    })
  }

  // 收视内容选择框变更回调,多内容用逗号分隔
  ssnrChanged(){
    this.ssnr = '';
    this.ssnrCheckGroupOptions.forEach(option => {
      if(option.checked) {
        this.ssnr += option.value + ',';
      }
    });
  }


  save(): void {
    if (this.resourceForm.valid) {
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

        if (this.resourceForm.controls.jnssjmy.value === '其他') {
          this.weixingResource!.jnssjmy = this.resourceForm.controls.jnssjmy_other.value;
        } else {
          this.weixingResource!.jnssjmy = this.resourceForm.controls.jnssjmy.value;
        }

        this.weixingResource!.wxmc = this.resourceForm.controls.wxmc.value;
        this.weixingResource!.wxcsfs = this.resourceForm.controls.wxcsfs.value;
        this.weixingResource!.xhtzfs = this.resourceForm.controls.xhtzfs.value;
        this.weixingResource!.ssnr = this.ssnr;
        this.weixingResource!.sjazdwmc = this.resourceForm.controls.sjazdwmc.value;
        this.weixingResource!.wxssazxkzh = this.resourceForm.controls.wxssazxkz.value;
        this.weixingResource!.ssdwlx = this.resourceForm.controls.ssdwlx.value;
        this.weixingResource!.lpm = this.resourceForm.controls.lpm.value;
        this.weixingResource!.lc = this.resourceForm.controls.lc.value;
        this.weixingResource!.zds = this.resourceForm.controls.zds.value;
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
          wxmc: this.resourceForm.controls.wxmc.value,
          jnssjmy:
            this.resourceForm.controls.jnssjmy.value === '其他'
              ? this.resourceForm.controls.jnssjmy_other.value
              : this.resourceForm.controls.jnssjmy.value,
          wxcsfs: this.resourceForm.controls.wxcsfs.value,
          xhtzfs: this.resourceForm.controls.xhtzfs.value,
          ssnr: this.ssnr,
          sjazdwmc: this.resourceForm.controls.sjazdwmc.value,
          wxssazxkzh: this.resourceForm.controls.wxssazxkz.value,
          ssdwlx: this.resourceForm.controls.ssdwlx.value,
          lpm: this.resourceForm.controls.lpm.value,
          lc: this.resourceForm.controls.lc.value,
          zds: this.resourceForm.controls.zds.value,
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
