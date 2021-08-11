export const environment = {
  // app
  appName: 'wlpt',
  appDescription: '基于ng-alain',
  // 服务器后端根地址
  serverUrl: `http://aliyun.ewen.pw:9001`,
  // 后台文件下载根地址
  serverFileDownloadRootUrl: 'http://aliyun.ewen.pw:9101/downloads',
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
  // 服务器自定义资源 *MyResource
  MyResourceTypeClassName: 'pw.ewen.WLPT.domains.entities.resources.myresource.MyResource',
  serverMyResourceServiceURL: '/resources/myresources',
  serverMyResourceRoomServiceURL: '/resources/myresource/room',
  //                *Weixing
  WeixingResourceTypeClassName: 'pw.ewen.WLPT.domains.entities.resources.weixing.WeixingResource',
  serverWeixingResourceServiceURL: '/resources/weixings',
  // 服务器文件上传、删除等
  serverFileServiceURL: '/file',
  // 服务器端退出账号
  serverLogoutURL: '/logout',
  // token默认过期时间
  tokenExpiredTime: 1000 * 60 * 5,
  // 默认用户头像
  defaultAvatar: '../assets/tmp/img/avatar.jpg',

  production: true,
  useHash: false
};
