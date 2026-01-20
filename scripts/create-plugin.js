#!/usr/bin/env node

/**
 * Create a new plugin from template
 * Usage: npm run create-plugin <plugin-name>
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const pluginName = process.argv[2];

if (!pluginName) {
  console.error(chalk.red('❌ Please provide a plugin name'));
  console.log(chalk. gray('Usage: npm run create-plugin <plugin-name>'));
  process.exit(1);
}

// Validate plugin name
if (!/^[a-z0-9-]+$/.test(pluginName)) {
  console.error(
    chalk.red('❌ Plugin name must be lowercase letters, numbers, and hyphens only')
  );
  process.exit(1);
}

const pluginDir = path.join(__dirname, '..', pluginName);

if (fs.existsSync(pluginDir)) {
  console.error(chalk.red(`❌ Plugin directory already exists: ${pluginName}/`));
  process.exit(1);
}

console.log(chalk.blue(`📦 Creating plugin: ${pluginName}\n`));

// Create directories
fs.mkdirSync(pluginDir);
fs.mkdirSync(path.join(pluginDir, 'examples'));

// Create main plugin file
const pluginTemplate = `/**
 * ${pluginName. toUpperCase().replace(/-/g, ' ')} PLUGIN
 * @version 1.0.0
 * @author Instituto Malleus Dei
 * @license Commercial - See LICENSE. md
 */

(function() {
  'use strict';

  console.log('🎨 ${pluginName} v1.0.0 - Loading.. .');

  // Your plugin code here

  console.log('✅ ${pluginName} ready!');

})();
`;

fs.writeFileSync(path.join(pluginDir, `${pluginName}.js`), pluginTemplate);

// Create README
const readmeTemplate = `# ${pluginName. replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

[Description of your plugin]

## Installation

\`\`\`html
<div id="${pluginName}-container"></div>
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespace-plugins@latest/${pluginName}/${pluginName}.min.js"></script>
\`\`\`

## Customization

[Document your customization options]

## License

Commercial - See [LICENSE.md](../LICENSE.md)
`;

fs.writeFileSync(path.join(pluginDir, 'README.md'), readmeTemplate);

// Create example
const exampleTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pluginName} - Example</title>
</head>
<body>
    <h1>${pluginName} Example</h1>
    
    <div id="${pluginName}-container"></div>
    
    <script src="../${pluginName}.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(pluginDir, 'examples', 'basic.html'), exampleTemplate);

console.log(chalk.green(`✅ Plugin created: ${pluginName}/`));
console.log(chalk.gray(`   ${pluginName}/${pluginName}.js`));
console.log(chalk.gray(`   ${pluginName}/README.md`));
console.log(chalk.gray(`   ${pluginName}/examples/basic. html`));

console.log(chalk.blue(`\n📝 Next steps:`));
console.log(chalk. gray(`   1. Edit ${pluginName}/${pluginName}.js`));
console.log(chalk.gray(`   2. Run:  npm run build: ${pluginName}`));
console.log(chalk.gray(`   3. Test: open ${pluginName}/examples/basic.html\n`));
