import { Injectable } from '@angular/core';
import { DatabaseService } from './database-service';

@Injectable()
export class LocationRepository {

  constructor(private db: DatabaseService) {
    console.log('Creating Location Repository');
  }

  insertLocation(user, latitude, longitude) {
    console.log('Insert location data[user=' + user + ',latitude=' + latitude + ',longitude=' + longitude + ']');

    this.db.executeSql('INSERT INTO location(rowid, user, latitude, longitude) VALUES(?,?,?,?)'
      ,[null,user,latitude,longitude]);
  }

  private convertLocation(response: any) {
    let data = [];
    for(var i=0; i<response.rows.length; i++) {
      data.push({rowid:response.rows.item(i).rowid,user:response.rows.item(i).user,latitude:response.rows.item(i).latitude,longitude:response.rows.item(i).longitude})
    }
    console.log('location data:' + data);
  }

  deleteAll() {
    console.log('Cleaning previous registered locations');
    this.db.executeSql('DELETE FROM location', {})
      .then(response => console.log('location data deleted:' + response));
  }

  selectAll() {
    console.log('Selecting all registered locations');
    this.db.executeSql('SELECT * FROM location', {})
      .then(response => this.convertLocation(response));
  }

}
