import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { STColumn, STData, STComponent, STChange } from '@delon/abc/st';
import { ACLService } from '@delon/acl';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FieldAuditService } from 'src/app/core/services/field-audit.service';
import { Region } from 'src/app/domains/region';
import { FieldAuditComponent } from '../../field-audit/field-audit.component';
import * as FileSaver from 'file-saver';
import { setAclAbility } from 'src/app/shared/utils/set-acl-ability';
import { YuleResourceService } from 'src/app/core/services/yule/yule.service';
import { IYuleResourceBase } from 'src/app/domains/resources/yule-resource/iyule-resource-base';
import { YuleGwRoomComponent } from '../yule-gw-room-detail/yule-gw-room-detail.component';
import { YuleGwRoomService } from 'src/app/core/services/yule/yule-gw-room.service';
import { AnySchema } from 'ajv';
import { Result } from 'postcss';
import { YuleGwWcService } from 'src/app/core/services/yule/yule-gw-wc.service';
import { YuleGwWcComponent } from '../yule-gw-wc-detail/yule-gw-wc-detail.component';
import { IYuleYyBase } from 'src/app/domains/resources/yule-resource/iyule-yy-base';
import { IYuleGwRoom } from 'src/app/domains/resources/yule-resource/iyule-gw-room';
import { IYuleGwWc } from 'src/app/domains/resources/yule-resource/iyule-gw-wc';
import { IFieldAudit } from 'src/app/domains/resources/ifield-audit';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Subscription, timer } from 'rxjs';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-yule-detail',
  templateUrl: './yule-detail.component.html',
  styles: []
})
export class YuleDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private acl: ACLService,
    private yuleResourceService: YuleResourceService,
    private gwRoomService: YuleGwRoomService,
    private gwWcService: YuleGwWcService,
    private fieldAuditService: FieldAuditService,
    private message: NzMessageService,
    private settings: SettingsService,
  ) {}

  resourceForm!: FormGroup;
  @Input() resourceId?: number;
  @Output() dataChanged = new EventEmitter();
  @Output() roomModalClosed = new EventEmitter();
  @Output() wcModalClosed = new EventEmitter();
  @Output() auditModalClosed = new EventEmitter();

  // ??????????????????
  gwRooms:STData[] = [];
  // ??????????????????
  gwWcs:STData[] = [];

  // ????????????????????????
  yuleGwRoomServiceUrl?:string;
  // ??????????????????????????????
  yuleFieldAuditServiceUrl = environment.fieldAuditServiceMap.get(environment.yuleResourceBaseTypeClassName)!;
  yuleResourceBase?: IYuleResourceBase;

  qxs: Array<{ key: string; value: string }> = [];
  selectedAuditIds: number[]  = [];
  fieldAudits: STData[] = [];

  // ????????????????????????
  readSubscription?: Subscription;

  selectedRoomIds:number[] = [];
  selectedWcIds:number[] = [];

  // ????????????????????????????????????
  showGw = false;
  // ??????????????????????????????
  showYy = false;

  // ???????????????????????????????????????
  gwRoomColumn: STColumn[] = [
    {title: '', index: 'id', type: 'checkbox'},
    {
      title: '?????????', 
      index: 'name', 
      type: 'link',
      click: (record: STData, instance?: STComponent) => {
        this.showRoom(record.id);
      }
    },
    {title: '??????', index: 'area'},
    {
      title: '???????????????????????????', 
      index: 'toilet',
      format: (item) => {
        if(item.toilet) {
          return "???";
        } else {
          return "???"
        }
      }
    },
    {
      title: '?????????????????????', 
      index: 'innerLock',
      format: (item) => {
        if(item.toilet) {
          return "???";
        } else {
          return "???"
        }
      }
    },
    {
      title: '??????????????????????????????', 
      index: 'window',
      format: (item, col, index) => {
        if(item.toilet) {
          return "???";
        } else {
          return "???"
        }
      }
    },
    {
      title: '?????????????????????', 
      index: 'everlight',
      format: (item, col, index) => {
        if(item.toilet) {
          return "???";
        } else {
          return "???"
        }
      }
    }
  ];

  // ???????????????????????????????????????
  gwWcColumn: STColumn[] = [
    {title: '', index: 'id', type: 'checkbox'},
    {
      title: '?????????', 
      index: 'name', 
      type: 'link',
      click: (record: STData, instance?: STComponent) => {
        this.showWc(record.id);
      }
    },
    {title: '??????', index: 'area'},
    {
      title: '??????????????????????????????', 
      index: 'dlwc',
      format: (item) => {
        if(item.dlwc) {
          return "???";
        } else {
          return "???"
        }
      }
    },
    {
      title: '????????????????????????', 
      index: 'ywjf',
      format: (item) => {
        if(item.ywjf) {
          return "???";
        } else {
          return "???"
        }
      }
    },
  ];

  // ?????????????????????
  jyfwCheckboxOptions = [
    {label:"????????????", value:"????????????", checked: false},
    {label:"????????????", value:"????????????"},
    {label:"???????????????", value:"???????????????"}
  ];

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

  // ???????????????????????????
  jyfwRequiredValidator():ValidatorFn {
    return (control:AbstractControl) => {
      const jyfw = control.value as Array<{label:string, value:string, checked?:boolean}>;
      if(jyfw.some(value=> value.checked)){
        return null;
      } else {
        return {required:false}
      }
    }
  }

  // ???????????????????????????
  roomListChanged(e:STChange):void {
    if (e.type === 'checkbox') {
      this.selectedRoomIds = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach(v => {
          this.selectedRoomIds.push(v.id);
        });
      }
    }
  }

  // ???????????????????????????
  wcListChanged(e:STChange):void {
    if (e.type === 'checkbox') {
      this.selectedWcIds = [];
      if (e.checkbox !== undefined && e.checkbox.length > 0) {
        e.checkbox.forEach(v => {
          this.selectedWcIds.push(v.id);
        });
      }
    }
  }

  ngOnInit(): void {
    this.resourceForm = this.fb.group({
      dwmc: ['', [Validators.required]],
      qxId: ['', [Validators.required]],
      sbxm: ['??????', [Validators.required]],
      csdz: ['', [Validators.required]],
      lxdh: ['', [Validators.required, Validators.pattern('(\\d)+')]],
      lxr: ['', [Validators.required]],
      symj: ['', [Validators.required, Validators.pattern('(\\d)+')]],
      aqtd: ['', [Validators.required]],
      jyfw: [this.jyfwCheckboxOptions, [this.jyfwRequiredValidator()]],
      fenqu: [""],
      tuibi: [""],
      jiangpinCatalogSame: [""],
      materialSame: [""],
      jiangpinValue: [""]
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
    this.roomModalClosed.subscribe({
      next: () => {
        this.getRooms();
      }
    });

    // ??????????????????????????????
    this.wcModalClosed.subscribe({
      next: () => {
        this.getWcs();
      }
    });

    // ??????????????????????????????
    this.auditModalClosed.subscribe({
      next: () => {
        this.getAudits();
      }
    });
  }

  // ????????????????????????
  getRooms():void {
    if(this.resourceId){
      this.gwRoomService.getByResourceId(this.resourceId).subscribe({
        next: (rooms) => {
          this.gwRooms = rooms;
          this.yuleResourceBase!.rooms = rooms;
        }
      })
    }
  }

  // ????????????????????????
  getWcs():void {
    if(this.resourceId){
      this.gwWcService.getByResourceId(this.resourceId).subscribe({
        next: (wcs) => {
          this.gwWcs = wcs;
          this.yuleResourceBase!.wcs = wcs;
        }
      })
    }
  }

  // ??????????????????
  removeRooms():void{
    this.gwRoomService.delete(this.selectedRoomIds).subscribe({
      next: () => {
        this.getRooms();
      }
    });
  }

  // ??????????????????
  removeWcs():void{
    this.gwWcService.delete(this.selectedWcIds).subscribe({
      next: () => {
        this.getWcs();
      }
    });
  }

  // ????????????????????????
  jyfwOnChange(options:any[]): void {
    this.showGw = this.showYy = false;
    this.showGw = options.find(option=>option.value==="????????????").checked;
    this.showYy = options.find(option=>option.value==="????????????").checked;
  }

  // ??????????????????????????????
  jyfwInitial(jyfwStr:string): void{
    const jyfwArr = jyfwStr.split(",");
    this.jyfwCheckboxOptions.forEach(option => {
      if(jyfwArr.find(jyfw=>option.value===jyfw)){
        option.checked = true;
      } else {
        option.checked = false;
      }
    })
    this.jyfwOnChange(this.jyfwCheckboxOptions);
    // ??????????????????????????????
    this.resourceForm.controls.jyfw.updateValueAndValidity();
  }

  // ?????????????????????
  initOptButton(): void {
    if(this.yuleResourceBase && this.yuleResourceBase.permissions) {
      setAclAbility(this.yuleResourceBase?.permissions, this.acl);
    }
  }

  // ?????????detail??????
  initDetail(): void {
    if (this.resourceId) {
      this.yuleResourceService.findOne(this.resourceId).subscribe({
        next: data => {
          this.yuleResourceBase = data;
          this.fieldAudits = data.fieldAudits ? data.fieldAudits : [];

          this.resourceForm.controls.qxId.setValue(data.qxId);
          this.resourceForm.controls.dwmc.setValue(data.dwmc);
          this.resourceForm.controls.sbxm.setValue(data.sbxm);
          this.resourceForm.controls.csdz.setValue(data.csdz);
          this.resourceForm.controls.lxdh.setValue(data.lxdh);
          this.resourceForm.controls.lxr.setValue(data.lxr);
          this.resourceForm.controls.symj.setValue(data.symj);
          this.resourceForm.controls.aqtd.setValue(data.aqtd);

          // ???????????????????????????
          if(data.yyBase){
            this.resourceForm.controls.fenqu.setValue(data.yyBase.fenqu.toString());
            this.resourceForm.controls.tuibi.setValue(data.yyBase.tuibi.toString());
            this.resourceForm.controls.jiangpinCatalogSame.setValue(data.yyBase.jiangpinCatalogSame.toString());
            this.resourceForm.controls.jiangpinValue.setValue(data.yyBase.jiangpinValue.toString());
            this.resourceForm.controls.materialSame.setValue(data.yyBase.materialSame.toString());
          }
          // ??????????????????????????????
          this.jyfwInitial(data.jyfw);
          // ?????????????????????
          this.getRooms();
          // ?????????????????????
          this.getWcs();
           // n??????????????????????????????
           if(!this.yuleResourceBase.readed) {
            this.readSubscription = timer(environment.setReadSeconds).subscribe({
              next: ()=>{
                this.yuleResourceService.read(this.resourceId!, this.settings.user.id).subscribe();
              }
            })
          }
        }
      });
    }
  }

  save(): void {
    if (this.resourceForm.valid) {
      const jyfwArr = this.resourceForm.controls.jyfw.value as Array<{label:string,value:string,checked:boolean}>;
      if (this.resourceId && this.yuleResourceBase) {
        // ???????????????
        this.yuleResourceBase.qxId = this.resourceForm.controls.qxId.value;
        this.yuleResourceBase.dwmc = this.resourceForm.controls.dwmc.value;
        this.yuleResourceBase.csdz = this.resourceForm.controls.csdz.value;
        this.yuleResourceBase.sbxm = this.resourceForm.controls.sbxm.value;
        this.yuleResourceBase.symj = this.resourceForm.controls.symj.value;
        this.yuleResourceBase.aqtd = this.resourceForm.controls.aqtd.value;
        this.yuleResourceBase.lxr = this.resourceForm.controls.lxr.value;
        this.yuleResourceBase.lxdh = this.resourceForm.controls.lxdh.value;
        this.yuleResourceBase.jyfw = jyfwArr.filter(jyfw=>jyfw.checked===true).map(jyfw => jyfw.value).toString();
        // ???????????????????????????????????????????????????????????????
        if(this.showYy){
          const yyBaseId = this.yuleResourceBase.yyBase?.id;
          const yyBase:IYuleYyBase = {
            id: yyBaseId,
            fenqu: this.resourceForm.controls.fenqu.value,
            tuibi: this.resourceForm.controls.tuibi.value,
            jiangpinCatalogSame: this.resourceForm.controls.jiangpinCatalogSame.value,
            jiangpinValue: this.resourceForm.controls.jiangpinValue.value,
            materialSame: this.resourceForm.controls.materialSame.value,
            yuleResourceBaseId: this.resourceId,
          }
          this.yuleResourceBase.yyBase = yyBase;
        }

        this.yuleResourceService.update(this.yuleResourceBase).subscribe({
          next: () => {
            this.dataChanged.emit();
            this.message.success('????????????');
          }
        });

      } else {
        // ???????????????
        this.yuleResourceBase = {
          qxId: this.resourceForm.controls.qxId.value,
          dwmc: this.resourceForm.controls.dwmc.value,
          csdz: this.resourceForm.controls.csdz.value,
          sbxm: this.resourceForm.controls.sbxm.value,
          symj: this.resourceForm.controls.symj.value,
          aqtd: this.resourceForm.controls.aqtd.value,
          lxr: this.resourceForm.controls.lxr.value,
          lxdh: this.resourceForm.controls.lxdh.value,
          jyfw: jyfwArr.filter(jyfw=>jyfw.checked===true).map(jyfw => jyfw.value).toString(),
        };


        this.yuleResourceService.add(this.yuleResourceBase).subscribe({
          next: result => {
            this.resourceId = result.id;
            this.yuleResourceBase = result;
            this.dataChanged.emit();
            this.message.success('????????????');
            // console.log(this.yuleResourceBase);
          }
        });
      }

      
    }
  }

  // ???????????????????????????
  showRoom(roomId?:number) {
    const modal = this.modal.create({
      nzTitle: '????????????',
      nzContent: YuleGwRoomComponent,
      nzAfterClose: this.roomModalClosed,
      nzComponentParams: {
        roomId,
        resourceId: this.resourceId
      },
      nzFooter: [
        {
          label: '??????',
          onClick: () => {
            modal.destroy();
          }
        },
        {
          label: '??????',
          type: 'primary',
          onClick: (component?: any) => {
            if (component.validate()) {
              component.save();
              modal.destroy();
            }
          }
        }
      ]
    })
  }

  // ???????????????????????????
  showWc(wcId?:number) {
    const modal = this.modal.create({
      nzTitle: '????????????',
      nzContent: YuleGwWcComponent,
      nzAfterClose: this.wcModalClosed,
      nzComponentParams: {
        wcId,
        resourceId: this.resourceId
      },
      nzFooter: [
        {
          label: '??????',
          onClick: () => {
            modal.destroy();
          }
        },
        {
          label: '??????',
          type: 'primary',
          onClick: (component?: any) => {
            if (component.validate()) {
              component.save();
              modal.destroy();
            }
          }
        }
      ]
    })
  }

  // ?????????????????????????????????
  showAudit(auditId?:number): void {
    const modal = this.modal.create({
      nzTitle: '??????????????????',
      nzContent: FieldAuditComponent,
      nzComponentParams: {
        resourceType: environment.yuleResourceBaseTypeClassName,
        resourceId: this.resourceId,
        auditId: auditId ? auditId : 0,
      },
      nzAfterClose: this.auditModalClosed,
      nzFooter: [
        {
          label: '??????',
          onClick: (component?: any) => {
            this.yuleResourceService.print(this.resourceId!, component.auditId).subscribe({
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
      this.fieldAuditService.findByResourceId(this.resourceId, this.yuleFieldAuditServiceUrl).subscribe({
        next: result => {
          this.fieldAudits = result;
          this.yuleResourceBase!.fieldAudits = result;
        }
      })
    }
  }
    

  // ????????????????????????
  removeAudits(): void {
    if(this.resourceId){
      this.fieldAuditService.deleteByResourceId(this.selectedAuditIds, this.resourceId, this.yuleFieldAuditServiceUrl).subscribe({
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
