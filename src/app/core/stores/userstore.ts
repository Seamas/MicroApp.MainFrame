export function setUser(username: string, token: string, nickname: string) {
  localStorage.setItem('username', username);
  localStorage.setItem('token', token);
  localStorage.setItem('nickname', nickname);
}

export function removeUserInfo() {
  localStorage.removeItem('username');
  localStorage.removeItem('token');
  localStorage.removeItem('nickname');
}

export function getUsername() {
  return localStorage.getItem('username');
}
