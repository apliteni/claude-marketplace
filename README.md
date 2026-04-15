# Apliteni Claude Code marketplace

Team marketplace listing Apliteni and Lessly plugins for Claude Code.

## Install

```bash
/plugin marketplace add apliteni/claude-marketplace
/plugin install clickup@apliteni
/plugin install lessly@apliteni
```

Plugin source access is gated by org membership on the underlying plugin repos.

## Plugins

| Plugin | Source | Description |
|---|---|---|
| `clickup` | `apliteni/claude-clickup-plugin` | ClickUp workflows across Apliteni workspaces |
| `lessly` | `lessly-hub/claude-lessly-plugin` | Lessly product, DX, and platform tooling |

## Adding a plugin

Open a PR updating `.claude-plugin/marketplace.json` with a new entry. CI validates the file. One approving review required.
