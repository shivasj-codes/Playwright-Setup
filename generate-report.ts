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
