const {
  codecept: Codecept,
  container: Container,
  config: Config,
} = require('codeceptjs');
const signale = require('signale');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

function init(configPath) {

  signale.info(chalk.bold('This script requires CodeceptJS installed'));
  signale.info();

  const dir = path.join(process.cwd(), configPath || '');
  signale.info(`Starting from ${dir}`);

  let currentConfig;
  try {
    currentConfig = Config.load(configPath);
  } catch (err) {
    signale.fatal(chalk.bold(`Can't load CodeceptJS config`));
    signale.fatal('Initialize CodeceptJS using init command:');
    signale.fatal('');
    signale.fatal('./node_modules/.bin/codecept.js init');
    throw err;
  }

  if (!currentConfig.helpers || !currentConfig.helpers.Puppeteer) {
    signale.fatal(chalk.bold(`Please enable Puppeteer helper`));
    throw new Error('Puppeteer helper should be enabled for this config');
  }

  if (!currentConfig.plugins || !currentConfig.plugins.reportPortal) {
    signale.fatal(chalk.bold(`ReportPortal is required to start`));
    signale.fatal(chalk.bold(`Install ReportPortal plugin`));

    signale.fatal();
    signale.fatal('npm i codeceptjs-reportportal-client --save');
    signale.fatal();
    signale.fatal('Login to http://reportportal.info to obtain credentials');
    signale.fatal('(or use private version of ReportPortal)');
    signale.fatal('Enable reportPortal plugin in config');
    signale.fatal('And pass in token, endpoint, launch, project values:');
    signale.fatal(`
  "plugins": {
    "reportPortal": {
      "enabled": false,
      "require": "codeceptjs-reportportal-client",
      "token": "{{ REQUIRED: token from ReportPortal }}",
      "endpoint": "{{ REQUIRED: endpoint of ReportPortal }}",
      "project": "{{ REQUIRED: project in ReportPortal }}"
      "launch": "e2cloud_test",
    }
  }
`);

    throw new Error('reportPortal plugin should be enabled for this config');
  }

  const codecept = new Codecept(currentConfig, {});
  codecept.initGlobals(dir);
  Container.create(currentConfig, {});

  // create index.js if not created
  if (!fs.existsSync(path.join(dir, 'index.js'))) {
    fs.copyFileSync(
      path.join(__dirname, 'index.gcloud.js'),
      path.join(dir, 'index.js')
    );

    signale.success('Created cloud function ' + path.join(dir, 'index.js'));
  } else {
    signale.warn('Skipping creating index.js function file');
  }

  // create package.json if not created
  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    fs.copyFileSync(
      path.join(__dirname, 'package.json'),
      path.join(dir, 'package.json')
    );

    signale.success('Created package.json for cloud function');
  }

  // check for all packages in package.json
  let package = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')));
  let requiredPackages = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).dependencies;

  for (let package in requiredPackages) {
    if (!package.dependencies[package] && !package.devDependencies[package]) {
      throw new Error(`${package} package is not listed in package.json`);
    }

  }
  signale.success('package.json validated');
}

module.exports = (configPath) => {
  try {
    return init(configPath);
  } catch (err) {
    signale.fatal(err);
    process.exit(1);
  }
}
