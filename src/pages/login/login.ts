import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
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

  constructor( public navCtrl: NavController, private toastCtrl: ToastController
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
        this.logginToast(user.name);
        this.navCtrl.setRoot(HomePage);
      }).catch(e => {
        switch(e.status) {
          case 400:
            this.badCredentialsToast();
            break;
          default:
            this.serverErrorToast();
            break;
        }
        console.log('Error: ' + JSON.stringify(e));
      });
  }

  logginToast(usuario: string) {
    this.presentToast('Bienvenido ' + usuario);
  }

  badCredentialsToast() {
    this.presentToast('Usuario o contraseña no válidos');
  }

  serverErrorToast() {
    this.presentToast('Ooops! Algo no ha ido bien. Por favor, contacta el administrador del sistema.');
  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }
}
