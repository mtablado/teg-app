import { Injectable } from '@angular/core';
import { DatabaseService } from './database-service';
import { User } from './user-entity';

@Injectable()
export class UserRepository {

  private user: User;

  constructor(private db: DatabaseService) {
    // Nothing at this moment.
  }

  public save(user: User) {
    console.log(`Saving user with rowid=${user.rowid}`);
    if (user.rowid) {
      console.log(`Update data: ${user.id}, ${user.username}, ${user.name}, ${user.lastname}`);
      this.db.executeSql('UPDATE user SET username = ?, name = ?, lastname = ? WHERE rowid = ?'
        , [user.username, user.name, user.lastname, user.rowid])
        .then(res => console.log('Success: ' + JSON.stringify(res)))
        .catch(e => console.log('Error: ' + JSON.stringify(e)));
    } else {
      console.log('Insert data: ' + user.username + ', ' + user.name + ', ' +  user.lastname);
      this.db.executeSql('INSERT INTO user (username, name, lastname) VALUES (?,?,?)'
        , [user.username, user.name, user.lastname])
        .then(res => console.log('Success: ' + JSON.stringify(res)))
        .catch(e => console.log('Error: ' + JSON.stringify(e)));
    }
  }

  public findUserByUsername(username: string) {

    var promise = new Promise((resolve, reject) => {
      this.db.executeSql('SELECT * FROM user WHERE username=?', [username])
        .then( (response: any) => {
          console.log('Convert database response into user entity. Number of results:' + response.rows.length);
          let n = response.rows.length;
          if (0 == n) {
            console.log('User ' + username + ' not found.');
            resolve(null);
          } else  if (n > 1) {
            reject(`Too many users! Only 1 is expected but ${response.rows.length} were found`);
          } else {
            let data: User = new User();

            let item = response.rows.item(0)
            console.log('Converting token ' + item.rowid
              + ', username:' + item.username
              + ', name:' + item.name
              + ', lastname:' + item.lastname);
            data.rowid = item.rowid;
            data.username = item.username;
            data.name = item.name;
            data.lastname = item.lastname;

            this.user = data;
            resolve(this.user);
          }
        }).catch(e => {
          console.log("error:" + e);
          reject(e);
        });
      });
    return promise;
  }

  public getUser() {
    return this.user;
  }

}
