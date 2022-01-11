export const environment = {
  // app
  appName: 'wlpt',
  appDescription: '基于ng-alain',
  // 服务器后端根地址
  serverUrl: `https://changdi.shssgc.org.cn/test/api`,
  // 后台文件下载根地址
  serverFileDownloadRootUrl: 'http://changdi.shssgc.org.cn/test/downloads/',
  // 服务器初始化服务地址
  serverInitMenuURL: '/admin/menuinit',
  // 服务器后端token刷新验证地址
  serverAuthRefreshURL: '/authentication/refresh',
  // 服务器后端用户服务地址
  serverUserServiceURL: '/admin/users',
  serverRoleServiceURL: '/admin/roles',
  // 服务器菜单 /resources/menus/authorized/admin
  serverMenuServiceURL: '/resources/menus',
  // 服务器资源管理
  serverResourceTypeServiceURL: '/admin/resourcetypes',
  serverResourceRangeServiceURL: '/admin/resourceranges',
  serverPermissionServiceURL: '/admin/permissions',
  // 各资源现场审核意见服务器地址对应表
  fieldAuditServiceMap: new Map([
    ["pw.ewen.WLPT.domains.entities.resources.weixing.WeixingResource", "/resources/weixings/fieldaudits"], // 卫星现场审核意见服务器地址
    ["pw.ewen.WLPT.domains.entities.resources.yule.YuleResourceBase", "/resources/yules/fieldaudits"], // 娱乐现场审核意见服务器地址
    ["pw.ewen.WLPT.domains.entities.resources.vod.VodResource", "/resources/vods/fieldaudits"], // vod现场审核意见服务器地址
    ["pw.ewen.WLPT.domains.entities.resources.artifactshop.ArtifactShopResource", "/resources/artifactshops/fieldaudits"], // 文物商店现场审核意见服务器地址
  ]),
  // 服务器自定义资源 
  //                 *Weixing
  weixingResourceTypeClassName: 'pw.ewen.WLPT.domains.entities.resources.weixing.WeixingResource',
  serverWeixingResourceServiceURL: '/resources/weixings',
  //                  *卫星现场审核意见service
  serverWeixingFieldAuditServiceURL: '/resources/weixings/fieldaudits',
  //                  *娱乐场地
  yuleResourceBaseTypeClassName: 'pw.ewen.WLPT.domains.entities.resources.yule.YuleResourceBase',
  serverYuleResourceBaseServiceURL: '/resources/yules',
  //                      歌舞娱乐包房服务
  serverYuleGwRoomServiceURL: '/resources/yules/rooms',
  //                      歌舞娱乐舞池服务
  serverYuleGwWcServiceURL: '/resources/yules/wcs',
  //                  *娱乐现场审核意见service
  serverYuleFieldAuditServiceURL: '/resources/yules/fieldaudits',
  //                 *Vod
  vodResourceTypeClassName: 'pw.ewen.WLPT.domains.entities.resources.vod.VodResource',
  serverVodResourceServiceURL: '/resources/vods',
  //                 *文物商店
  artifactShopResourceTypeClassName: 'pw.ewen.WLPT.domains.entities.resources.artifactshop.ArtifactShopResource',
  serverArtifactShopResourceServiceURL: '/resources/artifactshops',
  // 服务器现场审核意见
  serverFieldAuditServiceURL: '/fieldaudits',
  // 服务器附件包后台管理地址
  serverAttachmentBagServiceURL: '/attachmentbags',
  // 服务器文件上传、删除等
  serverFileServiceURL: '/file',
  // 服务器端退出账号
  serverLogoutURL: '/logout',
  // token默认过期时间15分钟
  tokenExpiredTime: 1000 * 60 * 15,
  // 默认用户头像
  defaultAvatar: './assets/avatar.jpg',
  // 默认场地审核单位名称
  defaultFieldAuditDepartment: '上海市社会文化管理处',
  // 场地审核GPS图片显示配置
  fieldAuditGpsUrl: 'https://apis.map.qq.com/ws/staticmap/v2/', // api接口地址
  fieldAuditGpsKey: '5VHBZ-PGARD-NZ44L-HC5UV-A36GQ-M4BMU', // api key
  fieldAuditGpsWidth:1000, // 图片宽度
  fieldAuditGpsHeight:800,  // 图片高度
  fieldAuditGpsZoom: 17,  // 放大系数
  // 打开页面设为已读的豪秒数
  setReadSeconds: 5000,

  production: false,
  useHash: false
};
