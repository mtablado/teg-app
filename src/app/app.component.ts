import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { WelcomePage } from '../pages/welcome/welcome';
import { ProfilePage } from '../pages/profile/profile';

import { SecurityContext } from '../providers/oauth/security-context';
import { User } from '../providers/db/user-entity';
import { ENV } from "../env/env";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  private EXPIRATION_TOPIC: string = 'user:expired-refresh-token';
  private CLOSED_SESSION_EVENT: string = 'user:closed-session';
  @ViewChild('content') nav: NavController;

  rootPage:any = HomePage;
  homePage = HomePage;
  loginPage = LoginPage;
  welcomePage = WelcomePage;
  profilePage = ProfilePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen
      , private securityContext: SecurityContext, public events: Events, ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      statusBar.styleDefault();

      console.log(` ENV mode: ${ENV.mode} `);

      // Show the welcome page if the user cannot be restored from database.
      this.securityContext.getUser()
        .subscribe((user: User) => {
          console.log(`User: ${user}`);
          if (null == user) {
            this.nav.push(this.welcomePage);
          }
        });

      splashScreen.hide();

      this.registerListeners();

    });
  }

  openPage(p) {
    this.rootPage = p;
  }

  private registerListeners() {
    this.processEvents(this.EXPIRATION_TOPIC);
    this.processEvents(this.CLOSED_SESSION_EVENT);
  }

  private processEvents(topic: string) {
    console.log('App subscribing to ' + topic);
    this.events.subscribe(topic, () => {
      console.log(topic + 'event received.');
      this.nav.push(LoginPage);
    });
  }

}
