import { Component } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'opt-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  appName = environment.appName;
  year = new Date().getFullYear();

}
