// Import Locator and Page from Playwright.
import { Locator, Page } from '@playwright/test';

// Import BasePage because LoginPage extends it.
import { BasePage } from './BasePage';

// extends
// LoginPage inherits everything from BasePage.
// That means LoginPage already has this.page.
export class LoginPage extends BasePage {
  // readonly
  // Locator will be assigned only once.
  // We don't want someone changing it later.
  readonly my_account_Btn: Locator;
  readonly email_box: Locator;
  readonly password_box: Locator;
  readonly submit_btn: Locator;

  // Constructor runs when:
  // new LoginPage(page)
  constructor(page: Page) {
    // super()
    // Calls BasePage constructor.
    // BasePage constructor stores:
    //
    // this.page = page;
    //
    // Without super(page), you'll get an error.
    super(page);

    this.my_account_Btn = page.getByRole('button', {
      name: 'My account',
    });
    this.email_box = page.getByPlaceholder('E-Mail Address');
    this.password_box = page.getByPlaceholder('Password');
    this.submit_btn = page.locator("input[value='Login']");
  }

  async navigateToURL(url: string) {
    await this.page.goto(url);
  }

  async clickMYAccount() {
    await this.my_account_Btn.click();
  }

  async enterEmailAddress(emailAdd: string) {
    await this.email_box.fill(emailAdd);
  }

  async enterPassword(password: string) {
    await this.password_box.fill(password);
  }

  async submitForm() {
    await this.submit_btn.click();
  }
}
