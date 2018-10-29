//**  Bootstrap script for Google Cloud Function **/
//**  Created by e2cloud service                 */
//**  See https://e2cloud.codecept.io            */

const Container = require('codeceptjs').container;
const Config = require('codeceptjs').config;
const Codecept = require('codeceptjs').codecept;
const event = require('codeceptjs').event;
const escapeRe = require('escape-string-regexp');
const path = require('path');

module.exports.runTest = async (req, res) => {
  let message = '';

  const testName = req.body.testName;
  const configFile = __dirname;
  if (req.body.configFile) {
    configFile = path.join(__dirname, req.body.configFile);
  }

  let config = Config.load(configFile);


  config.grep = `^${escapeRe(`${testName}`.replace(/( \| {.+})?$/g, ''))}`;
  config.teardown = (done) => {
    res.send(message);
  };

  if (config.helpers && config.helpers.Puppeteer) {
    config.helpers.Puppeteer.chrome = { args: ['--no-sandbox'] };
    config.helpers.Puppeteer.disableScreenshots = true; // temporary
  }

  if (config.plugins && config.plugins.reportPortal) {
    config.plugins.reportPortal.enabled = true;
    config.plugins.reportPortal.launchConfig = {
      id: req.body.launchId
    }
  }

  // pass more verbose output
  let opts = { debug: true };

  // a simple reporter, let's collect all passed and failed tests
  event.dispatcher.on(event.test.passed, (test) => {
    message += `"${test.title}" +`;
  });
  event.dispatcher.on(event.test.failed, (test) => {
    message += `"${test.title}" -`;
  });

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
