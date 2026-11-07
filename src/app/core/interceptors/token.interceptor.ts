import { HttpInterceptorFn } from '@angular/common/http';

const AUTH_ENDPOINTS = [
  '/api/rbac/auth/login',
  '/api/rbac/auth/register',
  '/api/rbac/users/check-username',
];

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => req.url.includes(path));

  if (token !== null && !isAuthEndpoint) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
    });
    return next(clonedReq);
  }

  return next(req);
};
