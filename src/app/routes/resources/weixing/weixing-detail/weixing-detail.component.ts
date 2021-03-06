import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { STColumn, STData, STComponent, STChange } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FieldAuditService } from 'src/app/core/services/field-audit.service';
import { WeixingResourceService } from 'src/app/core/services/weixing.service';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { Region } from 'src/app/domains/region';
import { FieldAuditComponent } from '../../field-audit/field-audit.component';
import * as FileSaver from 'file-saver';
import { setAclAbility } from 'src/app/shared/utils/set-acl-ability';
import { Observable, Subscription, timer } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ValidateFunction } from 'ajv';
import { SettingsService } from '@delon/theme';
import { IWeixingResource } from 'src/app/domains/resources/iweixing-resource';

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
    private settings: SettingsService,
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

  // ????????????????????????
  readSubscription?: Subscription;

  // ???????????????????????????
  jnssjmys = [
    { value: '??????????????????', label: '??????????????????' },
    { value: '????????????', label: '????????????' },
    { value: 'IPTV', label: 'IPTV' },
    { value: '??????', label: '??????' }
  ];

  // ?????????????????????
  wxmcOptions = [
    {label: '????????????', value: '????????????', checked: true},
    {label: '??????6B', value: '??????6B'},
  ]

  // ?????????????????????
  ssnr = [
    {label: 'CCTV-??????', value: 'CCTV-??????', checked: false},
    {label: 'CCTV-????????????', value: 'CCTV-????????????'},
    {label: 'CCTV-????????????', value: 'CCTV-????????????'},
    {label: 'CCTV-??????', value: 'CCTV-??????'},
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
    {label: '[V]?????????', value: '[V]?????????'},
    {label: '??????KBS', value: '??????KBS'},
    {label: '???????????????', value: '???????????????'},
    {label: '?????????????????????', value: '?????????????????????'},
    {label: '?????????????????????', value: '?????????????????????'},
    {label: '?????????????????????', value: '?????????????????????'},
    {label: '?????????????????????', value: '?????????????????????'},
    {label: '?????????????????????', value: '?????????????????????'}, 
    {label: '???????????????2', value: '???????????????2'},
    {label: '????????????', value: '????????????'},
    {label: '?????????????????????', value: '?????????????????????'},
    {label: '????????????????????????', value: '????????????????????????'},
    {label: '?????????????????????', value: '?????????????????????'},
    {label: '???????????????', value: '???????????????'},
    {label: '?????????', value: '?????????'},
  ]


  // ???????????????????????????
  auditColumns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    {
      title: '????????????',
      index: 'content',
      type: 'link',
      width: 150,
      click: (record: STData, instance?: STComponent) => {
        this.showAudit(record.id);
      }
    },
    { title: '????????????', index: 'auditDate', width: 150 },
    { title: '?????????', index: 'auditUserId', width: 150 }
  ];


  ngOnInit(): void {
    this.resourceForm = this.fb.group({
      sqdw: ['', [Validators.required]],
      qxId: ['', [Validators.required]],
      sqlx: ['??????', [Validators.required]],
      azdz: ['', [Validators.required]],
      bgdh: ['', [Validators.required, Validators.pattern('(\\d)+')]],
      yzbm: ['', [Validators.required]],
      fzr: ['', [Validators.required]],
      fzrsj: ['', [Validators.required, Validators.pattern('1[3-9]\\d{9}')]],
      jfwz: ['', [Validators.required]],
      txwz: ['', [Validators.required]],
      txsl: ['', [Validators.required]],
      txlx: ['??????', [Validators.required]],
      jnssjmy: ['??????????????????', [Validators.required]],
      jnssjmy_other: [],
      wxmc: [this.wxmcOptions, [this.wxmcRequiredValidator()]],
      wxcsfs: ['????????????', [Validators.required]],
      xhtzfs: ['??????', [Validators.required]],
      sjazdwmc: ['', [Validators.required]],
      wxssazxkz: ['', [Validators.required]],
      ssdwlx: ['??????', [Validators.required]],
      lpm: ['', [Validators.required]],
      lc: ['', [Validators.required]],
      zds: ['', [Validators.required]],
      lxdz: ['', [Validators.required]],
      // ssnr: ['']
    });

    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });

    // ?????????resourceId?????????????????????
    if (this.resourceId) {
      this.initDetail();
    } 
    // ???????????????
    this.initOptButton();


    // ??????????????????????????????
    this.auditModalClosed.subscribe({
      next: () => {
        this.getAudits();
      }
    });
  }

  // ?????????????????????
  initOptButton(): void {
    if(this.weixingResource && this.weixingResource.permissions) {
      setAclAbility(this.weixingResource?.permissions, this.acl);
    }
  }

  // ???????????????????????????
  wxmcRequiredValidator(): ValidatorFn{
    return (control:AbstractControl) => {
      const wxmc = control.value as Array<{label:string, value:string, checked?:boolean}>;
      if(wxmc.some(value=> value.checked)){
        return null;
      } else {
        return {required:false}
      }
    }
  }

  // ??????????????????????????????
  jyfwInitial(wxmcStr:string): void{
    const wxmcArr = wxmcStr.split(",");
    this.wxmcOptions.forEach(option => {
      if(wxmcArr.find(wxmc=>option.value===wxmc)){
        option.checked = true;
      } else {
        option.checked = false;
      }
    })
    // ??????????????????????????????
    this.resourceForm.controls.wxmc.updateValueAndValidity();
  }


  // ?????????detail??????
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
            this.resourceForm.controls.jnssjmy.setValue('??????');
            this.resourceForm.controls.jnssjmy_other.setValue(data.jnssjmy);
          }

          this.resourceForm.controls.wxcsfs.setValue(data.wxcsfs);
          this.resourceForm.controls.xhtzfs.setValue(data.xhtzfs);
          this.resourceForm.controls.sjazdwmc.setValue(data.sjazdwmc);
          this.resourceForm.controls.wxssazxkz.setValue(data.wxssazxkzh);
          this.resourceForm.controls.ssdwlx.setValue(data.ssdwlx);
          this.resourceForm.controls.lpm.setValue(data.lpm);
          this.resourceForm.controls.lc.setValue(data.lc);
          this.resourceForm.controls.zds.setValue(data.zds);
          this.resourceForm.controls.lxdz.setValue(data.lxdz);

          // ?????????????????????
          this.initSsnrCheckbox(data.ssnr);
          // ?????????????????????
          this.jyfwInitial(data.wxmc);
          // n??????????????????????????????
          if(this.weixingResource && !this.weixingResource.readed) {
            this.readSubscription = timer(environment.setReadSeconds).subscribe({
              next: ()=>{
                this.weixingResourceService.read(this.resourceId!, this.settings.user.id).subscribe();
              }
            })
          }
        }
      });
    }
  }

  // ??????????????????????????????
  initSsnrCheckbox(ssnr: string) {
    const arrSsnr = ssnr.split(',');
    this.ssnr.forEach(option=>{
      if(arrSsnr.indexOf(option.value) > -1){
        option.checked = true;
      }
    })
  }

  save(): void {
    if (this.resourceForm.valid) {
      const wxmcArr = this.resourceForm.controls.wxmc.value as Array<{label:string,value:string,checked:boolean}>;
      // ??????????????????
      const strSsnr = this.ssnr.filter(option=>option.checked).map(option => {return option.value}).reduce((a,b)=>{return a+','+b+','});
      if (this.resourceId) {
        // ???????????????
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

        if (this.resourceForm.controls.jnssjmy.value === '??????') {
          this.weixingResource!.jnssjmy = this.resourceForm.controls.jnssjmy_other.value;
        } else {
          this.weixingResource!.jnssjmy = this.resourceForm.controls.jnssjmy.value;
        }

        this.weixingResource!.ssnr = strSsnr;
        this.weixingResource!.wxmc = this.resourceForm.controls.wxmc.value;
        this.weixingResource!.wxcsfs = this.resourceForm.controls.wxcsfs.value;
        this.weixingResource!.xhtzfs = this.resourceForm.controls.xhtzfs.value;
        this.weixingResource!.sjazdwmc = this.resourceForm.controls.sjazdwmc.value;
        this.weixingResource!.wxssazxkzh = this.resourceForm.controls.wxssazxkz.value;
        this.weixingResource!.ssdwlx = this.resourceForm.controls.ssdwlx.value;
        this.weixingResource!.lpm = this.resourceForm.controls.lpm.value;
        this.weixingResource!.lc = this.resourceForm.controls.lc.value;
        this.weixingResource!.zds = this.resourceForm.controls.zds.value;
        this.weixingResource!.lxdz = this.resourceForm.controls.lxdz.value;

        this.weixingResource!.wxmc = wxmcArr.filter(jyfw=>jyfw.checked===true).map(wxmc => wxmc.value).toString();

        this.weixingResourceService.update(this.weixingResource!).subscribe({
          next: () => {
            this.dataChanged.emit();
            this.message.success('????????????');
          }
        });

      } else {
        // ???????????????
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
            this.resourceForm.controls.jnssjmy.value === '??????'
              ? this.resourceForm.controls.jnssjmy_other.value
              : this.resourceForm.controls.jnssjmy.value,
          wxcsfs: this.resourceForm.controls.wxcsfs.value,
          xhtzfs: this.resourceForm.controls.xhtzfs.value,
          sjazdwmc: this.resourceForm.controls.sjazdwmc.value,
          wxssazxkzh: this.resourceForm.controls.wxssazxkz.value,
          ssdwlx: this.resourceForm.controls.ssdwlx.value,
          lpm: this.resourceForm.controls.lpm.value,
          lc: this.resourceForm.controls.lc.value,
          zds: this.resourceForm.controls.zds.value,
          ssnr: strSsnr,
          lxdz: this.resourceForm.controls.lxdz.value,
          wxmc: wxmcArr.filter(jyfw=>jyfw.checked===true).map(wxmc => wxmc.value).toString()
        };

        this.weixingResourceService.add(this.weixingResource!).subscribe({
          next: result => {
            this.resourceId = result.id;
            this.weixingResource = result;
            this.dataChanged.emit();
            this.message.success('????????????');
          }
        });
      }

      
    }
  }

  // ?????????????????????????????????
  showAudit(auditId?:number): void {
    const modal = this.modal.create({
      nzTitle: '??????????????????',
      nzContent: FieldAuditComponent,
      nzComponentParams: {
        resourceType: environment.weixingResourceTypeClassName,
        resourceId: this.resourceId,
        auditId: auditId ? auditId : 0,
      },
      nzAfterClose: this.auditModalClosed,
      nzFooter: [
        {
          label: '??????',
          onClick: (component?: any) => {
            this.weixingResourceService.print(this.resourceId!, component.auditId).subscribe({
              next: (blob)=>{
                FileSaver.saveAs(blob.body);
              }
            })
          }
        },
        {
          label: '??????',
          onClick: () => {
            modal.destroy();
          }
        },
        {
          label: '??????',
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

  // ????????????????????????
  getAudits(): void {
    if(this.resourceId){
      this.fieldAuditService.findByResourceId(this.resourceId, this.weixingFieldAuditServiceUrl).subscribe({
        next: result=> {
          this.fieldAudits = result;
          this.weixingResource!.fieldAudits = result;
        }
      })
    }
  }
    

  // ????????????????????????
  removeAudits(): void {
    if(this.resourceId){
      this.fieldAuditService.deleteByResourceId(this.selectedAuditIds, this.resourceId, this.weixingFieldAuditServiceUrl).subscribe({
        next: () => {
          this.selectedAuditIds = [];
          this.getAudits();
        }
      });
    }
  }

  // ???????????????????????????????????????
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
