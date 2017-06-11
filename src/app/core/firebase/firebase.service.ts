import * as firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

const instance = firebase.initializeApp(environment.firebase, 'options');

@Injectable()
export class FirebaseService {

  instance = instance;

}
