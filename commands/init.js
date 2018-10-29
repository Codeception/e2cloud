const { Codecept, Config, Container } = require('../index');
const signale = require('signale');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const requiredPackages = [
  'puppeteer',
  'codeceptjs',
  'escape-string-regexp',
  'codeceptjs-reportportal-client'
];

function init(configPath) {

  signale.info('We will prepare your tests for serverless execution');
  signale.info();
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
    signale.fatal('(or use local version of ReportPortal)');
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
  const mocha = Container.mocha();

  // create index.js if not created
  if (!fs.existsSync(path.join(dir, 'index.js'))) {
    fs.copyFileSync(
      path.join(__dirname, '..', 'gcloud', 'index.template.js'),
      path.join(dir, 'index.js')
    );

    signale.success('Created cloud function ' + path.join(dir, 'index.js'));
  } else {
    signale.warn('Skipping creating index.js function file');
  }

  // create package.json if not created
  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    let package = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
    let newPackage = {
      dependencies: {}
    }

    for (let requiredPackage of requiredPackages) {
      newPackage.dependencies[requiredPackage] = package.devDependencies[requiredPackage];
    }

    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(newPackage));
    signale.success('Created package.json for cloud function');
  }

  // check for all packages in package.json
  let package = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')));
  if (!package.devDependencies) package.devDependencies = {};
  if (!package.dependencies) package.dependencies = {};

  for (let requiredPackage of requiredPackages) {
    if (!package.dependencies[requiredPackage] && !package.devDependencies[requiredPackage]) {
      throw new Error(`${requiredPackage} package is not listed in package.json`);
    }

  }
  signale.success('package.json validated');
  // initing it
}

module.exports = (configPath) => {
  try {
    return init(configPath);
  } catch (err) {
    signale.fatal(err);
    process.exit(1);
  }
}
