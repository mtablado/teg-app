import { Component } from '@angular/core';
import { Events, NavController, NavParams } from 'ionic-angular';

import { User } from '../../providers/db/user-entity';
import { SecurityContext } from '../../providers/oauth/security-context';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  private CLOSED_SESSION_EVENT: string = 'user:closed-session';
  user: User = new User();

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public events: Events
    , private securityContext: SecurityContext) {
    this.getUser();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  logout() {
    this.securityContext.logout().subscribe(
      () => {},
      (error) => {},
      () => {
        // complete.
        this.user = new User();
        this.events.publish(this.CLOSED_SESSION_EVENT);
      });
  }

  private getUser() {
    console.log('Loading user for home page');
    this.securityContext.getUser()
      .subscribe((user: User) => {this.user = user});
  }


}
