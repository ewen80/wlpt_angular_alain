import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STColumn, STData, STComponent, STChange } from '@delon/abc/st';
import { Region } from 'src/app/domains/region';
import { NzModalService, ModalButtonOptions } from 'ng-zorro-antd/modal';
import { IMyResource } from 'src/app/domains/my-resource/imy-resource';
import { MyResourceService } from 'src/app/core/services/my-resource/my-resource.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MyResourceRoomService } from 'src/app/core/services/my-resource/my-resource-room.service';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { ACLService } from '@delon/acl';
import { IWeixingResource } from 'src/app/domains/weixing-resource/iweixing-resource';
import { WeixingResourceService } from 'src/app/core/services/weixing/weixing.service';
import { formatDate } from '@angular/common';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { FileService } from 'src/app/core/services/file.service';
import { IAttachment } from 'src/app/domains/iattachment';

@Component({
  selector: 'app-weixing-detail',
  templateUrl: './weixing-detail.component.html',
  styles: [],
})
export class WeixingDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private acl: ACLService,
    private weixingResourceService: WeixingResourceService,
    private message: NzMessageService,
    private fileService: FileService,
  ) {}

  resourceForm!: FormGroup;
  @Input() resourceId?: number;
  @Output() dataChanged = new EventEmitter();

  weixingResource?: IWeixingResource;
  signBase64 = ''; // 签名图片base64数据

  qxs: Array<{ key: string; value: string }> = [];

  // 文件上传相关
  fileDownloadRootUrl = environment.serverFileDownloadRootUrl;
  fileUploadServiceURL = environment.serverUrl + environment.serverFileServiceURL + '/upload'; // 文件上传地址
  attachments: NzUploadFile[] = [];

  // 境内收视节目源选择
  jnssjmys = [
    { value: 'yxdslw', label: '有线电视联网' },
    { value: 'klxh', label: '开路信号' },
    { value: 'iptv', label: 'IPTV' },
    { value: 'other', label: '其他' },
  ];

  removeFile = (file: NzUploadFile) => {
    return this.fileService.removeFile(file.response.name);
  };

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
      hcrq: [Date(), [Validators.required]],
    });

    Region.codes.forEach((value: string, key: string) => {
      this.qxs.push({ key, value });
    });

    if (this.resourceId) {
      this.initDetail();
    } else {
      this.acl.attachAbility(['WRITE']);
    }
  }

  // 初始化保存按钮
  initSaveButton(): void {
    // 修改资源
    if (this.weixingResource?.permissions?.some((item) => item.mask === Permission.WRITE)) {
      this.acl.attachAbility(['WRITE']);
    } else {
      this.acl.removeAbility(['WRITE']);
    }
  }

  // 初始化detail数据
  initDetail(): void {
    if (this.resourceId) {
      this.weixingResourceService.findOne(this.resourceId).subscribe({
        next: (data) => {
          this.weixingResource = data;
          if (this.weixingResource?.sign) {
            this.signBase64 = `data:image/${this.weixingResource.sign.imageExtention};base64,${this.weixingResource.sign.signBase64}`;
          }

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

          if (this.jnssjmys.find((item) => item.value === data.jnssjmy)) {
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
          this.resourceForm.controls.hcrq.setValue(new Date(data.hcrq));

          // 初始化上传列表
          this.initAttachments();

          this.initSaveButton();
        },
      });
    }
  }

  // 初始化附件
  initAttachments(): void {
    this.attachments = [];
    this.weixingResource?.attachments?.forEach((attachment) => {
      this.attachments.push({
        uid: attachment.id!,
        name: attachment.name,
        status: 'done',
        url: environment.serverFileDownloadRootUrl + '\\' + attachment.path,
        response: {
          name: attachment.path,
          date: attachment.date,
          status: 'done',
        },
      });
    });
  }

  save(): void {
    if (this.resourceForm.valid) {
      // 转换附件类型
      const attachs: IAttachment[] = [];
      this.attachments.forEach((attachment) => {
        attachs.push({
          name: attachment.name,
          path: attachment.response.name,
          date: attachment.response.date,
        });
      });

      const hcrq = new Date(this.resourceForm.controls.hcrq.value);
      const hcrqString = hcrq.toISOString().split('T')[0];

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
        this.weixingResource!.hcrq = hcrqString;

        this.weixingResource!.attachments = attachs;
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
          hcrq: hcrqString,

          attachments: attachs,
        };
      }

      this.weixingResourceService.save(this.weixingResource!).subscribe({
        next: (result) => {
          this.resourceId = result.id;
          this.weixingResource = result;
          this.dataChanged.emit();
          this.message.success('保存成功');
        },
      });
    }
  }

  // 处理上传列表
  handleChange(info: NzUploadChangeParam): void {
    const fileList: NzUploadFile[] = [];
    info.fileList.forEach((file) => {
      if (file.status === 'done') {
        fileList.push(file);
      }
    });

    if (info.file.status === 'done') {
      fileList.map((file) => {
        file.url = environment.serverFileDownloadRootUrl + '\\' + file.response.name;
      });
      this.attachments = fileList;
      if (this.weixingResource?.id) {
        // 修改情况，修改后台数据
        this.save();
      }
      this.message.success(`${info.file.name} uploaded`);
    } else if (info.file.status === 'error') {
      this.attachments = fileList;
      this.message.error(`${info.file.name} upload failed.`);
    } else if (info.file.status === 'removed') {
      this.attachments = fileList;
      if (this.weixingResource?.id) {
        // 修改情况，修改后台数据
        this.save();
      }
      this.message.success(`${info.file.name} removed`);
    }
  }
}
