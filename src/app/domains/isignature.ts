export interface ISignature {
  id: number;
  signBase64: string; //签名图片base64字符串
  createdAt: string; // 创建时间
  name: string; // 姓名
  imageExtention: string; // 图片文件后缀名
}
