import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import 'rxjs/add/operator/filter';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';

import { LocationRepository } from '../db/location-repository';
import { ENV } from "../../env/env";

export interface Position {
  longitude: number;
  latitude: number;
}

@Injectable()
export class LocationTrackerProvider {

  private postPositionURL = ENV.server_api + "/position";

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;

  public backgroundGeolocation;

  constructor(public zone: NgZone
      , backgroundGeolocation: BackgroundGeolocation
      , private http: HttpClient
      , private locationRepository: LocationRepository ) {
    console.log('Hello LocationTrackerProvider Provider');
    this.backgroundGeolocation = backgroundGeolocation;
  }

  startTracking() {
    // Background Tracking

    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: true,
      interval: 2000
    };

    this.backgroundGeolocation.configure(config).subscribe((location) => {

      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
      });

      this.locationRepository.insertLocation('miguel', this.lat, this.lng);
      let pos = {
        'latitude': this.lat,
        'longitude': this.lng
      };
      this.postPosition(pos).subscribe();
    }, (err) => {

      console.log('Error at background geolocation process:' + err);

    });

    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();

  }

  postPosition(pos: Position): Observable<{}> {

    let headers = new HttpHeaders({
      'Content-Type':  'application/json'
    });

    const options = {
      headers: headers
    };

    return this.http.post<Position>(this.postPositionURL, pos, options)
      .pipe(
        retry(2),
        catchError(err => this.handleError(err))
      );
  }

  stopTracking() {
    console.log('stopTracking');
    this.backgroundGeolocation.stop();
    this.locationRepository.selectAll();
    this.locationRepository.deleteAll();
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);

        // return an observable with a user-facing error message
        console.log('Something bad happened; please try again later.');
    }
    return ErrorObservable.create('Something bad happened; please try again later.');

  };

}
