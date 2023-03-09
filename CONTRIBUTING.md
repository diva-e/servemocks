# Contributing to servemocks

Feel free to contribute to this project by creating a pull request on GitHub.

Commits should be well structured, which means that a single commit must not contain multiple concerns.

Furthermore, commit messages should have a conventional/semantic commit type in order for the automatic package version management to work.

Take a look at the the commit guidelines for more information.

## Development Workflow

1. Create a fork and clone the repository for local development
2. Create a new branch `feature/<issue>` or `bugfix/<issue>`
3. Commit and push your changes
4. Create a pull request on GitHub to start the code review process

Note that you should reflect a new feature in the `examples` section of this repository, this enables other developers to test it properly.

### Test CLI without creating a npm package

To install the local version of servemocks just navigate to the repository root and execute the following command:

```bash
npm install -g
```

## Publish a new Package Version (Maintainers)

NOTE: Packages should only be published based on the `main` branch
and only maintainers (members of `npmjs.com/org/divae`) are allowed to publish new package versions.

1. Run `npm run release -- --dry-run` to check which version will be created
2. Run `npm run release` to create new version including git tag, changelog entry and package.json version.
3. Run `git push origin <tagName>` to push the new git tag
4. Run `npm publish` to finsih the publication process

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to add semantics to commit messages.
Conventional Commits enable automatic changelogs and simplified publication of packages.

[Inspired by Angular Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md)

```plain
<type>: <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

| Version Level | Example         | Description                         |
|---------------|-----------------|-------------------------------------|
| Patch         | 1.0.0 --> 1.0.1 | Fixes / Patches                     |
| Minor         | 1.1.3 --> 1.2.0 | New features                        |
| Major         | 1.2.6 --> 2.0.0 | Breaking changes (see Type section) |

Subject must be written in imperative style eg:

* `docs: update README`
* `fix: fix encoding of webp images`
* `feat: add some nice feature`
* `refactor: rename FooBar to BarFoo`
* `style: apply code conventions to foo.js`
* `test: add unit test`

### Type

Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* **ci**: Changes to our CI configuration files and scripts (example scopes: Circle, BrowserStack, SauceLabs)
* **docs**: Documentation only changes
* **feat**: A new feature (features are minor changes)
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **test**: Adding missing tests or correcting existing tests
* **chore**: generic type to indicate technical changes without business value

Add an exclamation mark when introducing a **breaking change** (new major version)

eg. `refactor!: change cli option names`
