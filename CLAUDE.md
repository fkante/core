# Global Rules & Preferences

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## TypeScript

- Never use `any` or `unknown` in TypeScript code. Both are anti-patterns. Always use concrete types, interfaces, generics, or utility types. If a type is complex, define it explicitly.

## Code Style

- Never use single-character variable names in code.
- Never use nested ternaries beyond one level deep. If a ternary contains another ternary, extract the logic into a named helper function. Three simple `if`/`return` branches are always clearer than a nested ternary tree.
- Never add inline comments. Code must be self-explanatory through clear naming and structure. Inline comments are not a substitute for writing readable code. If documentation is truly necessary, use the language's formal documentation syntax: docstrings in Python, JSDoc in TypeScript/JavaScript, etc.

## Imports

- Never use inline imports (function-scoped `import` in Python or dynamic `import()` / `require()` inside function bodies in TypeScript). All imports go at the top of the file.
- If you reach for an inline import to break a circular dependency, stop. Restructure the modules instead — extract shared types/helpers to a third module, invert the dependency, or merge the modules. Inline imports hide the cycle; they don't fix it.
- The only acceptable exceptions are genuine lazy-loading needs: code-split routes/components (`React.lazy`, dynamic `import()` for bundle splitting) and optional/heavy dependencies that must not load at import time.

## PR Title Convention

When creating PR titles, always follow this format: `<emoji> <type>(<scope>): <description>`

- The description should be lowercase, imperative mood, max 60 chars, no period at the end
- The scope is optional but encouraged (e.g. the module, component, or area affected)

### Type → Emoji Map

| Type | Emoji | Use for |
|------|-------|---------|
| `feat` | ✨ | New features |
| `fix` | 🐛 | Bug fixes |
| `docs` | 📝 | Documentation changes |
| `style` | 💄 | Formatting, UI/cosmetic changes |
| `refactor` | ♻️ | Code restructuring (no behavior change) |
| `perf` | ⚡ | Performance improvements |
| `test` | ✅ | Adding or updating tests |
| `build` | 📦 | Build system or dependencies |
| `ci` | 👷 | CI/CD changes |
| `chore` | 🔧 | Maintenance, tooling, config |
| `revert` | ⏪ | Reverting changes |
| `hotfix` | 🚑 | Critical production fixes |
| `wip` | 🚧 | Work in progress |
| `release` | 🔖 | Release tags |
| `deps` | ⬆️ | Dependency upgrades |
| `breaking` | 💥 | Breaking changes |
| `security` | 🔒 | Security fixes |
| `i18n` | 🌐 | Internationalization |
| `a11y` | ♿ | Accessibility |

### Examples

- `✨ feat(auth): add SSO login flow`
- `🐛 fix(editor): resolve crash on empty canvas`
- `♻️ refactor(api): simplify error handling middleware`
- `⬆️ deps: upgrade react to v19`

## React Effects

Effects are an escape hatch for synchronizing with external systems, not for managing component logic. Before writing a `useEffect`, ask: "Does this run because the component was *displayed*, or because of a specific *interaction*?" If it's an interaction, use an event handler.

- **Derive state during render** — if a value can be computed from props or state, calculate it inline. Never store derived values in state + sync with an Effect.
- **Use `useMemo` for expensive computations** — not state + Effect. Avoids redundant render passes.
- **User-triggered logic belongs in event handlers** — form submissions, clicks, and other interactions must not be routed through Effects. Effects lose the context of *why* state changed.
- **Reset component state with `key`** — when a prop change should reset all state, render the component with `key={prop}` instead of resetting state in an Effect.
- **Never chain Effects that set state to trigger other Effects** — calculate all next state in a single event handler.
- **Notify parents from event handlers, not Effects** — call the parent callback in the same handler that updates local state, or lift state up (controlled component).
- **Data flows down** — if parent and child both need the same data, the parent should fetch it and pass it down. Never pass data up via an Effect calling a parent callback.
- **Subscribe to external stores with `useSyncExternalStore`** — not manual subscriptions in Effects.
- **Data fetching in Effects must have cleanup** — use an `ignore` flag in the cleanup function to discard stale responses and avoid race conditions.
- **App-wide init runs at module level** — or behind a guard variable, not in an Effect (which runs twice in dev).

## Guard Clauses

- Prefer guard clauses over nested conditionals. Invert the condition, return early, and keep the happy path unindented.
- Place all precondition checks (null checks, validation, early exits) at the top of the function as flat, sequential guards.
- Never wrap an entire function body in an if-statement when you can return early from the negated condition.

## Library & API Usage

- Before writing code that uses a library, framework, or API — always check Context7 MCP first to fetch up-to-date documentation. Do not rely on training data for API signatures, prop names, configuration options, or available presets. This applies to all usage: new code, refactors, and code reviews.

## Regression Awareness

- When a refactor or implementation touches multiple components, always check for regressions across the tool/platform. Trace every consumer of the changed code (shared components, hooks, utilities, styles) and verify that existing behavior is preserved in all contexts (e.g. panel vs right-click menu, default vs small variant, different entry points).

## PR Conventions

- Do not append `🤖 Generated with [Claude Code](https://claude.com/claude-code)` to PR descriptions.
