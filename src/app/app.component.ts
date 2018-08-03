import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { SecurityContext } from '../providers/oauth/security-context';
import { User } from '../db/user-entity';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage:any = LoginPage;
  homePage = HomePage;
  loginPage = LoginPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen
      , private securityContext: SecurityContext) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      statusBar.styleDefault();

      // Show the login page if the user cannot be restored from database.
      this.securityContext.getUser()
        .subscribe((user: User) => {
          if (user.name) {
            this.rootPage = this.homePage;
          } else {
            this.rootPage = this.loginPage;
          }
        });

      splashScreen.hide();


    });
  }

  openPage(p) {
    this.rootPage = p;
  }
}
