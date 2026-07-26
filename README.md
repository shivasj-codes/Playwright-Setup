# Playwright BDD Test Automation Framework

End-to-end test automation framework built with **Playwright**, **playwright-bdd** (Cucumber/Gherkin), **TypeScript**, and integrated code quality, reporting, and CI/CD tooling.

---

## Table of Contents

- [Playwright BDD Test Automation Framework](#playwright-bdd-test-automation-framework)
  - [Table of Contents](#table-of-contents)
  - [Reference Learning Resources](#reference-learning-resources)
  - [Project Setup](#project-setup)
  - [Code Formatting — Prettier](#code-formatting--prettier)
    - [`.prettierrc.json`](#prettierrcjson)
    - [Run Prettier](#run-prettier)
  - [Linting — ESLint](#linting--eslint)
    - [`eslint.config.ts`](#eslintconfigts)
    - [Run ESLint](#run-eslint)
  - [Gherkin Linting](#gherkin-linting)
  - [Git Hooks — Husky \& lint-staged](#git-hooks--husky--lint-staged)
    - [Husky](#husky)
    - [lint-staged](#lint-staged)
  - [package.json Scripts](#packagejson-scripts)
  - [Test Reporting — Allure](#test-reporting--allure)
    - [Install](#install)
    - [Configure reporter (`playwright.config.ts`)](#configure-reporter-playwrightconfigts)
    - [Run and generate](#run-and-generate)
    - [Netlify CLI (for deploying the Allure report)](#netlify-cli-for-deploying-the-allure-report)
  - [Test Reporting — Cucumber HTML](#test-reporting--cucumber-html)
  - [Multiple Cucumber HTML Reporter](#multiple-cucumber-html-reporter)
    - [`generate-report.ts`](#generate-reportts)
    - [Run](#run)
  - [CI/CD — GitHub Actions Workflow](#cicd--github-actions-workflow)
    - [Branch → Environment mapping](#branch--environment-mapping)
    - [Full workflow file](#full-workflow-file)
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

Add BDD (Cucumber/Gherkin) support on top of Playwright:

```bash
npm i -D playwright-bdd
```

---

## Code Formatting — Prettier

Docs: https://prettier.io/docs/install

Install an exact, pinned Prettier version:

```bash
npm install --save-dev --save-exact prettier@3.9.5
```

Install the Gherkin plugin for Prettier so `.feature` files get formatted too:
Package: https://www.npmjs.com/package/prettier-plugin-gherkin

```bash
npm i -D prettier-plugin-gherkin
```

### `.prettierrc.json`

```json
{
  "plugins": ["prettier-plugin-gherkin"],
  "singleQuote": true,
  "trailingComma": "es5"
}
```

### Run Prettier

```bash
npx prettier . --write
```

---

## Linting — ESLint

Install ESLint with the TypeScript parser/plugin and the Playwright plugin:

```bash
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-playwright --save-dev
```

Initialize the ESLint config:

```bash
npx eslint --init
```

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

### `eslint.config.ts`

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

Reference: https://www.npmjs.com/package/eslint-plugin-playwright

### Run ESLint

```bash
npx eslint "tests/**/*.ts"
```

---

## Gherkin Linting

`gherkin-lint-plus` is used as a replacement for the older, unmaintained `gherkin-lint`.
Package: https://www.npmjs.com/package/gherkin-lint-plus

```bash
npm i gherkin-lint-plus --save-dev
```

Run it against all feature files:

```bash
npx gherkin-lint-plus "tests/***/***/***.feature"
```

---

## Git Hooks — Husky & lint-staged

### Husky

Docs: https://typicode.github.io/husky/get-started.html
Package: https://www.npmjs.com/package/husky

```bash
npm install --save-dev husky
npx husky init
```

### lint-staged

Package: https://www.npmjs.com/package/lint-staged

```bash
npm install --save-dev lint-staged
```

Run it manually (also wired into Husky's pre-commit hook):

```bash
npx lint-staged
```

---

## package.json Scripts

```json
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
  "report:bdd": "npx ts-node generateReport.ts"
}
```

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

### Configure reporter (`playwright.config.ts`)

```ts
reporter: [['html'], ['allure-playwright']],
```

### Run and generate

```bash
npx playwright test
npx allure generate
npx allure open
```

Or serve directly without a separate generate step:

```bash
npx allure serve
```

### Netlify CLI (for deploying the Allure report)

```bash
npm i netlify-cli --save-dev
```

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

---

## Multiple Cucumber HTML Reporter

Package: https://www.npmjs.com/package/multiple-cucumber-html-reporter

```bash
npm i multiple-cucumber-html-reporter --save-dev
```

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

### Run

```bash
npx ts-node generate-report.ts
```

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

**Fix:** give each configuration a different `outputDir`, or use the `defineBddProject()` helper to manage multiple BDD projects.

```ts
const testAccessDir = defineBddConfig({
  features: 'tests/Accessibility_Test/feature/***.feature',
  steps: [
    'tests/Accessibility_Test/steps/***.steps.ts',
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

### `@axe-core/playwright`

Package: https://www.npmjs.com/package/@axe-core/playwright

```bash
npm i @axe-core/playwright
```

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

_This document consolidates the framework's setup notes for Playwright + BDD (Cucumber/Gherkin), code quality tooling (Prettier, ESLint, gherkin-lint-plus), Git hooks (Husky, lint-staged), test reporting (Allure, Cucumber HTML, Multiple Cucumber HTML Reporter), CI/CD (GitHub Actions), and accessibility testing (axe-core)._
