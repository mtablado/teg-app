import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { HomePage } from '../home/home';
import { SecurityContext } from '../../providers/oauth/security-context';
import { User } from '../../providers/db/user-entity';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  loginFormGroup : FormGroup;

  constructor( public navCtrl: NavController
      , private formBuilder: FormBuilder, private securityContext: SecurityContext ) {
    this.loginFormGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

  }

  logForm(){
    console.log(this.loginFormGroup.value);
    this.securityContext.login(this.loginFormGroup.value["username"], this.loginFormGroup.value["password"])
      .then((user: User) => {
        console.log('user logged in: ' + user.name);
        this.navCtrl.setRoot(HomePage);
      }).catch(e => {console.log('Error: ' + JSON.stringify(e))});
  }

}
