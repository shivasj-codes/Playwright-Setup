# Playwright BDD Test Automation Framework

End-to-end test automation framework built with **Playwright**, **playwright-bdd** (Cucumber/Gherkin), **TypeScript**, and integrated code quality, reporting, and CI/CD tooling.

---

## Table of Contents

- [Playwright BDD Test Automation Framework](#playwright-bdd-test-automation-framework)
  - [Table of Contents](#table-of-contents)
  - [Reference Learning Resources](#reference-learning-resources)
  - [Project Setup](#project-setup)
  - [Configuration Files](#configuration-files)
    - [`package.json` (fully annotated)](#packagejson-fully-annotated)
      - [Script-by-script explanation](#script-by-script-explanation)
      - [`lint-staged` block explanation](#lint-staged-block-explanation)
      - [Dependency groups explanation](#dependency-groups-explanation)
    - [`playwright.config.ts` (fully annotated)](#playwrightconfigts-fully-annotated)
      - [Section-by-section explanation](#section-by-section-explanation)
  - [Code Formatting — Prettier](#code-formatting--prettier)
    - [`.prettierrc.json`](#prettierrcjson)
    - [Run Prettier](#run-prettier)
  - [Linting — ESLint](#linting--eslint)
    - [`eslint.config.mts`](#eslintconfigmts)
      - [What each part of this config does](#what-each-part-of-this-config-does)
    - [Run ESLint](#run-eslint)
  - [Gherkin Linting](#gherkin-linting)
  - [Git Hooks — Husky \& lint-staged](#git-hooks--husky--lint-staged)
    - [Husky](#husky)
    - [lint-staged](#lint-staged)
  - [Test Reporting — Allure](#test-reporting--allure)
    - [Install](#install)
    - [Configure reporter (`playwright.config.ts`)](#configure-reporter-playwrightconfigts)
    - [Run and generate](#run-and-generate)
    - [Netlify CLI (for deploying the Allure report)](#netlify-cli-for-deploying-the-allure-report)
  - [Test Reporting — Cucumber HTML](#test-reporting--cucumber-html)
  - [Multiple Cucumber HTML Reporter](#multiple-cucumber-html-reporter)
    - [`generate-report.ts`](#generate-reportts)
      - [What this script does, step by step](#what-this-script-does-step-by-step)
    - [Run](#run)
  - [CI/CD — GitHub Actions Workflow](#cicd--github-actions-workflow)
    - [Branch → Environment mapping](#branch--environment-mapping)
    - [Full workflow file](#full-workflow-file)
      - [What the workflow does, job by job](#what-the-workflow-does-job-by-job)
    - [Required GitHub Secrets](#required-github-secrets)
  - [Accessibility Testing](#accessibility-testing)
    - [Why does Playwright BDD throw: _"When using several calls of defineBddConfig(), please manually provide different outputDir"_?](#why-does-playwright-bdd-throw-when-using-several-calls-of-definebddconfig-please-manually-provide-different-outputdir)
    - [`@axe-core/playwright`](#axe-coreplaywright)
  - [Troubleshooting](#troubleshooting)

---

## Reference Learning Resources

- Playwright learning repo: https://github.com/TestRoverAutomation/Playwright_Learning
- Playwright video playlist: https://youtube.com/playlist?list=PLf8vT0W16iNP7PVpW1lXuUNFmTBjAGm4V&si=r5z07tDGq-f97mfj

---

## Project Setup

Initialize a new Playwright project:

```bash
npm init playwright@latest
```

_What this does:_ scaffolds a fresh Playwright project — creates `playwright.config.ts`, a `tests/` folder with an example spec, installs `@playwright/test`, and downloads the browser binaries (Chromium/Firefox/WebKit).

Add BDD (Cucumber/Gherkin) support on top of Playwright:

```bash
npm i -D playwright-bdd
```

_What this does:_ installs `playwright-bdd` as a dev dependency. This is the library that lets you write tests as `.feature` files (Gherkin syntax: `Given/When/Then`) and auto-generates the actual Playwright spec files from them.

---

## Configuration Files

These are the two files that drive the whole framework. Every setting below is explained in plain English so anyone opening the repo later understands _why_ a line exists, not just what it does.

### `package.json` (fully annotated)

```json
{
  "name": "playwright-setup",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "lint:ts": "eslint \"tests/**/*.{ts,js}\"",
    "lint:feature": "node lint-features.js",
    "lint": "npm run lint:ts && npm run lint:feature",
    "lint:fix": "eslint \"tests/**/*.{ts,js}\" --fix",
    "prepare": "husky",
    "format": "prettier --check .",
    "format:fix": "prettier --write .",
    "test": "npx bddgen && npx playwright test",
    "allure-report": "allure generate allure-results --clean -o allure-report && allure open allure-report",
    "multiple-cucumber-report:bdd": "npx ts-node generate-report.ts"
  },
  "lint-staged": {
    "*.ts": ["eslint --fix tests/**/*.ts", "prettier --write tests/**/*.ts"],
    "*.feature": ["node lint-features.js", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@eslint/json": "^2.0.1",
    "@playwright/test": "^1.61.1",
    "@types/node": "^26.1.1",
    "@typescript-eslint/eslint-plugin": "^8.64.0",
    "@typescript-eslint/parser": "^8.64.0",
    "allure-commandline": "^2.43.0",
    "allure-playwright": "^3.10.2",
    "eslint": "^10.7.0",
    "eslint-plugin-playwright": "^2.10.5",
    "gherkin-lint-plus": "^1.0.2",
    "glob": "^13.0.6",
    "globals": "^17.7.0",
    "husky": "^9.1.7",
    "jiti": "^2.7.0",
    "lint-staged": "^16.4.0",
    "multiple-cucumber-html-reporter": "^3.10.0",
    "netlify-cli": "^27.0.0",
    "playwright-bdd": "^9.2.0",
    "prettier": "3.9.5",
    "prettier-plugin-gherkin": "^4.0.0",
    "typescript-eslint": "^8.64.0"
  },
  "dependencies": {
    "@axe-core/playwright": "^4.12.1"
  }
}
```

#### Script-by-script explanation

| Script                         | Command it runs                                                                        | What it actually does                                                                                                                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lint:ts`                      | `eslint "tests/**/*.{ts,js}"`                                                          | Checks every `.ts`/`.js` file under `tests/` against the ESLint rules and **reports** problems (does not fix anything).                                                                                                              |
| `lint:feature`                 | `node lint-features.js`                                                                | Runs a custom Node script (`lint-features.js`, project-specific) that lints `.feature` (Gherkin) files — e.g. catching missing scenario titles, bad indentation, duplicate step text.                                                |
| `lint`                         | `npm run lint:ts && npm run lint:feature`                                              | Runs both linters back to back. The `&&` means `lint:feature` only runs if `lint:ts` passes — this is the "run everything and fail fast" command, typically used in CI.                                                              |
| `lint:fix`                     | `eslint "tests/**/*.{ts,js}" --fix`                                                    | Same as `lint:ts` but with `--fix`, so ESLint automatically rewrites the file wherever it can safely auto-correct a violation (e.g. missing semicolons, unused imports).                                                             |
| `prepare`                      | `husky`                                                                                | npm automatically runs any script named `prepare` right after `npm install`. This is what wires up the Husky Git hooks (like pre-commit) on a fresh clone of the repo — nobody has to remember to run it manually.                   |
| `format`                       | `prettier --check .`                                                                   | Scans the whole repo and tells you which files are **not** formatted according to `.prettierrc.json`, but doesn't change anything. Good for CI — it can fail the build if formatting drifted.                                        |
| `format:fix`                   | `prettier --write .`                                                                   | Same scan, but actually rewrites every file to match the Prettier style. Run this locally before committing.                                                                                                                         |
| `test`                         | `npx bddgen && npx playwright test`                                                    | Two-step: `bddgen` reads your `.feature` files + step definitions and generates the real Playwright `.spec.ts` files from them, **then** `playwright test` executes those generated specs. This is the main "run all tests" command. |
| `allure-report`                | `allure generate allure-results --clean -o allure-report && allure open allure-report` | Takes the raw result files Playwright wrote into `allure-results/` during the test run, builds a browsable HTML report into `allure-report/` (`--clean` wipes any old report first), then opens it in your default browser.          |
| `multiple-cucumber-report:bdd` | `npx ts-node generate-report.ts`                                                       | Runs the custom `generate-report.ts` script (documented in [Multiple Cucumber HTML Reporter](#multiple-cucumber-html-reporter) below) which reads the Cucumber JSON results and builds a polished, metadata-rich HTML dashboard.     |

#### `lint-staged` block explanation

`lint-staged` only runs tools against files that are **currently staged for commit** (i.e. `git add`ed), not the whole repo — this keeps pre-commit checks fast.

```json
"lint-staged": {
  "*.ts": [
    "eslint --fix tests/**/*.ts",
    "prettier --write tests/**/*.ts"
  ],
  "*.feature": [
    "node lint-features.js",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

- **`*.ts`** staged → auto-fix lint issues, then reformat with Prettier.
- **`*.feature`** staged → run the custom Gherkin linter, then reformat with Prettier (using the `prettier-plugin-gherkin` plugin).
- **`*.json` / `*.md`** staged → just reformat with Prettier (JSON and Markdown don't need linting, only consistent formatting).

This block is read automatically by `lint-staged` when Husky's pre-commit hook calls `npx lint-staged` — so bad formatting/lint errors get caught **before** they're ever committed.

#### Dependency groups explanation

- **`devDependencies`** — tools only needed while _developing and running_ tests (linters, formatters, test runner, report generators, Git hooks). These are never needed in a production app, which is why they're kept separate from `dependencies`.
- **`dependencies`** — currently only `@axe-core/playwright`, the accessibility-testing engine. It's listed as a regular dependency (not dev) because in some setups accessibility checks are treated as part of the shippable test suite itself rather than a pure dev-time tool — either placement works, this is just how it's currently split in this project.

---

### `playwright.config.ts` (fully annotated)

```ts
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const testDir = defineBddConfig({
  features: 'tests/UI_Test/feature/**/*.feature',
  steps: [
    'tests/UI_Test/steps/**/*.steps.ts',
    'tests/UI_Test/fixture/fixtures.ts',
  ],
});

const testAccessDir = defineBddConfig({
  features: 'tests/Accessibility_Test/feature/**/*.feature',
  steps: [
    'tests/Accessibility_Test/steps/**/*.steps.ts',
    'tests/Accessibility_Test/fixture/fixtures.ts',
  ],
  outputDir: 'accessibility-results',
});

export default defineConfig({
  testDir,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['allure-playwright'],
    cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }),
    cucumberReporter('json', { outputFile: 'cucumber-report/result.json' }),
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',
    baseURL: 'https://ecommerce-playground.lambdatest.io/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'accessibility-test',
      testDir: testAccessDir,
      use: { ...devices['Desktop Firefox'] },
    },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
```

#### Section-by-section explanation

**Imports**

- `defineConfig`, `devices` — Playwright's own config helper and its library of preset device profiles (e.g. `'Desktop Chrome'`, `'iPhone 12'`) so you don't have to hand-write viewport sizes and user agents.
- `defineBddConfig`, `cucumberReporter` — from `playwright-bdd`. `defineBddConfig` is what converts a folder of `.feature` files + step definitions into a real Playwright test directory. `cucumberReporter` is a reporter factory used further down.

**The commented-out `dotenv` block**
Left in as a ready-to-use snippet. If the project later needs secrets or environment-specific values (like different base URLs per environment) pulled from a local `.env` file instead of hardcoding them, uncomment these three lines and they'll load automatically before the config is evaluated.

**`testDir` — the main UI test BDD config**

```ts
const testDir = defineBddConfig({
  features: 'tests/UI_Test/feature/**/*.feature',
  steps: [
    'tests/UI_Test/steps/**/*.steps.ts',
    'tests/UI_Test/fixture/fixtures.ts',
  ],
});
```

- `features` — glob pattern telling `playwright-bdd` where to find `.feature` files for the main UI suite.
- `steps` — glob patterns for the step-definition files (the TypeScript code that implements each `Given/When/Then` line) **and** the fixtures file (shared setup/teardown logic, e.g. custom `page` objects, auth state).
- No `outputDir` is set here, so `playwright-bdd` uses its default hidden folder, `.features-gen`, to write the generated spec files. This is why the CI workflow's "verify generated spec files" step looks in `.features-gen` first.

**`testAccessDir` — the accessibility BDD config**

```ts
const testAccessDir = defineBddConfig({
  features: 'tests/Accessibility_Test/feature/**/*.feature',
  steps: [
    'tests/Accessibility_Test/steps/**/*.steps.ts',
    'tests/Accessibility_Test/fixture/fixtures.ts',
  ],
  outputDir: 'accessibility-results',
});
```

Same idea as above but for a **separate** accessibility test suite. It **must** have its own `outputDir` (`accessibility-results`) — this is exactly the "please manually provide different outputDir" situation described in [Accessibility Testing](#accessibility-testing). Without a distinct `outputDir`, `playwright-bdd` can't tell which generated files belong to the UI suite vs. the accessibility suite and throws an error.

**Top-level `defineConfig({...})` options**

| Option          | Value                               | Meaning                                                                                                                                                                                                                                                                                                                                                       |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `testDir`       | `testDir` (the UI BDD config above) | Tells Playwright the default test directory is the generated UI test output.                                                                                                                                                                                                                                                                                  |
| `fullyParallel` | `true`                              | Runs test files in parallel workers instead of one at a time — much faster locally and in CI.                                                                                                                                                                                                                                                                 |
| `forbidOnly`    | `!!process.env.CI`                  | If someone left `test.only(...)` in a spec (which restricts a run to just that one test), this makes the whole test run **fail** when `CI` is set — a safety net so a debugging leftover never silently skips the rest of the suite in a real pipeline run.                                                                                                   |
| `retries`       | `process.env.CI ? 2 : 0`            | On CI, flaky tests get retried up to 2 times before being marked failed. Locally, no retries — you want to see failures immediately while developing.                                                                                                                                                                                                         |
| `workers`       | `process.env.CI ? 1 : undefined`    | On CI, runs one worker at a time (safer/more predictable on shared runners with limited resources). Locally, Playwright picks a sensible number of parallel workers automatically.                                                                                                                                                                            |
| `reporter`      | array of 4 reporters                | Playwright supports multiple reporters running simultaneously. Here: the built-in `html` report, the `allure-playwright` reporter (feeds the Allure dashboard), and two Cucumber reporters — one producing a standalone Cucumber HTML file, one producing the raw JSON that `generate-report.ts` later reads to build the "Multiple Cucumber HTML" dashboard. |

**`use` block — settings shared by every project below**

| Option       | Value                                           | Meaning                                                                                                                                                                                                                                                                 |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseURL`    | `'https://ecommerce-playground.lambdatest.io/'` | Every relative `page.goto('/some-page')` call resolves against this URL, so tests don't need to hardcode the full domain everywhere. The `localhost:3000` line above it is commented out — swap the two when testing a local dev build instead of the hosted demo site. |
| `trace`      | `'on-first-retry'`                              | Playwright only records a full trace (a step-by-step timeline you can replay in the Trace Viewer) the **first time** a test is retried after failing — keeps disk usage low while still capturing debugging info for actual failures.                                   |
| `screenshot` | `'on'`                                          | Takes a screenshot for every test, pass or fail (not just failures) — useful for visual review/reporting, though it does mean more storage used than `'only-on-failure'`.                                                                                               |
| `video`      | `'on'`                                          | Records video for every test run, same trade-off as above: more disk usage, but full visual playback available for anything, not just failures.                                                                                                                         |

**`projects` array — different browser/suite combinations**

- `chromium` — the main UI suite (inherits `testDir` from the top level) runs in Desktop Chrome.
- `accessibility-test` — overrides `testDir` to point at the accessibility BDD output (`testAccessDir`) and runs it in Desktop Firefox instead of Chrome.
- Everything else (`firefox`, `webkit`, mobile viewports, branded browsers like Edge/Chrome) is commented out — these are ready-made presets from the default Playwright scaffold, kept as reference. Uncomment any of them to add that browser/device to the test matrix.

**`webServer` block (commented out)**
Another ready-to-use snippet — if this project ever needs Playwright to boot a local dev server before running tests (and shut it down after), uncomment this and point `command`/`url` at the app.

---

## Code Formatting — Prettier

Docs: https://prettier.io/docs/install

Install an exact, pinned Prettier version:

```bash
npm install --save-dev --save-exact prettier@3.9.5
```

_What this does:_ installs Prettier as a dev dependency, and `--save-exact` locks the version in `package.json` to precisely `3.9.5` (no `^` or `~` range) so formatting output never silently changes because of an automatic minor/patch update.

Install the Gherkin plugin for Prettier so `.feature` files get formatted too:
Package: https://www.npmjs.com/package/prettier-plugin-gherkin

```bash
npm i -D prettier-plugin-gherkin
```

_What this does:_ Prettier doesn't understand Gherkin syntax out of the box — this plugin teaches it how, so `.feature` files get consistent indentation and spacing too.

### `.prettierrc.json`

```json
{
  "plugins": ["prettier-plugin-gherkin"],
  "singleQuote": true,
  "trailingComma": "es5"
}
```

- `plugins` — loads the Gherkin plugin installed above.
- `singleQuote` — use `'single quotes'` instead of `"double quotes"` in JS/TS.
- `trailingComma: "es5"` — adds trailing commas where valid in ES5 (arrays, objects) but not in places only newer JS supports (like function arguments), for cleaner git diffs.

### Run Prettier

```bash
npx prettier . --write
```

_What this does:_ reformats every file in the project (respecting `.prettierrc.json` and any `.prettierignore`) in place.

---

## Linting — ESLint

Install ESLint with the TypeScript parser/plugin and the Playwright plugin:

```bash
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-playwright --save-dev
```

_What this does:_ installs the core ESLint engine, the parser/plugin pair that lets ESLint understand TypeScript syntax and apply TS-specific rules, and a Playwright-specific plugin (catches Playwright anti-patterns, like using `page.pause()` or a standalone `expect()` outside a test).

Initialize the ESLint config:

```bash
npx eslint --init
```

_What this does:_ launches ESLint's interactive setup wizard, which asks a series of questions (shown below) and generates a starter config file plus installs whatever dependencies your answers require.

You can also run this directly via:

```bash
npm init @eslint/config@latest
```

During `eslint --init`, the following prompts/choices were used:

| Prompt                                                                             | Selection        |
| ---------------------------------------------------------------------------------- | ---------------- |
| What do you want to lint?                                                          | javascript, json |
| How would you like to use ESLint?                                                  | problems         |
| What type of modules does your project use?                                        | esm              |
| Which framework does your project use?                                             | none             |
| Does your project use TypeScript?                                                  | Yes              |
| Where does your code run?                                                          | browser, node    |
| Config file language                                                               | ts               |
| Add Jiti as a devDependency? (needed for Node.js < 24.3.0 to read TS config files) | Yes              |
| Install required dependencies now?                                                 | Yes              |
| Package manager                                                                    | npm              |

Required dependencies installed by the wizard: `eslint`, `@eslint/js`, `globals`, `typescript-eslint`, `@eslint/json`, `jiti`.

### `eslint.config.mts`

Replace the generated default config with the following:

```ts
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import playwright from 'eslint-plugin-playwright';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // JS + TS files
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser, // ✅ TypeScript parser object
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { js, '@typescript-eslint': tseslint.plugin },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      playwright.configs['flat/recommended'], // ✅ flat config, not "plugin:..."
    ],
    rules: {
      // ✅ allow CommonJS require() statements
      '@typescript-eslint/no-var-requires': 'off',
      // ✅ allow mixing import/require (useful for report.js)
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-commonjs': 'off',

      // Allow top-level await in flat configs or test utilities
      'no-await-in-loop': 'off',
      // allow stand-alone expect() in steps
      'playwright/no-standalone-expect': 'off',
      // ❌ forbid page.pause()
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='page'][callee.property.name='pause']",
          message: '❌ Do not use page.pause() in tests.',
        },
      ],
    },
  },

  // JSON files
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
    ignores: ['**/node_modules/**'],
  },
]);
```

#### What each part of this config does

- **`files: ['**/*.{js,mjs,cjs,ts,mts,cts}']`** — this block applies to every JS/TS file variant in the repo.
- **`languageOptions.parser: tseslint.parser`** — tells ESLint to parse files using the TypeScript parser (understands types, interfaces, generics, etc.) instead of the default JS-only parser.
- **`languageOptions.globals`** — declares which global variables are allowed without an "undefined variable" error — both browser globals (`window`, `document`) and Node globals (`process`, `__dirname`), since Playwright tests run in Node but interact with browser pages.
- **`extends`** — layers three rule sets on top of each other: ESLint's own recommended rules, the TypeScript-ESLint recommended rules, and `eslint-plugin-playwright`'s recommended rules (catches things like unused `page.click()` results or missing `await`).
- **`rules` overrides:**
  - `@typescript-eslint/no-var-requires: 'off'` and `@typescript-eslint/no-require-imports: 'off'` — normally TypeScript-ESLint discourages old-style `require(...)` in favor of `import`, but this project intentionally allows `require()` in a couple of places (e.g. `generate-report.ts` needs it for a package without TS types — see [Multiple Cucumber HTML Reporter](#multiple-cucumber-html-reporter)), so both rules are turned off project-wide.
  - `'import/no-commonjs': 'off'` — same reasoning, allows CommonJS-style imports.
  - `'no-await-in-loop': 'off'` — normally flagged as a performance smell, but test setup/step code often legitimately needs to `await` sequentially inside a loop (e.g. filling multiple form fields one at a time), so it's disabled.
  - `'playwright/no-standalone-expect': 'off'` — allows calling `expect()` outside of a `test()` block, which is common in BDD step definitions where assertions live in separate step files rather than inline in a `test(...)` callback.
  - `'no-restricted-syntax'` with a custom selector — this is a hand-written rule that specifically bans `page.pause()` (Playwright's interactive debug-pause command) anywhere in the codebase, with a clear custom error message. This stops someone from accidentally committing a debugging pause that would freeze CI.
- **The second block (`files: ['**/*.json']`)** — applies separate JSON-specific linting (checks for valid JSON syntax/structure) and explicitly excludes `node_modules`.

Reference: https://www.npmjs.com/package/eslint-plugin-playwright

### Run ESLint

```bash
npx eslint "tests/**/*.ts"
```

_What this does:_ lints every `.ts` file under `tests/` and prints any rule violations to the terminal.

---

## Gherkin Linting

`gherkin-lint-plus` is used as a replacement for the older, unmaintained `gherkin-lint`.
Package: https://www.npmjs.com/package/gherkin-lint-plus

```bash
npm i gherkin-lint-plus --save-dev
```

_What this does:_ installs a linter specifically for `.feature` (Gherkin) files — checks things like scenario naming, step formatting, and duplicate/orphaned steps.

Run it against all feature files:

```bash
npx gherkin-lint-plus "tests/***/***/***.feature"
```

_What this does:_ scans every `.feature` file (three levels deep, matching this project's `tests/<SuiteName>/feature/*.feature` structure) and reports Gherkin style/syntax issues.

---

## Git Hooks — Husky & lint-staged

### Husky

Docs: https://typicode.github.io/husky/get-started.html

Package: https://www.npmjs.com/package/husky

```bash
npm install --save-dev husky
npx husky init
```

_What this does:_ `husky` lets you run scripts automatically at Git lifecycle points (like right before a commit is created). `husky init` creates the `.husky/` folder and a default `pre-commit` hook file, and adds the `"prepare": "husky"` script to `package.json` (already present above) so every teammate gets the same hooks automatically after `npm install`.

### lint-staged

Package: https://www.npmjs.com/package/lint-staged

```bash
npm install --save-dev lint-staged
```

_What this does:_ installs the tool that only runs linters/formatters against files that are staged for commit (see the `lint-staged` block in `package.json`, explained above), rather than the whole repo — makes pre-commit checks fast.

Run it manually (also wired into Husky's pre-commit hook):

```bash
npx lint-staged
```

_What this does:_ runs the same checks Husky's pre-commit hook would run, on demand — useful to test your `lint-staged` config without actually making a commit.

---

## Test Reporting — Allure

> **Note:** Java is required to generate the Allure report.

Docs:

- https://vitalets.github.io/playwright-bdd/#/reporters/allure
- https://allurereport.org/docs/playwright/

### Install

```bash
npm install --save-dev allure-commandline
npm install --save-dev @playwright/test allure-playwright
```

_What this does:_ `allure-commandline` is the CLI tool that turns raw result files into an HTML report (`allure generate`/`allure open`). `allure-playwright` is the Playwright reporter plugin that writes those raw result files in the format Allure expects during a test run.

### Configure reporter (`playwright.config.ts`)

```ts
reporter: [['html'], ['allure-playwright']],
```

_What this does:_ tells Playwright to produce two reports simultaneously — its own built-in HTML report, and Allure's raw result files (later turned into a report with the commands below). See the fully annotated config above for how this evolved into the 4-reporter array actually used in this project.

### Run and generate

```bash
npx playwright test
npx allure generate
npx allure open
```

_What this does:_ runs the test suite (writing raw results into `allure-results/`), builds the browsable Allure HTML report from those results, then opens it in your browser.

Or serve directly without a separate generate step:

```bash
npx allure serve
```

_What this does:_ generates the report into a temporary folder and opens it immediately — convenient for a one-off local look, but not meant for keeping/publishing the report (use `generate` + a fixed output folder for that, as the CI workflow does).

### Netlify CLI (for deploying the Allure report)

```bash
npm i netlify-cli --save-dev
```

_What this does:_ installs the command-line tool used later in the CI workflow (`npx netlify deploy ...`) to publish the generated Allure report as a live, shareable website.

---

## Test Reporting — Cucumber HTML

Docs: https://vitalets.github.io/playwright-bdd/#/reporters/cucumber

Add the Cucumber reporter alongside the others in `playwright.config.ts`:

```ts
reporter: [
  ['html'],
  ['allure-playwright'],
  cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }),
],
```

_What this does:_ `cucumberReporter` (from `playwright-bdd`) writes a standalone Cucumber-style HTML report — the format testers/BDD stakeholders are often already used to reading, independent of Allure.

---

## Multiple Cucumber HTML Reporter

Package: https://www.npmjs.com/package/multiple-cucumber-html-reporter

```bash
npm i multiple-cucumber-html-reporter --save-dev
```

_What this does:_ installs a report generator that builds a more polished, metadata-rich Cucumber dashboard (with charts, environment info, feature/scenario counts) than the basic Cucumber HTML reporter above — it reads a Cucumber **JSON** results file as its input, which is why the next step adds a JSON reporter too.

Update the reporter list in `playwright.config.ts` to also emit a JSON result file (consumed by the report generator below):

```ts
reporter: [
  ['html'],
  ['allure-playwright'],
  cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }),
  cucumberReporter('json', { outputFile: 'cucumber-report/result.json' }),
],
```

### `generate-report.ts`

```ts
import os from 'os';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// `multiple-cucumber-html-reporter` ships no TypeScript type declarations,
// and `playwright-core/package.json` requires `resolveJsonModule: true` to
// import as an ES module. Pulling both in with `require` avoids TS2307
// errors without depending on a tsconfig flag that could change elsewhere
// in the project. The version string is cast explicitly so it stays typed
// from here on instead of leaking `any` into the rest of the file.

const report = require('multiple-cucumber-html-reporter');

const { version: playwrightVersion } =
  require('playwright-core/package.json') as {
    version: string;
  };

// --- Detect environment runtime info ---
const platformName: string = os.type(); // 'Windows_NT', 'Darwin', 'Linux'
const platformVersion: string = os.release();
const deviceName: string = os.hostname();
const nodeVersion: string = process.version;

// Try to detect active git branch
let gitBranch = 'unknown';
try {
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (err) {
  console.warn('⚠️ Git branch not found:', (err as Error).message);
}

// --- Minimal typed shape of the Cucumber JSON report ---
// Only the fields this script actually reads are declared; everything else
// in the report is left as `unknown` rather than guessed at.
interface CucumberStep {
  [key: string]: unknown;
}

interface CucumberElement {
  steps?: CucumberStep[];
  [key: string]: unknown;
}

interface CucumberFeature {
  elements?: CucumberElement[];
  [key: string]: unknown;
}

// Read the cucumber JSON results
const jsonDir = path.join(__dirname, 'cucumber-report');
const jsonPath = path.join(jsonDir, 'result.json');

let featureCount = 0;
let scenarioCount = 0;
let stepCount = 0;

try {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data: CucumberFeature[] = JSON.parse(raw);

  featureCount = data.length;
  for (const feature of data) {
    const elements = feature.elements ?? [];
    scenarioCount += elements.length;
    for (const scenario of elements) {
      stepCount += (scenario.steps ?? []).length;
    }
  }
} catch (err) {
  console.error('❌ Could not read JSON report:', (err as Error).message);
}

// Opening a browser only makes sense on a developer's own machine. On a CI
// runner (GitHub Actions and most other CI systems set CI=true) there is no
// display to open one on, and trying to anyway is a likely source of stray
// "about:blank" navigation. Only auto-open locally.
const isCI = process.env.CI === 'true';

report.generate({
  jsonDir,
  reportPath: 'multiple-cucumber-html-reporter/',
  openReportInBrowser: !isCI,
  displayDuration: true,
  displayReportTime: true,
  pageTitle: 'Playwright BDD Dashboard',
  reportName: 'TestRover Playwright BDD Report',
  metadata: {
    browser: {
      name: 'chrome', // Default; Playwright test config usually uses Chrome
      version: 'auto-detected at runtime',
    },
    device: deviceName,
    platform: {
      name: platformName,
      version: platformVersion,
    },
  },
  customData: {
    title: 'Playwright Runtime Execution Summary',
    data: [
      { label: 'Executed By', value: os.userInfo().username },
      {
        label: 'Operating System',
        value: `${platformName} ${platformVersion}`,
      },
      { label: 'Device Hostname', value: deviceName },
      { label: 'Node.js Version', value: nodeVersion },
      { label: 'Playwright Version', value: playwrightVersion },
      { label: 'Git Branch', value: gitBranch },
      { label: 'Features', value: featureCount },
      { label: 'Scenarios', value: scenarioCount },
      { label: 'Steps', value: stepCount },
      { label: 'Report Generated On', value: new Date().toLocaleString() },
    ],
  },
});
```

#### What this script does, step by step

1. **Imports (`os`, `child_process`, `fs`, `path`)** — Node built-ins used to gather machine/environment info and read files. No installation needed for these.
2. **`require(...)` for `multiple-cucumber-html-reporter` and `playwright-core/package.json`** — uses old-style `require` instead of `import` specifically because the reporter package has no TypeScript type definitions, and reading `package.json` as an ES module would need a tsconfig setting the project doesn't want to depend on. This is exactly why `'@typescript-eslint/no-require-imports': 'off'` was set in the ESLint config above.
3. **Environment detection block** — captures the OS name/version, machine hostname, and installed Node.js version, purely to display them in the final report's metadata panel.
4. **Git branch detection** — runs `git rev-parse --abbrev-ref HEAD` as a shell command to get the current branch name; if it fails (e.g. not in a git repo), it falls back to the string `'unknown'` instead of crashing the script.
5. **TypeScript interfaces (`CucumberStep`, `CucumberElement`, `CucumberFeature`)** — describe just enough of the Cucumber JSON structure to safely count features/scenarios/steps, without having to fully type every field the JSON report contains.
6. **Reading and counting** — loads `cucumber-report/result.json` (written by the `cucumberReporter('json', ...)` entry in `playwright.config.ts`), parses it, and tallies how many features, scenarios, and steps it contains.
7. **`isCI` check** — `process.env.CI` is a variable that GitHub Actions (and most CI systems) automatically set to `'true'` during a pipeline run. This is used so the report generator **only auto-opens a browser window when run locally** — trying to open a browser on a headless CI runner would just fail or hang.
8. **`report.generate({...})`** — the actual call into `multiple-cucumber-html-reporter`, passing in the JSON location, output folder, display options, and all the metadata/custom data gathered above, producing the final HTML dashboard.

### Run

```bash
npx ts-node generate-report.ts
```

_What this does:_ executes the script above directly using `ts-node` (runs TypeScript without a separate compile step). In `package.json` this is wired up as the `multiple-cucumber-report:bdd` script.

---

## CI/CD — GitHub Actions Workflow

File: `.github/workflows/playwright.yml`

### Branch → Environment mapping

| Branch pattern      | Environment                                 |
| ------------------- | ------------------------------------------- |
| `develop`           | Development                                 |
| `qa/*`              | QA                                          |
| `release/*`         | UAT                                         |
| `main`              | Production                                  |
| `pull_request`      | Preview (temporary, deleted when PR closes) |
| `workflow_dispatch` | Manually pick any environment on demand     |

### Full workflow file

```yaml
name: Playwright Tests

# ─────────────────────────────────────────────────────────────────
# TRIGGERS
# ─────────────────────────────────────────────────────────────────
# Branch → Environment mapping:
#   develop      → Development
#   qa/*         → QA
#   release/*    → UAT
#   main         → Production
#   pull_request → Preview (temporary, deleted when PR closes)
#   workflow_dispatch → manually pick any environment on demand
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment to run tests against'
        required: true
        type: choice
        options:
          - development
          - qa
          - uat
          - production
        default: development

  push:
    branches:
      - develop
      - 'qa/**'
      - 'release/**'
      - main

  pull_request:
    branches:
      - '**'

# ─────────────────────────────────────────────────────────────────
# PERMISSIONS (least privilege)
# ─────────────────────────────────────────────────────────────────
# Default is read-only for every job. Jobs that actually need to
# write (push gh-pages, comment on PRs) request it explicitly at
# the job level below, instead of granting it workflow-wide.
permissions:
  contents: read

# ─────────────────────────────────────────────────────────────────
# CONCURRENCY
# ─────────────────────────────────────────────────────────────────
# Cancels an in-progress run if a new commit lands on the same
# branch, so we never burn CI minutes testing stale code.
concurrency:
  group: playwright-tests-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ===================================================================
  # JOB 1 — DETERMINE ENVIRONMENT
  # ===================================================================
  # A small, fast job (no container, no dependencies) that figures out
  # which environment this run targets. Keeping this separate means
  # the mapping logic lives in one place and is easy to read/audit,
  # and it lets the heavy "test" job below use GitHub Environments
  # (environment-scoped secrets/variables, approval gates, deployment
  # history) based on the result.
  determine-environment:
    name: 🧭 Determine Target Environment
    runs-on: ubuntu-latest
    outputs:
      environment: ${{ steps.resolve.outputs.environment }}
      safe_branch: ${{ steps.resolve.outputs.safe_branch }}
    steps:
      - name: 🔎 Resolve environment from branch/event
        id: resolve
        run: |
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "🧭 Resolving deployment environment"
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

          RAW_BRANCH="${{ github.head_ref || github.ref_name }}"
          echo "Raw branch/ref : $RAW_BRANCH"
          echo "Event name     : ${{ github.event_name }}"

          # Sanitize the branch name so it is safe to reuse later as an
          # artifact name, a Netlify alias, and a URL path segment
          # (letters, numbers, hyphens, underscores, dots only).
          SAFE_BRANCH=$(echo "$RAW_BRANCH" | tr '/: ' '-' | tr -cd '[:alnum:]-_.')

          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            # Manual runs let a human pick the environment explicitly —
            # useful for re-validating QA/UAT on demand without a push.
            ENVIRONMENT="${{ github.event.inputs.environment }}"
          elif [ "${{ github.event_name }}" = "pull_request" ]; then
            # Every PR gets its own short-lived preview environment.
            ENVIRONMENT="preview"
          else
            case "$RAW_BRANCH" in
              main)       ENVIRONMENT="production" ;;
              release/*)  ENVIRONMENT="uat" ;;
              qa/*)       ENVIRONMENT="qa" ;;
              develop)    ENVIRONMENT="development" ;;
              *)          ENVIRONMENT="development" ;;
            esac
          fi

          echo "Resolved environment : $ENVIRONMENT"
          echo "Sanitized branch     : $SAFE_BRANCH"

          echo "environment=$ENVIRONMENT" >> "$GITHUB_OUTPUT"
          echo "safe_branch=$SAFE_BRANCH" >> "$GITHUB_OUTPUT"

  # ===================================================================
  # JOB 2 — BUILD, VALIDATE, TEST, REPORT, DEPLOY
  # ===================================================================
  test:
    name: 🧪 Test & Report (${{ needs.determine-environment.outputs.environment }})
    needs: determine-environment
    runs-on: ubuntu-latest

    # Binds this job to a GitHub Environment matching the resolved
    # name (development/qa/uat/production/preview). This is what
    # gives us "different secrets per environment" for free: secrets
    # and variables defined under Settings → Environments → <name>
    # are the ones resolved below, with no extra scripting needed.
    # It also enables optional required-reviewer approval gates on
    # sensitive environments like production, and a deployments tab
    # with full history.
    environment:
      name: ${{ needs.determine-environment.outputs.environment }}
      url: ${{ vars.TEST_BASE_URL }}

    permissions:
      contents: write # push the Cucumber report to gh-pages
      pull-requests: write # comment report links back on the PR

    container:
      # Pinned to an exact tag (not "latest") so a Playwright release
      # can never silently change test behavior mid-run.
      image: mcr.microsoft.com/playwright:v1.56.1-noble
    timeout-minutes: 60

    env:
      NODE_VERSION: lts/*
      JAVA_VERSION: '17' # Temurin 17 LTS — Allure CLI runs fine on it and 11 is nearing EOL
      ENVIRONMENT: ${{ needs.determine-environment.outputs.environment }}
      SAFE_BRANCH: ${{ needs.determine-environment.outputs.safe_branch }}
      TEST_BASE_URL: ${{ vars.TEST_BASE_URL }}

    steps:
      # ---------------------------------------------------------------
      # 0. WORKFLOW METADATA
      # ---------------------------------------------------------------
      - name: 🕒 Record workflow start time
        id: start-time
        run: echo "start_time=$(date +%s)" >> "$GITHUB_OUTPUT"

      - name: 📋 Print run banner
        run: |
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "🚀 Starting Playwright Tests"
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "Branch       : ${{ github.head_ref || github.ref_name }}"
          echo "Environment  : $ENVIRONMENT"
          echo "Commit SHA   : ${{ github.sha }}"
          echo "Triggered by : ${{ github.actor }}"
          echo "Event        : ${{ github.event_name }}"
          echo "Start time   : $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      # ---------------------------------------------------------------
      # 1. REPOSITORY SETUP
      # ---------------------------------------------------------------
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      # ---------------------------------------------------------------
      # 2. RUNTIME SETUP
      # ---------------------------------------------------------------
      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm' # caches ~/.npm keyed on package-lock.json

      - name: ☕ Setup Java (required by the Allure CLI)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: ${{ env.JAVA_VERSION }}
          # actions/setup-java gives version pinning + built-in caching,
          # which is faster and more reliable than "apt-get install".

      - name: 🔍 Print toolchain versions
        run: |
          echo "Node version : $(node --version)"
          echo "npm version  : $(npm --version)"
          echo "Java version : $(java -version 2>&1 | head -n 1)"

      # ---------------------------------------------------------------
      # 3. FRAMEWORK VALIDATION (fail fast, before spending CI time)
      # ---------------------------------------------------------------
      - name: 🔐 Validate required secrets & variables
        run: |
          echo "Checking required configuration for environment: $ENVIRONMENT"
          MISSING=0

          if [ -z "${{ secrets.NETLIFY_AUTH_TOKEN }}" ]; then
            echo "❌ Missing secret: NETLIFY_AUTH_TOKEN"
            MISSING=1
          fi
          if [ -z "${{ secrets.NETLIFY_SITE_ID }}" ]; then
            echo "❌ Missing secret: NETLIFY_SITE_ID"
            MISSING=1
          fi
          if [ -z "$TEST_BASE_URL" ]; then
            echo "⚠️  TEST_BASE_URL is not set for the '$ENVIRONMENT' environment."
            echo "   Tests will run, but any check that relies on this URL may fail."
          fi

          if [ "$MISSING" -eq 1 ]; then
            echo ""
            echo "❌ One or more required secrets are missing."
            echo "Possible reasons:"
            echo "- Secret not configured under Settings > Environments > $ENVIRONMENT"
            echo "- Typo in the secret name"
            echo "- Environment protection rules are blocking access"
            exit 1
          fi

          echo "✅ All required secrets are present."

      - name: 🗂️ Validate BDD framework files
        run: |
          echo "Checking feature files and step definitions..."
          FEATURE_COUNT=$(find . -name "*.feature" -not -path "*/node_modules/*" | wc -l)
          echo "Feature files found: $FEATURE_COUNT"

          if [ "$FEATURE_COUNT" -eq 0 ]; then
            echo "❌ No .feature files found in the repository."
            echo "Possible reasons:"
            echo "- Feature files were not committed"
            echo "- Wrong working directory"
            echo "- .feature files are excluded via .gitignore"
            exit 1
          fi

          echo "✅ BDD framework files validated ($FEATURE_COUNT feature files)."

      # ---------------------------------------------------------------
      # 4. DEPENDENCY INSTALLATION
      # ---------------------------------------------------------------
      - name: 📦 Install dependencies
        run: |
          echo "Starting dependency installation..."
          if ! npm ci; then
            echo "❌ Dependency installation failed."
            echo ""
            echo "Possible reasons:"
            echo "- package-lock.json is out of sync with package.json"
            echo "- npm registry unavailable"
            echo "- corrupted npm cache"
            echo ""
            echo "Please review the npm logs above."
            exit 1
          fi
          echo "Dependencies installed successfully."
          echo "✅ Dependencies installed successfully."

      - name: 🛠️ Install ts-node
        run: |
          # NOTE (review): a global "npm install -g ts-node" works, but it
          # is not pinned by package-lock.json, so the exact ts-node
          # version can silently drift between runs. Prefer adding
          # ts-node as a devDependency long-term for full reproducibility.
          if ! npm install -g ts-node; then
            echo "❌ ts-node installation failed. Please review the npm logs above."
            exit 1
          fi
          echo "✅ ts-node installed ($(ts-node --version))."

      # ---------------------------------------------------------------
      # 5. BDD GENERATION
      # ---------------------------------------------------------------
      - name: 🧬 Generate BDD tests from feature files
        run: |
          echo "Generating BDD tests..."
          if ! npx bddgen; then
            echo "❌ BDD generation failed."
            echo ""
            echo "Possible reasons:"
            echo "- Invalid or malformed .feature file syntax"
            echo "- Missing or misconfigured playwright-bdd config"
            echo "- Step definitions don't match feature file steps"
            echo ""
            echo "Please review the bddgen logs above."
            exit 1
          fi
          echo "BDD generation completed."
          echo "✅ BDD generation completed."

      - name: 🔎 Verify generated spec files
        run: |
          # This project's playwright.config.ts calls defineBddConfig()
          # without an explicit `outputDir`, so playwright-bdd falls back
          # to its default: ".features-gen" (a dot-directory, mirroring
          # the features/steps structure). We check there directly, and
          # fall back to a broader search in case outputDir is changed
          # later, so this doesn't silently break on a config edit.
          GENERATED_COUNT=$(find .features-gen -type f \( -name "*.spec.ts" -o -name "*.spec.js" \) 2>/dev/null | wc -l)

          if [ "$GENERATED_COUNT" -eq 0 ]; then
            echo "Nothing found in .features-gen, falling back to a repo-wide search..."
            GENERATED_COUNT=$(find . \( -name "*.spec.ts" -o -name "*.spec.js" \) -not -path "*/node_modules/*" -type f | wc -l)
          fi
          echo "Generated spec files: $GENERATED_COUNT"

          if [ "$GENERATED_COUNT" -eq 0 ]; then
            echo "❌ No generated spec files were found."
            echo ""
            echo "Possible reasons:"
            echo "- bddgen ran but produced no output"
            echo "- Output directory is misconfigured in the playwright-bdd config"
            echo "- Generated files use a naming/extension pattern this check doesn't recognize"
            echo ""
            echo "Diagnostic: repo contents after bddgen (excluding node_modules):"
            find . -not -path "*/node_modules/*" -not -path "*/.git/*" -type f -newer package.json | sort
            echo ""
            echo "If your playwright-bdd config sets a custom outputDir, check it here:"
            grep -rn "outputDir\|defineBddConfig" --include="*.ts" --include="*.js" . --exclude-dir=node_modules || echo "(no defineBddConfig usage found via grep)"
            exit 1
          fi

          echo "✅ Generated test files verified ($GENERATED_COUNT spec files)."

      # ---------------------------------------------------------------
      # 6. PLAYWRIGHT EXECUTION
      # ---------------------------------------------------------------
      - name: 🌍 Install Playwright browsers
        run: |
          # NOTE (review): since this job already runs inside the
          # official Playwright Docker image pinned to the same
          # version as the npm package, browsers are normally
          # pre-installed. This step is kept as cheap insurance
          # against a version mismatch — it's close to a no-op when
          # versions already match, so it isn't worth removing.
          echo "Installing Playwright browsers..."
          if ! npx playwright install --with-deps; then
            echo "❌ Playwright browser installation failed."
            echo ""
            echo "Possible reasons:"
            echo "- Network issue downloading browser binaries"
            echo "- Missing OS-level dependencies"
            echo "- Disk space exhausted on the runner"
            exit 1
          fi
          echo "✅ Playwright browsers installed."

      - name: 🧪 Run Playwright tests
        run: |
          # NOTE (review): package.json's "test" script is
          # "npx bddgen && npx playwright test" — since we already ran
          # bddgen explicitly above (so we could validate its output
          # before spending time on the full suite), calling
          # `npx playwright test` directly here avoids generating the
          # BDD tests a second time.
          echo "Running Playwright tests..."
          if ! npx playwright test; then
            echo "❌ Playwright test execution failed."
            echo ""
            echo "Possible reasons:"
            echo "- One or more test assertions failed"
            echo "- The application under test ($TEST_BASE_URL) was unreachable"
            echo "- A test exceeded its configured timeout"
            echo ""
            echo "Review the Allure/Cucumber report generated below for full details."
            exit 1
          fi
          echo "Playwright execution completed."
          echo "✅ Tests executed successfully."

      # ---------------------------------------------------------------
      # 7. REPORT GENERATION
      # ---------------------------------------------------------------
      # These run on success OR failure so a report always exists,
      # even for a red build — that's when it's needed most.
      - name: 📊 Install Allure CLI
        if: success() || failure()
        run: |
          echo "Installing Allure CLI..."
          if ! npm install -g allure-commandline; then
            echo "❌ Allure CLI installation failed. Please review the npm logs above."
            exit 1
          fi
          echo "$(npm root -g)/.bin" >> "$GITHUB_PATH"
          echo "✅ Allure CLI installed ($(allure --version))."

      - name: 📊 Generate Allure report
        if: success() || failure()
        run: |
          echo "Generating Allure report..."
          if ! allure generate allure-results --clean -o allure-report; then
            echo "❌ Allure report generation failed."
            echo "Possible reasons:"
            echo "- allure-results directory is empty or missing"
            echo "- Corrupted result files from a crashed test run"
            exit 1
          fi
          echo "Allure report generated successfully."
          echo "✅ Allure report generated."

      # ---------------------------------------------------------------
      # 8. ARTIFACT UPLOAD
      # ---------------------------------------------------------------
      - name: 💾 Upload Allure report artifact
        if: always()
        uses: actions/upload-artifact@v5
        with:
          name: allure-report-${{ env.ENVIRONMENT }}-${{ env.SAFE_BRANCH }}
          path: allure-report/
          retention-days: 30

      - name: 🧾 Print artifact retention info
        if: always()
        run: |
          echo "✅ Artifact uploaded."
          echo "Artifact name    : allure-report-${ENVIRONMENT}-${SAFE_BRANCH}"
          echo "Retention period : 30 days"
          echo "Expires around   : $(date -u -d '+30 days' +'%Y-%m-%d') UTC"

      # ---------------------------------------------------------------
      # 9. DEPLOYMENT
      # ---------------------------------------------------------------
      - name: 🚀 Deploy Allure report to Netlify
        id: netlify-deploy
        if: success()
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        run: |
          echo "Deploying Allure report — environment: $ENVIRONMENT, alias: $SAFE_BRANCH"
          if ! DEPLOY_OUTPUT=$(npx netlify deploy --site "$SITE_ID" --alias "$SAFE_BRANCH" --dir allure-report 2>&1); then
            echo "❌ Netlify deployment failed."
            echo ""
            echo "Possible reasons:"
            echo "- Invalid or expired NETLIFY_AUTH_TOKEN"
            echo "- Incorrect NETLIFY_SITE_ID"
            echo "- Netlify service outage"
            echo ""
            echo "$DEPLOY_OUTPUT"
            exit 1
          fi
          DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -E 'Website (Draft )?URL:' | grep -oE 'https://[^ <>]+' | head -n 1)
          if [ -z "$DEPLOY_URL" ]; then
            echo "⚠️  Could not parse the deployed URL from Netlify CLI output — falling back to any https link found."
            DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^ <>]+' | head -n 1)
          fi
          # Safety net: strip any leftover wrapping punctuation (<, >, trailing
          # commas/periods) in case the CLI output format changes again.
          DEPLOY_URL=$(echo "$DEPLOY_URL" | sed -E 's/^[<]+//; s/[>,.]+$//')
          echo "deploy_url=$DEPLOY_URL" >> "$GITHUB_OUTPUT"
          echo "✅ Netlify deployment completed."
          echo "Deployed URL: $DEPLOY_URL"

      - name: 🥒 Generate Cucumber HTML report
        id: cucumber-report
        if: success() # only bother building this if tests actually ran and Netlify already deployed above
        run: |
          echo "Generating Cucumber HTML report..."
          if ! npm run multiple-cucumber-report:bdd; then
            echo "❌ Cucumber HTML report generation failed."
            echo "Possible reasons:"
            echo "- The 'multiple-cucumber-report:bdd' script is missing from package.json"
            echo "- No cucumber JSON results were produced by the test run"
            echo ""
            echo "Note: this only blocks the GitHub Pages deploy below —"
            echo "the Netlify Allure report has already been deployed."
            exit 1
          fi
          ls -R cucumber-html-report || echo "⚠️ cucumber-html-report folder not found."
          echo "✅ Cucumber report generated."

      - name: 🌐 Deploy Cucumber HTML report to GitHub Pages
        id: gh-pages-deploy
        if: success()
        continue-on-error: true # let the next step print a clean diagnostic instead of a raw action failure
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./cucumber-html-report
          destination_dir: cucumber-reports/${{ env.ENVIRONMENT }}/${{ env.SAFE_BRANCH }}

      - name: 🌐 Verify GitHub Pages deployment
        if: success()
        run: |
          if [ "${{ steps.gh-pages-deploy.outcome }}" != "success" ]; then
            echo "❌ GitHub Pages deployment failed."
            echo "Possible reasons:"
            echo "- GitHub Pages is not enabled for this repository"
            echo "- Branch protection rules on gh-pages"
            echo "- GITHUB_TOKEN lacks contents:write permission"
            exit 1
          fi

          PAGES_URL="https://${{ github.repository_owner }}.github.io/$(basename '${{ github.repository }}')/cucumber-reports/${ENVIRONMENT}/${SAFE_BRANCH}/index.html"
          echo "pages_url=$PAGES_URL" >> "$GITHUB_ENV"
          echo "✅ GitHub Pages deployment completed."
          echo "Deployed URL: $PAGES_URL"

      - name: 💬 Comment report links on pull request
        if: github.event_name == 'pull_request' && success()
        uses: actions/github-script@v7
        with:
          script: |
            const body = [
              '### 📊 Test Reports Ready',
              '',
              `- **Allure Report:** ${{ steps.netlify-deploy.outputs.deploy_url }}`,
              `- **Cucumber Report:** ${{ env.pages_url }}`,
              '',
              `Environment: \`${{ env.ENVIRONMENT }}\``
            ].join('\n');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });

      # ---------------------------------------------------------------
      # 10. CLEANUP / SUMMARY
      # ---------------------------------------------------------------
      - name: 🧮 Print workflow summary
        if: always()
        run: |
          END_TIME=$(date +%s)
          START_TIME="${{ steps.start-time.outputs.start_time }}"
          DURATION=$((END_TIME - START_TIME))

          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "🏁 Workflow Summary"
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "Environment    : $ENVIRONMENT"
          echo "Branch         : ${{ github.head_ref || github.ref_name }}"
          echo "Commit SHA     : ${{ github.sha }}"
          echo "End time       : $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
          echo "Total duration : ${DURATION}s"
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

          {
            echo "## 🏁 Workflow Summary"
            echo ""
            echo "| Field | Value |"
            echo "|---|---|"
            echo "| Environment | $ENVIRONMENT |"
            echo "| Branch | ${{ github.head_ref || github.ref_name }} |"
            echo "| Commit | ${{ github.sha }} |"
            echo "| Duration | ${DURATION}s |"
            echo ""
            echo "## 🔗 Report Links"
            echo ""
            if [ -n "${{ steps.netlify-deploy.outputs.deploy_url }}" ]; then
              echo "- **Allure report (Netlify):** ${{ steps.netlify-deploy.outputs.deploy_url }}"
            else
              echo "- **Allure report (Netlify):** not deployed this run"
            fi
            if [ -n "${{ env.pages_url }}" ]; then
              echo "- **Cucumber report (GitHub Pages):** ${{ env.pages_url }}"
            else
              echo "- **Cucumber report (GitHub Pages):** not deployed this run"
            fi
          } >> "$GITHUB_STEP_SUMMARY"
```

#### What the workflow does, job by job

**Job 1 — `determine-environment`**
Figures out which deployment environment (development/qa/uat/production/preview) this run targets, purely from the branch name or manual input, and "sanitizes" the branch name (strips characters that aren't safe in a URL, filename, or Netlify alias) so it can be reused later. This runs as a tiny, fast, dependency-free job so the mapping logic is easy to read and test in isolation.

**Job 2 — `test`** (the heavy lifting)

1. **Metadata & banner** — records the start time and prints a readable summary of what's about to run (branch, environment, commit, trigger).
2. **Checkout & runtime setup** — pulls the repo code, installs the pinned Node.js version, and installs Java (required only because the Allure CLI is a Java tool).
3. **Framework validation (fail fast)** — before spending any real CI time, checks that required secrets (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`) exist and that at least one `.feature` file is present. If either check fails, the job stops immediately with a clear reason instead of failing confusingly later.
4. **Dependency installation** — `npm ci` (a stricter, reproducible version of `npm install` that uses `package-lock.json` exactly) followed by a global `ts-node` install.
5. **BDD generation & verification** — runs `bddgen` to turn `.feature` files into real spec files, then double-checks that files actually landed where expected, printing detailed diagnostics if not.
6. **Playwright execution** — installs browser binaries (cheap safety check since the Docker image should already have them) and runs the test suite.
7. **Report generation** — installs the Allure CLI and builds the Allure HTML report. This step runs `if: success() || failure()` — meaning it runs whether tests passed or failed, because a report is most valuable exactly when something broke.
8. **Artifact upload** — uploads the Allure report as a downloadable GitHub Actions artifact (kept for 30 days), regardless of outcome (`if: always()`).
9. **Deployment** — pushes the Allure report to Netlify (gets a live URL, aliased to the branch name) and the Cucumber report to GitHub Pages (published under a path scoped to environment + branch). If it's a pull request, posts both report links as a PR comment automatically.
10. **Summary** — prints timing and report links both to the console and to the GitHub Actions run summary page (`$GITHUB_STEP_SUMMARY`), so anyone opening the run can see the results without digging through logs.

### Required GitHub Secrets

Set under **GitHub Project Settings → Secrets and Variables → Actions → Repository secrets**:

| Secret               | Description                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| `NETLIFY_AUTH_TOKEN` | Personal access token from Netlify — https://app.netlify.com/user/applications#oauth |
| `NETLIFY_SITE_ID`    | The Project ID in Netlify (Project → Project configuration)                          |

---

## Accessibility Testing

Recommended tools:

1. **Lighthouse**
2. **axe DevTools** — Web Accessibility Testing Extension
3. **Accessibility Insights for Web** — browser extension

### Why does Playwright BDD throw: _"When using several calls of defineBddConfig(), please manually provide different outputDir"_?

This error occurs because multiple `defineBddConfig()` calls are attempting to generate BDD test files into the same output directory. Playwright BDD requires each configuration to have a unique output location so generated files don't overwrite or conflict with one another. If multiple configurations share the same output directory, Playwright BDD cannot distinguish which generated files belong to which configuration, so it throws this error.

**Fix:** give each configuration a different `outputDir`, or use the `defineBddProject()` helper to manage multiple BDD projects. This is exactly why, in the annotated `playwright.config.ts` above, `testAccessDir` explicitly sets `outputDir: 'accessibility-results'` while `testDir` (the main UI suite) uses the library's default.

```ts
const testAccessDir = defineBddConfig({
  features: 'tests/Accessibility_Test/feature/**/*.feature',
  steps: [
    'tests/Accessibility_Test/steps/**/*.steps.ts',
    'tests/Accessibility_Test/fixture/fixtures.ts',
  ],
  outputDir: 'accessibility-results',
});
```

Add a corresponding project in `playwright.config.ts`:

```ts
{
  name: 'accessibility-test',
  testDir: testAccessDir,
  use: { ...devices['Desktop Firefox'] },
},
```

_What this does:_ registers a separate Playwright "project" that runs only the accessibility suite's generated tests, in Firefox instead of the main suite's Chrome — so accessibility checks run independently and can be filtered/run on their own (`npx playwright test --project=accessibility-test`).

### `@axe-core/playwright`

Package: https://www.npmjs.com/package/@axe-core/playwright

```bash
npm i @axe-core/playwright
```

_What this does:_ installs the accessibility-testing engine (built on the industry-standard `axe-core` rules) with a Playwright-native API, so tests can run automated WCAG checks against a page and assert there are zero violations.

---

## Troubleshooting

| Issue                                  | Cause                                                                                         | Fix                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `defineBddConfig()` outputDir conflict | Multiple BDD configs writing to the same output directory                                     | Give each config a unique `outputDir`, or use `defineBddProject()`       |
| Allure report fails to generate        | Java not installed                                                                            | Install Java (Temurin 17 recommended) — required by the Allure CLI       |
| `bddgen` produces no spec files        | Malformed `.feature` syntax, misconfigured `outputDir`, or mismatched step definitions        | Check feature file syntax and confirm `outputDir` in `defineBddConfig()` |
| Netlify deploy fails in CI             | Missing/invalid `NETLIFY_AUTH_TOKEN` or `NETLIFY_SITE_ID`                                     | Verify secrets under Settings → Environments                             |
| GitHub Pages deploy fails              | Pages not enabled, branch protection on `gh-pages`, or `GITHUB_TOKEN` lacks `contents: write` | Enable Pages, check branch protection rules and workflow permissions     |

---
