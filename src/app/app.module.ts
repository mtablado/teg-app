import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { SQLite } from '@ionic-native/sqlite';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BackgroundMode } from '@ionic-native/background-mode';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { WelcomePage } from '../pages/welcome/welcome';

import { httpInterceptorProviders } from '../providers/http/interceptors-index';
import { LocationTrackerProvider } from '../providers/location-tracker/location-tracker';
import { DatabaseService } from '../providers/db/database-service';
import { LocationRepository } from '../providers/db/location-repository';
import { OAuthRepository } from '../providers/db/oauth-repository';

import { UserRepository } from '../providers/db/user-repository';
import { OAuthProvider } from '../providers/oauth/oauth';
import { SecurityContext } from '../providers/oauth/security-context';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    WelcomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    FormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    WelcomePage
  ],
  providers: [
    BackgroundMode,
    StatusBar,
    SplashScreen,
    BackgroundGeolocation,
    Geolocation,
    httpInterceptorProviders,
    HttpClientModule,
    SQLite,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LocationTrackerProvider,
    DatabaseService,
    LocationRepository,
    UserRepository,
    OAuthProvider,
    OAuthRepository,
    SecurityContext
  ]
})
export class AppModule {}
