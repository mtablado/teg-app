import { Injectable } from '@angular/core';
import { DatabaseService } from './database-service';
import { OAuthEntity } from './oauth-entity';

@Injectable()
export class OAuthRepository {

  private oauthEntity: OAuthEntity;

  constructor(private db: DatabaseService) {
    // Nothing at this moment.
  }

  public save(oauthEntity: OAuthEntity) {
    console.log(`Saving oauth with username=${oauthEntity.username}`);
    var promise = new Promise((resolve, reject) => {
      console.log(`Insert data: ${oauthEntity.username}, ${oauthEntity.accessToken}, ${oauthEntity.refreshToken}`);
      this.db.executeSql('INSERT INTO oauth (username, access_token, refresh_token) VALUES (?,?,?)'
        , [oauthEntity.username, oauthEntity.accessToken, oauthEntity.refreshToken])
        .then(res => {
          console.log('Success: ' + JSON.stringify(res));
          resolve(res);
        })
        .catch(e => {
          console.log('Error: ' + JSON.stringify(e));
          reject(e);
        });
      });
    return promise;
  }

  public deleteStaleTokens() {
    var promise = new Promise((resolve, reject) => {
      this.db.executeSql('DELETE FROM oauth', {})
        .then(res => {
          console.log('OAuth token deleted:' + JSON.stringify(res));
          resolve(res);
        }).catch(e => {
          console.log("Error deleting token:" + JSON.stringify(e));
          reject(e);
        });
      });

    return promise;
  }

  /**
   * This application only stores one token at a time.
   **/
  public findToken() {

    var promise = new Promise((resolve, reject) => {
      this.db.executeSql('SELECT * FROM oauth', {})
        .then( (response: any) => {
          console.log('Convert database response into oauth entity. Number of results:' + response.rows.length);
          let n = response.rows.length;
          if (0 == n) {
            console.log(`OAuth token not found.`);
            resolve(null);
          } else  if (n > 1) {
            reject(`Too many tokens! Only 1 is expected but ${response.rows.length} were found`);
          } else {
            let data: OAuthEntity = new OAuthEntity();

            let item = response.rows.item(0)
            console.log('Converting token ' + item.username
              + ', username:' + item.username
              + ', accessToken:' + item.access_token
              + ', refreshToken:' + item.refresh_token);
            data.username = item.username;
            data.accessToken = item.access_token;
            data.refreshToken = item.refresh_token;

            this.oauthEntity = data;
            resolve(this.oauthEntity);
          }
        }).catch(e => {
          console.log("error:" + e);
          reject(e);
        });
      });
    return promise;
  }

}
