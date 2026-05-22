const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';
const NICKNAME_KEY = 'nickname';

export function setUser(username: string, token: string, nickname: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USERNAME_KEY, username);
  sessionStorage.setItem(NICKNAME_KEY, nickname);
}

export function removeUserInfo() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem(NICKNAME_KEY);
  sessionStorage.removeItem('user_visible_menus');
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUsername(): string | null {
  return sessionStorage.getItem(USERNAME_KEY);
}

export function getNickname(): string | null {
  return sessionStorage.getItem(NICKNAME_KEY);
}

export function isLoggedIn(): boolean {
  return sessionStorage.getItem(TOKEN_KEY) !== null;
}
