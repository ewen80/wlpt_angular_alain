/*
    用户接口
    created by wenliang on 20210221
*/

export interface IUser {
  id: string; // 用户id
  name: string; // 用户姓名
  // passwordMD5?: string; // 加密密码
  token?: string; // 登录认证token
  avatar?: string; // 头像路径
  roleIds?: string[]; // 用户所属角色id
  defaultRoleId: string; // 用户默认角色
  currentRoleId: string; // 用户当前所属角色
  qxId?: number; // 区县id
}
