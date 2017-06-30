import { Component } from '@angular/core';
import { environment } from 'environments/environment';
import { version } from '../../../../package.json';

@Component({
  selector: 'opt-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  version = version;
  appName = environment.appName;
  year = new Date().getFullYear();

}
