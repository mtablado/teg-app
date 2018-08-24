import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
//import { MessageService } from '../message.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(/*private messenger: MessageService*/) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const started = Date.now();
    let msg: string;

    // extend server response observable with logging
    return next.handle(req)
      .pipe(
        tap(
          // Succeeds when there is a response; ignore other events
          event => {
            msg = event instanceof HttpResponse ? 'succeeded' : '';
          },
          // Operation failed; error is an HttpErrorResponse
          error => {
            msg = `failed (error code: ${error.status}, body was: ${JSON.stringify(error.error)})`
          }
        ),
        // Log when response observable either completes or errors
        finalize(() => {
          const elapsed = Date.now() - started;
          const logMsg = `${req.method} "${req.urlWithParams}"
             ${msg} in ${elapsed} ms.`;

          //this.messenger.add(msg);
          console.log(logMsg);
        })
      );
  }
}
