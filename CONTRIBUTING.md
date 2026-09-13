# Contributing

## Adding a plugin

### What qualifies

Each unit may have one plugin. A unit is a root AOR (Area of Responsibility) listed in the [operating-model registry](https://github.com/apliteni/operating-model/tree/main/aor). This includes product units such as Keitaro, Lessly, and Selgeo, as well as shared services such as `people-ops`, `brand`, and `compliance`. In your submission, name the person accountable for the unit and the service it provides. Tools made for only one team or campaign belong in that unit's plugin or should remain outside this marketplace.

### Naming and repositories

Use the unit ID from the registry as the plugin name: `<unit>@apliteni`. Use `apliteni/claude-<unit>-plugin` as the source repository for shared services, or `<product-org>/claude-<unit>-plugin` for product units.

Use `people-ops`, not `people`, unless the registry changes. The existing `apliteni` plugin, which contains company workflows, and `lessly-app-dev` are exceptions. Keep their names and current scope. Existing repositories also stay where they are. Any new exception requires an owner-approved policy change.

### Skills and ownership

Skills must live in the plugin owned by the relevant unit. Before submitting, compare your skills with existing unit skills, including skills that are outside this catalog. Compare their purpose, the conditions that activate them, and their output.

If an existing owner already covers the workflow, extend that owner's skill instead of creating a duplicate. If your skill has a genuinely different boundary, the pull request (PR) must include agreement from the maintainers affected by that boundary. Renaming a skill does not remove overlap. If overlap remains unresolved, the plugin cannot be admitted.

### How to submit

Open a PR that updates `.claude-plugin/marketplace.json`. Include the unit, maintainer, comparison with existing skills, agreed boundaries, and evidence that the plugin installs and supports a representative workflow.

The PR requires one approving review from Artur (@asabirov). He checks the plugin's unit fit, skill ownership, naming, intended users' repository access, installation evidence, and passing CI.

### If your plugin is rejected

The rejection will identify the rule that was not met. Your team keeps and maintains its `apliteni/` repository and can [load a clone directly](https://code.claude.com/docs/en/plugins#test-your-plugin):

```bash
git clone git@github.com:apliteni/claude-gtm-intake-plugin.git
claude --plugin-dir ./claude-gtm-intake-plugin
```

Pass `--plugin-dir` each time you launch Claude Code, and update the clone with Git. You can request admission again when unit ownership and skill boundaries are agreed, or when the owner changes this policy. Your team may continue using the plugin meanwhile.

## Plugin names are immutable

A plugin's `name` in `marketplace.json` is the public install identifier (`/plugin install <name>@apliteni`). Once published, it must not change — users have it pinned in their local marketplace cache, and renames silently break every existing installation with a misleading `Repository not found` error.

To rebrand a plugin:

1. **Add a new entry** with the new `name` pointing at the same (or renamed) repo.
2. **Keep the old entry** with `"deprecated": true` and a `description` that redirects: `"Renamed to <new-name>@apliteni. Run /plugin install <new-name>@apliteni."`
3. Old installations will see the deprecation note after `/plugin marketplace update apliteni`.

The underlying GitHub repo can be renamed freely — GitHub auto-redirects `git clone`. The `name` field in `marketplace.json` cannot.

Deprecated entries can be removed once usage is gone (e.g. one year after deprecation).
