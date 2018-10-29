const signale = require('signale');
const chalk = require('chalk');
var install = require('npm-install-package')


const frameworks = [
  'codeceptjs'
];

module.exports = (framework, configPath = '') => {
  try {
    if (frameworks.indexOf(framework) < 0) {
      signale.fail("Please provide a test framework supported by e2cloud");
      signale.fail(`Supported frameworks are: ${chalk.bold(frameworks.join(', '))}`);
      throw new Error('Framework not defined');
    }

    const spinner = ora(`Installing ${framework}...`).start();
    // install framework
    install(framework, { saveDev: true }, function (err) {
      spinner.stop();
      if (err) {
        signale.fatal(err);
        return;
      }
      // prepare cloud function for framework
      require(`../frameworks/${framework}/init`)(configPath);
    });

  } catch (err) {
    signale.fatal(err);
    process.exit(1);
  }
}

