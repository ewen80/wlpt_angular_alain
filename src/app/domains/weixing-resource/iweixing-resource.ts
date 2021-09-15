import { IAttachment } from '../iattachment';
import { IFieldAudit } from '../ifield-audit';
import { Permission } from '../iresource-range-permission-wrapper';
import { ISignature } from '../isignature';
import { IResourceCheckIn } from '../resource/iresource-checkin';

export interface IWeixingResource {
  id?: number;
  permissions?: Array<{ mask: Permission }>;
  resourceCheckIn?: IResourceCheckIn;
  // attachments?: IAttachment[];
  // sign?: ISignature;
  fieldAudits?: IFieldAudit[];

  // 编号
  bh?: string;
  // 申请单位
  sqdw: string;
  // 区id
  qxId: string;
  // 申请类型
  sqlx: string;
  // 安装地址
  azdz: string;
  // 办公电话
  bgdh: string;
  // 邮政编码
  yzbm: string;
  // 负责人
  fzr: string;
  // 负责人手机
  fzrsj: string;
  // 机房位置
  jfwz: string;
  // 天线位置
  txwz: string;
  // 天线数量
  txsl: number;
  // 天线类型
  txlx: string;
  // 境内收视节目源
  jnssjmy: string;
  // 卫星传输方式
  wxcsfs: string;
  // 信号调制方式
  xhtzfs: string;
  // 收视内容
  ssnr: string;
  // 设计安装单位名称
  sjazdwmc: string;
  // 卫星设施安装许可证证号
  wxssazxkzh: string;
  // 楼盘名
  lpm: string;
  // 楼层
  lc: string;
  // 终端数
  zds: number;
  // // 核查日期
  // hcrq: string;
}
