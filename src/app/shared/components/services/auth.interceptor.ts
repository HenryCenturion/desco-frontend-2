import {HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  const authToken = isBrowser ? localStorage.getItem('authToken') : null;

  const authReq = authToken
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${authToken}`) })
    : req;

  return next(authReq);
};
