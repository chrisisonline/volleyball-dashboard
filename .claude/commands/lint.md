# Lint Skill

Run linters and formatters on all changed files before shipping.

## Instructions

1. Run `git diff HEAD --name-only` and `git status --short` in parallel to get the list of changed files
2. Identify which changed files are lintable (`.ts`, `.tsx`, `.astro`, `.js`, `.jsx`, `.json`, `.md`, `.css`)
3. If there are lintable files:
   a. Run `npm run lint:fix` to auto-fix ESLint issues
   b. Run `npm run format` to apply Prettier formatting
4. Run `npm run lint` to check for any remaining lint errors that could not be auto-fixed
5. Report results:
   - If lint passes with no errors: confirm all files are clean
   - If lint errors remain: show the errors and stop — do NOT proceed to ship until errors are resolved
