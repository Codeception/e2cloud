const RPClient = require('reportportal-client');
const signale = require('signale');
const path = require('path');
const url = require('url');
const chalk = require('chalk');
const ora = require('ora');
const { exec } = require('child_process');

const runCommand = `gcloud functions call runTest `;

async function run(configPath, opts) {

  const dir = path.join(process.cwd(), configPath || '');
  signale.info(`Starting from ${dir}`);

  let testNames;
  let reportPortalConfig;

  // open index.js file to obtain test names and RP config
  try {
    const indexModule = require(path.join(dir, 'index.js'));
    testNames = indexModule.getTests(configPath);
    reportPortalConfig = indexModule.getReportPortalConfig(configPath);
  } catch (err) {
    signale.fatal(`Can't obtain functions from ${path.join(dir, 'index.js')}`);
    signale.fatal("index.js should export 'getTests' and 'getReportPortalConfig' functions");
    throw err;
  }

  // start RP session
  signale.info('Starting ReportPortal session for ' + reportPortalConfig.project);

  const interactive = new signale.Signale({interactive: true, scope: 'interactive'});

  const rpClient = new RPClient(reportPortalConfig);
  let response = await rpClient.checkConnect();

  if (!reportPortalConfig.launchConfig) reportPortalConfig.launchConfig = {};

  let launchObj = rpClient.startLaunch({
    name: opts.title || 'Cloud Launch',
    description: 'Started by e2cloud',
    // tags: reportPortalConfig.launchConfig.tags || [],
  });

  response = await launchObj.promise;

  let resultUrl = new url.URL(reportPortalConfig.endpoint).origin;

  resultUrl += `/ui/#${reportPortalConfig.project}/launches/all/${response.id}`;

  signale.star(`Realtime report ${chalk.bold(resultUrl)}`);
  const spinner = ora('Starting tests...').start();


  for (let testName of testNames) {
    const runParams = { testName, launchId: response.id };

    testsFinished = 0;

    if (opts.dryRun) {
      signale.note(`Scheduled ${testName}`);
      continue;
    }
    // override report portal id
    exec(runCommand + `--data '${JSON.stringify(runParams)}'`, { cwd: dir }, (err, stdout, stderr) => {
      if (!testsFinished) spinner.stop();
      testsFinished++;
      interactive.await(`[%d/%d] Tests executed`, testsFinished, testNames.length);

      if (testsFinished === testNames.length) { // all finished, closing RP session
        rpClient.finishLaunch(launchObj.tempId);
        signale.complete('Completed.');
        signale.star(`Report stored at ${chalk.bold(resultUrl)}`);
      }
    });
  }

  if (opts.dryRun) {
    spinner.stop();
    rpClient.finishLaunch(launchObj.tempId);
    signale.success('Dry-run completed.');
  }
}

module.exports = async (configPath, opts = {}) => {
  try {
    return await run(configPath, opts);
  } catch (err) {
    signale.fatal(err);
    process.exit(1);
  }
}
