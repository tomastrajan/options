import { browser, by, element } from 'protractor';

export class OptionsPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('opt-root h1')).getText();
  }
}
