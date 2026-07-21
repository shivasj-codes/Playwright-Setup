// Import the Page class from Playwright.
// Page represents one browser tab.
// Without importing Page, TypeScript doesn't know what "Page" is.
import { Page } from '@playwright/test';

// export -> Makes this class usable in other files.
// class -> Blueprint/template.
// BasePage -> Parent class for all page objects.
export class BasePage {
  // protected
  // - Accessible inside this class.
  // - Accessible in child classes (LoginPage, HomePage...).
  // - NOT accessible outside.
  //
  // page -> Variable name.
  // : Page -> Type of this variable is Playwright's Page object.
  protected page: Page;

  // constructor()
  // Runs automatically whenever an object is created.
  //
  // Example:
  // const login = new LoginPage(page);
  //
  // Since LoginPage extends BasePage,
  // BasePage constructor is called first.
  constructor(page: Page) {
    // Left side -> Class variable
    // Right side -> Constructor parameter
    //
    // this.page = page
    //
    // Store the received Page object inside the class
    // so every method can use it later.
    this.page = page;
  }
}
