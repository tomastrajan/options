import { OptionsPage } from './app.po';

describe('options App', () => {
  let page: OptionsPage;

  beforeEach(() => {
    page = new OptionsPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to opt!!');
  });
});
