import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { DatabaseService } from '../db/database-service';
import { OAuthRepository } from '../db/oauth-repository';
import { OAuthEntity } from '../db/oauth-entity';

export class OAuthToken {
  public id;
  public user;
  public access_token;
  public token_type;
  public refresh_token;
  public expires_in;
  public scope;

  public toString() {
    return "id: " + this.id
      + ", access_token: " + this.access_token
      + ", token_type: " + this.token_type
      + ", refresh_token: " + this.refresh_token
      + ", expires_in: " + this.expires_in
      + ", scope: " + this.scope;
  }
}

/**
 * OAuth Provider that handles the communication with the server to request
 * access tokens and refresh tokens and that stores the tokens for further use.
 * IMPORTANT: This provider is only valid for one connection at a time. So,
 * only one token will be stored at database.
 *
 * The class is nowadays hardcoded, working with bearer token and password
 * grant type only.
 */
@Injectable()
export class OAuthProvider {

  private url = "http://192.168.1.45:8080/oauth/token";
  private httpLoginOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': 'Basic RWxHYXJhYmF0b0FwcDp0b3Rv'
    })
  };

  private oauthToken: OAuthToken;
  // The username of the registered user.
  private registeredUser: string;

  constructor(
      private http: HttpClient
      , private db: DatabaseService
      , private oauthRepository: OAuthRepository) {
    console.log('Hello OauthProvider Provider');
    this.registeredUser = null;
  }

  public getAuthorizationToken(): string {
    return this.oauthToken.access_token;
  }

  public findToken(): OAuthToken {

    var promise = new Promise((resolve, reject) => {
      this.oauthRepository.findToken()
        .then((oauthEntity: OAuthEntity) => {
          this.oauthToken = new OAuthToken();
          this.oauthToken.user = oauthEntity.username;
          this.oauthToken.access_token = oauthEntity.accessToken;
          this.oauthToken.refresh_token = oauthEntity.refreshToken;
          this.registeredUser = oauthEntity.username;
          resolve(this.oauthToken);
        })
        .catch(e => {
          console.log('Error while finding token in promise:' + JSON.stringify(e));
          this.oauthToken = new OAuthToken();
          resolve(this.oauthToken);
        })
      });
      return promise;
  }

  public getRegisteredUser(): string {
    return this.registeredUser;
  }

  public isUserRegistered() {
    return (this.registeredUser != null);
  }

  public login(username, password) {

    var promise = new Promise((resolve, reject) => {
      console.log("login attempt for user: " + username);
      let body = new HttpParams()
        .set('grant_type', 'password')
        .set('client_id', 'ElGarabatoApp')
        .set('username', username)
        .set('password', password);
      console.log("Sending params:" + {body});

      this.http.post(this.url, body, this.httpLoginOptions)
        .subscribe(
          (data: OAuthToken) => {
            this.loginSuccess(username, data);
            resolve();
          },
          err => {
            this.handleError(err);
            // TODO reject(err) when required.
          },
          () => resolve()
        );

    });
    return promise;

  }

  public refreshToken() {
    let username = this.registeredUser;
    console.log("refresh token attempt for user: " + username);
    var promise = new Promise((resolve, reject) => {

      let body = new HttpParams()
        .set('grant_type', 'refresh_token')
        .set('refresh_token', this.oauthToken.refresh_token)
        .set('client_id', 'ElGarabatoApp')
        .set('username', username);
      console.log("Sending params:" + {body});

      this.http.post(this.url, body, this.httpLoginOptions)
        .subscribe(
          (data: OAuthToken) => {
            this.loginSuccess(username, data);
            resolve();
          },
          err => {
            // When refreshing a token as a fallback method,
            // errors are not raised anymore to avoid infite loops.
            // TODO Raise not logged in event.
            console.error(
              `REFRESH TOKEN: Backend returned code ${err.status}, ` +
              `body was: ${err.error}`);
            resolve();
          },
          () => resolve()
        );

    });
    return promise;

  }

  private headers(token: string) {
    console.log('Creating headers with auth: ' + token);
    let headers = new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + token
    });
    console.log('headers: ' + headers.get('Authorization'));
    return headers;
  }

  private loginSuccess(username: string, data: OAuthToken) {
    // TODO show message.
    console.log("Data received from server: " + JSON.stringify(data));
    this.registeredUser = username;

    this.oauthToken = data;

    this.removeStaleTokens(username);
    this.storeToken(username, this.oauthToken);
  }

  private storeToken(username: string, data: OAuthToken) {
    console.log("About to persist oauth token");
    let entity: OAuthEntity = new OAuthEntity();
    entity.username = username;
    entity.accessToken = data.access_token;
    entity.refreshToken = data.refresh_token;
    this.oauthRepository.save(entity)
      .then(res => console.log('Token stored:' + res))
      .catch(e => console.log('Error storing token:' + e));
  }

  private removeStaleTokens(username: string) {
    console.log('Removing old token information');
    this.oauthRepository.deleteStaleTokens()
      .then(res => console.log('Old token deleted:' + res))
      .catch(e => console.log('Error deleteing old token:' + e));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else if (error.status === 401) {
      console.error('Invalid authentication 401');
      this.refreshToken().then(() => {
        console.log('configure retries...');
      }).catch(function () {
        // TODO Is the registered user valid?
        this.loggedIn = false;
        console.log("Refresh token Promise Rejected");
      });
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);

        // return an observable with a user-facing error message
        console.log('Something bad happened; please try again later.');
        // TODO Throw error
        //return throwError('Something bad happened; please try again later.');
    }

  };

}
