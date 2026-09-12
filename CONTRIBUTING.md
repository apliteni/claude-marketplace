# Contributing

## Adding a plugin

The marketplace distributes internal tools by service unit: one plugin per unit, with that unit's skills inside it. A submission must name the unit, its accountable maintainer, and the service it provides across teams. A tool for one team or campaign does not qualify; extend the relevant unit plugin instead.

The existing `apliteni` entry remains the home for company-wide workflows. The existing product entries `lessly` and `lessly-app-dev` remain listed with their current scope and names. These are explicit exceptions, not a precedent for new team or product entries. A new product entry or a change to these boundaries needs a separate owner-approved change to this policy before admission.

Use the unit's lowercase, hyphen-separated name as the install name: `<unit>@apliteni`, backed by `apliteni/claude-<unit>-plugin` (for example, `compliance@apliteni` and `apliteni/claude-compliance-plugin`). Do not name a unit plugin after a team, campaign, or individual skill. Existing exceptions keep their names and repositories; published names follow the immutable-name rule below.

Each skill has one owning plugin. Compare proposed skills with the current catalog by purpose, activation conditions, and output, not just filename. Duplicating an existing unit's workflow under a different name does not qualify. Extend its owning plugin, or agree a distinct boundary with the affected maintainer and record it in the PR. Product-specific skills may coexist with unit skills only when that boundary is clear; namespaces alone do not resolve competing instructions. Unresolved overlap blocks admission.

Open a PR updating `.claude-plugin/marketplace.json`. Include the unit and maintainer, audience and service, skill comparison with affected plugins, agreed boundaries, proposed install name and source repo, and evidence that installation and a representative workflow work. CI validates the catalog structure. Admission requires one approving review from the repository owner, Artur (@asabirov), who checks:

- Service-unit fit (or an explicit existing exception) and accountable maintenance.
- Skill ownership and resolved overlap, with affected maintainer input.
- Naming, source access for intended users, installation evidence, and passing CI.

A rejection should cite the unmet rule and the path to reconsideration. The team keeps its plugin in its own `apliteni/` repository and maintains access, releases, and installation instructions. It can load a clone directly without a marketplace entry:

```bash
git clone git@github.com:apliteni/claude-gtm-intake-plugin.git
claude --plugin-dir ./claude-gtm-intake-plugin
```

Pass `--plugin-dir` on each launch; update the clone with Git. For managed installation, the team can publish a separate marketplace manifest (`.claude-plugin/marketplace.json`) in its repository, then use `/plugin marketplace add <owner>/<repo>` and `/plugin install <plugin-name>@<marketplace-name>`. The marketplace name comes from that manifest; a plugin manifest alone is insufficient. See Claude Code's [local plugin loading](https://code.claude.com/docs/en/plugins#test-your-plugin) and [marketplace setup](https://code.claude.com/docs/en/plugin-marketplaces) instructions.

Reconsider a rejected submission when it serves a service unit and its skills have an agreed home, or when the owner changes this policy. Rejection from this catalog does not prohibit team use.

## Plugin names are immutable

A plugin's `name` in `marketplace.json` is the public install identifier (`/plugin install <name>@apliteni`). Once published, it must not change — users have it pinned in their local marketplace cache, and renames silently break every existing installation with a misleading `Repository not found` error.

To rebrand a plugin:

1. **Add a new entry** with the new `name` pointing at the same (or renamed) repo.
2. **Keep the old entry** with `"deprecated": true` and a `description` that redirects: `"Renamed to <new-name>@apliteni. Run /plugin install <new-name>@apliteni."`
3. Old installations will see the deprecation note after `/plugin marketplace update apliteni`.

The underlying GitHub repo can be renamed freely — GitHub auto-redirects `git clone`. The `name` field in `marketplace.json` cannot.

Deprecated entries can be removed once usage is gone (e.g. one year after deprecation).
