import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { WelcomePage } from '../pages/welcome/welcome';
import { SecurityContext } from '../providers/oauth/security-context';
import { User } from '../providers/db/user-entity';
import { ENV } from "../env/env";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  const EXPIRATION_TOPIC: string = 'user:expired-refresh-token';
  @ViewChild('content') nav: NavController;

  rootPage:any = HomePage;
  homePage = HomePage;
  loginPage = LoginPage;
  welcomePage = WelcomePage;

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
          if (user.name == 'undefined') {
            this.nav.push(this.welcomePage);
          }
        });

      splashScreen.hide();

      this.handleExpiration();

    });
  }

  openPage(p) {
    this.rootPage = p;
  }

  handleExpiration() {
    console.log('App subscribing to ' + this.EXPIRATION_TOPIC);
    this.events.subscribe(this.EXPIRATION_TOPIC, () => {
      console.log('Handling expired tokens');
      this.nav.push(LoginPage);
    });
  }

}
