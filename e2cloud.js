#!/usr/bin/env node
const program = require('commander');
const signale = require('signale');
const CFonts = require('cfonts');

if (process.versions.node && process.versions.node.split('.') && process.versions.node.split('.')[0] < 8) {
  signale.fatal('NodeJS >= 8 is required to run.');
  console.log();
  console.log('Please upgrade your NodeJS engine');
  console.log(`Current NodeJS version: ${process.version}`);
  process.exit(1);
}

CFonts.say('e2cloud', {
  font: 'block',              // define the font face
  align: 'left',              // define text alignment
  colors: ['cyanBright','white'],         // define all colors
  background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
  letterSpacing: 1,           // define letter spacing
  lineHeight: 1,              // define the line height
  space: true,                // define if the output text should have empty lines on top and on the bottom
  maxLength: '0',             // define how many character can be on one line
});


program.command('init [path]')
  .description('Prepare files for cloud execution [path]')
  .action(require('./commands/init'));

program.command('deploy [path]')
  .description('Deploy to cloud')
  .option('--verbose', 'output internal logging information')
  .option('--profile [value]', 'configuration profile to be used')
  .action(require('./commands/deploy'));

program.command('run [path]')
  .description('Run all tests in cloud')
  .option('--dry-run', "Prepare tests but not execute them in cloud")
  .option('--title <title>', "Specify the title for this run (pass in build id)")
  .action(require('./commands/run'));


program.parse(process.argv);
