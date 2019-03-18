import { Component } from '@angular/core';
import { NavController, MenuController, Events } from 'ionic-angular';
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

  private EXPIRATION_TOPIC: string = 'user:expired-refresh-token';
  private CLOSED_SESSION_EVENT: string = 'user:closed-session';

  shareLocation: boolean;
  user: User;

  constructor(public menuCtrl: MenuController
      , private backgroundMode: BackgroundMode
      , public navCtrl: NavController
      , private locationTracker: LocationTrackerProvider
      , private oauthProvider: OAuthProvider
      , private securityContext: SecurityContext
      , public events: Events) {

    this.shareLocation = false;
    this.user = new User();
    //this.getUser();
    this.backgroundMode.setDefaults({ silent: true });
    // Override the back button on Android to go to background instead of closing the app.
    this.backgroundMode.overrideBackButton();
    this.backgroundMode.enable();

    // Load user
    this.getUser();

    this.registerListeners();
  }

  public getUser() {
    console.log('Loading user for home page');
    this.securityContext.getUser()
      .subscribe((user: User) => {
        this.user = user;
        this.shareLocation = user.shareLocation;
        if (this.shareLocation) {
          this.start();
        }
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
    // shareLocation property already changed by user control.
    console.log("toggle share location to: " + this.shareLocation);
    if (this.shareLocation) {
      this.start();
    } else {
      this.stop();
    }
    this.updateShareLocation(this.shareLocation);
  }

  updateShareLocation(shareLocation: boolean) {
    this.shareLocation = shareLocation;
    this.securityContext.updateShareLocation(this.shareLocation);
  }

  start() {
    this.locationTracker.startTracking();
  }

  stop(){
    this.locationTracker.stopTracking();
  }

  private registerListeners() {
    this.processEvents(this.EXPIRATION_TOPIC);
    this.processEvents(this.CLOSED_SESSION_EVENT);
  }

  private processEvents(topic: string) {
    console.log('Home subscribing to ' + topic);
    this.events.subscribe(topic, () => {
      console.log(topic + ' event received. Stopping tracking.');
      this.stop();
      this.updateShareLocation(false);
    });
  }
}
