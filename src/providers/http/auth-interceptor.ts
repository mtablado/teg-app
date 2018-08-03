import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { OAuthProvider } from '../oauth/oauth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private oauthProvider: OAuthProvider) {
    // Nothing at this time.
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    console.log('AuthInterceptor Intercepting ' + req.url );
    if (!req.url.endsWith('/oauth/token')) {

      // Get the auth token from the service.
      const authToken = this.oauthProvider.getAuthorizationToken();
      console.log('AuthInterceptor securing request with auth: ' + authToken);

      // Clone the request and replace the original headers with
      // cloned headers, updated with the authorization.
      const authReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + authToken)
      });

      // send cloned request with header to the next handler.
      return next.handle(authReq);
    } else {
      console.log('AuthInterceptor skipping url');
      return next.handle(req);
    }


  }
}
