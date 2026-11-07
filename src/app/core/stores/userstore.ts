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

function isTokenExpired(token: string): boolean {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return true;
    }

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));

    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    removeUserInfo();
    return false;
  }

  return true;
}
