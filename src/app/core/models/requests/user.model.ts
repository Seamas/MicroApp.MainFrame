export interface User {
  id: number; // 不展示
  username: string; // 用户名（唯一，不可修改）
  nickname: string; // 昵称
  email: string; // 邮箱
  isEnabled: boolean; // 状态
}
