# Contributing

## Adding a plugin

One plugin per unit. A unit is a root AOR in the [operating-model registry](https://github.com/apliteni/operating-model/tree/main/aor), including product units (Keitaro, Lessly, Selgeo) and shared services (`people-ops`, `brand`, `compliance`). Name its accountable maintainer and service in the submission. Tools for a single team or campaign belong in the relevant unit plugin or stay outside this marketplace.

Use the registry's unit ID as the plugin name: `<unit>@apliteni`, with source repo `apliteni/claude-<unit>-plugin` for shared services or `<product-org>/claude-<unit>-plugin` for product units. Use `people-ops`, not `people`, unless the registry changes. Existing `apliteni` (company workflows) and `lessly-app-dev` are exceptions; retain their names and current scope. Existing repositories stay in place. New exceptions require an owner-approved policy change.

Skills live in their owning unit's plugin. Compare purpose, activation conditions, and output with existing unit skills, including those outside this catalog. Extend the owner instead of duplicating its workflow; a distinct boundary needs affected-maintainer agreement in the PR. Renaming a skill does not resolve overlap. Unresolved overlap blocks admission.

Open a PR updating `.claude-plugin/marketplace.json`, with the unit, maintainer, skill comparison, agreed boundaries, and evidence of installation and a representative workflow. One approving review from Artur (@asabirov) is required. He checks unit fit, skill ownership, naming, intended users' repository access, installation evidence, and passing CI.

A rejection cites the unmet rule. The team keeps and maintains its `apliteni/` repository and can [load a clone directly](https://code.claude.com/docs/en/plugins#test-your-plugin):

```bash
git clone git@github.com:apliteni/claude-gtm-intake-plugin.git
claude --plugin-dir ./claude-gtm-intake-plugin
```

Pass `--plugin-dir` on each launch and update the clone with Git. Reconsider admission when unit ownership and skill boundaries are agreed, or the owner changes this policy; team use can continue meanwhile.

## Plugin names are immutable

A plugin's `name` in `marketplace.json` is the public install identifier (`/plugin install <name>@apliteni`). Once published, it must not change — users have it pinned in their local marketplace cache, and renames silently break every existing installation with a misleading `Repository not found` error.

To rebrand a plugin:

1. **Add a new entry** with the new `name` pointing at the same (or renamed) repo.
2. **Keep the old entry** with `"deprecated": true` and a `description` that redirects: `"Renamed to <new-name>@apliteni. Run /plugin install <new-name>@apliteni."`
3. Old installations will see the deprecation note after `/plugin marketplace update apliteni`.

The underlying GitHub repo can be renamed freely — GitHub auto-redirects `git clone`. The `name` field in `marketplace.json` cannot.

Deprecated entries can be removed once usage is gone (e.g. one year after deprecation).
