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
import { IYuleResourceBase } from 'src/app/domains/yule-resource/iyule-resource-base';
import { YuleGwRoomComponent } from '../yule-gw-room-detail/yule-gw-room-detail.component';
import { YuleGwRoomService } from 'src/app/core/services/yule/yule-gw-room.service';
import { AnySchema } from 'ajv';
import { Result } from 'postcss';
import { YuleGwWcService } from 'src/app/core/services/yule/yule-gw-wc.service';
import { YuleGwWcComponent } from '../yule-gw-wc-detail/yule-gw-wc-detail.component';
import { IYuleYyBase } from 'src/app/domains/yule-resource/iyule-yy-base';
import { IYuleGwRoom } from 'src/app/domains/yule-resource/iyule-gw-room';
import { IYuleGwWc } from 'src/app/domains/yule-resource/iyule-gw-wc';
import { IFieldAudit } from 'src/app/domains/resource/ifield-audit';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Subscription, timer } from 'rxjs';

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
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {}

  resourceForm!: FormGroup;
  @Input() resourceId?: number;
  @Output() dataChanged = new EventEmitter();
  @Output() roomModalClosed = new EventEmitter();
  @Output() wcModalClosed = new EventEmitter();
  @Output() auditModalClosed = new EventEmitter();

  // 歌舞包房数据
  gwRooms:STData[] = [];
  // 歌舞舞池数据
  gwWcs:STData[] = [];

  // 获取包房信息地址
  yuleGwRoomServiceUrl?:string;
  // 获取场所审核意见地址
  yuleFieldAuditServiceUrl = environment.fieldAuditServiceMap.get(environment.yuleResourceBaseTypeClassName)!;
  yuleResourceBase?: IYuleResourceBase;

  qxs: Array<{ key: string; value: string }> = [];
  selectedAuditIds: number[]  = [];
  fieldAudits: STData[] = [];

  // 已读状态更新订阅
  readSubscription?: Subscription;

  selectedRoomIds:number[] = [];
  selectedWcIds:number[] = [];

  // 是否显示歌舞娱乐场所字段
  showGw = false;
  // 是否显示游艺场所字段
  showYy = false;

  // 歌舞娱乐场所包房列表列配置
  gwRoomColumn: STColumn[] = [
    {title: '', index: 'id', type: 'checkbox'},
    {
      title: '包房名', 
      index: 'name', 
      type: 'link',
      click: (record: STData, instance?: STComponent) => {
        this.showRoom(record.id);
      }
    },
    {title: '面积', index: 'area'},
    {
      title: '是否有隔断或卫生间', 
      index: 'toilet',
      format: (item) => {
        if(item.toilet) {
          return "是";
        } else {
          return "否"
        }
      }
    },
    {
      title: '是否有内锁装置', 
      index: 'innerLock',
      format: (item) => {
        if(item.toilet) {
          return "是";
        } else {
          return "否"
        }
      }
    },
    {
      title: '是否安装透明清晰材料', 
      index: 'window',
      format: (item, col, index) => {
        if(item.toilet) {
          return "是";
        } else {
          return "否"
        }
      }
    },
    {
      title: '是否安装长明灯', 
      index: 'everlight',
      format: (item, col, index) => {
        if(item.toilet) {
          return "是";
        } else {
          return "否"
        }
      }
    }
  ];

  // 歌舞娱乐场所舞池列表列配置
  gwWcColumn: STColumn[] = [
    {title: '', index: 'id', type: 'checkbox'},
    {
      title: '舞池名', 
      index: 'name', 
      type: 'link',
      click: (record: STData, instance?: STComponent) => {
        this.showWc(record.id);
      }
    },
    {title: '面积', index: 'area'},
    {
      title: '舞池与休息座是否分开', 
      index: 'dlwc',
      format: (item) => {
        if(item.dlwc) {
          return "是";
        } else {
          return "否"
        }
      }
    },
    {
      title: '是否有衣物寄放室', 
      index: 'ywjf',
      format: (item) => {
        if(item.ywjf) {
          return "是";
        } else {
          return "否"
        }
      }
    },
  ];

  // 经营范围选择项
  jyfwCheckboxOptions = [
    {label:"歌舞娱乐", value:"歌舞娱乐", checked: false},
    {label:"游艺娱乐", value:"游艺娱乐"},
    {label:"文化游乐场", value:"文化游乐场"}
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

  // 经营范围必选验证器
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

  // 包房列表变化时回调
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

  // 舞池列表变化时回调
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
      sbxm: ['新办', [Validators.required]],
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

    // 如果有resourceId则读取具体内容
    if (this.resourceId) {
      this.initDetail();
    } 
    // 初始化权限
    this.initOptButton();

    // 房间明细对话框关闭时
    this.roomModalClosed.subscribe({
      next: () => {
        this.getRooms();
      }
    });

    // 舞池明细对话框关闭时
    this.wcModalClosed.subscribe({
      next: () => {
        this.getWcs();
      }
    });

    // 核查意见对话框关闭时
    this.auditModalClosed.subscribe({
      next: () => {
        this.getAudits();
      }
    });
  }

  // 获取歌舞房间数据
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

  // 获取歌舞舞池数据
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

  // 删除歌舞房间
  removeRooms():void{
    this.gwRoomService.delete(this.selectedRoomIds).subscribe({
      next: () => {
        this.getRooms();
      }
    });
  }

  // 删除歌舞舞池
  removeWcs():void{
    this.gwWcService.delete(this.selectedWcIds).subscribe({
      next: () => {
        this.getWcs();
      }
    });
  }

  // 经营范围选项变更
  jyfwOnChange(options:any[]): void {
    this.showGw = this.showYy = false;
    this.showGw = options.find(option=>option.value==="歌舞娱乐").checked;
    this.showYy = options.find(option=>option.value==="游艺娱乐").checked;
  }

  // 初始化经营范围复选框
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
    // 触发修改按钮表单认证
    this.resourceForm.controls.jyfw.updateValueAndValidity();
  }

  // 初始化操作按钮
  initOptButton(): void {
    if(this.yuleResourceBase && this.yuleResourceBase.permissions) {
      setAclAbility(this.yuleResourceBase?.permissions, this.acl);
    }
  }

  // 初始化detail数据
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

          // 初始化歌舞游艺数据
          if(data.yyBase){
            this.resourceForm.controls.fenqu.setValue(data.yyBase.fenqu.toString());
            this.resourceForm.controls.tuibi.setValue(data.yyBase.tuibi.toString());
            this.resourceForm.controls.jiangpinCatalogSame.setValue(data.yyBase.jiangpinCatalogSame.toString());
            this.resourceForm.controls.jiangpinValue.setValue(data.yyBase.jiangpinValue.toString());
            this.resourceForm.controls.materialSame.setValue(data.yyBase.materialSame.toString());
          }
          // 初始化经营范围选择框
          this.jyfwInitial(data.jyfw);
          // 初始化包房数据
          this.getRooms();
          // 初始化舞池数据
          this.getWcs();
           // n秒后设置该资源为已读
           if(!this.yuleResourceBase.readed) {
            this.readSubscription = timer(environment.setReadSeconds).subscribe({
              next: ()=>{
                this.yuleResourceService.read(this.resourceId!, this.tokenService.get()!.user.id).subscribe();
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
        // 如果是修改
        this.yuleResourceBase.qxId = this.resourceForm.controls.qxId.value;
        this.yuleResourceBase.dwmc = this.resourceForm.controls.dwmc.value;
        this.yuleResourceBase.csdz = this.resourceForm.controls.csdz.value;
        this.yuleResourceBase.sbxm = this.resourceForm.controls.sbxm.value;
        this.yuleResourceBase.symj = this.resourceForm.controls.symj.value;
        this.yuleResourceBase.aqtd = this.resourceForm.controls.aqtd.value;
        this.yuleResourceBase.lxr = this.resourceForm.controls.lxr.value;
        this.yuleResourceBase.lxdh = this.resourceForm.controls.lxdh.value;
        this.yuleResourceBase.jyfw = jyfwArr.filter(jyfw=>jyfw.checked===true).map(jyfw => jyfw.value).toString();
        // 如果经营范围中有歌舞游艺则保存相关字段信息
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
            this.message.success('修改成功');
          }
        });

      } else {
        // 如果是新增
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
            this.message.success('添加成功');
            // console.log(this.yuleResourceBase);
          }
        });
      }

      
    }
  }

  // 弹出包房信息对话框
  showRoom(roomId?:number) {
    const modal = this.modal.create({
      nzTitle: '包房信息',
      nzContent: YuleGwRoomComponent,
      nzAfterClose: this.roomModalClosed,
      nzComponentParams: {
        roomId,
        resourceId: this.resourceId
      },
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
    })
  }

  // 弹出舞池信息对话框
  showWc(wcId?:number) {
    const modal = this.modal.create({
      nzTitle: '舞池信息',
      nzContent: YuleGwWcComponent,
      nzAfterClose: this.wcModalClosed,
      nzComponentParams: {
        wcId,
        resourceId: this.resourceId
      },
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
    })
  }

  // 弹出现场审核意见对话框
  showAudit(auditId?:number): void {
    const modal = this.modal.create({
      nzTitle: '现场审核信息',
      nzContent: FieldAuditComponent,
      nzComponentParams: {
        resourceType: environment.yuleResourceBaseTypeClassName,
        resourceId: this.resourceId,
        auditId: auditId ? auditId : 0,
      },
      nzAfterClose: this.auditModalClosed,
      nzFooter: [
        {
          label: '打印',
          onClick: (component?: any) => {
            this.yuleResourceService.print(this.resourceId!, component.auditId).subscribe({
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
      this.fieldAuditService.findByResourceId(this.resourceId, this.yuleFieldAuditServiceUrl).subscribe({
        next: result => {
          this.fieldAudits = result;
          this.yuleResourceBase!.fieldAudits = result;
        }
      })
    }
  }
    

  // 删除现场审核意见
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
