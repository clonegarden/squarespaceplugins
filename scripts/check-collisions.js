#!/usr/bin/env node

/**
 * Cross-plugin namespace collision checker.
 *
 * Every plugin loads as an independent <script> tag on the same Squarespace page,
 * in a non-deterministic order. Two plugins that use the same CSS class or DOM
 * element id fight over the same nodes. The classic failure: two plugins both
 * inject <style id="anavo-xx-styles">, and the one that runs second removes the
 * first one's stylesheet, leaving that plugin rendered as unstyled markup.
 *
 * This script fails the build when two different plugin directories use the same
 * `anavo-*` identifier, or assign the same DOM element id.
 *
 * Usage: node scripts/check-collisions.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const IGNORED_DIRS = new Set([
  'node_modules',
  'scripts',
  'docs',
  'demos',
  'thumbnails',
  '.git',
  '.github',
]);

/**
 * Identifiers that are intentionally shared, because the licensing and
 * connectivity helpers in _shared/ are copied verbatim into every paid plugin.
 */
const SHARED_IDENTIFIERS = new Set([
  'anavo-license-notice',
  'anavo-license-override',
  'anavo-connectivity-notice',
  'anavo-auto-dismiss',
  // Marker attribute whose *value* identifies the plugin, so the name is shared
  // by design: data-anavo-plugin="ascii-animation".
  'anavo-plugin',
]);

/** First namespace segments shorter than this are reported as a warning. */
const MIN_PREFIX_LENGTH = 4;

/**
 * Matches `anavo-foo-bar`, `data-anavo-foo-bar` and `seo-anavo-foo-bar`, but not
 * the `anavo-nav-list` hiding inside `seo-anavo-nav-list` — a leading qualifier
 * is part of the identifier, not a separate match.
 */
const IDENTIFIER = /(?<![a-z0-9-])(?:[a-z0-9]+-)?anavo-[a-z0-9]+(?:-[a-z0-9]+)*/g;

function pluginDirs() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => !IGNORED_DIRS.has(name) && !name.startsWith('.'));
}

function sourceFiles(dir) {
  const files = [];
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) walk(full);
      } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
        files.push(full);
      }
    }
  };
  walk(path.join(ROOT, dir));
  return files;
}

/** `data-anavo-image-tilt` and `anavo-image-tilt` are the same identifier. */
function normalize(identifier) {
  return identifier.replace(/^data-/, '');
}

function collectIdentifiers(source) {
  const found = new Set();
  for (const match of source.matchAll(IDENTIFIER)) {
    found.add(normalize(match[0]));
  }
  return found;
}

function collectAssignedIds(source) {
  const ids = new Set();
  const patterns = [
    /\.id\s*=\s*['"]([^'"]+)['"]/g,
    /\bSTYLE_ID\s*=\s*['"]([^'"]+)['"]/g,
    /\bstyleId\s*=\s*['"]([^'"]+)['"]/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) ids.add(match[1]);
  }
  return ids;
}

/** `anavo-magic-menu-item` -> `magic`; `seo-anavo-nav-list` -> `nav`. */
function namespaceSegment(identifier) {
  const tail = identifier.slice(identifier.indexOf('anavo-') + 'anavo-'.length);
  return tail.split('-')[0];
}

function addOwner(map, key, owner) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(owner);
}

function main() {
  const dirs = pluginDirs();
  const identifierOwners = new Map();
  const idOwners = new Map();

  for (const dir of dirs) {
    const sources = sourceFiles(dir).map(file => fs.readFileSync(file, 'utf8'));
    if (sources.length === 0) continue;
    const combined = sources.join('\n');

    for (const identifier of collectIdentifiers(combined)) {
      addOwner(identifierOwners, identifier, dir);
    }
    for (const id of collectAssignedIds(combined)) {
      addOwner(idOwners, id, dir);
    }
  }

  const errors = [];
  const shortNamespaces = new Map();

  for (const [identifier, owners] of identifierOwners) {
    if (SHARED_IDENTIFIERS.has(identifier)) continue;
    if (owners.size > 1) {
      errors.push(
        `CSS identifier "${identifier}" is used by ${owners.size} plugins: ${[...owners]
          .sort()
          .join(', ')}`
      );
      continue;
    }
    const segment = namespaceSegment(identifier);
    const owner = [...owners][0];
    if (segment.length < MIN_PREFIX_LENGTH) {
      shortNamespaces.set(`${segment}/${owner}`, [segment, owner]);
    }
  }

  for (const [id, owners] of idOwners) {
    if (SHARED_IDENTIFIERS.has(id)) continue;
    if (owners.size > 1) {
      errors.push(
        `DOM element id "${id}" is assigned by ${owners.size} plugins: ${[...owners]
          .sort()
          .join(', ')}`
      );
    }
  }

  for (const key of [...shortNamespaces.keys()].sort()) {
    const [segment, owner] = shortNamespaces.get(key);
    console.log(
      `WARN  namespace "anavo-${segment}-" (${owner}) is short and collision-prone — prefer the full plugin slug`
    );
  }

  if (errors.length > 0) {
    console.error('\nNamespace collisions detected:\n');
    for (const error of errors.sort()) console.error(`  ERROR ${error}`);
    console.error(
      '\nTwo plugins sharing an identifier break each other when installed on the same page.'
    );
    console.error('Rename one of them to use its full plugin slug as the prefix.\n');
    process.exit(1);
  }

  console.log(
    `\nOK: ${identifierOwners.size} anavo-* identifiers and ${idOwners.size} element ids across ${dirs.length} plugins, no collisions.`
  );
}

main();
