import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class DatabaseService {

  private databaseName = 'elgarabatoapp.db';
  private databaseLocation = 'default';

  constructor(private sqlite: SQLite) {
    console.log('Creating Database Service');
    this.createDatabase();
  }

  private createDatabase() {
    console.log('Creating database [name=' + this.databaseName + ',location=' + this.databaseLocation + ']');
    this.sqlite.create({
          name: this.databaseName,
          location: this.databaseLocation
        }).then((db: SQLiteObject) => {
          this.createLocationTable(db);
          this.createOAuth(db);
          this.createUser(db);
        }).catch(e => {
          console.log(e);
        });

  }

  private createLocationTable(db: SQLiteObject) {
    console.log('Creating location table.');
    db.executeSql('CREATE TABLE IF NOT EXISTS location(rowid INTEGER PRIMARY KEY, user TEXT, latitude TEXT, longitude TEXT)', []])
      .then(res => {
        console.log('Creating location table success.');
        console.log(res);
      })
      .catch(e => {
        console.log(e);
      });
  }

  private createOAuth(db: SQLiteObject) {
    console.log('Creating table oauth.');
    db.executeSql('CREATE TABLE IF NOT EXISTS oauth(username TEXT PRIMARY KEY, access_token TEXT, refresh_token TEXT)', [])
      .then(res => {
        console.log('Creating oauth table success.');
        console.log(res);
      })
      .catch(e => {
        console.log(e);
      });


  }

  private createUser(db: SQLiteObject) {
    console.log('Creating table user.');
    db.executeSql('CREATE TABLE IF NOT EXISTS user(rowid INTEGER PRIMARY KEY, username TEXT, name TEXT, lastname TEXT)', [])
      .then(res => {
        console.log('Creating user table success.');
        console.log(res);
      })
      .catch(e => {
        console.log(e);
      });
  }

  public executeSql(sql: any, values: any) {

    var promise = new Promise((resolve, reject) => {
      this.sqlite.create({
          name: this.databaseName,
          location: this.databaseLocation
        }).then((db: SQLiteObject) => {
          console.log("DB Connection stablished:" + db);
          console.log(`Executing sql: ${sql} with params ${values}`);
          db.executeSql(sql, values)
            .then((res) => {
              console.log('sql response: ' + JSON.stringify(res));
              resolve(res);
            })
            .catch(e => {
              console.log('sql error: ' + JSON.stringify(e));
              reject(e);
            });
        }).catch(e => {
          console.log("DB Connection error:" + JSON.stringify(e));
          reject(e);
        });

    });
    return promise;
  }

}
