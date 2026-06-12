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

A daily GitHub Action (`.github/workflows/traffic-telemetry.yml`) pulls clone + view counts from the GitHub Traffic API for the marketplace and every listed plugin repo, and forwards them to PostHog as `plugin_repo_clones` / `plugin_repo_views` events. Source: [issue #7](https://github.com/apliteni/claude-marketplace/issues/7).

Required repo secrets:
- `TRAFFIC_PAT` — fine-grained PAT with `Administration: Read` on the marketplace and every plugin repo listed in `marketplace.json`.
- `POSTHOG_API_KEY` — project API key (`phc_…`) from the `Apliteni` PostHog org, `plugin-telemetry` project.
- `POSTHOG_HOST` — e.g. `https://eu.posthog.com`.

Captures successful clones only — failed clones (e.g. private repo, missing org access) leave no trace in the Traffic API. An opt-in plugin telemetry hook (Phase 2) will surface successful first-runs so we can detect "clones happened but installs didn't" divergence.
