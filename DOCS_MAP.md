# Decrity Documentation Map

> Your guide to navigating Decrity's documentation

---

## Where Do I Start?

```
         Are you...
              │
    ┌─────────┼─────────┐
    │         │         │
   New     Developer  Manager
    │         │         │
    ▼         ▼         ▼
 README   QUICKSTART  ROADMAP
```

---

## Documentation Structure

### Level 1: Overview (Start Here)
```
├─ README.md              ← Project overview, badges, quick links
└─ PROJECT_SUMMARY.md     ← Complete summary of what's been built
```

**When to read:**
- First time seeing the project
- Need a quick overview
- Want to understand scope

---

### Level 2: Getting Started

#### For Users (Future)
```
└─ User Guide (TBD)       ← How to install and use the extension
```

#### For Developers
```
├─ QUICKSTART.md          ← Set up dev environment in 5 minutes
├─ CONTRIBUTING.md        ← Development workflow and guidelines
└─ ARCHITECTURE.md        ← System design and data flow
```

**When to read:**
- Ready to start coding
- Need to understand the codebase
- Want to contribute

---

### Level 3: Project Management

#### Progress & Tracking
```
├─ STATUS.md              ← Quick status dashboard (weekly updates)
├─ PROGRESS.md            ← Detailed task tracking with timeline
├─ ROADMAP.md             ← Product roadmap and milestones
└─ CHANGELOG.md           ← Version history and release notes
```

**When to read:**
- Want to track progress
- Planning sprints
- Checking milestones
- Reviewing releases

---

### Level 4: Deep Technical

#### Architecture & Design
```
├─ ARCHITECTURE.md        ← System architecture diagrams
└─ DOC.md                 ← Complete 40+ page specification
```

**When to read:**
- Making architectural decisions
- Understanding technical design
- Planning major features

---

### Level 5: Process & Templates

#### GitHub Templates
```
.github/
├─ ISSUE_TEMPLATE/
│  ├─ bug_report.md
│  └─ feature_request.md
├─ pull_request_template.md
└─ templates/
   └─ weekly-update.md
```

**When to use:**
- Reporting bugs
- Requesting features
- Creating PRs
- Weekly status updates

---

## Documentation by Purpose

### "I want to understand the project"
1. Start: **README.md**
2. Then: **PROJECT_SUMMARY.md**
3. Deep dive: **DOC.md**

### "I want to start developing"
1. Start: **QUICKSTART.md**
2. Then: **CONTRIBUTING.md**
3. Reference: **ARCHITECTURE.md**

### "I want to track progress"
1. Quick view: **STATUS.md**
2. Details: **PROGRESS.md**
3. Timeline: **ROADMAP.md**
4. History: **CHANGELOG.md**

### "I want to contribute"
1. Read: **CONTRIBUTING.md**
2. Follow: **Pull Request Template**
3. Reference: **ARCHITECTURE.md**

### "I want to report an issue"
1. Use: **Bug Report Template**
2. Or: **Feature Request Template**

---

## Documentation Flowchart

```
                    START
                      │
                      ▼
              ┌───────────────┐
              │  README.md    │ ◄── Always start here
              └───────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐
│  I want to  │ │ I want   │ │  I want to   │
│   USE it    │ │  BUILD   │ │   MANAGE     │
└─────────────┘ └────┬─────┘ └──────┬───────┘
                     │              │
                     ▼              ▼
              ┌──────────────┐ ┌──────────────┐
              │ QUICKSTART   │ │  ROADMAP     │
              │      +       │ │      +       │
              │ CONTRIBUTING │ │  PROGRESS    │
              └──────┬───────┘ └──────┬───────┘
                     │              │
                     ▼              ▼
              ┌──────────────┐ ┌──────────────┐
              │ ARCHITECTURE │ │   STATUS     │
              │      +       │ │      +       │
              │   DOC.md     │ │  CHANGELOG   │
              └──────────────┘ └──────────────┘
```

---

## Documentation Details

| File | Pages | Words | Purpose | Update Frequency |
|------|-------|-------|---------|------------------|
| README.md | 1 | 500 | Overview | As needed |
| PROJECT_SUMMARY.md | 5 | 2000 | Complete summary | Per version |
| QUICKSTART.md | 3 | 1000 | Setup guide | Per version |
| CONTRIBUTING.md | 3 | 1200 | Dev guidelines | As needed |
| ARCHITECTURE.md | 8 | 3000 | System design | Per major version |
| DOC.md | 40+ | 8000+ | Full spec | Rarely |
| ROADMAP.md | 4 | 1500 | Product roadmap | Monthly |
| PROGRESS.md | 6 | 2500 | Task tracking | Weekly |
| STATUS.md | 3 | 800 | Quick dashboard | Weekly |
| CHANGELOG.md | 2 | 600 | Version history | Per release |

**Total:** ~75 pages, ~20,000 words of documentation

---

## Documentation Types

### Quick Reference (Glance-able)
- STATUS.md: status badges and metrics
- README.md: badges and links

### Task-Oriented (Action-able)
- QUICKSTART.md: step-by-step setup
- CONTRIBUTING.md: development workflow
- Templates: bug reports, PRs

### Planning (Strategic)
- ROADMAP.md: timeline and milestones
- PROGRESS.md: detailed task lists

### Historical (Retrospective)
- CHANGELOG.md: what changed when
- PROJECT_SUMMARY.md: what we built

### Technical (Reference)
- ARCHITECTURE.md: how it works
- DOC.md: why we built it this way

---

## Documentation Workflow

### Daily
- Update STATUS.md when major progress happens
- Mark tasks in PROGRESS.md as complete

### Weekly
- Review PROGRESS.md and update percentages
- Add weekly update (use template)
- Update STATUS.md dashboard

### Per Milestone
- Update ROADMAP.md timeline
- Update PROJECT_SUMMARY.md
- Add entry to CHANGELOG.md

### Per Release
- Update version numbers everywhere
- Complete CHANGELOG.md entry
- Update README.md badges
- Archive old updates

---

## Reading Time Estimates

| Document | Quick Skim | Full Read | Deep Study |
|----------|-----------|-----------|------------|
| README | 2 min | 5 min | - |
| PROJECT_SUMMARY | 5 min | 15 min | - |
| QUICKSTART | 5 min | 15 min | 30 min |
| CONTRIBUTING | 5 min | 10 min | 20 min |
| ARCHITECTURE | 10 min | 30 min | 1 hour |
| DOC | 15 min | 1 hour | 3 hours |
| ROADMAP | 5 min | 15 min | - |
| PROGRESS | 10 min | 30 min | - |
| STATUS | 2 min | 5 min | - |
| CHANGELOG | 2 min | 10 min | - |

**Total time to read everything:** ~4-6 hours

---

## Documentation Best Practices

### For Writers
1. Update date at top of file
2. Use clear headings and structure
3. Include examples and diagrams
4. Write for your audience
5. Keep it DRY (Don't Repeat Yourself)
6. Link between related docs
7. Avoid decorative emoji; prefer clear headings and plain text

### For Readers
1. Start with README
2. Use the search function (Ctrl+F)
3. Follow the links
4. Check "Last Updated" dates
5. Read what you need, not everything

---

## Quick Links Matrix

|  | Overview | Setup | Track | Build | Plan |
|---|---|---|---|---|---|
| **README** | ● | ○ | ○ | ○ | ○ |
| **PROJECT_SUMMARY** | ● | ○ | ● | ○ | ○ |
| **QUICKSTART** | ○ | ● | ○ | ● | ○ |
| **CONTRIBUTING** | ○ | ● | ○ | ● | ○ |
| **ARCHITECTURE** | ○ | ○ | ○ | ● | ○ |
| **DOC** | ● | ○ | ○ | ● | ● |
| **ROADMAP** | ○ | ○ | ● | ○ | ● |
| **PROGRESS** | ○ | ○ | ● | ○ | ● |
| **STATUS** | ○ | ○ | ● | ○ | ○ |
| **CHANGELOG** | ○ | ○ | ● | ○ | ○ |

**Legend:** ● Primary | ○ Secondary

---

## Need Help?

### Finding Information
1. Check this map for the right document
2. Use GitHub search
3. Ask in Issues/Discussions

### Improving Documentation
1. Open an issue: "Documentation improvement"
2. Submit a PR with changes
3. Follow CONTRIBUTING.md

---

**This documentation map helps you navigate all Decrity docs efficiently.**

**Last updated:** 2026-03-29
