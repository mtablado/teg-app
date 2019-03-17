import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
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

  shareLocation: boolean;
  user: User;

  constructor(public menuCtrl: MenuController
      , private backgroundMode: BackgroundMode
      , public navCtrl: NavController
      , private locationTracker: LocationTrackerProvider
      , private oauthProvider: OAuthProvider
      , private securityContext: SecurityContext) {

    this.shareLocation = false;
    this.user = new User();
    //this.getUser();
    this.backgroundMode.setDefaults({ silent: true });
    // Override the back button on Android to go to background instead of closing the app.
    this.backgroundMode.overrideBackButton();
    this.backgroundMode.enable();

    // Load user
    this.getUser();
  }

  public getUser() {
    console.log('Loading user for home page');
    this.securityContext.getUser()
      .subscribe((user: User) => {
        this.user = user;
        this.shareLocation = user.shareLocation;
      });
  }

  public isUserRegistered() {
    return this.oauthProvider.isUserRegistered();
  }

  ionViewDidEnter(){
    // Mmmm don't know yet ...
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
    this.securityContext.updateShareLocation(this.shareLocation);
  }

  start() {
    this.locationTracker.startTracking();
  }

  stop(){
    this.locationTracker.stopTracking();
  }

}
