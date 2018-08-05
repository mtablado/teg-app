import { Component , ViewChild ,ElementRef } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { Geolocation ,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation';
import { BackgroundMode } from '@ionic-native/background-mode';

import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
import { LoginPage } from '../login/login';
import { OAuthProvider } from '../../providers/oauth/oauth';
import { User } from '../../providers/db/user-entity';
import { SecurityContext } from '../../providers/oauth/security-context';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  options : GeolocationOptions;
  currentPos : Geoposition;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  shareLocation: boolean;
  user: User;

  constructor(public menuCtrl: MenuController
      , private backgroundMode: BackgroundMode
      , public navCtrl: NavController
      , private locationTracker: LocationTrackerProvider
      , private geolocation : Geolocation
      , private oauthProvider: OAuthProvider
      , private securityContext: SecurityContext) {

    this.shareLocation = false;
    this.user = new User();
    //this.getUser();
    this.backgroundMode.setDefaults({ silent: true });
    // Override the back button on Android to go to background instead of closing the app.
    this.backgroundMode.overrideBackButton();
    this.backgroundMode.enable();
  }

  public getUser() {
    console.log('Loading user for home page');
    this.securityContext.getUser()
      .subscribe((user: User) => {this.user = user});
  }
  public isUserRegistered() {
    return this.oauthProvider.isUserRegistered();
  }

  changeLocationSetting(share) {
    console.log("changing location to %s", share);
  }
  ionViewDidEnter(){
    this.getUserPosition();
  }

  getUserPosition(){
      this.options = {
        enableHighAccuracy : false
      };
      this.geolocation.getCurrentPosition(this.options).then((pos : Geoposition) => {

          this.currentPos = pos;

          console.log(pos);
          this.addMap(pos.coords.latitude,pos.coords.longitude);

      },(err : PositionError)=>{
          console.log("error : " + err.message);
      ;
      })
  }

  openMenu() {
    this.menuCtrl.open();
  }

  openPage(page) {
    this.navCtrl.push(page, {});
  }
  showLogin() {
    this.navCtrl.push(LoginPage, {});
  }

  toggleShareLocation() {
    console.log("toggle share location to: " + this.shareLocation);
    if (this.shareLocation) {
      this.start();
    } else {
      this.stop();
    }
  }

  start() {
    this.locationTracker.startTracking();
  }

  stop(){
    this.locationTracker.stopTracking();
  }

  addMap(lat,long) {

    let latLng = new google.maps.LatLng(lat, long);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker();

  }

  addMarker(){

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<p>This is your current position !</p>";
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }
}
