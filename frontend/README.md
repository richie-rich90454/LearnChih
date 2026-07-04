# LernChih Frontend

React 18 + TypeScript + Vite + Fluent UI 2 frontend for the LernChih student forum.

## Development scripts

| Script                    | Description                       |
| ------------------------- | --------------------------------- |
| `npm run dev`             | Start the Vite dev server         |
| `npm run build`           | Build the production bundle       |
| `npm run type-check`      | Run TypeScript with `--noEmit`    |
| `npm run lint`            | Run ESLint                        |
| `npm run storybook`       | Start Storybook on port 6006      |
| `npm run build-storybook` | Build the static Storybook bundle |

## OpenAPI code generation

This project uses [`openapi-typescript`](https://github.com/drwpow/openapi-typescript) to generate TypeScript types from the backend OpenAPI spec.

```bash
# From a running backend
npm run generate-api:live

# From the backend Maven build output
npm run generate-api:file

# From the bundled static spec (default)
npm run generate-api
```

Generated types are written to `src/generated/types.gen.ts`.

## Accessibility and performance testing

The following scripts start a production preview server and run tests against it:

```bash
npm run lighthouse   # Lighthouse report -> tests-accessibility/lighthouse-report.html
npm run axe          # axe-core scan of key pages
npm run pa11y        # pa11y-ci scan of key pages
npm run a11y         # Build and run all accessibility/performance checks
```

> These scripts require a Chromium-based browser. They run in headless mode with `--no-sandbox` so they can execute in CI.
