---
name: commit-push
description: 'Commit all changes and push to current branch using conventional commit format. Use when: committing changes, pushing code, saving work with [feat]/[fix]/[edit] prefix.'
---

# Commit & Push

Automatically analyze changes, generate a conventional commit message, and push to current branch.

## When to Use

- User says `/commit-push` (no message needed)
- Ready to commit and push all changes
- Need quick save and push workflow

## Commit Format

```
[type] brief message
```

**Types:**

- `[feat]` - New feature or functionality
- `[fix]` - Bug fix
- `[edit]` - Code refactoring or improvements
- `[docs]` - Documentation changes
- `[style]` - Formatting, whitespace
- `[test]` - Adding or updating tests
- `[chore]` - Deps, config, maintenance

## Workflow

1. **Check git status** - Show files changed
2. **Check git diff** - Analyze actual changes (use `--stat` for overview)
3. **Infer commit type** from changes:
   - New files/features → `[feat]`
   - Bug fixes → `[fix]`
   - Refactoring/improvements → `[edit]`
   - Documentation → `[docs]`
   - Tests → `[test]`
   - Config/deps → `[chore]`
4. **Generate brief message** (3-7 words) describing the core change
5. **Stage all** with `git add .`
6. **Commit** with `[type] message`
7. **Push** to current branch
8. **Confirm** success with short summary

## Rules

- Keep message SHORT (3-7 words max)
- Lowercase, no period
- Describe WHAT changed, not HOW
- If multiple types, use the most significant one
- Show the final commit message before pushing

## Example Flow

User: `/commit-push`

Agent actions:

1. `git status --short` → sees modified files
2. `git diff --stat` → sees changes in validation schemas
3. Infers: `[feat]` + "add user profile validation"
4. `git add .`
5. `git commit -m "[feat] add user profile validation"`
6. `git push`
7. Confirms: "Committed and pushed: [feat] add user profile validation"
