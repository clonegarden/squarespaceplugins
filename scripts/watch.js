#!/usr/bin/env node

/**
 * Watch for changes and auto-rebuild
 */

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue.bold('👀 Watching for changes...\n'));

const watcher = chokidar. watch('**/*.js', {
  ignored: ['**/node_modules/**', '**/*. min.js', '**/scripts/**'],
  persistent: true,
});

watcher.on('change', path => {
  if (path.endsWith('.min.js')) return;

  console.log(chalk. yellow(`\n📝 Changed: ${path}`));

  try {
    execSync(`node scripts/minify.js ${path}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red('Build failed'));
  }
});

console.log(chalk.gray('Watching all . js files (except . min.js)'));
console.log(chalk.gray('Press Ctrl+C to stop\n'));
