# ForkIt Review Suite

A comprehensive code review suite designed to catch the pitfalls of AI-assisted ("vibe coded") development before every deployment to the App Store and Google Play.

## Quick Start

```bash
cd AppFiles

# Run the full review suite (do this before every deployment)
npm run review

# Auto-fix what can be auto-fixed
npm run review:fix
```

---

## What Gets Checked

### 1. AI Pitfall Detection
Catches the most common mistakes AI coding assistants introduce:
- **Leftover console.log** — AI uses these for debugging and forgets to remove them
- **Unused variables** — AI generates code that references things it never uses
- **Magic numbers** — AI hardcodes values like `300`, `0.85`, `16` without named constants
- **Unreachable code** — AI generates code after `return` statements
- **Empty catch blocks** — AI swallows errors silently with `catch (e) {}`
- **`var` usage** — AI defaults to older patterns; `const`/`let` required
- **`==` vs `===`** — AI inconsistently uses loose equality
- **Duplicate object keys** — AI regenerates objects and duplicates entries
- **Parameter reassignment** — AI modifies function arguments directly

### 2. Security
Catches vulnerabilities that AI routinely introduces:
- **`eval()` and code injection** — `eval()`, `new Function()`, `setTimeout(string)` are blocked
- **Hardcoded secrets** — API keys, tokens, passwords detected by secretlint
- **Unsafe regex** — Patterns vulnerable to ReDoS attacks
- **Object injection** — Dynamic property access patterns that enable prototype pollution
- **Timing attacks** — String comparisons in security-sensitive contexts

### 3. React & React Native Best Practices
Catches hook violations, lifecycle bugs, and platform-specific issues:
- **Rules of Hooks** (ERROR) — Hooks called conditionally or in loops
- **Exhaustive deps** — Missing dependencies in `useEffect`/`useMemo`/`useCallback`
- **Missing keys** — List items rendered without `key` props
- **Array index keys** — Using index as key (causes bugs on reorder)
- **Unstable nested components** — Components defined inside render (recreated every render)
- **Inline styles** — Style objects in JSX (creates new object reference per render)
- **Raw text outside `<Text>`** — Crashes on native; works on web
- **Unused StyleSheet entries** — Dead styles that bloat the bundle
- **Color literals** — Hardcoded colors instead of theme constants

### 4. Accessibility
Catches screen reader and assistive technology issues:
- **Missing accessibility props** — Interactive elements without `accessibilityLabel`
- **Invalid roles** — Incorrect `accessibilityRole` values
- **Nested touchables** — Overlapping touch targets confuse screen readers
- **Invalid state/value** — Incorrect `accessibilityState` or `accessibilityValue`

### 5. Code Quality & Consistency
Catches complexity, duplication, and maintainability issues:
- **Cognitive complexity** — Functions too complex to understand (threshold: 20)
- **Duplicate strings** — Same string literal used 4+ times (extract to constant)
- **Identical functions** — Copy-pasted logic that should be a shared function
- **Duplicate branches** — If/else branches that do the same thing
- **Function length** — Functions over 100 lines (App.js exempt)
- **File length** — Files over 500 lines (App.js exempt)
- **Nesting depth** — Code nested more than 4 levels deep
- **Too many parameters** — Functions with more than 4 parameters

### 6. Documentation Standards
Catches missing or poor documentation:
- **Missing JSDoc** — Exported/public functions require JSDoc comments
- **Missing descriptions** — JSDoc blocks need a description, not just `@param` tags
- **Missing @param** — All function parameters should be documented
- **Missing @returns** — Return values should be documented
- **Type checking** — JSDoc type annotations must be valid

### 7. Design Consistency
Catches inconsistent code style and patterns:
- **Naming conventions** — `camelCase` for variables, consistent patterns throughout
- **Import order** — Grouped and alphabetized (builtin > external > internal > relative)
- **Arrow functions** — Prefer arrow callbacks, concise bodies where possible
- **Destructuring** — Prefer `const { x } = obj` over `const x = obj.x`
- **Object shorthand** — Prefer `{ name }` over `{ name: name }`
- **Template literals** — Prefer `` `Hello ${name}` `` over `"Hello " + name`
- **No nested ternaries** — Unreadable; use if/else or early returns

---

## Available Commands

| Command | What It Does |
|---|---|
| `npm run review` | Runs the full 5-check suite. **Use before every deployment.** |
| `npm run review:fix` | Auto-fixes lint and formatting issues |
| `npm run lint` | Lint only (warnings allowed) |
| `npm run lint:fix` | Lint and auto-fix what ESLint can fix |
| `npm run lint:strict` | Lint with zero warnings allowed (use for CI) |
| `npm run format` | Auto-format all files with Prettier |
| `npm run format:check` | Check formatting without changing files |
| `npm run dead-code` | Find unused files, exports, and dependencies |
| `npm run audit` | Check dependencies for known vulnerabilities |
| `npm run secrets` | Scan for hardcoded API keys, tokens, passwords |

---

## Pre-Commit Hook

A git pre-commit hook runs automatically on every commit. It:
1. Runs ESLint (with auto-fix) on staged `.js`/`.jsx` files
2. Runs Prettier (with auto-fix) on staged `.js`/`.jsx`/`.json`/`.md` files

If linting fails with errors, the commit is blocked until you fix the issues.

---

## Pre-Deployment Manual Checklist

These checks **cannot be automated** — do them yourself before every app store submission.

### Security
- [ ] Search for hardcoded secrets: `grep -r "sk-\|api_key\|secret\|password\|token" --include="*.js" .`
- [ ] Check `app.json` and any `.env` files for exposed keys
- [ ] Verify tokens use `expo-secure-store`, NOT `AsyncStorage`
- [ ] Confirm all API calls use HTTPS

### Device Testing
- [ ] Test on a real iPhone (not just simulator)
- [ ] Test on a real Android device (not just emulator)
- [ ] Test on iPad (even with `supportsTablet: false`, it must render usably)
- [ ] Cold start time under 5 seconds

### Accessibility
- [ ] Navigate the full app with VoiceOver enabled (iOS)
- [ ] Navigate the full app with TalkBack enabled (Android)
- [ ] Test with large font / Dynamic Type enabled

### Edge Cases
- [ ] Test in airplane mode (graceful error handling)
- [ ] Test on slow network (3G simulation)
- [ ] Test empty states (no results, no location, etc.)
- [ ] Test backgrounding and foregrounding the app
- [ ] Test the full user flow start to finish

### Store Compliance
- [ ] Privacy Nutrition Labels match actual data collection (iOS)
- [ ] Data Safety Form matches actual data collection (Android)
- [ ] All `NSUsage*` permission descriptions are specific and accurate (iOS)
- [ ] Privacy policy URL is accessible and current
- [ ] If using any AI services: disclosed per Apple Guideline 5.1.2i

---

## Understanding the Output

### Severity Levels
- **error** — Must fix before deployment. These catch real bugs, security vulnerabilities, and crashes.
- **warn** — Should fix. These catch code quality issues, missing documentation, and inconsistencies. Won't block commits but will show in `npm run review` output.

### Gradually Tightening
The suite starts with most rules as warnings so you can see everything without being blocked. As you fix issues:
1. Fix all **errors** first (these are already blocking)
2. Work through **warnings** category by category
3. When a category is clean, promote those rules to errors in `.eslintrc.js`
4. Eventually use `npm run lint:strict` (zero warnings) as your standard

---

## What Each Tool Does

| Tool | Purpose | Config File |
|---|---|---|
| **ESLint** | Static code analysis (logic, security, React patterns, a11y, quality, docs, consistency) | `.eslintrc.js` |
| **Prettier** | Code formatting (indentation, semicolons, quotes, line width) | `.prettierrc` |
| **Knip** | Dead code detection (unused files, exports, dependencies) | — |
| **npm audit** | Dependency vulnerability scanning (known CVEs) | — |
| **secretlint** | Secret detection (API keys, tokens, credentials in source) | `.secretlintrc.json` |
| **Husky** | Git pre-commit hooks (runs lint-staged before every commit) | `.husky/pre-commit` |
| **lint-staged** | Runs linters on staged files only (fast pre-commit checks) | `package.json` |

---

## Customizing Rules

### Making a rule stricter
In `.eslintrc.js`, change `"warn"` to `"error"`:
```js
"no-console": ["error", { allow: ["warn", "error"] }],
```

### Disabling a rule for one line
```js
// eslint-disable-next-line no-magic-numbers
const ANIMATION_DURATION = 300;
```

### Disabling a rule for a file
Add to the `overrides` array in `.eslintrc.js`:
```js
{
  files: ["specific-file.js"],
  rules: {
    "rule-name": "off",
  },
}
```

---

## Why This Matters

Research on AI-generated code shows:
- **2.74x more vulnerabilities** than human-written code (Veracode, 2025)
- **8x increase** in code duplication in AI-assisted codebases (GitClear)
- **~20% of AI-suggested packages** don't actually exist ("slopsquatting")
- Audits of 5,600 vibe-coded apps found **2,000+ vulnerabilities** and **400+ exposed secrets**

The four biggest vibe-coding failure categories:
1. **Hardcoded secrets** in the client bundle
2. **Client-side authentication** instead of server-side
3. **Happy path only** — crashes on edge cases
4. **Architectural drift** — inconsistent patterns across AI sessions

This review suite catches issues in all four categories before they reach your users.
