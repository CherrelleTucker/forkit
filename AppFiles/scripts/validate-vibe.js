#!/usr/bin/env node
/**
 * Vibe Code Validator — catches common AI coding assistant mistakes.
 *
 * Checks:
 *  1. EAS env var consistency across build profiles
 *  2. Phantom npm imports (packages not in package.json)
 *  3. Phantom file imports (relative imports to nonexistent files)
 *  4. Orphan asset references in app.json
 *  5. Hallucinated API routes (fetch calls to nonexistent backend endpoints)
 *  6. Hardcoded localhost / private IPs in source
 *  7. Unfinished stubs (TODO / FIXME / HACK markers)
 *  8. StyleSheet hallucinations (defined↔referenced mismatch)
 *  9. Web-isms in React Native (onClick, className, div, span, etc.)
 * 10. Dead state variables (useState declared but value never read)
 * 11. Duplicate function definitions
 * 12. Permission–code mismatch (declared vs actually used)
 */

const fs = require('fs');
const path = require('path');
const { builtinModules } = require('module');

const ROOT = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

let errors = 0;
let warnings = 0;

function error(check, msg) {
  console.error(`  ERROR [${check}]: ${msg}`);
  errors++;
}

function warn(check, msg) {
  console.warn(`  WARN  [${check}]: ${msg}`);
  warnings++;
}

function heading(n, label) {
  console.log(`\n── ${n}. ${label} ──`);
}

/** Recursively collect .js/.jsx files, skipping node_modules, dotfiles, and this script. */
function collectJsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip the scripts directory (contains this validator and other tooling)
      if (entry.name === 'scripts') continue;
      results.push(...collectJsFiles(full));
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

/** Extract the npm package name from an import specifier (handles scoped pkgs). */
function pkgName(specifier) {
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
  }
  return specifier.split('/')[0];
}

const jsFiles = collectJsFiles(ROOT);
const allDeps = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
};

// Node builtin modules (with and without 'node:' prefix)
const builtins = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);

// ─────────────────────────────────────────────────────────────────────────────
// 1. EAS env var consistency
// ─────────────────────────────────────────────────────────────────────────────
heading(1, 'EAS env var consistency');

const easPath = path.join(ROOT, 'eas.json');
if (fs.existsSync(easPath)) {
  const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));
  const profiles = eas.build || {};

  const distProfiles = Object.entries(profiles).filter(
    ([name]) => !name.includes('development') && !name.includes('simulator'),
  );

  // Collect EXPO_PUBLIC_* keys across distributable profiles
  const allEnvKeys = new Set();
  for (const [, config] of distProfiles) {
    for (const key of Object.keys(config.env || {})) {
      if (key.startsWith('EXPO_PUBLIC_')) allEnvKeys.add(key);
    }
  }

  for (const envKey of allEnvKeys) {
    for (const [name, config] of distProfiles) {
      if (!(config.env && config.env[envKey])) {
        error(1, `eas.json profile "${name}" missing ${envKey}`);
      }
    }
  }

  // Localhost fallback check
  const appJsPath = path.join(ROOT, 'App.js');
  if (fs.existsSync(appJsPath)) {
    const appSource = fs.readFileSync(appJsPath, 'utf8');
    const fallbacks = [
      ...appSource.matchAll(/process\.env\.(\w+)\s*\|\|\s*['"]http:\/\/localhost/g),
    ];
    for (const match of fallbacks) {
      const varName = match[1];
      for (const [name, config] of distProfiles) {
        if (!(config.env && config.env[varName])) {
          error(
            1,
            `App.js falls back to localhost for ${varName} but profile "${name}" doesn't set it`,
          );
        }
      }
    }
  }

  if (errors === 0) console.log('  OK');
} else {
  console.log('  SKIP (no eas.json)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Phantom npm imports
// ─────────────────────────────────────────────────────────────────────────────
heading(2, 'Phantom npm imports');

const errsBefore2 = errors;

// Match: import ... from 'pkg'  |  require('pkg')  |  import('pkg')
const importPatterns = [
  /from\s+['"]([^.\/][^'"]*)['"]/g,
  /require\(\s*['"]([^.\/][^'"]*)['"]\s*\)/g,
  /import\(\s*['"]([^.\/][^'"]*)['"]\s*\)/g,
];

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  for (const pattern of importPatterns) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(source)) !== null) {
      const specifier = m[1];
      const name = pkgName(specifier);

      if (builtins.has(name)) continue;
      if (name === 'react-native') continue; // provided by expo runtime

      if (!allDeps[name]) {
        error(2, `${rel} imports "${name}" but it's not in package.json`);
      }
    }
  }
}

if (errors === errsBefore2) console.log('  OK');

// ─────────────────────────────────────────────────────────────────────────────
// 3. Phantom file imports
// ─────────────────────────────────────────────────────────────────────────────
heading(3, 'Phantom file imports');

const errsBefore3 = errors;
const relImportPattern = /(?:from|require\()\s*['"](\.[^'"]+)['"]/g;
const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const rel = path.relative(ROOT, file);

  relImportPattern.lastIndex = 0;
  let m;
  while ((m = relImportPattern.exec(source)) !== null) {
    const specifier = m[1];
    const base = path.resolve(dir, specifier);

    const found = extensions.some((ext) => fs.existsSync(base + ext));
    if (!found) {
      error(3, `${rel} imports "${specifier}" but file not found`);
    }
  }
}

if (errors === errsBefore3) console.log('  OK');

// ─────────────────────────────────────────────────────────────────────────────
// 4. Orphan asset references in app.json
// ─────────────────────────────────────────────────────────────────────────────
heading(4, 'Orphan asset references');

const errsBefore4 = errors;
const appJsonPath = path.join(ROOT, 'app.json');

if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  /** Recursively find string values that look like local file paths. */
  function findAssetPaths(obj, keyPath) {
    const paths = [];
    if (typeof obj === 'string' && obj.startsWith('./')) {
      paths.push({ keyPath, value: obj });
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => paths.push(...findAssetPaths(item, `${keyPath}[${i}]`)));
    } else if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        paths.push(...findAssetPaths(v, keyPath ? `${keyPath}.${k}` : k));
      }
    }
    return paths;
  }

  const assetRefs = findAssetPaths(appJson, '');

  for (const { keyPath, value } of assetRefs) {
    // Skip URL-like values and permission strings
    if (value.startsWith('http')) continue;

    const resolved = path.resolve(ROOT, value);
    if (!fs.existsSync(resolved)) {
      error(4, `app.json ${keyPath} references "${value}" but file not found`);
    }
  }

  if (errors === errsBefore4) console.log('  OK');
} else {
  console.log('  SKIP (no app.json)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Hallucinated API routes
// ─────────────────────────────────────────────────────────────────────────────
heading(5, 'Hallucinated API routes');

const errsBefore5 = errors;

// Try common backend locations
const backendCandidates = [
  path.join(ROOT, '..', 'forkit-backend', 'api'),
  path.join(ROOT, '..', 'backend', 'api'),
  path.join(ROOT, '..', 'api'),
  path.join(ROOT, 'api'),
];

const backendDir = backendCandidates.find((d) => fs.existsSync(d) && fs.statSync(d).isDirectory());

if (backendDir) {
  // Match: fetch(`${BACKEND_URL}/api/some-route` or fetch(BACKEND_URL + '/api/...')
  const routePattern = /fetch\(\s*[`'"]?\$\{[^}]+\}\/api\/([a-z0-9-]+)/g;

  const backendFiles = fs.readdirSync(backendDir).map((f) => path.parse(f).name);

  for (const file of jsFiles) {
    const source = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);

    routePattern.lastIndex = 0;
    let m;
    while ((m = routePattern.exec(source)) !== null) {
      const route = m[1];
      if (!backendFiles.includes(route)) {
        error(5, `${rel} calls /api/${route} but no ${route}.js found in backend`);
      }
    }
  }

  if (errors === errsBefore5) console.log('  OK');
} else {
  console.log('  SKIP (backend directory not found)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Hardcoded localhost / private IPs
// ─────────────────────────────────────────────────────────────────────────────
heading(6, 'Hardcoded localhost / private IPs');

const errsBefore6 = errors;
const localhostPatterns = [
  /['"`]https?:\/\/localhost[:\d/'"` ]/g,
  /['"`]https?:\/\/127\.0\.0\.1[:\d/'"` ]/g,
  /['"`]https?:\/\/0\.0\.0\.0[:\d/'"` ]/g,
  /['"`]https?:\/\/192\.168\.\d/g,
  /['"`]https?:\/\/10\.0\.\d/g,
];

// Lines that are env-var fallbacks are covered by check 1 — skip them
const envFallbackPattern = /process\.env\.\w+\s*\|\|/;

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  const lines = source.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comment lines
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
    // Skip env-var fallback lines (already validated by check 1)
    if (envFallbackPattern.test(line)) continue;

    for (const pattern of localhostPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        error(6, `${rel}:${i + 1} contains hardcoded localhost/private IP`);
      }
    }
  }
}

if (errors === errsBefore6) console.log('  OK');

// ─────────────────────────────────────────────────────────────────────────────
// 7. Unfinished stubs (TODO / FIXME / HACK)
// ─────────────────────────────────────────────────────────────────────────────
heading(7, 'Unfinished stubs');

const warnsBefore7 = warnings;
const stubPattern = /\b(TODO|FIXME|HACK|XXX)\b[:\s]/gi;

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  const lines = source.split('\n');

  for (let i = 0; i < lines.length; i++) {
    stubPattern.lastIndex = 0;
    const m = stubPattern.exec(lines[i]);
    if (m) {
      warn(7, `${rel}:${i + 1} — ${m[1]}: ${lines[i].trim().slice(0, 80)}`);
    }
  }
}

if (warnings === warnsBefore7) console.log('  OK');

// ─────────────────────────────────────────────────────────────────────────────
// 8. StyleSheet hallucinations
// ─────────────────────────────────────────────────────────────────────────────
heading(8, 'StyleSheet hallucinations');

const errsBefore8 = errors;

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  // Find all StyleSheet.create({...}) blocks and extract defined style names.
  // Style names are at the top level of the object (e.g., "container", "header").
  // We identify them by matching keys followed by { or a value on the same line,
  // using exactly 2 spaces indent (the convention for top-level keys).
  const sheetMatches = [...source.matchAll(/StyleSheet\.create\(\{([\s\S]*?)\n\}\)/g)];
  if (sheetMatches.length === 0) continue;

  const definedStyles = new Set();
  for (const sm of sheetMatches) {
    const block = sm[1];
    // Match top-level style names: lines starting with exactly 2 spaces + word + colon
    // This excludes nested CSS properties (4+ spaces) like "color:", "fontSize:", etc.
    for (const km of block.matchAll(/^\s{2}(\w+)\s*:/gm)) {
      // Skip common CSS property names that could appear at any indent
      const name = km[1];
      const cssProps = new Set([
        'color',
        'fontSize',
        'fontFamily',
        'fontWeight',
        'letterSpacing',
        'lineHeight',
        'position',
        'top',
        'left',
        'right',
        'bottom',
        'zIndex',
        'alignItems',
        'alignSelf',
        'justifyContent',
        'flexDirection',
        'flex',
        'flexShrink',
        'flexGrow',
        'flexWrap',
        'gap',
        'padding',
        'paddingTop',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'paddingVertical',
        'paddingHorizontal',
        'margin',
        'marginTop',
        'marginBottom',
        'marginLeft',
        'marginRight',
        'marginVertical',
        'marginHorizontal',
        'borderRadius',
        'borderTopLeftRadius',
        'borderTopRightRadius',
        'borderBottomLeftRadius',
        'borderBottomRightRadius',
        'backgroundColor',
        'borderWidth',
        'borderColor',
        'borderTopWidth',
        'borderTopColor',
        'borderBottomWidth',
        'borderBottomColor',
        'borderLeftWidth',
        'borderLeftColor',
        'borderRightWidth',
        'borderRightColor',
        'shadowColor',
        'shadowOpacity',
        'shadowRadius',
        'shadowOffset',
        'elevation',
        'overflow',
        'textAlign',
        'textDecorationLine',
        'textTransform',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'opacity',
        'transform',
        'display',
        'resizeMode',
      ]);
      if (!cssProps.has(name)) {
        definedStyles.add(name);
      }
    }
  }

  // Find all styles.xxx references in the file
  const referencedStyles = new Set();
  for (const rm of source.matchAll(/styles\.(\w+)/g)) {
    referencedStyles.add(rm[1]);
  }

  // Check for references to undefined styles
  for (const ref of referencedStyles) {
    if (!definedStyles.has(ref)) {
      error(8, `${rel} references styles.${ref} but it's not defined in StyleSheet.create()`);
    }
  }

  // Check for defined but unreferenced styles (warn, not error — could be dynamic)
  for (const def of definedStyles) {
    if (!referencedStyles.has(def)) {
      warn(8, `${rel} defines style "${def}" but it's never referenced`);
    }
  }
}

if (errors === errsBefore8) console.log('  OK');

// ─────────────────────────────────────────────────────────────────────────────
// 9. Web-isms in React Native
// ─────────────────────────────────────────────────────────────────────────────
heading(9, 'Web-isms in React Native');

const errsBefore9 = errors;

// Patterns that indicate web React code pasted into React Native
const webPatterns = [
  { pattern: /\bonClick\s*[={]/g, label: 'onClick (use onPress)' },
  { pattern: /\bclassName\s*[={]/g, label: 'className (use style)' },
  { pattern: /\bhtmlFor\s*[={]/g, label: 'htmlFor (not in RN)' },
  { pattern: /<div[\s>]/g, label: '<div> (use <View>)' },
  { pattern: /<span[\s>]/g, label: '<span> (use <Text>)' },
  { pattern: /<img[\s>]/g, label: '<img> (use <Image>)' },
  { pattern: /<input[\s>]/g, label: '<input> (use <TextInput>)' },
  { pattern: /<button[\s>]/g, label: '<button> (use <TouchableOpacity>)' },
  { pattern: /<a\s+href/g, label: '<a href> (use Linking.openURL)' },
  { pattern: /document\.(get|query|create)/g, label: 'DOM API (not available in RN)' },
  { pattern: /window\.(add|remove)EventListener/g, label: 'window events (use RN APIs)' },
];

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  const lines = source.split('\n');

  // Skip platform utility files that intentionally use web APIs behind Platform.OS checks
  if (rel.includes('utils/platform') || rel.includes('utils/location')) continue;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
    // Skip lines with Platform.OS checks (intentional web-specific code)
    if (/Platform\.OS/.test(line)) continue;

    for (const { pattern, label } of webPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        error(9, `${rel}:${i + 1} uses ${label}`);
      }
    }
  }
}

if (errors === errsBefore9) console.log('  OK');

// ─────────────────────────────────────────────────────────────────────────────
// 10. Dead state variables
// ─────────────────────────────────────────────────────────────────────────────
heading(10, 'Dead state variables');

const warnsBefore10 = warnings;

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  // Find all useState declarations: const [value, setValue] = useState(...)
  const stateDecls = [...source.matchAll(/const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState/g)];

  for (const decl of stateDecls) {
    const valueName = decl[1];
    const setterName = `set${decl[2]}`;

    // Count occurrences of the value name (excluding the declaration line itself)
    // We need word-boundary matches to avoid false positives (e.g., "loading" inside "isLoading")
    const valueRegex = new RegExp(`\\b${valueName}\\b`, 'g');
    const valueMatches = [...source.matchAll(valueRegex)];
    // Subtract 1 for the declaration itself
    const valueUses = valueMatches.length - 1;

    if (valueUses === 0) {
      warn(10, `${rel} — "${valueName}" (useState) is never read`);
    }

    // Check if setter is ever called
    const setterRegex = new RegExp(`\\b${setterName}\\b`, 'g');
    const setterMatches = [...source.matchAll(setterRegex)];
    // Subtract 1 for the declaration itself
    const setterUses = setterMatches.length - 1;

    if (setterUses === 0) {
      warn(10, `${rel} — "${setterName}" (useState setter) is never called`);
    }
  }
}

if (warnings === warnsBefore10) console.log('  OK');

// ─────────────────────────────────────────────────────────────────────────────
// 11. Duplicate function definitions
// ─────────────────────────────────────────────────────────────────────────────
heading(11, 'Duplicate function definitions');

const errsBefore11 = errors;

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  // Only flag top-level / module-level duplicates (no leading whitespace).
  // Functions defined inside closures (indented) can legitimately share names
  // across different scopes.
  const funcDefs = [
    ...source.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm),
    ...source.matchAll(/^const\s+(\w+)\s*=\s*(?:async\s+)?\(/gm),
    ...source.matchAll(/^const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/gm),
  ];

  // Deduplicate matches (a single definition can match multiple patterns)
  const deduped = new Map(); // "name:line" -> { name, line }
  for (const fm of funcDefs) {
    const name = fm[1];
    const line = source.slice(0, fm.index).split('\n').length;
    const key = `${name}:${line}`;
    if (!deduped.has(key)) deduped.set(key, { name, line });
  }

  const seen = new Map(); // name -> first line
  for (const { name, line } of deduped.values()) {
    if (seen.has(name)) {
      error(11, `${rel}:${line} — "${name}" already defined at line ${seen.get(name)}`);
    } else {
      seen.set(name, line);
    }
  }
}

if (errors === errsBefore11) console.log('  OK');

// ─────────────────────────────────────────────────────────────────────────────
// 12. Permission–code mismatch
// ─────────────────────────────────────────────────────────────────────────────
heading(12, 'Permission-code mismatch');

const errsBefore12 = errors;

if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const expo = appJson.expo || appJson;
  const androidPerms = new Set((expo.android && expo.android.permissions) || []);
  const plugins = (expo.plugins || []).map((p) => (Array.isArray(p) ? p[0] : p));

  // Combine all JS source for checking
  const allSource = jsFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

  // Map of: API usage pattern -> required permission/plugin
  const permChecks = [
    {
      api: /expo-location|requestLocationPermission|getCurrentPosition/,
      perm: () => plugins.includes('expo-location') || androidPerms.has('ACCESS_FINE_LOCATION'),
      label: 'Location APIs used but expo-location plugin or ACCESS_FINE_LOCATION not declared',
    },
    {
      api: /expo-camera|Camera\.request/,
      perm: () => plugins.includes('expo-camera') || androidPerms.has('CAMERA'),
      label: 'Camera APIs used but expo-camera plugin or CAMERA permission not declared',
    },
    {
      api: /expo-contacts|Contacts\.request/,
      perm: () => plugins.includes('expo-contacts') || androidPerms.has('READ_CONTACTS'),
      label: 'Contacts APIs used but expo-contacts plugin or READ_CONTACTS not declared',
    },
    {
      api: /expo-notifications|Notifications\.request/,
      perm: () => plugins.includes('expo-notifications'),
      label: 'Notification APIs used but expo-notifications plugin not declared',
    },
    {
      api: /expo-media-library|MediaLibrary\.request/,
      perm: () =>
        plugins.includes('expo-media-library') || androidPerms.has('READ_EXTERNAL_STORAGE'),
      label: 'Media library APIs used but expo-media-library plugin not declared',
    },
  ];

  for (const check of permChecks) {
    if (check.api.test(allSource) && !check.perm()) {
      error(12, check.label);
    }
  }

  if (errors === errsBefore12) console.log('  OK');
} else {
  console.log('  SKIP (no app.json)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════');
if (errors > 0) {
  console.error(`FAILED: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`PASSED with ${warnings} warning(s)`);
} else {
  console.log('ALL CHECKS PASSED');
}
