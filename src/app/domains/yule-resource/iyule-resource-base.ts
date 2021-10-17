import { IResourceBase } from "../resource/iresource-base";
import { IYuleGwRoom } from "./iyule-gw-room";
import { IYuleGwWc } from "./iyule-gw-wc";
import { IYuleYyBase } from "./iyule-yy-base";

export interface IYuleResourceBase extends IResourceBase {
    id?:number;
    // 编号
    bh?:string;
    // 各区id
    qxId:string;
    // 单位名称
    dwmc:string;
    // 场所地址
    csdz:string;
    // 经营范围
    jyfw:string;
    // 申办项目
    sbxm:string;
    // 使用面积
    symj:string;
    // 安全通道
    aqtd:string;
    // 联系人
    lxr:string;
    // 联系人电话
    lxdh:string;
    // 歌舞娱乐包房
    rooms?:IYuleGwRoom[];
    // 歌舞娱乐舞池
    wcs?:IYuleGwWc[];
    // 歌舞游艺
    yyBase?:IYuleYyBase;
}