#!/usr/bin/env node

/**
 * Preset catalogue exporter for the Quotation Builder.
 *
 * The preset templates live inside quotation-builder.js because the plugin is a
 * standalone IIFE — it cannot fetch a catalogue at runtime without an extra
 * request and a race against first paint. But three other places need to know
 * the same list: the demo page's preset switcher, the plugin store's "Customize"
 * dialog, and the price fields that dialog renders. Hand-copying the list into
 * each of them is how they drift apart.
 *
 * So the JS stays the single source of truth and this script extracts it into
 * quotation-builder/presets.json, which the demo and the store both consume.
 * The block between the `presets:begin` / `presets:end` markers is evaluated in
 * isolation and must therefore stay self-contained — it may not reference
 * anything declared outside it.
 *
 * Price keys are assigned here so that no consumer has to re-derive them:
 *   s{step}o{option}  price of one choice in a select/multiselect step
 *   s{step}u          unit price of a quantity step
 * Those keys are what the script tag's `prices` parameter is written in, as
 * `prices=s0o0:1200,s2u:150`, carrying only the values the owner changed.
 *
 * Usage:
 *   node scripts/export-presets.js           write presets.json
 *   node scripts/export-presets.js --check   fail if presets.json is stale
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'quotation-builder', 'quotation-builder.js');
const TARGET = path.join(ROOT, 'quotation-builder', 'presets.json');

const BEGIN = '/* presets:begin';
const END = '/* presets:end */';

function fail(message) {
  console.error('export-presets: ' + message);
  process.exit(1);
}

function extractPresets(source) {
  const begin = source.indexOf(BEGIN);
  const end = source.indexOf(END);
  if (begin === -1 || end === -1 || end < begin) {
    fail('could not find the presets:begin / presets:end markers in ' + SOURCE);
  }

  const block = source.slice(begin, end);
  if (block.indexOf('var PRESETS') === -1) {
    fail('the marked block does not declare PRESETS');
  }

  try {
    return new Function(block + '\nreturn PRESETS;')();
  } catch (err) {
    fail('the marked block is not self-contained: ' + err.message);
  }
}

function readVersion(source) {
  const match = source.match(/Anavo Quotation Builder v(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

/** Flatten one preset's editable prices into keyed, labelled entries. */
function collectPrices(preset) {
  const prices = [];

  preset.steps.forEach(function (step, stepIndex) {
    if (step.type === 'quantity') {
      prices.push({
        key: 's' + stepIndex + 'u',
        label: step.title + ' — per ' + step.unitLabel,
        default: step.unitPrice,
      });
      return;
    }

    if (!Array.isArray(step.options)) return;

    step.options.forEach(function (option, optionIndex) {
      prices.push({
        key: 's' + stepIndex + 'o' + optionIndex,
        label: step.title + ' — ' + option[0],
        default: option[1],
      });
    });
  });

  return prices;
}

function build() {
  const source = fs.readFileSync(SOURCE, 'utf8');
  const presets = extractPresets(source);

  const catalogue = {
    // A reminder for anyone who opens the JSON looking for somewhere to edit.
    generatedBy: 'scripts/export-presets.js — edit quotation-builder.js instead',
    pluginVersion: readVersion(source),
    priceKeyFormat: 's{step}o{option} for choices, s{step}u for quantity unit price',
    presets: Object.keys(presets).map(function (id) {
      const preset = presets[id];
      return {
        id: id,
        label: preset.label,
        name: preset.name,
        stepCount: preset.steps.length,
        prices: collectPrices(preset),
      };
    }),
  };

  return JSON.stringify(catalogue, null, 2) + '\n';
}

const generated = build();

if (process.argv.includes('--check')) {
  if (!fs.existsSync(TARGET)) {
    fail('presets.json is missing — run: npm run export-presets');
  }
  if (fs.readFileSync(TARGET, 'utf8') !== generated) {
    fail('presets.json is stale — run: npm run export-presets');
  }
  console.log('export-presets: presets.json is current');
} else {
  fs.writeFileSync(TARGET, generated);
  const count = JSON.parse(generated).presets.length;
  console.log('export-presets: wrote ' + path.relative(ROOT, TARGET) + ' (' + count + ' presets)');
}
