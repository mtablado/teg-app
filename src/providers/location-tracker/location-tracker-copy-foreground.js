import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import { LocationRepository } from '../db/location-repository';
import { OAuthProvider } from '../oauth/oauth';


/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTrackerProvider---- {

  private postPositionURL = "http://192.168.1.45:8080/private/api/v1/position";

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;

  public backgroundGeolocation;
  public geolocation;

  constructor(public zone: NgZone
      , backgroundGeolocation: BackgroundGeolocation
      , geolocation: Geolocation
      , private locationRepository: LocationRepository
      , private oauthProvider: OAuthProvider ) {
    console.log('Hello LocationTrackerProvider Provider');
    this.backgroundGeolocation = backgroundGeolocation;
    this.geolocation = geolocation;
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
      }
      this.oauthProvider.post(this.postPositionURL, pos);
    }, (err) => {

      console.log(err);

    });

    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();

    // Foreground Tracking

    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };

    this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

      console.log(position);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

      this.locationRepository.insertLocation('miguel', this.lat, this.lng);
    });
  }

  stopTracking() {

    console.log('stopTracking');
    this.locationRepository.selectAll();
    this.locationRepository.deleteAll();
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
  }
}
