#!/usr/bin/env node

/**
 * Minify JavaScript files using Terser
 * Usage: npm run minify <file-path>
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const chalk = require('chalk');

async function minifyFile(filePath) {
  try {
    console.log(chalk.blue(`📦 Minifying: ${filePath}`));

    const code = fs.readFileSync(filePath, 'utf8');

    const result = await minify(code, {
      compress: {
        dead_code: true,
        drop_console: false, // Keep console logs for debugging
        drop_debugger:  true,
        keep_classnames: true,
        keep_fnames: false,
        passes: 2,
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: false,
      },
      format: {
        comments: /^!/,
        preamble: `/* ${path.basename(filePath)} - Minified by Instituto Malleus Dei */`,
      },
      sourceMap: false,
    });

    if (result.error) {
      throw result.error;
    }

    const minifiedPath = filePath.replace('. js', '.min.js');
    fs.writeFileSync(minifiedPath, result.code, 'utf8');

    const originalSize = Buffer.byteLength(code, 'utf8');
    const minifiedSize = Buffer.byteLength(result.code, 'utf8');
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    console.log(chalk.green(`✅ Minified: ${minifiedPath}`));
    console.log(
      chalk.gray(
        `   ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (${savings}% smaller)`
      )
    );

    return minifiedPath;
  } catch (error) {
    console.error(chalk.red(`❌ Error minifying ${filePath}:`), error.message);
    process.exit(1);
  }
}

// Get file path from command line
const filePath = process.argv[2];

if (!filePath) {
  console.error(chalk.red('❌ Please provide a file path'));
  console.log(chalk.gray('Usage: npm run minify <file-path>'));
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(chalk.red(`❌ File not found: ${filePath}`));
  process.exit(1);
}

minifyFile(filePath);
