export interface IYuleYyBase{
    id?:number,
    // 是否分区经营
    fenqu:boolean,
    // 是否有退币，退钢珠功能
    tuibi:boolean,
    // 奖品是否与目录单一致
    jiangpinCatalogSame:boolean,
    // 单件奖品价值是否超过500元
    jiangpinValue:boolean,
    
    yuleResourceBaseId:number,
}