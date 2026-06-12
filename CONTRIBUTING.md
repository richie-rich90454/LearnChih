# Contributing to OpenSolutions

Thanks for your interest. Contributions are welcome.

## How

1. Fork the repository
2. Create a branch: `git checkout -b my-feature`
3. Make your changes
4. Ensure the build passes: `./mvnw package` (backend) and `npm run build` (frontend)
5. Commit with a clear message following [Conventional Commits](https://www.conventionalcommits.org/)
6. Push: `git push origin my-feature`
7. Open a Pull Request

## Commit Messages

Use the conventional commit format:

```
type(scope): description
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

Scopes: `api`, `ui`, `auth`, `db`, `ws`, or omit if cross-cutting

## Code Style

- **Java**: Follow the existing style in the codebase. Run `./mvnw compile` before pushing.
- **TypeScript**: Run `npm run build` and `npx tsc --noEmit` before pushing. No warnings.

## Pull Requests

- One logical change per PR
- Describe what and why, not how
- Reference any related issues
- Keep PRs small and focused

## Reporting Issues

Use the issue templates. Provide enough detail for someone else to reproduce the problem.

## Questions

Open a discussion or use the "Question" issue template.
