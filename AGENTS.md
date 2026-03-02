# AGENT.md

## Project Overview

**servemocks** is a mock server tool that generates REST APIs from JSON, XML, and other sample files in a directory. It's built on Express and can be used as a CLI tool or mounted as middleware in an existing Express app.

## Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Release (uses standard-version)
npm run release        # patch release
npm run release:patch  # patch release
npm run release:minor  # minor release
npm run release:major  # major release
```

## Quality checks

- Make sure to run `npm test` and `npm run lint:fix` after changes have been finished
- Keep the project lightweight and avoid adding more dependencies
- Make sure to update `src/serve-mocks.spec.js` with tests for new features, it is basically a kind of e2e test which covers most of logic

## Project Structure

```
src/
├── serve-mocks.js              # Main entry point
├── public-api.js               # Public exports
├── mock-file-types.js          # Supported file types
├── cli.js                      # CLI implementation
├── serve-mocks.spec.js         # Main tests
├── service/
│   ├── endpoint-registration.service.js  # Endpoint registration logic
│   ├── script-evaluation.service.js      # Dynamic response (.mjs) evaluation
│   └── logger.js                          # Logging utility
└── utilities/
    ├── sorting.js              # Endpoint sorting by specificity
    ├── http-method.js          # HTTP method utilities
    ├── encoding.js             # Encoding utilities
    └── async-utilities.js      # Async utilities
```

## Key Concepts

### Mock File Conventions
- File naming: `<http-method>.<extension>` or `<path>.<http-method>.<extension>`
- Example: `user.post.json` → POST /user
- `[any]` can be used as a wildcard for any path segment
- HTTP method is derived from the filename (get, post, put, patch, delete)

### Dynamic Responses
- Use `.mjs` files for dynamic/mock responses
- Supported modes: `eval`, `dynamicImport`, `disabled`

### Options
- `responseDelay_ms`: Default delay before responses (default: 100)
- `dynamicMockResponsesMode`: `'eval' | 'dynamicImport' | 'disabled'` (default: `'eval'`)
- `endpointRegistrationLogging`: `'verbose' | 'compact' | 'disabled'` (default: `'verbose'`)

## Dependencies

- **express**: Web framework
- **chalk**: Terminal colors
- **commander**: CLI parsing
- **cors**: CORS middleware
- **glob**: File pattern matching
- **ajv**: JSON Schema validation
