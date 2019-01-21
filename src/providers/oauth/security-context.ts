import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';

import { UserRepository } from '../db/user-repository';
import { User } from '../db/user-entity';
import { OAuthProvider, OAuthToken } from './oauth';
import { ENV } from "../../env/env";

@Injectable()
export class SecurityContext {

  private getUserURL = ENV.server_api + "/users/username/";

  // Controls if user is logged in or not.
  loggedIn: boolean = false;
  // The username of the registered user.
  private registeredUser: string;

  private user: User;

  constructor(
    private http: HttpClient
    , private oauthProvider: OAuthProvider
    , private userRepository: UserRepository) {
    // Nothing at this moment.
  }

  public login(username, password) {
    this.loggedIn = false;
    var promise = new Promise((resolve, reject) => {
      this.oauthProvider.login(username, password)
        .then(() => {
          console.log('login success');
          this.loggedIn = true;
          this.setCurrentUser(username)
            .then(user => resolve(user))
            .catch(e => {console.log('Error: ' + JSON.stringify(e))})
        })
        .catch(e => {reject(e)});
      });
    return promise;
  }

  public logout(): Observable<void> {
    const simpleObservable = new Observable<void>((observer) => {
      this.loggedIn = false;
      this.registeredUser = null;
      this.oauthProvider.logout().subscribe(() => {
        observer.next();
      }, (error) => {
        observer.error(error);
      }, () => {
        observer.complete();
      });
    });
    return simpleObservable;
  }

  public setCurrentUser(username: string) {
    this.registeredUser = username;
    this.loggedIn = true;
    var promise = new Promise((resolve, reject) => {
      this.userRepository.findUserByUsername(username)
        .then((user: User) => {
          this.user = user;

          console.log('Is user valid: ' + (null != this.user));
          // First time the user logs in the app.
          if (null == user) {
            console.log('User is not registered at db. Fetch it from backend.');

            this.requestUser(username).subscribe(
              (user: User) => {
                this.userRepository.save(user);
                this.user = user;
                resolve(this.user);
              },
              (error) => reject()
            )
          } else {
            this.requestUser(username).subscribe(
              (user: User) => {
                // Store database user id since it is property of the mob app.
                let id = this.user.rowid;
                this.user = user;
                this.user.rowid = id
                this.userRepository.save(this.user);

              },
              (error) => console.log(`error while fetching user: ${error.status}`)
            )
            resolve(this.user);
          }
        }).catch(e => reject(e)); // TODO handle error.
      });
    return promise;
  }

  public setUser(user: User) {
    this.user = user;
  }

  public getUser(): Observable<User> {
    const simpleObservable = new Observable<User>((observer) => {

      if (this.user) {
        observer.next(this.user);
        observer.complete();
      } else {
        observer.next(new User());
        this.oauthProvider.findToken()
          .then((oauthToken: OAuthToken) => {
            console.log(`User ${this.oauthProvider.getRegisteredUser()} still not loaded`);
            this.setCurrentUser(this.oauthProvider.getRegisteredUser())
              .then((user: User) => {
                observer.next(user);
                observer.complete();
              })
              .catch(e => {console.log('Error: ' + JSON.stringify(e))});
          }).catch(e => {console.log('Error: ' + JSON.stringify(e))});
      }

    });
    return simpleObservable;
  }

  private requestUser(username: string): Observable<User> {
    let headers = new HttpHeaders({
      'Content-Type':  'application/json'
    });

    const options = {
      headers: headers
    };

    let url = this.getUserURL + username;
    return this.http.get<User>(url, options)
      .pipe(
        retry(1)
      );
  }

}
