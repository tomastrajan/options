import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from 'environments/environment';

import { FirebaseService } from '@app/core';

@Component({
  selector: 'opt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements  OnInit {

  appName = environment.appName.split(' ');
  logo = require('../assets/logo.png');
  themeClass = 'default-theme';

  navigation = [
    { link: 'about', label: 'About' },
    { link: 'calculators', label: 'Calculators' }
  ];

  constructor(
    private firebase: FirebaseService,
    private titleService: Title
  ) {
    this.titleService.setTitle(environment.appName);
  }

  ngOnInit() {}

}