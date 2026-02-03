import { HttpInterceptorFn } from '@angular/common/http';


export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem("token");
    if (token !== null) {
        const clonedReq = req.clone({
            setHeaders: {
            'Authorization': 'Bearer ' + token
            }
        });
        return next(clonedReq);
    }

    return next(req);
}