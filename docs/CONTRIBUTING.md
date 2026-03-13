# Contributing to The Auto Judge

Thank you for your interest in contributing! This document outlines the workflows, conventions, and expectations for anyone contributing to this project.

> Documentation contributions are always welcome ❤

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Branching Model](#branching-model)
3. [Commit Conventions](#commit-conventions)
4. [Pull Requests](#pull-requests)
5. [Issues](#issues)
6. [Code Style](#code-style)
7. [Project Structure](#project-structure)

---

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. Create a new branch from `main` following the [branching conventions](#branching-model) below.
3. Make your changes, then open a Pull Request targeting `main`.
4. Ensure your PR passes any automated checks before requesting a review.

> If you plan to work on a significant feature, open an Issue first to discuss the approach before writing code.

---

## Branching Model

| Branch                         | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| `main`                         | Stable integration branch — always deployable |
| `feature/<short-description>`  | New features or enhancements                  |
| `fix/<short-description>`      | Bug fixes                                     |
| `docs/<short-description>`     | Documentation-only changes                    |
| `refactor/<short-description>` | Code cleanup with no behaviour change         |

**Rules:**

- Never commit directly to `main`.
- Every change goes through a feature branch and a PR.
- Branch names should be lowercase and hyphen-separated (e.g. `feature/submission-handler`, `fix/sandbox-timeout`).

---

## Commit Conventions

Commit messages must use the following prefixes so the history stays readable:

| Prefix      | When to use                                 |
| ----------- | ------------------------------------------- |
| `feat:`     | A new feature or user-facing capability     |
| `fix:`      | A bug fix                                   |
| `docs:`     | Documentation changes only                  |
| `refactor:` | Code restructuring with no behaviour change |
| `test:`     | Adding or updating tests                    |
| `chore:`    | Tooling, dependencies, CI config changes    |
| `style:`    | Formatting, linting fixes (no logic change) |

**Format:**

```
<prefix>: <short imperative summary>  (50 chars max)

[Optional body — explain WHY, not just what]

[Optional footer — e.g. Closes #42]
```

**Examples:**

```
feat: add hint rate limiting to submission endpoint

fix: handle sandbox timeout edge case for C++ submissions

docs: update architecture.md with DFD Level 1 details
Closes #18
```

---

## Pull Requests

- Target branch is always `main`.
- Title should follow the same commit prefix convention (`feat:`, `fix:`, etc.).
- Include the related Issue number in the PR description if one exists — e.g. `Closes #42` or `Relates to #15`.
- Keep PRs focused: one feature or fix per PR. Avoid bundling unrelated changes.
- Add a short description of **what** changed and **why**.
- Request at least one reviewer before merging.

**PR Description Template:**

```
## Summary
Brief description of changes.

## Related Issue
Closes #<issue-number>

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactor

## Testing Done
Describe any manual or automated testing performed.
```

---

## Issues

- Apply a **predefined label** when creating an issue (e.g. `bug`, `enhancement`, `documentation`, `question`).
- Write a **detailed description** — include steps to reproduce for bugs, or a clear use-case for feature requests.
- For bugs, include: expected behaviour, actual behaviour, and environment details.
- Avoid duplicate issues — search existing issues before opening a new one.

---

## Code Style

### Backend (Python / FastAPI)

- Follow [PEP 8](https://peps.python.org/pep-0008/).
- Use type hints on all function signatures.
- Keep route handlers thin — business logic belongs in service/utility modules.

### Frontend (TypeScript / Next.js)

- Follow the existing ESLint and Prettier configuration.
- Use functional components and React hooks.
- Co-locate component styles using Tailwind utility classes; avoid inline `style` props.

### General

- Do not commit secrets, `.env` files, or credentials.
- Do not leave `console.log` / `print` debug statements in production code.
- Write self-documenting code; add comments only where the logic is non-obvious.

---

## Project Structure

```
the-auto-judge/
├── apps/
│   ├── frontend/       # Next.js UI (Vercel)
│   └── backend/        # FastAPI gateway & API endpoints (VPS)
├── docker/             # Dockerfiles for isolated execution sandboxes
├── docs/               # Architecture docs, DFDs, ERD diagrams
└── README.md
```

See [docs/architecture.md](architecture.md) for the full system design.
