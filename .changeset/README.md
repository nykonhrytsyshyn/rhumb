<!--suppress HtmlDeprecatedAttribute, HtmlUnknownTarget -->
<h1 id="title" align="center">Changesets</h1>

<div align="center">
  <h6>
    <a rel="noopener noreferrer" href="../README.md">Readme</a>
    ·
    <a rel="noopener noreferrer" href="../RELEASING.md">Releasing</a>
    ·
    <a rel="noopener noreferrer" href="../CONTRIBUTING.md">Contributing</a>
    ·
    <a rel="noopener noreferrer" href="https://changesets.dev">Changesets Docs</a>
  </h6>
</div>

A changeset is a small Markdown file that says which public npm package changes
and by how much. The release PR consumes them: it bumps the version of each
named package, writes its `CHANGELOG.md` and deletes the files.

Only the publishable packages are versioned here, with SemVer, each on its own:

- `@nykon/rhumb`     - the library (`packages/core`)
- `@nykon/rhumb-cli` - the command line (`apps/cli`), which bundles the library

The website and the repository keep the calendar version (`YY.M.N`) and are not
touched by changesets.

<div align="center">
  <h2 id="adding-a-changeset">Adding a Changeset</h2>
</div>

When contributing code that affects package functionality, generate a changeset
file from the root directory:

```bash
pnpm run changeset
```

1. **Select package(s)**: Choose any changed package.
2. **Select bump type**: Choose `patch` (bug fixes), `minor` (new features), or
   `major` (breaking changes).
3. **Summary**: Provide a concise description of your changes.
4. **Commit**: Commit the newly generated `.changeset/<name>.md` file alongside
   your PR.

> [!TIP]
> For CI-only, documentation-only, or non-user-facing PRs that require a
> changeset check to pass, generate an empty changeset without triggering a
> version bump:
> ```bash
> pnpm run changeset:empty
> ```

| Command                     | Description                                                                              |
|-----------------------------|------------------------------------------------------------------------------------------|
| `pnpm run changeset`        | Interactively create a new changeset file.                                               |
| `pnpm run changeset:empty`  | Create an empty changeset (no version bump or changelog entry).                          |
| `pnpm run changeset:status` | Preview pending changesets and calculated version bumps without modifying files.         |
| `pnpm run version`          | Consume changesets, bump package versions, and update changelogs (used primarily by CI). |

<div align="center">
  <h2 id="bundled-packages">Bundled Packages</h2>
</div>

`@nykon/rhumb-cli` contains a copy of `@nykon/rhumb`. When a change reaches the
library it also reaches the CLI, so name both (at least `patch` for the CLI), or
the CLI keeps shipping the old code. CI tells you when you forgot.

Write the text for the people who update the package: what changed for them, not
how it was done.
