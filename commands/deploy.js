const signale = require('signale');
const path = require('path');
const fs = require('fs');
const ora = require('ora');
const { exec } = require('child_process');

const deployCommand = `gcloud beta functions deploy runTest --trigger-http --runtime nodejs8 --memory 1024MB`;

function deploy(configPath) {

  const dir = path.join(process.cwd(), configPath || '');
  signale.info(`Starting from ${dir}`);

  const spinner = ora('Deploying function').start();

  exec(deployCommand, { cwd: dir } , (err, stdout, stderr) => {
    spinner.stop();
    if (err) {
      // node couldn't execute the command
      signale.fatal(err);
      return;
    }

    // the *entire* stdout and stderr (buffered)
    signale.log(stdout);
    signale.info(stderr);
  });
}

module.exports = (configPath) => {
  try {
    return deploy(configPath);
  } catch (err) {
    signale.fatal(err);
    process.exit(1);
  }
}
