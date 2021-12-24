import { IResourceBase } from "../resource/iresource-base";

export interface IVodResource extends IResourceBase {

    // 编号
    bh?: string;
    // 系统名称
    sysName?: string;
    // 设备名称
    deviceName?: string;
    // 制造厂商
    manufacturer?: string;
    // 设备型号
    deviceModel?: string;
    // 取样方式
    samplingMethod?: string;
    // 检测地点
    detectLocation?: string;
    // 检测单位
    detectUnit?: string;
    // 系统说明
    sysExplanation?: string;
    // 检测依据
    detectBasis?: string;
    // 检测概况
    detectOverview?: string;
}