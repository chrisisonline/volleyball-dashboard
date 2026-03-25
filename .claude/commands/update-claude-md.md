# Update CLAUDE.md Skill

Review recent changes and sync CLAUDE.md so it stays accurate as the codebase evolves.

## Instructions

1. Gather context in parallel:
   - Run `git log --oneline -20` to see recent commits
   - Run `git diff HEAD --name-only` to see currently changed files
   - Run `git diff main~5..main --name-only` to see files changed across recent commits
   - Read the current `CLAUDE.md`

2. For each area of CLAUDE.md, check whether it's still accurate:
   - **Project structure**: scan `src/` with Glob to find current files/folders — add new ones, remove deleted ones, update descriptions if purpose changed
   - **Custom slash commands**: list `.claude/commands/` to find all skills — add any new ones, remove deleted ones, update descriptions
   - **Tech stack**: check `package.json` for dependency changes (new packages, version bumps worth noting)
   - **Key conventions**: note any patterns introduced or removed based on commit messages and changed files
   - **Commands**: check `package.json` scripts for any new or removed commands
   - **External API**: check `src/types/momentum.ts` and `src/lib/momentum-api.ts` for structural changes

3. Make targeted edits to CLAUDE.md — only update sections where something actually changed. Do not rewrite content that is still accurate.

4. Report a summary of what was updated and why, referencing specific commits or files where relevant.
