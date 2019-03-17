import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatabaseService } from './database-service';
import { User } from './user-entity';

@Injectable()
export class UserRepository {

  private user: User;

  constructor(private db: DatabaseService) {
    // Nothing at this moment.
  }

  public save(user: User): Observable<User> {
    console.log(`Saving user with rowid=${user.rowid}`);
    if (user.rowid) {
      return this.updateUser(user);
    } else {
      return this.insertUser(user);
    }
  }

  private insertUser(user: User): Observable<User> {
    const simpleObservable = new Observable<User>((observer) => {

      console.log('Insert data: ' + user.username + ', ' + user.name + ', ' +  user.lastname);
      this.db.executeSql('INSERT INTO user (username, name, lastname, share_location) VALUES (?,?,?,?)'
        , [user.username, user.name, user.lastname, user.shareLocation])
        .then(res => {
          console.log('Success: ' + JSON.stringify(res));
          observer.next(this.user);
          observer.complete();
        })
        .catch(e => {
          console.log('Error: ' + JSON.stringify(e));
          observer.error(e);
        });

    });
    return simpleObservable;
  }

  private updateUser(user: User): Observable<User> {
    const simpleObservable = new Observable<User>((observer) => {

      console.log(`Update data: ${user.id}, ${user.username}, ${user.name}, ${user.lastname}, ${user.shareLocation}`);
      this.db.executeSql('UPDATE user SET username = ?, name = ?, lastname = ?, share_location = ? WHERE rowid = ?'
        , [user.username, user.name, user.lastname, user.shareLocation, user.rowid])
        .then(res => {
          console.log('Success: ' + JSON.stringify(res));
          this.findUserByUsername(user.username).subscribe(
            (user: User) => observer.next(user)
            , (error) => observer.error(error)
            , () => observer.complete()
          )
        })
        .catch(e => {
          console.log('Error: ' + JSON.stringify(e));
          observer.error(e);
        });

    });
    return simpleObservable;
  }

  public findUserByUsername(username: string): Observable<User> {

    var promise: Promise<User> = new Promise((resolve, reject) => {
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
              + ', lastname:' + item.lastname
              + ', share_location:' + item.share_location);
            data.rowid = item.rowid;
            data.username = item.username;
            data.name = item.name;
            data.lastname = item.lastname;
            data.shareLocation = item.share_location;

            this.user = data;
            resolve(this.user);
          }
        }).catch(e => {
          console.log("error:" + e);
          reject(e);
        });
      });

    // Return observable from promise object.
    return Observable.fromPromise(promise);
  }

  public getUser() {
    return this.user;
  }

}
