//**  Bootstrap script for Google Cloud Function **/
//**  Created by e2cloud service                 */
//**  See https://e2cloud.codecept.io            */

const Container = require('codeceptjs').container;
const Config = require('codeceptjs').config;
const Codecept = require('codeceptjs').codecept;
const escapeRe = require('escape-string-regexp');
const path = require('path');

/**
 * Function to be executed in the cloud.
 *
 * Override it to customize execution
 */
module.exports.runTest = async (req, res) => {

  const testName = req.body.testName;
  const configFile = __dirname;
  if (req.body.configFile) {
    configFile = path.join(__dirname, req.body.configFile);
  }

  let config = Config.load(configFile);

  config.grep = `^${escapeRe(`${testName}`.replace(/( \| {.+})?$/g, ''))}`;
  if (config.helpers && config.helpers.Puppeteer) {
    config.helpers.Puppeteer.chrome = { args: ['--no-sandbox'] };
    config.helpers.Puppeteer.disableScreenshots = true; // temporary
  }

  // todo add same config updates for webdriverio


  if (config.plugins && config.plugins.reportPortal) {
    config.plugins.reportPortal.enabled = true;
  }

  // pass more verbose output
  let opts = { debug: true };

  // create runner
  let codecept = new Codecept(config, opts);

  codecept.initGlobals(__dirname);

  // create helpers, support files, mocha
  Container.create(config, opts);

  // initialize listeners
  codecept.runHooks();

  // load tests
  codecept.loadTests();

  // run tests
  codecept.run();
}

/**
* Provides test names for cloud running.
* Executed by `run` command locally
*
* Override it to grep or filter tests
*/
module.exports.getTests = (configPath) => {

  const currentConfig = Config.load(configPath);
  const codecept = new Codecept(currentConfig, {});
  codecept.initGlobals(dir);
  Container.create(currentConfig, {});
  const mocha = Container.mocha();
  codecept.loadTests();
  mocha.files = codecept.testFiles;
  mocha.loadFiles();
  let testNames = []
  for (let suite of mocha.suite.suites) {
    for (let test of suite.tests) {
      // to grep by full describe + it name
      testNames.push(`${suite.title}: ${test.title}`);
    }
  }
  return testNames;
}

/**
 * Obtain ReportPortal config from CodeceptJS config
 * Override to use custom config
*/
module.exports.getReportPortalConfig = (configPath) => {
  const currentConfig = Config.load(configPath);

  if (currentConfig && currentConfig.plugins && currentConfig.plugins.reportPortal) {
    return currentConfig.plugins.reportPortal;
  }

  throw new Error("ReportPortal config can't be found");
}
