export interface IYuleGwRoom {
    id?:number,
    // 娱乐id
    yuleResourceBaseId:number,
    // 包房名
    name:string,
    // 包房面积
    area:number,
    // 核定人数
    hdrs:number,
    // 是否有隔断或者卫生间
    toilet:boolean,
    // 是否有内锁
    innerLock:boolean,
    // 是否有安装透明清晰材料
    window:boolean,
    // 是否有1000首以上歌曲
    oneThousandSongs:boolean,
    // 是否有长明灯
    everlight:boolean
}