# 📚 Documentation Reorganization & AI-Native Git Workflow Plan

**Created:** November 17, 2024  
**Target:** v0.1 Release Tonight  
**Approach:** Git-Native + Folder Structure (Options 1 & 2)

---

## 🎯 Goals

1. **Organize 33 root-level MD files** into logical folder structure
2. **Implement AI-native git workflow** with automated, descriptive commits
3. **Set up semantic versioning** (starting with v0.1)
4. **Create sustainable documentation** system that scales

---

## 📊 Current State Analysis

### Repository Status
- **Branch:** `feature/pivot-refactor` (active development)
- **Git Tags:** None (clean slate for v0.1)
- **Root MD Files:** 33 files (too cluttered)
- **Commit Quality:** Mixed - some conventional commits (`feat:`, `fix:`), many vague ("update")
- **Automation:** Husky referenced but not installed, no active git hooks
- **Uncommitted Changes:** 
  - Modified: blueprints, package files
  - New: lib/managers/, lib/stores/, scripts/, SQL migration

### File Categorization (33 MD files)

**✅ Keep at Root (2):**
- `README.md` - Main project documentation
- `WARP.md` - AI assistant instructions

**📘 Setup Guides (6):** → `docs/setup/`
- QUICK_START.md, QUICK_SETUP.md
- DEPLOYMENT.md
- STRIPE_SETUP.md, SUPABASE_SETUP_GUIDE.md
- TESTING.md

**📗 Feature Guides (4):** → `docs/guides/`
- DEMO_MODE.md, DEMO_MODE_TEST.md
- DESIGN_STUDIO_GUIDE.md
- CONVERSATION_MANAGEMENT.md

**📙 Architecture Docs (2):** → `docs/architecture/`
- REFACTOR_STRATEGY.md
- docs/PROMPT_ARCHITECTURE_OVERHAUL.md (already in docs/)

**📦 Archive - Status/Completion (15):** → `docs/archive/2024-11/`
- IMPLEMENTATION_COMPLETE.md, IMPLEMENTATION_STATUS.md
- IMPLEMENTATION_SUMMARY.md, IMPLEMENTATION_SUMMARY_STREAMLINED_UX.md
- IMPLEMENTATION_PLAN_STREAMLINED_UX.md
- BACKEND_INTEGRATION_COMPLETE.md, BACKEND_MIGRATION_COMPLETE.md
- COPILOT_INTEGRATION_COMPLETE.md, COPILOT_MIGRATION.md
- HERO_UI_COMPLETE.md, HERO_UI_INTEGRATION.md
- UX_ENHANCEMENTS_COMPLETE.md
- INTEGRATED_VALUE_PROP_COMPLETE.md
- LINKEDIN_UPGRADE_COMPLETE.md, LINKEDIN_POST_BIO_FIX.md

**📦 Archive - Checklists (4):** → `docs/archive/2024-11/`
- LAUNCH_READY.md
- READY_TO_TEST.md
- DEMO_READY_CHECKLIST.md
- SUPABASE_MIGRATIONS_APPLIED.md

**📦 Archive - Implementation Plans (2):** → `docs/archive/2024-11/`
- ROBUSTNESS_UPGRADES.md
- ENHANCED_PERSONA_IMPLEMENTATION.md

**🗑️ Delete/Archive (1):**
- enahnecperosna.md (typo - "enhanced persona", 26KB)

**📁 Already Organized:**
- blueprints/ (content samples)
- components/*.md (READMEs)
- tests/evidence-chain/README.md
- lib/stores/*.md

---

## 🏗️ Proposed Folder Structure

```
flowtuskMVP/
├── README.md                          # ✅ Keep - Main entry point
├── WARP.md                            # ✅ Keep - AI assistant config
├── CHANGELOG.md                       # 🆕 New - Version history
├── .gitmessage                        # 🆕 New - Commit template
│
├── docs/
│   ├── README.md                      # 🆕 Master index
│   │
│   ├── setup/                         # Getting started
│   │   ├── quick-start.md
│   │   ├── deployment.md
│   │   ├── stripe-setup.md
│   │   ├── supabase-setup.md
│   │   └── testing.md
│   │
│   ├── guides/                        # Feature documentation
│   │   ├── demo-mode.md
│   │   ├── design-studio.md
│   │   ├── conversation-management.md
│   │   └── git-workflow.md           # 🆕 New - Workflow guide
│   │
│   ├── architecture/                  # Technical decisions
│   │   ├── refactor-strategy.md
│   │   └── prompt-architecture-overhaul.md
│   │
│   └── archive/                       # Historical records
│       ├── README.md                  # 🆕 Archive index
│       └── 2024-11/                   # Month-based folders
│           ├── implementation-complete.md
│           ├── backend-migration.md
│           ├── copilot-integration.md
│           ├── launch-ready.md
│           └── ... (21 more files)
│
├── .git/hooks/
│   ├── prepare-commit-msg             # 🆕 AI-powered commit messages
│   └── pre-commit                     # 🆕 Lint + typecheck
│
└── ... (existing project structure)
```

---

## 🤖 AI-Native Git Workflow (Inspired by Article)

### Conventional Commits Standard

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Adding tests
- `chore:` - Build/tooling changes

**Examples (from article principles):**
```bash
# ❌ Bad (current style)
update

# ✅ Good (AI-native)
feat(copilot): implement real-time streaming chat with 40s timeout

fix(flows): resolve RLS policy blocking demo mode access

docs: reorganize 33 MD files into logical folder structure

refactor(value-prop): extract evidence chain validation into separate util
```

### Automated Git Hooks

**1. `prepare-commit-msg` Hook**
- Analyzes `git diff --staged`
- Detects: files changed, lines added/removed, patterns
- Suggests commit message using AI logic:
  - If only MD files → `docs:`
  - If API routes → `feat:` or `fix:`
  - If tests → `test:`
  - If dependencies → `chore:`
- User can accept, edit, or reject

**2. `pre-commit` Hook**
- Runs `npm run lint` on staged files
- Runs `npm run typecheck`
- Blocks commit if errors (can bypass with `--no-verify`)

### Semantic Versioning Strategy

**Format:** `vMAJOR.MINOR.PATCH`

- **MAJOR** (v1.0.0): Breaking changes, public launch
- **MINOR** (v0.1.0): New features, backward compatible
- **PATCH** (v0.1.1): Bug fixes, no new features

**Tonight's Release: v0.1.0**
- First tagged release after copilot bug fix
- Marks: Copilot working, demo mode stable, RLS fixed
- Creates baseline for future development

**NPM Scripts (to add):**
```json
{
  "scripts": {
    "version:patch": "npm version patch -m 'chore: bump version to %s'",
    "version:minor": "npm version minor -m 'feat: release version %s'",
    "version:major": "npm version major -m 'feat!: BREAKING CHANGE - version %s'",
    "release": "git push --follow-tags origin $(git branch --show-current)"
  }
}
```

### CHANGELOG Format (Keep a Changelog)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- AI-native git workflow with automated commit messages
- Documentation reorganization into docs/ folder structure

### Changed
- Moved 33 MD files into logical categories

### Fixed
- (After tonight) Copilot bug resolved

## [0.1.0] - 2024-11-17

### Added
- Copilot conversational interface
- Demo mode for unauthenticated access
- RLS policies for positioning_* tables
- Comprehensive testing infrastructure

### Fixed
- URL normalization without protocol
- ICP card UX improvements
- ThemeProvider missing closing tag

### Changed
- Upgraded ICP generation to gpt-4o

[Unreleased]: https://github.com/user/repo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/user/repo/releases/tag/v0.1.0
```

---

## 🚀 Implementation Plan (8 Phases)

### Phase 1: Create Folder Structure
**Time:** 2 minutes  
**Files:** 4 new directories

```bash
mkdir -p docs/{setup,guides,architecture,archive/2024-11}
```

### Phase 2: Move & Rename Files
**Time:** 5 minutes  
**Files:** 31 moves, 1 deletion

Example moves:
- `QUICK_START.md` → `docs/setup/quick-start.md`
- `IMPLEMENTATION_COMPLETE.md` → `docs/archive/2024-11/implementation-complete.md`
- Delete `enahnecperosna.md`

**Naming Convention:**
- Lowercase with hyphens (kebab-case)
- Descriptive but concise
- Example: `BACKEND_MIGRATION_COMPLETE.md` → `backend-migration.md`

### Phase 3: Create Documentation Indexes
**Time:** 10 minutes  
**Files:** 2 new README files

**`docs/README.md`** - Master index with:
- Quick links to common docs
- Explanation of folder structure
- "How to contribute" section

**`docs/archive/README.md`** - Timeline of:
- November 2024: Copilot integration, backend migration, launch prep
- Links to all archived docs with dates
- What each milestone accomplished

### Phase 4: Git Commit Template
**Time:** 3 minutes  
**Files:** 1 new file + git config

Create `.gitmessage`:
```
# <type>(<scope>): <subject> (max 50 chars)
# |<----  Using a Maximum Of 50 Characters  ---->|

# <body> (optional, wrap at 72 chars)
# |<----   Try To Limit Each Line to a Maximum Of 72 Characters   ---->|

# <footer> (optional)
# Examples: 
# - Closes #123
# - BREAKING CHANGE: brief description

# Type: feat|fix|docs|style|refactor|perf|test|chore
# Scope: copilot|flows|auth|ui|api|db|docs (optional)
# Subject: imperative mood ("add" not "added", "fix" not "fixed")
```

Configure git:
```bash
git config commit.template .gitmessage
```

### Phase 5: Git Hooks
**Time:** 15 minutes  
**Files:** 2 executable hooks

**`.git/hooks/prepare-commit-msg`** (AI-powered):
```bash
#!/bin/bash
# Analyze staged changes and suggest commit message

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Skip if commit message already provided (amend, merge, etc.)
if [ -n "$COMMIT_SOURCE" ]; then
  exit 0
fi

# Get staged files
STAGED_FILES=$(git diff --cached --name-only)

# Detect type based on files
if echo "$STAGED_FILES" | grep -q "\.md$"; then
  TYPE="docs"
elif echo "$STAGED_FILES" | grep -q "app/api"; then
  TYPE="feat"
elif echo "$STAGED_FILES" | grep -q "\.test\."; then
  TYPE="test"
elif echo "$STAGED_FILES" | grep -q "package.json"; then
  TYPE="chore"
else
  TYPE="feat"
fi

# Get brief summary of changes
SUMMARY=$(git diff --cached --stat | tail -1)

# Suggest commit message
echo "# Auto-suggested type: $TYPE" >> $COMMIT_MSG_FILE
echo "# Changed files: $(echo $STAGED_FILES | wc -w)" >> $COMMIT_MSG_FILE
echo "# $SUMMARY" >> $COMMIT_MSG_FILE
echo "" >> $COMMIT_MSG_FILE
```

**`.git/hooks/pre-commit`** (Quality checks):
```bash
#!/bin/bash
# Run linting and type checking before commit

echo "Running pre-commit checks..."

# Lint staged files
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Fix errors or use --no-verify to skip."
  exit 1
fi

# Type check
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed. Fix errors or use --no-verify to skip."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
```

Make executable:
```bash
chmod +x .git/hooks/prepare-commit-msg .git/hooks/pre-commit
```

### Phase 6: CHANGELOG & Versioning
**Time:** 10 minutes  
**Files:** 1 new CHANGELOG.md + package.json scripts

Create `CHANGELOG.md` with v0.1.0 entry (based on recent commits).

Add to `package.json`:
```json
{
  "version": "0.1.0",
  "scripts": {
    "version:patch": "npm version patch -m 'chore: bump version to %s' && git push --follow-tags",
    "version:minor": "npm version minor -m 'feat: release version %s' && git push --follow-tags",
    "version:major": "npm version major -m 'feat!: BREAKING CHANGE - version %s' && git push --follow-tags",
    "changelog": "echo 'Manual CHANGELOG update required after version bump'"
  }
}
```

### Phase 7: Git Workflow Documentation
**Time:** 15 minutes  
**Files:** 1 new `docs/guides/git-workflow.md`

Document:
- How to write good commit messages
- How git hooks work (and how to bypass)
- Versioning strategy (when to bump major/minor/patch)
- Release process for v0.1 tonight
- Examples from AI-native article

### Phase 8: Validation & Cleanup
**Time:** 10 minutes  
**Tasks:**

1. Search for hardcoded MD file references:
```bash
grep -r "IMPLEMENTATION_COMPLETE" --exclude-dir=node_modules --exclude-dir=.git
grep -r "WARP.md" --exclude-dir=node_modules --exclude-dir=.git
```

2. Update any broken links in:
   - README.md
   - WARP.md
   - Other docs

3. Test git hooks:
```bash
echo "test" >> test.txt
git add test.txt
git commit -m "test: verify hooks work"
# Should show suggestions and run checks
```

4. Verify folder structure:
```bash
tree docs/ -L 2
```

5. Create `.github/pull_request_template.md` (optional):
```markdown
## Description
<!-- Brief description of changes -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking)
- [ ] ✨ New feature (non-breaking)
- [ ] 💥 Breaking change
- [ ] 📝 Documentation update

## Checklist
- [ ] Code follows project style (lint passes)
- [ ] Types are correct (typecheck passes)
- [ ] Tests updated/added
- [ ] CHANGELOG.md updated
- [ ] Evidence chain preserved (if applicable)
```

---

## 📋 Tonight's Release Workflow (v0.1)

**After copilot bug is fixed:**

1. **Commit the fix:**
```bash
git add <fixed-files>
git commit
# Hook will suggest message, edit to:
# fix(copilot): resolve [specific bug description]
```

2. **Run this reorganization:**
```bash
# (After you approve this plan, I'll execute all phases)
```

3. **Commit reorganization:**
```bash
git add -A
git commit -m "docs: reorganize 33 MD files into logical folder structure

- Move setup guides to docs/setup/
- Move feature docs to docs/guides/
- Archive 21 status/implementation docs to docs/archive/2024-11/
- Create master index at docs/README.md
- Add AI-native git workflow with hooks
- Set up CHANGELOG and semantic versioning

BREAKING CHANGE: MD file paths changed - update bookmarks"
```

4. **Create v0.1.0 tag:**
```bash
npm version minor -m "feat: release v0.1.0 - copilot working, demo stable"
# This creates tag and bumps package.json
```

5. **Push with tags:**
```bash
git push origin feature/pivot-refactor --follow-tags
```

6. **Update CHANGELOG:**
```bash
# Add release date to [0.1.0] section
# Move unreleased changes to 0.1.0
# Commit with: docs(changelog): mark v0.1.0 as released
```

---

## 🎯 Success Metrics

After implementation, you should have:

- ✅ Only 2 MD files at root (README.md, WARP.md)
- ✅ All docs organized in logical folders
- ✅ Git hooks suggesting commit messages
- ✅ CHANGELOG.md tracking versions
- ✅ v0.1.0 tag created
- ✅ Clear workflow documentation
- ✅ No broken links to moved files

---

## 🚨 Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking links to moved files | Phase 8 validates with grep, updates references |
| Git hooks annoying/buggy | Document bypass with `--no-verify` |
| WARP.md location hardcoded | Verify with grep, WARP checks root by default |
| Lost context in archived docs | Archive README provides timeline & context |
| Merge conflicts in team | Do on feature branch, communicate in PR |

---

## 💡 Future Enhancements

**After v0.1 (optional):**

1. **Obsidian Integration** (if knowledge base grows):
   - Point Obsidian vault to `docs/` folder
   - Add graph view for interconnected docs
   - Install Obsidian Git plugin for auto-sync

2. **GitHub Actions for Changelog**:
   - Auto-generate CHANGELOG from conventional commits
   - Use tools like `standard-version` or `semantic-release`

3. **Commit Message Linting**:
   - Install `commitlint` to enforce conventional commits
   - Reject commits that don't follow format

4. **AI Commit Message Generation** (advanced):
   - Integrate with OpenAI API to generate commit messages from diffs
   - Analyze semantic meaning, not just file patterns

---

## ⏱️ Total Time Estimate

- **Execution:** 60-70 minutes (all 8 phases)
- **Testing:** 10 minutes
- **Documentation review:** 10 minutes
- **Total:** ~90 minutes

---

## 📞 Next Steps

1. **Review this plan** - Any changes needed?
2. **Approve execution** - I'll run all 8 phases
3. **Test together** - Verify hooks and structure
4. **Fix copilot bug** - Using new workflow
5. **Tag v0.1.0** - Tonight's release! 🚀

---

**Questions or concerns?** Let me know what you'd like adjusted!
