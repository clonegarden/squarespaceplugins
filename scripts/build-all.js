#!/usr/bin/env node

/**
 * Build all plugins in the repository
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const chalk = require('chalk');
const ora = require('ora');

async function buildAll() {
  const rootDir = path.join(__dirname, '. .');

  // Find all plugin directories (those containing a . js file with same name as directory)
  const pluginDirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => ! ['node_modules', 'scripts', 'docs', '. git'].includes(dirent.name))
    .map(dirent => dirent.name);

  console.log(chalk.blue. bold('\n🔨 Building all plugins.. .\n'));

  let built = 0;
  let skipped = 0;

  for (const pluginName of pluginDirs) {
    const pluginDir = path.join(rootDir, pluginName);
    const sourceFile = path.join(pluginDir, `${pluginName}.js`);

    if (!fs.existsSync(sourceFile)) {
      skipped++;
      continue;
    }

    const spinner = ora(`Building ${pluginName}...`).start();

    try {
      const code = fs.readFileSync(sourceFile, 'utf8');

      const result = await minify(code, {
        compress: {
          dead_code: true,
          drop_console: false,
          drop_debugger: true,
          keep_classnames:  true,
          passes: 2,
        },
        mangle: {
          keep_classnames: true,
        },
        format: {
          comments: /^!/,
          preamble: `/* ${pluginName}. js - © 2026 Instituto Malleus Dei */`,
        },
      });

      const minifiedPath = path.join(pluginDir, `${pluginName}.min.js`);
      fs.writeFileSync(minifiedPath, result. code, 'utf8');

      const originalSize = Buffer.byteLength(code, 'utf8');
      const minifiedSize = Buffer.byteLength(result.code, 'utf8');
      const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

      spinner.succeed(
        chalk.green(
          `${pluginName}:  ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (${savings}% smaller)`
        )
      );

      built++;
    } catch (error) {
      spinner.fail(chalk.red(`${pluginName}: ${error.message}`));
    }
  }

  console. log(
    chalk.blue.bold(
      `\n✅ Build complete:  ${built} plugins built, ${skipped} skipped\n`
    )
  );
}

buildAll().catch(error => {
  console.error(chalk.red('❌ Build failed: '), error);
  process.exit(1);
});
