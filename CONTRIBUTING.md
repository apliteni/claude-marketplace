# Contributing

## Adding a plugin

Open a PR updating `.claude-plugin/marketplace.json` with a new entry. CI validates the file. One approving review required.

## Plugin names are immutable

A plugin's `name` in `marketplace.json` is the public install identifier (`/plugin install <name>@apliteni`). Once published, it must not change — users have it pinned in their local marketplace cache, and renames silently break every existing installation with a misleading `Repository not found` error.

To rebrand a plugin:

1. **Add a new entry** with the new `name` pointing at the same (or renamed) repo.
2. **Keep the old entry** with `"deprecated": true` and a `description` that redirects: `"Renamed to <new-name>@apliteni. Run /plugin install <new-name>@apliteni."`
3. Old installations will see the deprecation note after `/plugin marketplace update apliteni`.

The underlying GitHub repo can be renamed freely — GitHub auto-redirects `git clone`. The `name` field in `marketplace.json` cannot.

Deprecated entries can be removed once usage is gone (e.g. one year after deprecation).
