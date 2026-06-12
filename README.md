# Apliteni Claude Code marketplace

Team marketplace listing Apliteni and Lessly plugins for Claude Code.

## Access

All plugin repos are **private**. To install any plugin from this marketplace you must be a member of the [`apliteni` GitHub org](https://github.com/apliteni) (Lessly plugin requires `lessly-hub` org membership).

If `/plugin install` fails with `Repository not found`, this usually means you don't have access to the underlying repo, not that the repo is missing — GitHub returns the same error for both. Ask in #engineering for an org invite.

## Install

```bash
/plugin marketplace add apliteni/claude-marketplace
/plugin install apliteni@apliteni
/plugin install compliance@apliteni
/plugin install lessly@apliteni
```

If a plugin has been renamed and `/plugin install` says `Repository not found`, refresh your local registry first:

```bash
/plugin marketplace update apliteni
```

## Plugins

| Plugin | Source | Description |
|---|---|---|
| `apliteni` | `apliteni/claude-apliteni-plugin` | Apliteni company workflows — AORs, OKRs, RFCs, handbook, playbook, strategy, chats, work-tools, xaas |
| `compliance` | `apliteni/claude-compliance-plugin` | EU SaaS compliance AOR — legal-copilot skill for GDPR, AML/KYC, NIS2, LEA verification |
| `lessly` | `lessly-hub/claude-lessly-plugin` | Lessly product, DX, and platform tooling |

## Adding a plugin

Open a PR updating `.claude-plugin/marketplace.json` with a new entry. CI validates the file. One approving review required. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for naming rules.

## Telemetry

Two surfaces feed the Apliteni PostHog project:

- **Phase 1** — daily GitHub Action (`.github/workflows/traffic-telemetry.yml`) pulls clones + views from the Traffic API for the marketplace and every listed plugin repo. Captures successful clones only.
- **Phase 2** — `SessionStart` hook inside each plugin sends one anonymous event per UTC day. Closes the gap that Phase 1 can't see (clones happened but installs didn't run).

Required repo secrets: `TRAFFIC_PAT`, `POSTHOG_API_KEY`, `POSTHOG_HOST`. Source values from 1Password (apliteni account, `Employee` vault).

Full setup runbook — including how to port the hook to a new plugin and how to add a new tracked repo — in [`docs/telemetry-setup.md`](docs/telemetry-setup.md). Source issue: [#7](https://github.com/apliteni/claude-marketplace/issues/7).
